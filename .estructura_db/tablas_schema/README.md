# Estructura de Tablas Schema - Enerbook

Esta carpeta contiene archivos JSON que representan **exactamente** la estructura de cada tabla del schema.sql, con datos de ejemplo realistas y completos.

## 📋 **Mapeo 1:1 con Schema.sql**

| **Archivo JSON** | **Tabla SQL** | **Registros** | **Estado** |
|------------------|---------------|---------------|------------|
| `usuarios.json` | `usuarios` | 3 | ✅ Completo |
| `irradiacion_cache.json` | `irradiacion_cache` | 2 | ✅ Completo |
| `cotizaciones_inicial.json` | `cotizaciones_inicial` | 2 | ✅ Completo |
| `proveedores.json` | `proveedores` | 4 | ✅ Completo |
| `certificaciones.json` | `certificaciones` | 9 | ✅ Completo |
| `proyectos.json` | `proyectos` | 4 | ✅ Completo |
| `cotizaciones_final.json` | `cotizaciones_final` | 2 | ✅ Completo |
| `contratos.json` | `contratos` | 3 | ✅ Completo |
| `pagos_milestones.json` | `pagos_milestones` | 3 | ✅ Completo |
| `transacciones_financiamiento.json` | `transacciones_financiamiento` | 1 | ✅ Completo |
| `comisiones_enerbook.json` | `comisiones_enerbook` | 2 | ✅ Completo |
| `resenas.json` | `resenas` | 1 | ✅ Completo |
| `stripe_webhooks_log.json` | `stripe_webhooks_log` | 2 | ✅ Completo |
| `stripe_disputes.json` | `stripe_disputes` | 1 | ✅ Completo |

## 🔗 **Relaciones entre Archivos**

Los datos mantienen consistencia en las foreign keys:

```
usuarios → cotizaciones_inicial → proyectos → cotizaciones_final → contratos
    ↓              ↓                   ↓              ↓              ↓
proveedores → certificaciones     ↓              ↓         pagos_milestones
    ↓                              ↓              ↓              ↓
stripe_requirements            ↓              ↓         transacciones_financiamiento
                                   ↓              ↓              ↓
                              opciones_pago   ↓         comisiones_enerbook
                                              ↓              ↓
                                         resenas      stripe_webhooks_log
                                                           ↓
                                                  stripe_disputes
```

## 📊 **Casos de Uso Cubiertos**

### **Escenario 1: Pago Único (Upfront)**
- Usuario: Juan Pérez (`usuarios[0]`)
- Cotización: Premium SolarEdge (`cotizaciones_final[1]`)
- Contrato: CTR-2025-0001 (`contratos[0]`)
- Estado: Pagado y completado

### **Escenario 2: Pago por Milestones**
- Usuario: María González (`usuarios[1]`)
- Cotización: Canadian Solar (`cotizaciones_final[0]`)
- Contrato: CTR-2025-0002 (`contratos[1]`)
- Milestones: 3 pagos programados (`pagos_milestones[0-2]`)

### **Escenario 3: Financiamiento Externo**
- Usuario: Carlos Rodríguez (`usuarios[2]`)
- Contrato: CTR-2025-0003 (`contratos[2]`)
- Financiamiento: Banco Solar MX (`transacciones_financiamiento[0]`)
- Service Fee: $45,000 MXN (`comisiones_enerbook[1]`)

## 🎯 **Uso Recomendado**

1. **Desarrollo**: Usar como datos semilla para testing
2. **API Testing**: Endpoints con datos realistas
3. **Frontend**: Mockups con datos consistentes
4. **Documentación**: Ejemplos para API docs

## ⚠️ **Importante**

- Todos los UUIDs son consistentes entre archivos
- Los montos incluyen IVA mexicano (16%)
- Las fechas siguen el flujo lógico del negocio
- Los campos JSONB contienen estructuras completas
- Los estados reflejan el ciclo de vida real

---
*Generado automáticamente por Claude Code el 2025-01-18*