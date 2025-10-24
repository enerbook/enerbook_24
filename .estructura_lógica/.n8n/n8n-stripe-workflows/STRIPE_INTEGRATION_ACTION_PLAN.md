# Plan de Acción - Integración Stripe con Sistema Actual

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ INFRAESTRUCTURA YA IMPLEMENTADA

#### 1. Workflows n8n (100% funcionales)
- **W1**: Upfront Payment Processing (`/webhook/payment-upfront`)
- **W2**: Stripe Webhook Handler (`/webhook/stripe-events`)
- **W3**: Milestone Setup (`/webhook/payment-milestones-setup`)
- **W4**: Milestone Complete (`/webhook/milestone-complete`)
- **W5**: Milestone Payment (`/webhook/milestone-pay`)

#### 2. API Services (`src/api/payments.js`)
```javascript
✅ createUpfrontPayment()  → Llama W1
✅ setupMilestones()        → Llama W3
✅ completeMilestone()      → Llama W4
✅ payMilestone()           → Llama W5
```

#### 3. Context & Hooks
- ✅ `src/context/PaymentContext.jsx` - Estado global de pagos
- ✅ `src/hooks/usePaymentSheet.js` - Hook multiplataforma Stripe
- ✅ `src/hooks/usePaymentSheetWeb.js` - Implementación web

#### 4. Componentes Cliente (Payment)
- ✅ `src/cliente/components/payment/PaymentMethodSelector.jsx`
- ✅ `src/cliente/components/payment/UpfrontPayment.jsx`
- ✅ `src/cliente/components/payment/StripePaymentFormWeb.jsx`

#### 5. Tabs de Pagos
- ✅ `src/cliente/components/dashboard/proyecto-tabs/PagosTab.jsx`
- ✅ `src/instalador/components/contrato-tabs/PagosTab.jsx`

#### 6. Configuración Stripe
- ✅ StripeProvider en `app/_layout.jsx`
- ✅ Variables de entorno configuradas:
  - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

#### 7. Sistema de Contratos/Cotizaciones
- ✅ `src/cliente/services/contractService.js`
- ✅ `src/cliente/services/quotationService.js`
- ✅ `src/cliente/components/modals/AcceptQuotationModal.jsx`

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 1. **Conexión AcceptQuotationModal → Flujo de Pagos**
El modal actual solo crea contratos pero NO inicia pagos.

### 2. **Integración PagosTab en Proyecto Details**
PagosTab existe pero no está visible en `app/cliente-panel/proyecto/[id].jsx`

### 3. **Componentes Instalador para Milestones**
- Gestión de milestones (marcar completados)
- Vista de milestones completados pendientes de pago

### 4. **Stripe Connect Onboarding**
- Edge Function para crear cuenta Stripe Connect
- Pantalla de onboarding para instaladores

### 5. **Realtime Subscriptions**
Suscripciones a cambios en `payments` y `payment_milestones`

---

## 🎯 PLAN DE ACCIÓN - FASES

### **FASE 1: Conectar Sistema de Cotizaciones con Pagos** ⚡ PRIORIDAD MÁXIMA

#### ✅ Paso 1.1: Modificar AcceptQuotationModal
**Archivo**: `src/cliente/components/modals/AcceptQuotationModal.jsx`

**Cambios**:
```javascript
const handleAccept = async () => {
  // ... código existente que crea contrato ...

  const contract = await contractService.acceptQuotation(
    quotation.id,
    selectedPaymentType,
    userId
  );

  alert('¡Cotización aceptada! Ahora procede con el pago.');

  // NUEVO: Redirigir a PagosTab con flag para iniciar pago
  if (onSuccess) {
    onSuccess({
      contract,
      quotation,
      needsPaymentSetup: true,
      paymentType: selectedPaymentType
    });
  }

  onClose();
};
```

#### ✅ Paso 1.2: Actualizar proyecto/[id].jsx para mostrar PagosTab
**Archivo**: `app/cliente-panel/proyecto/[id].jsx`

