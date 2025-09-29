# Feature: Instalador

Este módulo contiene toda la funcionalidad relacionada con el rol de **Instalador** (proveedores de servicios solares).

## Estructura

```
instalador/
├── components/
│   ├── auth/                        # Autenticación
│   │   └── InstallerNavbar.jsx      # Navbar para login/signup
│   │
│   ├── dashboard/                   # Tabs del dashboard
│   │   ├── ProfileTab.jsx           # Perfil de empresa
│   │   ├── DocumentsTab.jsx         # Documentos legales
│   │   ├── CertificationsTab.jsx    # Certificaciones
│   │   └── ProjectsTab.jsx          # Hub de proyectos
│   │
│   ├── views/                       # Vistas de ProjectsTab
│   │   ├── QuotationsView.jsx       # Cotizaciones enviadas
│   │   ├── ContractsView.jsx        # Contratos activos
│   │   └── ReviewsView.jsx          # Reseñas recibidas
│   │
│   ├── cards/                       # Tarjetas individuales
│   │   ├── QuotationCard.jsx        # Tarjeta de cotización
│   │   ├── ContractCard.jsx         # Tarjeta de contrato
│   │   └── ReviewCard.jsx           # Tarjeta de reseña
│   │
│   └── modals/                      # Modales de acción
│       ├── ProjectDetailsModal.jsx   # Detalles de proyecto
│       ├── SendQuoteModal.jsx        # Enviar cotización
│       ├── QuotationDetailsModal.jsx # Ver cotización
│       ├── ContractDetailsModal.jsx  # Ver contrato
│       ├── UpdateStatusModal.jsx     # Actualizar estado
│       ├── UploadDocumentModal.jsx   # Subir documento
│       └── UploadCertificationModal.jsx # Subir certificación
│
└── services/
    └── installerService.js           # CRUD de instaladores
```

## Características Principales

### ¿Qué es un Instalador?
Un **instalador** es una empresa/proveedor que:
- Recibe notificaciones de proyectos solares disponibles
- Envía cotizaciones personalizadas a clientes
- Gestiona contratos firmados
- Sube documentación legal y certificaciones
- Recibe reseñas y calificaciones de clientes

### Flujo de Usuario Instalador

1. **Registro y Verificación**
   - Instalador se registra con datos de empresa
   - Sube documentos legales requeridos
   - Sube certificaciones (ISO, CE, UL, etc.)
   - Admin verifica y activa cuenta

2. **Proyectos Disponibles**
   - Recibe alertas de nuevos proyectos
   - Ve detalles técnicos completos
   - Decide enviar cotización

3. **Envío de Cotización**
   - Completa formulario con propuesta
   - Especifica precio, plazo, garantías
   - Cotización llega al cliente

4. **Gestión de Contratos**
   - Cliente acepta cotización → Se crea contrato
   - Actualiza status del proyecto (milestones)
   - Recibe pagos según avance

5. **Reseñas**
   - Cliente califica al terminar proyecto
   - Reseñas visibles en perfil público

## Componentes del Dashboard

### ProfileTab
```jsx
import ProfileTab from '@instalador/components/dashboard/ProfileTab';

// Campos del perfil
- Nombre de empresa
- Representante legal
- RFC
- Teléfono
- CURP
- Dirección fiscal
- Estados donde opera
- Descripción de la empresa
- Fecha de fundación
```

**Características:**
- Modo edición/vista
- Validación de campos
- Guardado automático en `proveedores`

### DocumentsTab
```jsx
import DocumentsTab from '@instalador/components/dashboard/DocumentsTab';

// Documentos requeridos
- Identificación oficial
- Acta constitutiva
- Declaración no deudor
- Declaración jurada
- Poder notarial
- Otros documentos legales
```

**Características:**
- Subida de archivos PDF/imágenes
- Estado: subido/pendiente
- Descarga de documentos
- Reemplazo de archivos

### CertificationsTab
```jsx
import CertificationsTab from '@instalador/components/dashboard/CertificationsTab';

// Certificaciones comunes
- ISO 9001:2015
- CE
- UL
- Otras certificaciones
```

**Características:**
- Fecha de obtención y expiración
- Alertas de vencimiento
- Subida de certificados escaneados

### ProjectsTab
```jsx
import ProjectsTab from '@instalador/components/dashboard/ProjectsTab';

// Sub-tabs
1. Proyectos Disponibles - Nuevas oportunidades
2. Mis Cotizaciones - Cotizaciones enviadas
3. Contratos - Proyectos activos
4. Mis Reseñas - Calificaciones recibidas
```

**Características:**
- Vista de proyectos con filtros
- Detalles técnicos completos
- Botón "Enviar Cotización"
- Estados: disponible, cotizado, contratado

## Vistas de Proyectos

### QuotationsView
Muestra todas las cotizaciones enviadas con su estado:
- **Pendiente**: Cliente aún no responde
- **Aceptada**: Se convirtió en contrato
- **Rechazada**: Cliente eligió otro proveedor

### ContractsView
Lista de contratos activos con:
- Milestones del proyecto
- Pagos pendientes/completados
- Botón para actualizar status
- Documentos del contrato

### ReviewsView
Reseñas y calificaciones de clientes:
- Calificación (1-5 estrellas)
- Comentario del cliente
- Fecha de proyecto
- Proyecto asociado

## Modales

