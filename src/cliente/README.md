# Cliente Feature Module

This module contains all components, hooks, services, and logic related to registered clients in the Enerbook platform.

## Overview

The Cliente feature manages registered users who have completed signup and are managing their solar energy projects. Clients can:
- Request quotes from verified installers
- View and compare received quotes
- Sign contracts with selected installers
- Track project progress
- Manage their profile and account settings

## Directory Structure

```
src/cliente/
├── components/
│   ├── auth/
│   │   └── LoginNavbar.jsx           # Navigation bar for login/signup pages
│   ├── dashboard/
│   │   ├── tabs/
│   │   │   ├── DashboardTab.jsx      # Main overview tab
│   │   │   ├── ConsumoTab.jsx        # Energy consumption analysis tab
│   │   │   ├── IrradiacionTab.jsx    # Solar irradiation analysis tab
│   │   │   ├── DetallesTab.jsx       # Technical details tab
│   │   │   ├── ProyectosTab.jsx      # Projects management tab (quotes, contracts, progress)
│   │   │   └── PerfilTab.jsx         # Profile management tab
│   │   ├── common/
│   │   │   ├── AnalysisCharts.jsx    # Consumption and irradiation charts
│   │   │   ├── ChartCard.jsx         # Reusable chart component with SVG
│   │   │   ├── MetricTile.jsx        # Individual metric tile
│   │   │   ├── MetricsGrid.jsx       # Grid of metrics (consumption, irradiation, system)
│   │   │   ├── QuotesCTA.jsx         # CTA for requesting quotes
│   │   │   └── UserInfoBar.jsx       # User info header bar
│   │   └── DetallesProyectoSolar.jsx # Detailed project view
│   ├── layout/
│   │   └── ClienteAppLayout.jsx      # Main layout wrapper with sidebar
│   ├── modals/
│   │   ├── SolicitarCotizacionesModal.jsx  # Modal for requesting quotes from installers
│   │   ├── AcceptQuotationModal.jsx        # Modal for accepting a quote and selecting payment
│   │   ├── NuevoProyectoModal.jsx          # Modal for creating new project with OCR
│   │   └── ReceiptUploadModal.jsx          # Modal for uploading CFE receipts
│   └── ClientSidebar.jsx             # Client-specific sidebar navigation
├── context/
│   ├── ClienteAuthContext.jsx        # Client authentication context wrapper
│   └── ClienteDashboardDataContext.jsx # Dashboard data processing context
├── hooks/
│   ├── useSolicitarCotizaciones.js   # Hook for quote request flow (shared with Lead)
│   └── useClientRealtime.js          # Real-time subscriptions for projects and quotes
├── services/
│   ├── authService.js                # Authentication service
│   ├── clientService.js              # Client CRUD operations
│   ├── projectService.js             # Project management service
│   ├── quotationService.js           # Quotation management service
│   └── contractService.js            # Contract management service
└── README.md
```

## Components

### Auth Components

#### LoginNavbar
- **Purpose**: Navigation bar for authentication pages (login, signup)
- **Location**: `components/auth/LoginNavbar.jsx`
- **Props**: `{ onNavigate: Function }`
- **Usage**:
  ```jsx
  import LoginNavbar from '../src/cliente/components/auth/LoginNavbar';
  <LoginNavbar onNavigate={handleNavigate} />
  ```

### Dashboard Tabs

#### DashboardTab
- **Purpose**: Main overview dashboard
- **Location**: `components/dashboard/tabs/DashboardTab.jsx`
- **Components Used**:
  - `UserInfoBar` - User information header
  - `QuotesCTA` - Call-to-action for requesting quotes
  - `MetricsGrid` - Key metrics display (consumption, irradiation, system size)
  - `AnalysisCharts` - Consumption and irradiation charts
- **Data Source**: `ClienteDashboardDataContext`

#### ConsumoTab
- **Purpose**: Energy consumption analysis
- **Location**: `components/dashboard/tabs/ConsumoTab.jsx`
- **Features**:
  - Historical consumption charts
  - Monthly breakdown
  - Consumption patterns
- **Data Source**: `consumo_kwh_historico` from initial analysis

#### IrradiacionTab
- **Purpose**: Solar irradiation analysis
- **Location**: `components/dashboard/tabs/IrradiacionTab.jsx`
- **Features**:
  - Monthly irradiation data
  - NASA data integration
  - Seasonal variations
- **Data Source**: `irradiacion_cache` with fallback to sizing results

#### DetallesTab
- **Purpose**: Technical system details
- **Location**: `components/dashboard/tabs/DetallesTab.jsx`
- **Features**:
  - System sizing details (kWp, panels, inverters)
  - Energy production estimates
  - Technical specifications