**Agregar**:
- Incluir PagosTab en las tabs del proyecto
- Detectar flag `needsPaymentSetup` y activar PagosTab automáticamente
- Pasar datos de cotización/contrato a PagosTab

```javascript
// En el componente proyecto details
const [activeTab, setActiveTab] = useState('detalles');
const [paymentSetupData, setPaymentSetupData] = useState(null);

// Callback desde AcceptQuotationModal
const handleQuotationAccepted = (data) => {
  if (data.needsPaymentSetup) {
    setPaymentSetupData(data);
    setActiveTab('pagos');
  }
};
```

#### ✅ Paso 1.3: Adaptar PagosTab para recibir datos de contrato
**Archivo**: `src/cliente/components/dashboard/proyecto-tabs/PagosTab.jsx`

**Funcionalidad**:
- Detectar si viene de aceptación de cotización
- Mostrar PaymentMethodSelector si `needsPaymentSetup === true`
- Flujo automático: Upfront → UpfrontPayment / Milestones → setupMilestones

---

### **FASE 2: Completar Flujo de Pagos Cliente**

#### ✅ Paso 2.1: Integrar Realtime Subscriptions
**Crear**: `src/hooks/usePaymentUpdates.js`

```javascript
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePaymentUpdates = (paymentId, onUpdate) => {
  useEffect(() => {
    if (!paymentId) return;

    const subscription = supabase
      .channel(`payment-${paymentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `id=eq.${paymentId}`
      }, (payload) => {
        onUpdate('payment', payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payment_milestones',
        filter: `payment_id=eq.${paymentId}`
      }, (payload) => {
        onUpdate('milestone', payload.new);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [paymentId]);
};
```

#### ✅ Paso 2.2: Actualizar UpfrontPayment con Realtime
**Archivo**: `src/cliente/components/payment/UpfrontPayment.jsx`

**Ya implementado**, verificar que esté usando `usePaymentUpdates`.

#### ✅ Paso 2.3: Crear MilestoneTracking Component
**Crear**: `src/cliente/components/payment/MilestoneTracking.jsx`

**Funcionalidad**:
- Mostrar lista de milestones con estado
- Botón "Pagar" para milestones completados
- Llamar a `payMilestone()` → W5
- Mostrar Stripe Payment Sheet
- Suscripción realtime para actualizar estados

---

### **FASE 3: Implementar Gestión de Milestones (Instalador)**

#### ✅ Paso 3.1: Crear MilestonesTab para Instalador
**Crear**: `src/instalador/components/contrato-tabs/MilestonesTab.jsx`

**Funcionalidad**:
```javascript
import { useState, useEffect } from 'react';
import { completeMilestone } from '../../../api/payments';
import { supabase } from '../../../lib/supabaseClient';

export default function MilestonesTab({ contrato }) {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    loadMilestones();
  }, [contrato.id]);

  const loadMilestones = async () => {
    const { data } = await supabase
      .from('payment_milestones')
      .select('*')
      .eq('payment_id', contrato.payment_id)
      .order('milestone_number');

    setMilestones(data || []);
  };

  const handleMarkComplete = async (milestoneId) => {
    try {
      await completeMilestone(milestoneId); // Llama W4
      loadMilestones(); // Refrescar
      alert('Milestone marcado como completado');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <View>
      {milestones.map(milestone => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          onMarkComplete={() => handleMarkComplete(milestone.id)}
        />
      ))}
    </View>
  );
}
```

#### ✅ Paso 3.2: Integrar MilestonesTab en contrato details
**Archivo**: `app/instalador-panel/contrato/[id].jsx`

Agregar nueva tab "Hitos" que muestre `MilestonesTab`.

---

### **FASE 4: Stripe Connect para Instaladores**

#### ✅ Paso 4.1: Crear Edge Function
**Crear**: `supabase/functions/stripe_connect_onboard/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
});

