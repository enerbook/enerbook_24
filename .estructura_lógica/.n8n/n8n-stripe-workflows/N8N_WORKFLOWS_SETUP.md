# Guía de Configuración - Workflows de n8n

Esta guía te llevará paso a paso para crear los 5 workflows necesarios para el sistema de pagos.

## 🎯 Resumen de Workflows

### Workflow 1: Upfront Payment Processing
Procesa pagos completos por adelantado. El cliente paga el 100% del proyecto en una sola transacción. Maneja la creación del cliente en Stripe, genera el Payment Intent, aplica el split de comisiones (8% plataforma, 92% instalador) y registra todo en la base de datos.

### Workflow 2: Stripe Webhook Handler
Recibe y procesa eventos de Stripe (webhooks). Actualiza el estado de los pagos cuando se completan o fallan, registra las transferencias a instaladores, y sincroniza el estado del proyecto en la base de datos según los eventos de Stripe.

### Workflow 3: Milestone Setup
Configura un plan de pagos por hitos para un proyecto. Divide el pago total según un template predefinido (ej: 30% inicio, 40% instalación, 30% entrega), calcula las comisiones por milestone, y crea los registros de hitos pendientes en la base de datos.

### Workflow 4: Milestone Complete (Instalador)
Permite al instalador marcar un hito como completado. Actualiza el estado del milestone a "completed" y registra la fecha de finalización, preparando el hito para que el cliente pueda proceder con el pago correspondiente.

### Workflow 5: Milestone Payment (Cliente)
Procesa el pago de un hito individual. El cliente paga solo el porcentaje correspondiente a ese milestone, se crea un Payment Intent específico, se aplican las comisiones sobre ese monto, y se actualiza el estado del hito a "in_progress" hasta que Stripe confirme el pago.

---

## 🔧 Configuración Previa

### 1. Credenciales en n8n

Antes de crear los workflows, configura estas credenciales en n8n:

#### A) **Stripe API**
1. En n8n, ve a **Settings** → **Credentials**
2. Click en **+ Add Credential**
3. Busca **Stripe API**
4. Completa:
   - **Secret Key**: `YOUR_STRIPE_SECRET_KEY`
5. Guarda como **"Stripe API"**

#### B) **Supabase (HTTP Header Auth)**
1. Click en **+ Add Credential**
2. Busca **Header Auth**
3. Completa:
   - **Name**: `Supabase Service Role`
   - **Name**: `apikey`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZHZvc2ppdHJrb3BuYXJib3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzMDMyMSwiZXhwIjoyMDczODA2MzIxfQ.AB4ke4bt8qF6QG8SWCOyQ2EF24UW-gBm50nNWOYrixI`
4. Guarda

#### C) **Variables de Entorno en n8n**
1. Ve a **Settings** → **Environment Variables**
2. Agrega:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://qkdvosjitrkopnarbozv.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZHZvc2ppdHJrb3BuYXJib3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzMDMyMSwiZXhwIjoyMDczODA2MzIxfQ.AB4ke4bt8qF6QG8SWCOyQ2EF24UW-gBm50nNWOYrixI
   STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
   ```

---

## 📋 WORKFLOW 1: Upfront Payment Processing

### Propósito
Procesar pagos completos (Upfront) de un proyecto.

### Request
- **URL**: `https://services.enerbook.mx/webhook/payment-upfront`
- **Method**: `POST`
- **Body**:
```json
{
  "proyecto_id": "uuid",
  "cliente_id": "uuid",
  "instalador_id": "uuid",
  "total_amount": 150000
}
```

### Nodos a Crear

#### 1. **Webhook** (Trigger)
- Type: `Webhook`
- HTTP Method: `POST`
- Path: `payment-upfront`
- Respond: `Using Respond to Webhook Node`

#### 2. **Code - Calculate Fees**
- Type: `Code`
- Mode: `Run Once for All Items`
- JavaScript Code:
```javascript
const totalAmount = $input.item.json.total_amount;
const platformFee = totalAmount * 0.08; // 8%
const installerAmount = totalAmount * 0.92; // 92%

return [{
  json: {
    ...$input.item.json,
    platform_fee: platformFee,
    installer_amount: installerAmount
  }
}];
```