- **Data Source**: `sizing_results` from initial analysis

#### ProyectosTab
- **Purpose**: Project management interface
- **Location**: `components/dashboard/tabs/ProyectosTab.jsx`
- **Features**:
  - Create new projects with OCR receipt upload
  - Request quotes from installers
  - View received quotes
  - Accept quotes and select payment methods
  - Track contracts
  - View project status
- **Data Sources**: `proyectos`, `cotizaciones`, `contratos` tables
- **Related Modals**: SolicitarCotizacionesModal, NuevoProyectoModal, ReceiptUploadModal, AcceptQuotationModal

#### PerfilTab
- **Purpose**: User profile and account settings
- **Location**: `components/dashboard/tabs/PerfilTab.jsx`
- **Features**:
  - Update personal information
  - Change password
  - Manage notification preferences
  - View account history

### Modals

#### SolicitarCotizacionesModal
- **Purpose**: Submit quote requests to verified installers
- **Location**: `components/modals/SolicitarCotizacionesModal.jsx`
- **Props**: `{ isOpen: boolean, onClose: Function, onSuccess: Function }`
- **Features**:
  - Project details form
  - Installer selection from verified providers
  - Automatic notification to selected installers
  - Integration with email/SMS alerts
- **Shared Usage**: Also used by Lead feature for temporary users
- **Cross-feature Import Example**:
  ```jsx
  // From Lead feature
  import SolicitarCotizacionesModal from '../../../../cliente/components/modals/SolicitarCotizacionesModal';
  ```

#### AcceptQuotationModal
- **Purpose**: Accept a quote and select payment method
- **Location**: `components/modals/AcceptQuotationModal.jsx`
- **Props**: `{ quotation: Object, onClose: Function, onSuccess: Function, userId: string }`
- **Features**:
  - Display quotation details
  - Payment method selection:
    - Upfront payment (100% at start)
    - Milestone payments (30%-40%-30%)
    - Financing (external entity)
  - Contract creation upon acceptance
- **Service Used**: `contractService.acceptQuotation()`

#### NuevoProyectoModal
- **Purpose**: Create new project with CFE receipt OCR
- **Location**: `components/modals/NuevoProyectoModal.jsx`
- **Props**: `{ isOpen: boolean, onClose: Function, onSuccess: Function }`
- **Features**:
  - File upload (max 2 files: front and back of receipt)
  - Supported formats: JPG, PNG, WebP, PDF
  - Max file size: 10MB per file
  - N8N webhook integration for OCR processing
  - Real-time upload progress
- **Webhook**: `https://services.enerbook.mx/webhook-test/ocr-nuevo-proyecto`

#### ReceiptUploadModal
- **Purpose**: Upload CFE receipt images for OCR processing
- **Location**: `components/modals/ReceiptUploadModal.jsx`
- **Props**: `{ isOpen: boolean, onClose: Function, onSubmit: Function, ocrData: Object, setOcrData: Function, isLoading: boolean }`
- **Features**:
  - Drag-and-drop file upload
  - Image preview
  - OCR result display
  - Integration with N8N webhook
- **Used By**: ProyectosTab for creating new projects

## Hooks

### useSolicitarCotizaciones
- **Purpose**: Manages quote request flow and modal state
- **Location**: `hooks/useSolicitarCotizaciones.js`
- **Returns**:
  ```javascript
  {
    isModalOpen: boolean,
    openModal: Function,
    closeModal: Function,
    handleSuccess: Function
  }
  ```
- **Usage**:
  ```jsx
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();
  ```
- **Cross-feature Usage**: Imported by Lead components for temporary user quote requests

### useClientRealtime
- **Purpose**: Real-time subscriptions for client projects and quotes using Supabase
- **Location**: `hooks/useClientRealtime.js`
- **Exports**: Two hooks for different real-time subscriptions

#### useClientProjects
- **Returns**:
  ```javascript
  {
    projects: Array,        // Client's projects
    loading: boolean,       // Loading state
    error: string | null,   // Error message
    refresh: Function       // Manual refresh function
  }
  ```
- **Features**:
  - Real-time subscription to `proyectos` table
  - Automatically updates on INSERT/UPDATE/DELETE
  - Filters by client user ID
- **Usage**:
  ```jsx
  const { projects, loading, error, refresh } = useClientProjects();
  ```

#### useClientQuotes
- **Returns**:
  ```javascript
  {
    quotes: Array,              // Received quotations
    loading: boolean,           // Loading state
    newQuoteCount: number,      // Count of new quotes since last check
    clearNewQuoteCount: Function, // Reset new quote counter
    refresh: Function           // Manual refresh function
  }
  ```
