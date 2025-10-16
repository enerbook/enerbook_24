# Plan de Implementación - Método UPFRONT

## 🎯 Objetivo
Implementar el método de pago "Upfront" (pago único completo con comisión del 8%) usando Stripe, Supabase y n8n.

---

## 📋 FASE 1: Configuración de Infraestructura

### 1.1 Variables de Entorno
Agregar a `.env`:
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx  # Para n8n
STRIPE_WEBHOOK_SECRET=whsec_xxx
N8N_WEBHOOK_BASE_URL=https://n8n.enerbook.mx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 1.2 Dependencias NPM
Ya instaladas:
- `@stripe/stripe-js@^7.9.0`
- `@stripe/stripe-react-native@^0.50.3`

---

## 📊 FASE 2: Base de Datos

### 2.1 Migration: `supabase/migrations/005_upfront_payment.sql`

```sql
-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE payment_method AS ENUM ('upfront', 'milestones');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- ============================================================================
-- TABLA: payments
-- ============================================================================
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES auth.users(id),
  instalador_id uuid REFERENCES auth.users(id),

  -- Método y montos
  payment_method payment_method NOT NULL DEFAULT 'upfront',
  total_amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL, -- 8% del total
  installer_amount numeric(10,2) NOT NULL, -- 92% del total

  -- Stripe IDs
  stripe_payment_intent_id text UNIQUE,
  stripe_customer_id text,

  -- Estados
  status payment_status DEFAULT 'pending',
  paid_at timestamptz,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLA: installer_transfers
-- ============================================================================
CREATE TABLE installer_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  instalador_id uuid REFERENCES auth.users(id),

  -- Stripe
  stripe_transfer_id text UNIQUE,
  amount numeric(10,2) NOT NULL,

  -- Estado
  status text DEFAULT 'pending', -- pending, processing, completed, failed
  transferred_at timestamptz,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_transfers ENABLE ROW LEVEL SECURITY;

-- Clientes pueden ver sus propios pagos
CREATE POLICY "Clientes ven sus pagos"
ON payments FOR SELECT
USING (auth.uid() = cliente_id);

-- Instaladores pueden ver pagos de sus proyectos
CREATE POLICY "Instaladores ven sus pagos"
ON payments FOR SELECT
USING (auth.uid() = instalador_id);

-- Instaladores ven sus transferencias
CREATE POLICY "Instaladores ven sus transferencias"
ON installer_transfers FOR SELECT
USING (auth.uid() = instalador_id);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX idx_payments_proyecto ON payments(proyecto_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_transfers_instalador ON installer_transfers(instalador_id, status);

-- ============================================================================
-- MODIFICAR TABLA PROYECTOS
-- ============================================================================
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method payment_method;
```

### 2.2 Ejecutar Migration
```bash
npx supabase db push
```

---

## 🔧 FASE 3: Backend - n8n Workflow

### 3.1 Workflow: "Upfront Payment Processing"

**Endpoint**: `POST /webhook/payment-upfront`

**Request Body**:
```json
{
  "proyecto_id": "uuid",
  "cliente_id": "uuid",
  "instalador_id": "uuid",
  "total_amount": 150000,
  "stripe_customer_id": "cus_xxx" // opcional
}
```

**Nodes del Workflow**:

1. **Webhook Node** (Trigger)
   - Method: POST
   - Path: `/payment-upfront`

2. **Function: Calculate Fees**
   ```javascript
   const totalAmount = $json.total_amount;
   const platformFee = totalAmount * 0.08; // 8%
   const installerAmount = totalAmount * 0.92; // 92%

   return {
     json: {
       ...items[0].json,
       platform_fee: platformFee,
       installer_amount: installerAmount
     }
   };
   ```

3. **Stripe: Create or Get Customer**
   - Si no existe `stripe_customer_id`, crear uno nuevo
   - Resource: Customers
   - Operation: Create

