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
│   │   ├── ProyectosTab.jsx          # Projects management tab (quotes, contracts, progress)
│   │   └── PerfilTab.jsx             # Profile management tab
│   └── modals/
│       ├── SolicitarCotizacionesModal.jsx  # Modal for requesting quotes from installers
│       └── VerCotizacionModal.jsx    # Modal for viewing detailed quote information
├── hooks/
│   └── useSolicitarCotizaciones.js   # Hook for quote request flow (shared with Lead)
├── services/
│   └── clientService.js              # Client CRUD operations
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

#### ProyectosTab
- **Purpose**: Main project management interface
- **Location**: `components/dashboard/ProyectosTab.jsx`
- **Features**:
  - Request new quotes
  - View received quotes from installers
  - Compare quote details
  - Sign contracts
  - Track project status
- **Data Sources**: `proyectos`, `cotizaciones`, `contratos` tables
- **Related Modals**: SolicitarCotizacionesModal, VerCotizacionModal

#### PerfilTab
- **Purpose**: User profile and account settings
- **Location**: `components/dashboard/PerfilTab.jsx`
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
  - Installer selection
  - Automatic notification to selected installers
  - Integration with email/SMS alerts
- **Shared Usage**: Also used by Lead feature for temporary users
- **Cross-feature Import Example**:
  ```jsx
  // From Lead feature
  import SolicitarCotizacionesModal from '../../../../cliente/components/modals/SolicitarCotizacionesModal';
  ```

#### VerCotizacionModal
- **Purpose**: Display detailed quote information
- **Location**: `components/modals/VerCotizacionModal.jsx`
- **Props**: `{ isOpen: boolean, onClose: Function, quotationId: string }`
- **Features**:
  - Quote breakdown
  - Installer information
  - Accept/reject actions
  - Download PDF

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

## Services

### clientService
- **Purpose**: Client CRUD operations and business logic
- **Location**: `services/clientService.js`
- **Exports**:
  ```javascript
  {
    getClientProfile: async (userId) => {},
    updateClientProfile: async (userId, data) => {},
    getClientProjects: async (userId) => {},
    getReceivedQuotes: async (userId) => {},
    createProject: async (projectData) => {}
  }
  ```
- **Database Tables**:
  - `usuarios` - Client user records
  - `proyectos` - Client projects
  - `cotizaciones` - Received quotes
  - `contratos` - Signed contracts
- **Central Export**: Available via `src/services/index.js`

## Data Flow

### Quote Request Flow
1. Client opens SolicitarCotizacionesModal (via ProyectosTab or Lead dashboard)
2. Form submission triggers `useSolicitarCotizaciones` hook
3. `clientService.createProject()` creates project record
4. System notifies selected installers
5. Installers receive notification and can submit quotes
6. Client views quotes in ProyectosTab
7. Client can accept quote, which generates contract

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