- **Features**:
  - Real-time subscription to `cotizaciones` table
  - Tracks new quote notifications
  - Includes installer information via join
  - Automatically increments `newQuoteCount` on new quotes
- **Usage**:
  ```jsx
  const { quotes, loading, newQuoteCount, clearNewQuoteCount, refresh } = useClientQuotes();
  ```

## Services

### authService
- **Purpose**: Authentication operations for clients
- **Location**: `services/authService.js`
- **Key Methods**:
  - `signIn(email, password)` - Client login via Supabase Auth
  - `signUp(email, password)` - Client registration
  - `signOut()` - Logout
  - `getCurrentUser()` - Get current authenticated user
  - `getSession()` - Get current session with JWT token

### clientService
- **Purpose**: Client CRUD operations and business logic
- **Location**: `services/clientService.js`
- **Security**: Uses explicit column selection (no SELECT *)
- **Key Methods**:
  ```javascript
  {
    getClientByUserId: async (userId) => {},
    getClientWithQuote: async (userId) => {}, // Returns { user, cotizacion }
    upsertClient: async (userId, clientData) => {},
    updateClient: async (userId, updates) => {},
    getInitialQuote: async (userId) => {},
    createInitialQuote: async (quoteData) => {},
    updateInitialQuote: async (quoteId, updates) => {},
    migrateLeadToClient: async (userId, leadData) => {}
  }
  ```
- **Input Validation**:
  - Email validation with regex
  - Mexican phone number validation (10 digits)
  - String sanitization to prevent XSS
  - RFC validation (max 13 chars)
  - Date validation
- **Database Tables**:
  - `usuarios` - Client user records
  - `cotizaciones_inicial` - Initial CFE analysis (consumo_kwh_historico, sizing_results)

### projectService
- **Purpose**: Project management operations
- **Location**: `services/projectService.js`
- **Key Methods**:
  ```javascript
  {
    getClientProjects: async (userId) => {},
    createProject: async (projectData) => {},
    updateProject: async (projectId, updates) => {},
    deleteProject: async (projectId) => {}
  }
  ```
- **Database Table**: `proyectos`

### quotationService
- **Purpose**: Quotation management operations
- **Location**: `services/quotationService.js`
- **Key Methods**:
  ```javascript
  {
    getProjectQuotations: async (projectId) => {},
    getQuotationDetails: async (quotationId) => {},
    acceptQuotation: async (quotationId) => {}
  }
  ```
- **Database Table**: `cotizaciones`

### contractService
- **Purpose**: Contract management operations
- **Location**: `services/contractService.js`
- **Key Methods**:
  ```javascript
  {
    getClientContracts: async (userId) => {},
    getContractDetails: async (contractId) => {},
    acceptQuotation: async (quotationId, userId, paymentType) => {}
  }
  ```
- **Features**:
  - Creates contract when accepting quotation
  - Handles payment type selection (upfront, milestones, financing)
- **Database Table**: `contratos`

## Context Providers

### ClienteAuthContext
- **Purpose**: Client-specific authentication context wrapper
- **Location**: `context/ClienteAuthContext.jsx`
- **Wraps**: Global `AuthContext` from `src/context/AuthContext.jsx`
- **Provides**:
  ```javascript
  {
    // Inherited from AuthContext
    user, token, userType, clientData, loading,
    clientLogin, clientSignup, logout, migrateLeadToClient,

    // Client-specific methods
    isClientAuthenticated: boolean,
    updateClientProfile: async (updates) => {},
    getClientQuote: async () => {},
    refreshClientData: async () => {},
    setClientData: Function,
    fetchClientData: Function
  }
  ```

### ClienteDashboardDataContext
- **Purpose**: Processes and provides dashboard data with memoization
- **Location**: `context/ClienteDashboardDataContext.jsx`
- **Data Processing**: Uses `useMemo` to process data only when `clientData` or `userType` changes
- **Provides**:
  ```javascript
  {
    consumoData: Array,           // Processed from consumo_kwh_historico
    irradiacionData: Array,       // Processed from irradiacion_cache or sizing_results
    metricsData: {                // Calculated metrics
      consumoPromedio: number,
      consumoMaximo: number,
      irradiacionPromedio: number,
      sistemaRequerido: number
    },
    reciboData: Object,           // Raw CFE receipt data
    resumenEnergetico: Object,    // Energy summary
    sistemaData: Object,          // Sizing results (kWp, panels, etc.)
    userData: Object,             // User info
    isLoading: boolean,
    hasData: boolean
  }
  ```

## Data Flow