4. **Stripe: Create Payment Intent**
   - Amount: `{{ $json.total_amount * 100 }}` (en centavos)
   - Currency: MXN
   - Customer: `{{ $json.stripe_customer_id }}`
   - Application Fee: `{{ $json.platform_fee * 100 }}`
   - Transfer Data:
     - Destination: `{{ $json.instalador_stripe_account_id }}`
   - Metadata:
     ```json
     {
       "proyecto_id": "{{ $json.proyecto_id }}",
       "payment_method": "upfront"
     }
     ```

5. **Supabase: Get Installer Stripe Account**
   ```sql
   SELECT raw_user_meta_data->>'stripe_account_id' as stripe_account_id
   FROM auth.users
   WHERE id = '{{ $json.instalador_id }}'
   ```

6. **Supabase: Insert Payment Record**
   - Table: `payments`
   - Campos:
     - `proyecto_id`
     - `cliente_id`
     - `instalador_id`
     - `payment_method`: 'upfront'
     - `total_amount`
     - `platform_fee`
     - `installer_amount`
     - `stripe_payment_intent_id`
     - `stripe_customer_id`
     - `status`: 'processing'

7. **Response**
   ```json
   {
     "success": true,
     "client_secret": "{{ $json.client_secret }}",
     "payment_id": "{{ $json.payment_id }}"
   }
   ```

### 3.2 Workflow: "Stripe Webhook Handler"

**Endpoint**: `POST /webhook/stripe-events`

**Nodes**:

1. **Webhook Node**
   - Validate Stripe signature

2. **Switch Node** - Event Type
   - Case 1: `payment_intent.succeeded`
   - Case 2: `transfer.created`
   - Case 3: `payment_intent.payment_failed`

3. **Branch: payment_intent.succeeded**
   - **Supabase: Update Payment**
     ```sql
     UPDATE payments
     SET status = 'completed',
         paid_at = NOW(),
         updated_at = NOW()
     WHERE stripe_payment_intent_id = '{{ $json.data.object.id }}'
     ```

   - **Supabase: Update Proyecto**
     ```sql
     UPDATE proyectos
     SET payment_status = 'paid'
     WHERE id = '{{ $json.data.object.metadata.proyecto_id }}'
     ```

4. **Branch: transfer.created**
   - **Supabase: Insert Transfer Record**
     ```sql
     INSERT INTO installer_transfers (
       payment_id, instalador_id, stripe_transfer_id,
       amount, status, transferred_at
     ) VALUES (...)
     ```

5. **Branch: payment_intent.payment_failed**
   - **Supabase: Update Payment Status**
     ```sql
     UPDATE payments
     SET status = 'failed'
     WHERE stripe_payment_intent_id = '{{ $json.data.object.id }}'
     ```

---

## ⚛️ FASE 4: Frontend - React Native

### 4.1 Hook: `src/hooks/useUpfrontPayment.js`

```javascript
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const N8N_BASE_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_BASE_URL;

export function useUpfrontPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateUpfrontPayment = async (proyectoId, totalAmount) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del proyecto
      const { data: proyecto, error: proyectoError } = await supabase
        .from('proyectos')
        .select('cliente_id, instalador_id')
        .eq('id', proyectoId)
        .single();

      if (proyectoError) throw proyectoError;

      // Llamar a n8n
      const response = await fetch(`${N8N_BASE_URL}/payment-upfront`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          cliente_id: proyecto.cliente_id,
          instalador_id: proyecto.instalador_id,
          total_amount: totalAmount
        })
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error);

      return {
        clientSecret: data.client_secret,
        paymentId: data.payment_id
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateUpfrontPayment,
    loading,
    error
  };
}
```

### 4.2 Componente: `src/components/payment/UpfrontPaymentForm.jsx`

```jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useUpfrontPayment } from '../../hooks/useUpfrontPayment';

export default function UpfrontPaymentForm({ proyectoId, totalAmount, onSuccess }) {
  const stripe = useStripe();
  const { initiateUpfrontPayment, loading } = useUpfrontPayment();
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!cardComplete) return;

    try {
      setProcessing(true);

      // 1. Obtener clientSecret de n8n
      const { clientSecret } = await initiateUpfrontPayment(proyectoId, totalAmount);

      // 2. Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
        paymentMethodType: 'Card'
      });

      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const platformFee = totalAmount * 0.08;
  const installerAmount = totalAmount * 0.92;

  return (
    <View className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-semibold mb-4">Pago Completo (Upfront)</Text>

      {/* Desglose */}
      <View className="mb-6 p-4 bg-gray-50 rounded">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm">Monto del Proyecto:</Text>
          <Text className="text-sm font-semibold">${totalAmount.toLocaleString('es-MX')}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Comisión Plataforma (8%):</Text>
          <Text className="text-sm text-gray-600">${platformFee.toLocaleString('es-MX')}</Text>
        </View>
        <View className="flex-row justify-between pt-2 border-t border-gray-300">
          <Text className="text-sm font-semibold">Para el Instalador:</Text>
          <Text className="text-sm font-semibold">${installerAmount.toLocaleString('es-MX')}</Text>
        </View>
      </View>

      {/* Card Field */}
      <CardField
        postalCodeEnabled={false}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
        style={{ height: 50, marginBottom: 20 }}
      />

      {/* Botón de Pago */}
      <TouchableOpacity
        className={`p-4 rounded-lg ${cardComplete && !processing ? 'bg-green-600' : 'bg-gray-300'}`}
        disabled={!cardComplete || processing}
        onPress={handlePayment}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Pagar ${totalAmount.toLocaleString('es-MX')} MXN
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

### 4.3 Integración en Dashboard: `app/dashboard.jsx`

```jsx
import UpfrontPaymentForm from '../src/components/payment/UpfrontPaymentForm';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '../src/lib/stripe';

// Dentro del componente
<StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
  <UpfrontPaymentForm
    proyectoId={selectedProyecto.id}
    totalAmount={selectedProyecto.costo_total}
    onSuccess={() => {
      alert('¡Pago completado exitosamente!');
      // Refrescar datos
    }}
  />
</StripeProvider>
```

---

## 🧪 FASE 5: Testing

### 5.1 Tarjetas de Prueba Stripe
```
✅ Pago exitoso: 4242 4242 4242 4242
❌ Pago fallido: 4000 0000 0000 0002
⏳ Requiere autenticación: 4000 0025 0000 3155
```

### 5.2 Flujo E2E
1. Cliente selecciona proyecto
2. Elige método "Upfront"
3. Ingresa tarjeta de prueba
4. Confirma pago
5. Verificar en Supabase:
   - `payments` tiene registro con `status='completed'`
   - `proyectos.payment_status='paid'`
   - `installer_transfers` tiene registro
6. Verificar en Stripe Dashboard:
   - Payment Intent succeeded
   - Transfer creado al instalador

---

## ✅ Checklist de Entregables

**Base de Datos:**
- [ ] `supabase/migrations/005_upfront_payment.sql`
- [ ] RLS policies configuradas
- [ ] Índices creados

**Backend:**
- [ ] n8n Workflow: "Upfront Payment Processing"
- [ ] n8n Workflow: "Stripe Webhook Handler"
- [ ] Webhook configurado en Stripe Dashboard

**Frontend:**
- [ ] `src/hooks/useUpfrontPayment.js`
- [ ] `src/components/payment/UpfrontPaymentForm.jsx`
- [ ] Integración en dashboard cliente

**Testing:**
- [ ] Pago exitoso con 4242 4242 4242 4242
- [ ] Pago fallido con 4000 0000 0000 0002
- [ ] Verificar registro en Supabase
- [ ] Verificar transfer en Stripe

---

## ⏱️ Estimación de Tiempo

- **Configuración + DB**: 1 día
- **n8n Workflows**: 2 días
- **Frontend**: 2 días
- **Testing**: 1 día
- **Total**: **6 días hábiles**
