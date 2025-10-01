# Feature: Lead

Este módulo contiene toda la funcionalidad relacionada con el rol de **Lead** (usuarios anónimos temporales).

## Estructura

```
lead/
├── components/
│   ├── camera/                      # Captura de recibos CFE
│   │   ├── SimpleWebCamera.jsx      # Componente de cámara web
│   │   ├── AdvancedCameraOverlay.jsx# Overlay visual para guiar captura
│   │   └── ReceiptUploadModal.jsx   # Modal para subir recibos
│   │
│   └── dashboard/                   # Componentes del dashboard de lead
│       ├── tabs/                    # Tabs del dashboard
│       │   ├── DashboardTab.jsx     # Tab principal con resumen
│       │   ├── ConsumoTab.jsx       # Historial de consumo
│       │   ├── IrradiacionTab.jsx   # Datos de irradiación solar
│       │   └── DetallesTab.jsx      # Detalles del recibo y dimensionamiento
│       │
│       └── common/                  # Componentes compartidos del dashboard
│           ├── UserInfoBar.jsx      # Barra de información del usuario
│           ├── MetricsGrid.jsx      # Cuadrícula de métricas
│           ├── AnalysisCharts.jsx   # Gráficos de análisis
│           └── QuotesCTA.jsx        # Call-to-action para cotizaciones
│
├── hooks/
│   ├── useOcr.js                    # Hook para procesamiento OCR
│   └── useAdvancedReceiptScanner.js # Hook avanzado para escaneo
│
└── services/
    └── leadService.js               # Servicio para operaciones CRUD de leads
```

## Características Principales

### ¿Qué es un Lead?
Un **lead** es un usuario anónimo que:
- Analiza su recibo CFE sin necesidad de registro
- Tiene una sesión temporal identificada por `temp_lead_id`
- Sus datos se almacenan temporalmente en `cotizaciones_leads_temp`
- Puede convertirse en cliente registrándose

### Flujo de Usuario Lead

1. **Captura de Recibo**
   - Usuario captura/sube fotos del recibo CFE (frontal y posterior)
   - Sistema procesa con OCR vía webhook N8N
   - Genera `temp_lead_id` único

2. **Análisis Temporal**
   - Dashboard muestra datos del recibo procesado
   - Gráficos de consumo histórico
   - Cálculo de sistema solar recomendado
   - Irradiación solar de la ubicación

3. **Conversión a Cliente**
   - CTA visible en sidebar: "¡Regístrate!"
   - Al registrarse, datos migran a tabla `usuarios`
   - Se mantiene historial de análisis

### Componentes de Cámara/OCR

#### SimpleWebCamera
```javascript
import SimpleWebCamera from '@lead/components/camera/SimpleWebCamera';

// Componente de cámara con captura dual (frontal y posterior)
<SimpleWebCamera onComplete={handlePhotos} />
```

**Características:**
- Captura 2 fotos del recibo
- Indicadores de paso y progreso
- Previsualización de fotos
- Compatible con móvil y web

#### useOcr Hook
```javascript
import { useOcr } from '@lead/hooks/useOcr';

const { processImages, loading, error } = useOcr();

// Procesa imágenes y redirige con temp_lead_id
await processImages(frontImage, backImage);
```

**Flujo:**
1. Envía imágenes a webhook N8N
2. Webhook procesa OCR y guarda en DB
3. Retorna `temp_lead_id`
4. Redirige a dashboard con parámetro `?temp_lead_id=xxx`

### Dashboard de Lead

#### Tabs Disponibles
1. **Dashboard** - Vista principal con resumen
2. **Consumo** - Historial de consumo eléctrico con tabla y gráfico
3. **Irradiación** - Datos mensuales de irradiación solar
4. **Detalles** - Información completa del recibo y dimensionamiento

**Tabs NO disponibles para leads:**
- ❌ Proyectos (solo clientes)
- ❌ Perfil (solo clientes)

#### Componentes Comunes

**UserInfoBar**
- Muestra nombre del recibo, número de servicio y dirección
- Se adapta según tipo de usuario (lead/cliente)

**MetricsGrid**
- 4 métricas clave: Consumo promedio, Sistema requerido, Irradiación, Producción esperada
- Datos reales desde `leadData` con fallback

**AnalysisCharts**
- Gráfico de consumo histórico (últimos 12 meses)
- Gráfico de irradiación mensual
- Generación dinámica con SVG