#### 3. **HTTP Request - Get Installer Stripe Account**
- Type: `HTTP Request`
- Authentication: `Generic Credential Type` → `Header Auth` → Selecciona `Supabase Service Role`
- Method: `POST`
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/rpc/get_installer_stripe_account`
- Send Body: `Yes`
- Body Content Type: `JSON`
- Specify Body: `Using JSON`
- JSON:
```json
{
  "instalador_id": "={{ $json.instalador_id }}"
}
```
- Headers:
  - `Authorization`: `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Content-Type`: `application/json`

#### 4. **HTTP Request - Get Cliente Email**
- Type: `HTTP Request`
- Method: `POST`
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/rpc/get_user_email`
- Send Body: `Yes`
- JSON:
```json
{
  "user_id": "={{ $('Webhook').item.json.cliente_id }}"
}
```
- Headers:
  - `Authorization`: `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `apikey`: `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`

#### 5. **Code - Merge Data**
```javascript
const webhookData = $('Webhook').item.json;
const calculatedData = $('Code - Calculate Fees').item.json;
const stripeAccount = $('HTTP Request - Get Installer Stripe Account').item.json[0];
const clienteEmail = $('HTTP Request - Get Cliente Email').item.json;

return [{
  json: {
    ...webhookData,
    ...calculatedData,
    stripe_account_id: stripeAccount.stripe_account_id,
    cliente_email: clienteEmail
  }
}];
```

#### 6. **Stripe - Create Customer**
- Type: `Stripe`
- Credential: `Stripe API`
- Resource: `Customer`
- Operation: `Create`
- Email: `={{ $json.cliente_email }}`
- Additional Fields:
  - Metadata:
    - `cliente_id`: `={{ $json.cliente_id }}`
    - `proyecto_id`: `={{ $json.proyecto_id }}`

#### 7. **Stripe - Create Payment Intent**
- Type: `Stripe`
- Resource: `Payment Intent`
- Operation: `Create`
- Amount: `={{ Math.round($json.total_amount * 100) }}`
- Currency: `mxn`
- Additional Fields:
  - Customer: `={{ $('Stripe - Create Customer').item.json.id }}`
  - Application Fee Amount: `={{ Math.round($json.platform_fee * 100) }}`
  - Transfer Data:
    - Destination: `={{ $json.stripe_account_id }}`
  - Metadata:
    - `proyecto_id`: `={{ $json.proyecto_id }}`
    - `payment_method`: `upfront`
    - `cliente_id`: `={{ $json.cliente_id }}`
    - `instalador_id`: `={{ $json.instalador_id }}`

#### 8. **HTTP Request - Insert Payment Record**
- Type: `HTTP Request`
- Method: `POST`
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payments`
- Send Headers: `Yes`
- Headers:
  - `apikey`: `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Authorization`: `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- Send Body: `Yes`
- Body Content Type: `JSON`
- JSON:
```json
{
  "proyecto_id": "={{ $json.proyecto_id }}",
  "cliente_id": "={{ $json.cliente_id }}",
  "instalador_id": "={{ $json.instalador_id }}",
  "payment_method": "upfront",
  "total_amount": {{ $json.total_amount }},
  "platform_fee": {{ $json.platform_fee }},
  "installer_amount": {{ $json.installer_amount }},
  "stripe_payment_intent_id": "={{ $('Stripe - Create Payment Intent').item.json.id }}",
  "stripe_customer_id": "={{ $('Stripe - Create Customer').item.json.id }}",
  "status": "processing"
}
```

#### 9. **Respond to Webhook - Success**
- Type: `Respond to Webhook`
- Respond With: `JSON`
- Response Code: `200`
- Response Body:
```json
{
  "success": true,
  "client_secret": "={{ $('Stripe - Create Payment Intent').item.json.client_secret }}",
  "payment_id": "={{ $('HTTP Request - Insert Payment Record').item.json[0].id }}"
}
```

### Conexiones
```
Webhook → Calculate Fees → Get Installer Stripe → Get Cliente Email → Merge Data → Create Customer → Create Payment Intent → Insert Payment → Respond Success
```

---

## 📋 WORKFLOW 2: Stripe Webhook Handler

### Propósito
Recibir eventos de Stripe y actualizar la base de datos.

### Request
- **URL**: `https://services.enerbook.mx/webhook/stripe-events`
- **Method**: `POST`
- **Configurar en Stripe Dashboard**