serve(async (req) => {
  const { instalador_id, email, phone } = await req.json();

  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'standard',
    country: 'MX',
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
  });

  // Update proveedor with stripe_account_id
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  await fetch(`${supabaseUrl}/rest/v1/proveedores?id=eq.${instalador_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ stripe_account_id: account.id })
  });

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'enerbook://stripe-refresh',
    return_url: 'enerbook://stripe-success',
    type: 'account_onboarding',
  });

  return new Response(JSON.stringify({ url: accountLink.url }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### ✅ Paso 4.2: Deploy Edge Function
```bash
supabase functions deploy stripe_connect_onboard
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
```

#### ✅ Paso 4.3: Crear Pantalla Onboarding
**Crear**: `app/instalador-panel/stripe-onboarding.jsx`

```javascript
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../src/lib/supabaseClient';

export default function StripeOnboarding() {
  const { user } = useAuth();
  const [hasStripeAccount, setHasStripeAccount] = useState(false);

  useEffect(() => {
    checkStripeAccount();
  }, []);

  const checkStripeAccount = async () => {
    const { data } = await supabase
      .from('proveedores')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    setHasStripeAccount(!!data?.stripe_account_id);
  };

  const startOnboarding = async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/stripe_connect_onboard`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          instalador_id: user.id,
          email: user.email,
          phone: user.phone
        })
      }
    );

    const { url } = await response.json();
    await WebBrowser.openBrowserAsync(url);
  };

  if (hasStripeAccount) {
    return <Text>✅ Cuenta Stripe conectada</Text>;
  }

  return (
    <TouchableOpacity onPress={startOnboarding}>
      <Text>Conectar con Stripe</Text>
    </TouchableOpacity>
  );
}
```

---

### **FASE 5: Testing End-to-End**

#### ✅ Prueba 1: Flujo Upfront Payment
1. Cliente acepta cotización con método "Pago Total"
2. Se crea contrato en base de datos
3. Redirige a PagosTab
4. Muestra UpfrontPayment component
5. Cliente ingresa tarjeta de prueba `4242 4242 4242 4242`
6. Se llama a W1 → crea PaymentIntent
7. Stripe Payment Sheet aparece
8. Pago se confirma
9. W2 recibe webhook `payment_intent.succeeded`
10. `payments.status` → `completed`
11. `proyectos.payment_status` → `paid`
12. UI se actualiza via realtime

#### ✅ Prueba 2: Flujo Milestone Payment
1. Cliente acepta cotización con método "Pagos por Hitos"
2. Se crea contrato
3. Redirige a PagosTab
4. Cliente selecciona template de milestones
5. Se llama a W3 → crea payment + milestones
6. Muestra MilestoneTracking con milestones pendientes
7. Instalador va a su panel → MilestonesTab
8. Marca primer milestone como completado → W4
9. `payment_milestones.status` → `completed`
10. Cliente ve milestone listo para pagar
11. Cliente hace clic en "Pagar Milestone"
12. Se llama a W5 → crea PaymentIntent
13. Pago se confirma
14. W2 actualiza `payment_milestones.status` → `paid`
15. Siguiente milestone se desbloquea

#### ✅ Prueba 3: Stripe Connect
1. Nuevo instalador se registra
2. Panel muestra "Conectar Stripe"
3. Click → llama Edge Function
4. Crea cuenta Stripe Connect
5. Abre WebBrowser con Stripe onboarding
6. Instalador completa formularios
7. Stripe redirige a app
8. `proveedores.stripe_account_id` guardado
9. Instalador puede recibir pagos

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Conexión Cotizaciones → Pagos
- [ ] Modificar `AcceptQuotationModal.jsx` para redirigir a PagosTab
- [ ] Actualizar `proyecto/[id].jsx` para incluir PagosTab
- [ ] Adaptar `PagosTab.jsx` para recibir datos de contrato
- [ ] Testing: Aceptar cotización → Ver PagosTab

### FASE 2: Flujo Pagos Cliente
- [ ] Crear `usePaymentUpdates.js` hook
- [ ] Verificar `UpfrontPayment.jsx` con realtime
- [ ] Crear `MilestoneTracking.jsx` component
- [ ] Testing: Pago upfront completo
- [ ] Testing: Pago milestone individual

### FASE 3: Gestión Milestones Instalador
- [ ] Crear `MilestonesTab.jsx` para instalador
- [ ] Integrar en `contrato/[id].jsx`
- [ ] Testing: Marcar milestone completado

### FASE 4: Stripe Connect
- [ ] Crear Edge Function `stripe_connect_onboard`
- [ ] Deploy a Supabase
- [ ] Crear pantalla `stripe-onboarding.jsx`
- [ ] Agregar deep linking para return URLs
- [ ] Testing: Onboarding completo

### FASE 5: Testing E2E
- [ ] Flujo upfront completo (cliente)
- [ ] Flujo milestones completo (cliente + instalador)
- [ ] Verificar webhooks en n8n
- [ ] Verificar datos en Supabase
- [ ] Verificar transfers en Stripe Dashboard

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Tarea | Tiempo Estimado |
|------|-------|-----------------|
| **1** | Conexión Cotizaciones → Pagos | 1 día |
| **2** | Flujo Pagos Cliente | 2 días |
| **3** | Gestión Milestones Instalador | 1 día |
| **4** | Stripe Connect | 2 días |
| **5** | Testing E2E | 1 día |
| | **TOTAL** | **7 días hábiles** |

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### **HOY - DÍA 1**
1. ✅ Revisar arquitectura existente (COMPLETADO)
2. ⚡ Modificar `AcceptQuotationModal.jsx`
3. ⚡ Actualizar `proyecto/[id].jsx`
4. ⚡ Testing: Flujo aceptación → PagosTab

### **DÍA 2**
1. Crear `usePaymentUpdates.js`
2. Crear `MilestoneTracking.jsx`
3. Testing: Pago upfront

### **DÍA 3**
1. Testing: Pago milestones
2. Crear `MilestonesTab.jsx` instalador

### **DÍA 4-5**
1. Edge Function Stripe Connect
2. Pantalla onboarding
3. Testing onboarding

### **DÍA 6-7**
1. Testing E2E completo
2. Ajustes y correcciones
3. Documentación

---

## 📝 NOTAS IMPORTANTES

### Variables de Entorno Necesarias
```bash
# Frontend (.env)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_N8N_WEBHOOK_BASE_URL=https://services.enerbook.mx
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

# n8n
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Supabase Edge Functions
STRIPE_SECRET_KEY=sk_test_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Tablas de Base de Datos
- ✅ `payments` - Existe (creada por n8n workflows)
- ✅ `payment_milestones` - Existe (creada por n8n workflows)
- ✅ `installer_transfers` - Existe
- ✅ `contratos` - Existe (sistema actual)
- ✅ `cotizaciones_final` - Existe (sistema actual)
- ✅ `proyectos` - Existe (sistema actual)

### Endpoints n8n
- ✅ `POST /webhook/payment-upfront` - W1
- ✅ `POST /webhook/stripe-events` - W2
- ✅ `POST /webhook/payment-milestones-setup` - W3
- ✅ `POST /webhook/milestone-complete` - W4
- ✅ `POST /webhook/milestone-pay` - W5

---

## 🎯 OBJETIVO FINAL

**Al completar este plan tendremos:**

✅ Sistema de cotizaciones conectado con pagos Stripe
✅ Flujo completo de pago upfront funcionando
✅ Flujo completo de pagos por milestones funcionando
✅ Instaladores pueden marcar milestones completados
✅ Clientes pueden pagar milestones individuales
✅ Stripe Connect onboarding para instaladores
✅ Realtime updates en toda la aplicación
✅ Testing E2E completo

**Resultado**: Sistema de pagos completamente funcional y listo para producción.

---

**Documento generado**: 2025-10-23
**Basado en**: Auditoría completa del proyecto actual
**Próxima actualización**: Después de completar Fase 1