### Quote Request Flow
1. Client opens SolicitarCotizacionesModal (via ProyectosTab or QuotesCTA)
2. Form submission triggers `useSolicitarCotizaciones` hook
3. `projectService.createProject()` creates project record
4. System notifies selected installers
5. Installers receive notification and can submit quotes
6. Client receives real-time update via `useClientQuotes` hook
7. Client views quotes in ProyectosTab
8. Client opens AcceptQuotationModal to accept quote
9. `contractService.acceptQuotation()` generates contract

### Project Lifecycle
1. **Lead Conversion**: Lead completes signup → migrates to Client with existing analysis
2. **Quote Request**: Client submits project via SolicitarCotizacionesModal
3. **Quote Reception**: Installers submit quotes → appear in ProyectosTab
4. **Contract Signing**: Client accepts quote → contract generated
5. **Project Execution**: Progress tracking in ProyectosTab
6. **Completion**: Final review and payment

## Integration Points

### Cross-Feature Dependencies
- **Lead → Cliente**: Lead components import `useSolicitarCotizaciones` and `SolicitarCotizacionesModal`
  - Example: `src/lead/components/dashboard/tabs/ConsumoTab.jsx`
  - Path: `../../../../cliente/hooks/useSolicitarCotizaciones`

### Auth Integration
- **AuthContext**: Manages client authentication state
- **User Type**: `userType === 'cliente'`
- **Session Storage**: AsyncStorage for persistent login
- **Route Protection**: Redirects to `/dashboard` if authenticated

### Database Schema
```sql
-- Main client table
usuarios (
  id UUID PRIMARY KEY,
  nombre VARCHAR,
  email VARCHAR UNIQUE,
  telefono VARCHAR,
  created_at TIMESTAMP
)

-- Client projects
proyectos (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  direccion TEXT,
  consumo_promedio NUMERIC,
  sistema_kwp NUMERIC,
  estado VARCHAR,
  created_at TIMESTAMP
)

-- Received quotes
cotizaciones (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  proveedor_id UUID REFERENCES proveedores(id),
  monto_total NUMERIC,
  detalles JSONB,
  estado VARCHAR,
  created_at TIMESTAMP
)
```

## Usage Examples

### Client Dashboard Page
```jsx
// app/dashboard.jsx
import { useState } from 'react';
import ProyectosTab from '../src/cliente/components/dashboard/ProyectosTab';
import PerfilTab from '../src/cliente/components/dashboard/PerfilTab';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('proyectos');

  return (
    <div>
      {activeTab === 'proyectos' && <ProyectosTab />}
      {activeTab === 'perfil' && <PerfilTab />}
    </div>
  );
}
```

### Login/Signup Pages
```jsx
// app/login.jsx
import LoginNavbar from '../src/cliente/components/auth/LoginNavbar';

export default function Login() {
  return (
    <>
      <LoginNavbar onNavigate={handleNavigate} />
      {/* Login form */}
    </>
  );
}
```

### Requesting Quotes
```jsx
// Inside ProyectosTab.jsx
import { useSolicitarCotizaciones } from '../../hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../modals/SolicitarCotizacionesModal';

const ProyectosTab = () => {
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();

  return (
    <>
      <button onClick={openModal}>Solicitar Cotizaciones</button>
      <SolicitarCotizacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};
```

## Migration Notes

### Files Migrated
- **From**: `src/components/auth/` → **To**: `src/cliente/components/auth/`
- **From**: `src/components/dashboard/` → **To**: `src/cliente/components/dashboard/`
- **From**: `src/components/modals/` → **To**: `src/cliente/components/modals/`
- **From**: `src/hooks/` → **To**: `src/cliente/hooks/`
- **From**: `src/services/` → **To**: `src/cliente/services/`

### Import Updates
All references in the following files were updated:
- `app/login.jsx` - LoginNavbar import
- `app/signup.jsx` - LoginNavbar import
- `app/dashboard.jsx` - ProyectosTab, PerfilTab imports
- `src/services/index.js` - clientService export path
- Lead feature components - Cross-feature imports for quote modal and hook

### Cross-Feature Import Pattern
Lead components importing Cliente functionality:
```javascript
// src/lead/components/dashboard/tabs/ConsumoTab.jsx
import { useSolicitarCotizaciones } from '../../../../cliente/hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../../../../cliente/components/modals/SolicitarCotizacionesModal';
```

## Related Features

- **Lead**: Temporary users who may convert to Clientes after signup
- **Instalador**: Service providers who submit quotes to Clientes
- **Admin**: System administrators who monitor client activity

## Future Enhancements

- Real-time quote notifications
- Contract e-signature integration
- Payment processing through Stripe
- Project milestone tracking
- Review and rating system
- Referral program