### Nodos a Crear

#### 1. **Webhook** (Trigger)
- Type: `Webhook`
- HTTP Method: `POST`
- Path: `stripe-events`
- Respond: `Immediately`

#### 2. **Code - Validate Stripe Signature**
```javascript
// Obtener headers y body
const signature = $input.item.headers['stripe-signature'];
const rawBody = $input.item.rawBody;

// En producción, validar con:
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

// Por ahora, pasamos el evento tal cual
return [{
  json: $input.item.json
}];
```

#### 3. **Switch - Event Type**
- Type: `Switch`
- Mode: `Rules`
- Rules:
  1. `payment_intent.succeeded` → `{{ $json.type === 'payment_intent.succeeded' }}`
  2. `transfer.created` → `{{ $json.type === 'transfer.created' }}`
  3. `payment_intent.payment_failed` → `{{ $json.type === 'payment_intent.payment_failed' }}`

#### 4a. **Branch: payment_intent.succeeded**

**HTTP Request - Update Payment Status**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payments`
- Method: `PATCH`
- Query Parameters:
  - `stripe_payment_intent_id`: `eq.{{ $json.data.object.id }}`
- Headers:
  - `apikey`: `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Authorization`: `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- JSON:
```json
{
  "status": "completed",
  "paid_at": "{{ $now }}"
}
```

**HTTP Request - Update Proyecto Status**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/proyectos`
- Method: `PATCH`
- Query Parameters:
  - `id`: `eq.{{ $json.data.object.metadata.proyecto_id }}`
- JSON:
```json
{
  "payment_status": "paid"
}
```

#### 4b. **Branch: transfer.created**

**HTTP Request - Insert Transfer Record**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/installer_transfers`
- Method: `POST`
- JSON:
```json
{
  "payment_id": "={{ $json.data.object.metadata.payment_id }}",
  "instalador_id": "={{ $json.data.object.metadata.instalador_id }}",
  "stripe_transfer_id": "={{ $json.data.object.id }}",
  "amount": {{ $json.data.object.amount / 100 }},
  "status": "completed",
  "transferred_at": "={{ $json.data.object.created }}"
}
```

#### 4c. **Branch: payment_intent.payment_failed**

**HTTP Request - Update Payment Failed**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payments`
- Method: `PATCH`
- Query Parameters:
  - `stripe_payment_intent_id`: `eq.{{ $json.data.object.id }}`
- JSON:
```json
{
  "status": "failed"
}
```

---

## 📋 WORKFLOW 3: Milestone Setup

### Request
```json
{
  "proyecto_id": "uuid",
  "cliente_id": "uuid",
  "instalador_id": "uuid",
  "total_amount": 150000,
  "template_id": "uuid"
}
```

### Nodos

#### 1. **Webhook**
- Path: `payment-milestones-setup`

#### 2. **HTTP Request - Get Template**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/installer_milestone_templates`
- Method: `GET`
- Query Parameters:
  - `id`: `eq.{{ $json.template_id }}`
  - `select`: `*`

#### 3. **Code - Calculate Fees & Milestones**
```javascript
const template = $('HTTP Request - Get Template').item.json[0];
const totalAmount = $input.item.json.total_amount;
const platformFee = totalAmount * 0.08;
const installerAmount = totalAmount * 0.92;

const milestones = template.milestones.map((m, index) => ({
  milestone_number: index + 1,
  title: m.title,
  description: m.description,
  percentage: m.percentage,
  amount: (totalAmount * m.percentage) / 100
}));

return [{
  json: {
    ...$input.item.json,
    platform_fee: platformFee,
    installer_amount: installerAmount,
    milestones: milestones
  }
}];
```

#### 4. **HTTP Request - Create Payment Record**
- Similar al Workflow 1 pero con `payment_method: "milestones"`