**QuotesCTA**
- Call-to-action para solicitar cotizaciones
- Para leads: muestra botón "Crear Cuenta" en sidebar
- Para clientes: modal de solicitud de cotizaciones

## Servicios

### leadService.js
```javascript
import { leadService } from '@lead/services/leadService';

// Obtener datos de lead por temp_lead_id
const leadData = await leadService.getLeadData(tempLeadId);

// Crear nuevo lead
const newLead = await leadService.createLeadData(data);

// Actualizar lead existente
await leadService.updateLeadData(tempLeadId, updates);

// Eliminar lead (después de conversión)
await leadService.deleteLeadData(tempLeadId);
```

## Integración con la Base de Datos

### Tabla: cotizaciones_leads_temp
```sql
- temp_lead_id (text, PK)
- nombre (text)
- no_servicio (text)
- direccion (text)
- tarifa (text)
- consumo_kwh_historico (jsonb)
- sizing_results (jsonb)
- irradiation_data (jsonb)
- created_at (timestamp)
```

### Datos Almacenados

**consumo_kwh_historico:**
```json
[
  { "periodo": "ENE-2024", "consumo": 250, "porcentaje_promedio": 95 },
  ...
]
```

**sizing_results:**
```json
{
  "results": {
    "kWp_needed": 3.73,
    "n_panels": 7,
    "estimated_annual_production": 5850
  }
}
```

**irradiation_data:**
```json
{
  "monthly": [
    { "mes": "ENE", "value": 5.2, "rank": "Medio" },
    ...
  ]
}
```

## Flujo de Datos

### 1. Captura → OCR → Lead
```
Usuario → SimpleWebCamera → useOcr → N8N Webhook
                                         ↓
                            cotizaciones_leads_temp
                                         ↓
                            Redirige con temp_lead_id
                                         ↓
                            leads-users-dashboard
```

### 2. Lead → AuthContext
```
URL params (temp_lead_id) → AuthContext.setLeadMode()
                                  ↓
                          fetchLeadData()
                                  ↓
                          leadService.getLeadData()
                                  ↓
                          leadData almacenado en context
```

### 3. Dashboard → DashboardDataContext
```
DashboardDataContext detecta userType === 'lead'
            ↓
    Toma leadData de AuthContext
            ↓
    Procesa datos (consumo, irradiación, métricas)
            ↓
    Provee datos a componentes del dashboard
```

## Conversión Lead → Cliente

### Flujo en signup.jsx
```javascript
import { useAuth } from '@/context/AuthContext';

const { leadData, migrateLeadToClient } = useAuth();

// Durante el registro
if (leadData && leadData.temp_lead_id) {
  // Pre-llena nombre desde recibo
  setFormData({ nombre: leadData.nombre || '' });

  // Al registrarse exitosamente
  await migrateLeadToClient(userId, leadData.temp_lead_id);
  // → Crea entrada en cotizaciones_inicial
  // → Elimina entrada temporal de cotizaciones_leads_temp
}
```

## Uso en Aplicación

```javascript
// En app/leads-users-dashboard.jsx
import DashboardTab from '../src/lead/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/lead/components/dashboard/tabs/ConsumoTab';

// Detectar modo lead
const searchParams = new URLSearchParams(window.location.search);
const tempLeadId = searchParams.get('temp_lead_id');

if (tempLeadId && !user) {
  // Activar modo lead
  await setLeadMode(tempLeadId);
}
```

## Navegación

### UnifiedSidebar para Leads
Items disponibles:
- ✅ Dashboard
- ✅ Consumo
- ✅ Irradiación
- ✅ Detalles
- ❌ Proyectos (oculto)
- ❌ Perfil (oculto)
- ✨ CTA "¡Regístrate!" (destacado)

## Próximas Mejoras
- [ ] Persistencia de leads en localStorage
- [ ] Recordatorios automáticos para registro
- [ ] Comparativas de consumo con otros usuarios
- [ ] Simulador interactivo de ahorros
- [ ] Exportación de análisis en PDF
- [ ] Sistema de referidos para leads

## Notas Importantes
- **Temporal:** Los datos de leads son temporales y pueden ser eliminados después de X días
- **Sin autenticación:** Leads no requieren login, acceso por URL con temp_lead_id
- **Migración limpia:** Al convertirse en cliente, no se duplican datos
- **Fallback:** Siempre hay datos de ejemplo para testing si no hay leadData