### SendQuoteModal
```jsx
// Campos de la cotización
- Precio total del sistema
- Plazo de instalación (días)
- Garantía de equipos (años)
- Garantía de mano de obra (años)
- Comentarios adicionales
- Términos y condiciones
```

### UpdateStatusModal
Actualiza el estado del contrato:
- En progreso
- Completado
- Pausado
- Cancelado

### UploadDocumentModal
Modal para subir documentos legales con:
- Drag & drop
- Validación de formato
- Vista previa
- Confirmación de subida

## Servicios

### installerService.js
```javascript
import { installerService } from '@instalador/services/installerService';

// Obtener todos los instaladores
const installers = await installerService.getAllInstallers();

// Obtener por ID
const installer = await installerService.getInstallerById(id);

// Obtener por usuario ID
const installer = await installerService.getInstallerByUserId(userId);

// Actualizar perfil
await installerService.updateInstaller(id, updates);

// Obtener reseñas
const reviews = await installerService.getInstallerReviews(id);
```

## Integración con la Base de Datos

### Tabla: proveedores
```sql
- id (uuid)
- usuario_id (uuid) -> usuarios.id
- nombre_empresa (text)
- representante_legal (text)
- rfc (text)
- telefono (text)
- curp (text)
- direccion_fiscal (text)
- estados_operacion (text[])
- descripcion_empresa (text)
- fecha_fundacion (date)
- activo (boolean)
- stripe_account_id (text)
- stripe_onboarding_completed (boolean)
- stripe_account_type (text)
- acepta_financiamiento_externo (boolean)
- created_at, updated_at
```

### Otras Tablas Relacionadas
- `cotizaciones_proveedores` - Cotizaciones enviadas
- `contratos` - Contratos firmados
- `resenas_proveedores` - Reseñas recibidas
- `documentos_proveedores` - Documentos legales
- `certificaciones_proveedores` - Certificaciones

## Integración con Stripe

Los instaladores usan **Stripe Connect** para recibir pagos:

1. **Onboarding**
   - Instalador completa perfil
   - Se crea cuenta Stripe Connect (Express Account)
   - Stripe verifica identidad y datos bancarios

2. **Recepción de Pagos**
   - Cliente paga → Funds hold en Stripe
   - Se completa milestone → Pago liberado a instalador
   - Enerbook retiene comisión automáticamente

3. **Tipos de Cuenta**
   - **Express**: Recomendado, proceso simplificado
   - **Standard**: Control total del instalador
   - **Custom**: Personalización máxima

## Flujo de Datos

### 1. Registro → Verificación
```
Instalador → installer-signup.jsx → AuthContext
                                       ↓
                        Crea entrada en usuarios (tipo: instalador)
                                       ↓
                        Crea entrada en proveedores (activo: false)
                                       ↓
                        Email a admin para verificación
```

### 2. Proyecto Nuevo → Notificación
```
Cliente solicita cotizaciones → proyectos (estado: abierto)
                                       ↓
            Webhook/Trigger envía notificaciones a instaladores activos
                                       ↓
            Instaladores ven en "Proyectos Disponibles"
```

### 3. Enviar Cotización
```
Instalador → SendQuoteModal → cotizaciones_proveedores
                                       ↓
                        Notificación al cliente
                                       ↓
                Cliente ve en ProyectosTab → "Cotizaciones Recibidas"
```

### 4. Cotización Aceptada → Contrato
```
Cliente acepta cotización → contratos (estado: activo)
                                       ↓
                    proyecto (estado: en_progreso)
                                       ↓
            Instalador ve en ContractsView
```

## Permisos y Acceso

### Verificación de Instalador
```javascript
// En AuthContext
const { data: installer } = await supabase
  .from('proveedores')
  .select('*')
  .eq('usuario_id', user.id)
  .eq('activo', true)
  .single();

if (!installer) {
  // Redirigir o mostrar mensaje de cuenta no activa
}
```

### Estados del Instalador
- **Pendiente**: Registrado, esperando verificación
- **Activo**: Verificado, puede recibir proyectos
- **Suspendido**: Temporalmente deshabilitado
- **Inactivo**: Cuenta cerrada

## Navegación

### UnifiedSidebar para Instaladores
Items disponibles:
- ✅ Perfil
- ✅ Documentos
- ✅ Certificaciones
- ✅ Proyectos (4 sub-tabs)
- ✅ Cerrar Sesión

## Uso en Aplicación

```javascript
// En app/installer-dashboard.jsx
import ProfileTab from '@instalador/components/dashboard/ProfileTab';
import ProjectsTab from '@instalador/components/dashboard/ProjectsTab';
import SendQuoteModal from '@instalador/components/modals/SendQuoteModal';

// Verificación de acceso
const { user, userType } = useAuth();

if (userType !== 'instalador') {
  // Redirigir
}
```

## Próximas Mejoras
- [ ] Chat en tiempo real con clientes
- [ ] Calendario de instalaciones
- [ ] Inventario de materiales
- [ ] Sistema de subcontratistas
- [ ] Analytics de cotizaciones (tasa de éxito)
- [ ] Programa de referidos
- [ ] Certificaciones automáticas desde organismos
- [ ] Integración con ERP externos

## Notas Importantes
- **Stripe Connect obligatorio**: Sin completar onboarding, no pueden recibir pagos
- **Documentos legales**: Requeridos para activación de cuenta
- **Certificaciones**: Opcionales pero mejoran confianza del cliente
- **Reseñas públicas**: Visibles para futuros clientes
- **Comisión Enerbook**: Se retiene automáticamente en cada pago