#### 5. **Code - Prepare Milestones for Insert**
```javascript
const paymentId = $('HTTP Request - Create Payment Record').item.json[0].id;
const milestones = $input.item.json.milestones;

return milestones.map(m => ({
  json: {
    payment_id: paymentId,
    milestone_number: m.milestone_number,
    title: m.title,
    description: m.description,
    percentage: m.percentage,
    amount: m.amount,
    status: 'pending'
  }
}));
```

#### 6. **HTTP Request - Insert Milestones** (Loop)
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payment_milestones`
- Method: `POST`
- Execute Once: `No` (loop sobre items)

---

## 📋 WORKFLOW 4: Milestone Complete (Instalador)

### Request
```json
{
  "milestone_id": "uuid"
}
```

### Nodos

#### 1. **Webhook**
- Path: `milestone-complete`

#### 2. **HTTP Request - Update Milestone**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payment_milestones`
- Method: `PATCH`
- Query Parameters:
  - `id`: `eq.{{ $json.milestone_id }}`
- JSON:
```json
{
  "status": "completed",
  "completed_at": "{{ $now }}"
}
```

---

## 📋 WORKFLOW 5: Milestone Payment (Cliente)

### Request
```json
{
  "milestone_id": "uuid"
}
```

### Nodos

#### 1. **Webhook**
- Path: `milestone-pay`

#### 2. **HTTP Request - Get Milestone + Payment**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payment_milestones`
- Method: `GET`
- Query Parameters:
  - `id`: `eq.{{ $json.milestone_id }}`
  - `select`: `*, payment:payments(*)`

#### 3. **Code - Calculate Milestone Fee**
```javascript
const milestone = $input.item.json[0];
const milestoneAmount = milestone.amount;
const platformFee = milestoneAmount * 0.08;
const installerAmount = milestoneAmount * 0.92;

return [{
  json: {
    ...milestone,
    milestone_platform_fee: platformFee,
    milestone_installer_amount: installerAmount,
    instalador_id: milestone.payment.instalador_id
  }
}];
```

#### 4. **Get Installer Stripe Account** (similar a Workflow 1)

#### 5. **Stripe - Create Payment Intent**
- Amount: `={{ Math.round($json.amount * 100) }}`
- Application Fee: `={{ Math.round($json.milestone_platform_fee * 100) }}`
- Transfer Destination: `={{ $json.stripe_account_id }}`
- Metadata:
  - `milestone_id`: `={{ $json.id }}`
  - `payment_method`: `milestones`

#### 6. **HTTP Request - Update Milestone with Payment Intent**
- URL: `{{ $env.EXPO_PUBLIC_SUPABASE_URL }}/rest/v1/payment_milestones`
- Method: `PATCH`
- Query Parameters:
  - `id`: `eq.{{ $json.id }}`
- JSON:
```json
{
  "stripe_payment_intent_id": "={{ $('Stripe - Create Payment Intent').item.json.id }}",
  "status": "in_progress"
}
```

#### 7. **Respond to Webhook**
```json
{
  "success": true,
  "client_secret": "={{ $('Stripe - Create Payment Intent').item.json.client_secret }}",
  "milestone_id": "={{ $json.id }}"
}
```

---

## ✅ Checklist de Configuración

- [ ] Credenciales de Stripe configuradas
- [ ] Credenciales de Supabase configuradas
- [ ] Variables de entorno configuradas
- [ ] Workflow 1: Upfront Payment creado y activado
- [ ] Workflow 2: Stripe Webhook creado y activado
- [ ] Workflow 3: Milestone Setup creado y activado
- [ ] Workflow 4: Milestone Complete creado y activado
- [ ] Workflow 5: Milestone Payment creado y activado
- [ ] Webhook de Stripe apuntando a `https://services.enerbook.mx/webhook/stripe-events`

---

## 🧪 Testing

### Test Workflow 1 (Upfront):
```bash
curl -X POST https://services.enerbook.mx/webhook/payment-upfront \
  -H "Content-Type: application/json" \
  -d '{
    "proyecto_id": "tu-proyecto-uuid",
    "cliente_id": "tu-cliente-uuid",
    "instalador_id": "tu-instalador-uuid",
    "total_amount": 150000
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_id": "uuid"
}
```