# Feature: Admin

Este módulo contiene toda la funcionalidad relacionada con el rol de **Administrador**.

## Estructura

```
admin/
├── components/
│   └── tabs/                    # Tabs del dashboard administrativo
│       ├── ResumenTab.jsx       # Resumen general del sistema
│       ├── FinanzasTab.jsx      # Análisis financiero completo
│       ├── FinanzasTabSimple.jsx # Versión simplificada de finanzas
│       ├── ProveedoresTab.jsx   # Gestión de proveedores
│       ├── ProyectosTabSimple.jsx # Análisis de proyectos
│       └── AlertasTab.jsx       # Centro de alertas en tiempo real
│
├── services/
│   ├── auth.js                  # Autenticación y permisos de admin
│   └── queries.js               # Queries especializadas para métricas
│
└── hooks/
    └── useAdminMetrics.js       # Hook para cargar métricas con auto-refresh
```

## Características Principales

### Dashboard Administrativo
- **Página:** `app/admin-dashboard.jsx`
- **Verificación de acceso:** Tabla `administradores` con campo `activo = true`
- **Niveles:** `admin` y `super_admin`
- **Permisos:** Control granular mediante campo JSONB

### Tabs Disponibles

#### 1. Resumen General (ResumenTab)
- Métricas de usuarios (total, nuevos últimos 30 días)
- Estadísticas de proyectos (total, en progreso, completados)
- Valor total de contratos
- Comisiones generadas y pendientes
- Estado de proveedores y milestones

#### 2. Finanzas (FinanzasTab/FinanzasTabSimple)
- Comisiones totales, pendientes y pagadas
- Service fees de Stripe
- Disputas activas
- Análisis por tipo de pago
- Estado de milestones de pago
- Filtros por período (semana, mes, trimestre, año)

#### 3. Proveedores (ProveedoresTab)
- Lista completa de instaladores
- Estado de onboarding de Stripe
- Tipos de cuenta (Express, Standard, Custom)
- Proyectos por proveedor
- Búsqueda y filtrado avanzado
- Proveedores que aceptan financiamiento

#### 4. Proyectos (ProyectosTabSimple)
- Distribución por estado
- Análisis regional
- Tasas de completación y cancelación
- Valor total de contratos
- Filtros por región

#### 5. Alertas (AlertasTab)
Sistema de alertas en tiempo real que monitorea:
- **Críticas:** Milestones vencidos >7 días, disputas activas
- **Advertencias:** Webhooks sin procesar, onboarding pendiente
- **Información:** Proyectos sin actividad, pagos pendientes
- Auto-actualización cada 30 segundos

## Servicios

### auth.js
```javascript
// Funciones principales
checkAdminAccess(userId)           // Verifica si usuario es admin activo
hasAdminLevel(userId, level)       // Verifica nivel específico
hasPermission(userId, permission)  // Verifica permiso granular
listAdministrators()               // Lista todos los admins
createAdministrator()              // Crea nuevo admin
deactivateAdministrator()          // Desactiva un admin
```

### queries.js
```javascript
// Métricas disponibles
getUserMetrics()      // Usuarios y leads
getProjectMetrics()   // Estados de proyectos
getFinanceMetrics()   // Comisiones y contratos
getProviderMetrics()  // Proveedores y Stripe
getRegionalAnalysis() // Análisis por región
getSystemAlerts()     // Alertas del sistema
getTrends(period)     // Tendencias temporales
```

## Hooks

### useAdminMetrics
```javascript
import { useAdminMetrics } from '@admin/hooks/useAdminMetrics';

// Uso básico
const { data, loading, error, refresh } = useAdminMetrics('users');

// Con auto-refresh cada 30 segundos
const { data, loading } = useAdminMetrics('alerts', 30000);

// Tipos disponibles:
// 'users', 'projects', 'finance', 'providers', 'regional', 'alerts', 'trends'
```

## Integración con la Base de Datos

### Tabla: administradores
```sql
- id (uuid)
- usuario_id (uuid) -> usuarios.id
- nivel_acceso (text) -- 'admin' | 'super_admin'
- permisos (jsonb)
- activo (boolean)
- created_at, updated_at
```

### Tablas Consultadas
- `usuarios` - Clientes registrados
- `cotizaciones_leads_temp` - Leads temporales
- `proyectos` - Proyectos solares
- `contratos` - Contratos firmados
- `comisiones_enerbook` - Comisiones de la plataforma
- `proveedores` - Instaladores
- `pagos_milestones` - Pagos por milestone
- `stripe_webhooks_log` - Webhooks de Stripe
- `stripe_disputes` - Disputas de Stripe
- `transacciones_financiamiento` - Transacciones

## Uso en Aplicación

```javascript
// En app/admin-dashboard.jsx
import ResumenTab from '../src/admin/components/tabs/ResumenTab';
import { checkAdminAccess } from '../src/admin/services/auth';

// Verificación de acceso
const adminData = await checkAdminAccess(user.id);
if (!adminData) {
  // Redirigir o mostrar error
}
```

## Próximas Mejoras
- [ ] Dashboard con gráficos interactivos (Recharts)
- [ ] Exportación de reportes en PDF/Excel
- [ ] Sistema de notificaciones push
- [ ] Gestión de permisos desde UI
- [ ] Logs de auditoría de acciones admin
- [ ] Integración con herramientas de BI

## Notas Importantes
- **Seguridad:** Todas las queries validan acceso admin antes de ejecutar
- **Performance:** Usar auto-refresh con moderación para no sobrecargar DB
- **Permisos:** Super admins tienen acceso a todas las funcionalidades
- **Alertas:** Sistema crítico, verificar que funcione correctamente