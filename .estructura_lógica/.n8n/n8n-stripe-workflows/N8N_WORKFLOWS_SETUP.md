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