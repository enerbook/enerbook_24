# Instalador Feature Module

This module contains all components, hooks, services, and logic related to solar installation providers in the Enerbook platform.

## Overview

The Instalador feature manages verified solar installation companies who provide quotes and services to clients. Installers can:
- View incoming project requests
- Submit detailed quotes with pricing and timeline
- Manage active contracts and projects
- Upload certifications and legal documents
- Track project progress and payments
- Receive ratings and reviews from clients

## Directory Structure

```
src/instalador/
├── components/
│   ├── auth/
│   │   └── InstallerNavbar.jsx        # Navigation bar for installer auth pages
│   ├── cards/
│   │   ├── QuotationCard.jsx          # Quote request card display
│   │   ├── ContractCard.jsx           # Active contract card
│   │   └── ReviewCard.jsx             # Client review display card
│   ├── dashboard/
│   │   ├── ProjectsTab.jsx            # Main projects/quotes management tab
│   │   ├── ProfileTab.jsx             # Company profile management
│   │   ├── DocumentsTab.jsx           # Legal documents upload/management
│   │   └── CertificationsTab.jsx      # Technical certifications management
│   ├── layout/
│   │   ├── InstallerAppLayout.jsx     # Main app layout wrapper
│   │   └── InstallerHeader.jsx        # Header with navigation
│   ├── modals/
│   │   ├── ProjectDetailsModal.jsx    # View detailed project request
│   │   ├── SendQuoteModal.jsx         # Submit quote to client
│   │   ├── QuotationDetailsModal.jsx  # View submitted quote details
│   │   ├── ContractDetailsModal.jsx   # View contract details
│   │   ├── UpdateStatusModal.jsx      # Update project status
│   │   ├── UploadDocumentModal.jsx    # Upload legal documents
│   │   └── UploadCertificationModal.jsx # Upload certifications
│   └── views/
│       ├── QuotationsView.jsx         # All quotes list view
│       ├── ContractsView.jsx          # All contracts list view
│       └── ReviewsView.jsx            # All reviews list view
├── hooks/
│   └── useInstallerRealtime.js        # Real-time updates for quotes/contracts
├── services/
│   ├── authService.js                 # Installer authentication
│   ├── installerService.js            # Installer CRUD operations
│   ├── quotationService.js            # Quote submission and management
│   └── contractService.js             # Contract management
└── README.md
```

## Components

### Auth Components

#### InstallerNavbar
- **Purpose**: Navigation bar for installer authentication pages
- **Location**: `components/auth/InstallerNavbar.jsx`
- **Props**: `{ currentPage: 'login' | 'signup' }`
- **Usage**:
  ```jsx
  import InstallerNavbar from '../src/instalador/components/auth/InstallerNavbar';
  <InstallerNavbar currentPage="login" />
  ```

### Layout Components

#### InstallerAppLayout
- **Purpose**: Main application layout with sidebar navigation
- **Location**: `components/layout/InstallerAppLayout.jsx`
- **Props**: `{ activeTab: string, setActiveTab: Function, children: ReactNode }`
- **Features**:
  - Responsive sidebar navigation
  - Tab management
  - User menu with logout
  - Notifications badge

#### InstallerHeader
- **Purpose**: Top header with branding and user actions
- **Location**: `components/layout/InstallerHeader.jsx`
- **Features**:
  - Company logo/name display
  - Notification bell
  - User profile dropdown

### Dashboard Tabs

#### ProjectsTab
- **Purpose**: Main interface for managing quotes and contracts
- **Location**: `components/dashboard/ProjectsTab.jsx`
- **Features**:
  - View incoming project requests
  - Submit quotes with pricing breakdown
  - Track active contracts
  - Update project status
  - Filter by status (pending, active, completed)
- **Sub-views**: QuotationsView, ContractsView, ReviewsView

#### ProfileTab
- **Purpose**: Company profile and settings
- **Location**: `components/dashboard/ProfileTab.jsx`
- **Features**:
  - Update company information
  - Contact details management
  - Service area coverage
  - Business hours
  - Team member management

#### DocumentsTab
- **Purpose**: Legal document management and compliance
- **Location**: `components/dashboard/DocumentsTab.jsx`
- **Required Documents**:
  - Identificación Oficial
  - Acta Constitutiva
  - Declaración No Deudor
  - Declaración Jurada
  - Poder Notarial
- **Features**:
  - Upload/replace documents
  - View upload status
  - Download copies
  - Expiration tracking

#### CertificationsTab
- **Purpose**: Technical certification management
- **Location**: `components/dashboard/CertificationsTab.jsx`
- **Common Certifications**:
  - ISO 9001:2015
  - CE Certification
  - UL Certification
  - NABCEP Certification
- **Features**:
  - Upload certification files
  - Track expiration dates
  - Renewal reminders
  - Verification status

### Card Components

#### QuotationCard
- **Purpose**: Display quote request summary
- **Location**: `components/cards/QuotationCard.jsx`
- **Props**: `{ quotation: Object, onViewDetails: Function, onSubmitQuote: Function }`
- **Displays**:
  - Client name and location
  - Project size (kWp)
  - Required timeline
  - Submission deadline
  - Current status

#### ContractCard
- **Purpose**: Display active contract summary
- **Location**: `components/cards/ContractCard.jsx`
- **Props**: `{ contract: Object, onViewDetails: Function, onUpdateStatus: Function }`
- **Displays**:
  - Contract ID and date
  - Client information
  - Payment schedule
  - Current milestone
  - Completion percentage

#### ReviewCard
- **Purpose**: Display client review
- **Location**: `components/cards/ReviewCard.jsx`
- **Props**: `{ review: Object }`
- **Displays**:
  - Client name
  - Rating (1-5 stars)
  - Review text
  - Project type
  - Date posted

### Modal Components

#### ProjectDetailsModal
- **Purpose**: View detailed project request information
- **Location**: `components/modals/ProjectDetailsModal.jsx`
- **Props**: `{ project: Object, setShowProjectModal: Function }`
- **Displays**:
  - Full project specifications
  - Site details and location
  - Energy consumption data
  - Client preferences
  - Budget range

#### SendQuoteModal
- **Purpose**: Submit detailed quote to client
- **Location**: `components/modals/SendQuoteModal.jsx`
- **Props**: `{ project: Object, setShowQuoteModal: Function }`
- **Form Fields**:
  - System size (kWp)
  - Equipment breakdown
  - Installation cost
  - Timeline estimate
  - Warranty details
  - Payment terms
  - Additional notes

#### UploadDocumentModal
- **Purpose**: Upload legal documents
- **Location**: `components/modals/UploadDocumentModal.jsx`
- **Props**: `{ uploadAction: string, setShowUploadModal: Function, handleDocumentUpload: Function }`
- **Features**:
  - File upload (PDF)
  - Document type selection
  - Expiration date (if applicable)
  - Notes/comments

#### UploadCertificationModal
- **Purpose**: Upload technical certifications
- **Location**: `components/modals/UploadCertificationModal.jsx`
- **Props**: `{ certificationAction: string, setShowCertificationModal: Function, handleCertificationUpload: Function }`
- **Features**:
  - File upload (PDF)
  - Certification type selection
  - Issue date
  - Expiration date
  - Issuing authority

### View Components

#### QuotationsView
- **Purpose**: List all quotes (pending, submitted, accepted, rejected)
- **Location**: `components/views/QuotationsView.jsx`
- **Features**:
  - Filter by status
  - Sort by date/deadline
  - Bulk actions
  - Search by project ID or client name

#### ContractsView
- **Purpose**: List all active and completed contracts
- **Location**: `components/views/ContractsView.jsx`
- **Features**:
  - Filter by status
  - Sort by date/value
  - Payment tracking
  - Status updates

#### ReviewsView
- **Purpose**: List all client reviews and ratings
- **Location**: `components/views/ReviewsView.jsx`
- **Features**:
  - Average rating display
  - Filter by rating
  - Sort by date
  - Response to reviews

## Hooks

### useInstallerRealtime
- **Purpose**: Subscribe to real-time updates for quotes and contracts
- **Location**: `hooks/useInstallerRealtime.js`
- **Returns**:
  ```javascript
  {
    newQuotations: Array,
    updatedContracts: Array,
    notifications: Array
  }
  ```
- **Usage**:
  ```jsx
  const { newQuotations, updatedContracts } = useInstallerRealtime(installerId);
  ```

## Services

### installerService
- **Purpose**: Installer CRUD operations
- **Location**: `services/installerService.js`
- **Exports**:
  ```javascript
  {
    getInstallerProfile: async (userId) => {},
    updateInstallerProfile: async (userId, data) => {},
    getInstallerStats: async (installerId) => {},
    uploadDocument: async (installerId, documentData) => {},
    uploadCertification: async (installerId, certificationData) => {}
  }
  ```

### quotationService
- **Purpose**: Quote management operations
- **Location**: `services/quotationService.js`
- **Exports**:
  ```javascript
  {
    getQuotationRequests: async (installerId) => {},
    submitQuotation: async (quotationData) => {},
    updateQuotation: async (quotationId, data) => {},
    getQuotationDetails: async (quotationId) => {}
  }
  ```

### contractService
- **Purpose**: Contract management operations
- **Location**: `services/contractService.js`
- **Exports**:
  ```javascript
  {
    getInstallerContracts: async (installerId) => {},
    updateContractStatus: async (contractId, status) => {},
    uploadMilestoneProof: async (contractId, milestoneData) => {},
    getPaymentSchedule: async (contractId) => {}
  }
  ```

### authService
- **Purpose**: Installer authentication
- **Location**: `services/authService.js`
- **Exports**:
  ```javascript
  {
    installerLogin: async (email, password) => {},
    installerSignup: async (companyData) => {},
    verifyInstaller: async (installerId) => {}
  }
  ```

## Data Flow

### Quote Submission Flow
1. Client creates project request via SolicitarCotizacionesModal
2. System notifies matched installers (based on location/capabilities)
3. Installer views request in ProjectsTab (QuotationsView)
4. Installer clicks "View Details" → ProjectDetailsModal opens
5. Installer clicks "Submit Quote" → SendQuoteModal opens
6. Installer fills quote form with pricing and details
7. Quote submitted → stored in `cotizaciones` table
8. Client receives notification and can view quote
9. Client accepts quote → Contract generated
10. Contract appears in ContractsView for installer

### Document Verification Flow
1. New installer signs up via installer-signup page
2. Account created in `proveedores` table with `verificado: false`
3. Installer navigates to DocumentsTab
4. System shows list of required documents
5. Installer uploads each document via UploadDocumentModal
6. Admin receives notification of pending verification
7. Admin reviews documents in admin dashboard
8. Admin approves → `verificado: true`
9. Installer can now receive quote requests

## Integration Points

### Auth Integration
- **AuthContext**: Manages installer authentication state
- **User Type**: `userType === 'instalador'`
- **Session Storage**: AsyncStorage for persistent login
- **Route Protection**: Redirects to `/instalador-panel` if authenticated

### Database Schema
```sql
-- Installer companies
proveedores (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id),
  nombre_empresa VARCHAR,
  email VARCHAR UNIQUE,
  telefono VARCHAR,
  direccion TEXT,
  verificado BOOLEAN DEFAULT false,
  calificacion_promedio NUMERIC,
  proyectos_completados INTEGER,
  created_at TIMESTAMP
)

-- Documents
documentos_proveedores (
  id UUID PRIMARY KEY,
  proveedor_id UUID REFERENCES proveedores(id),
  tipo_documento VARCHAR,
  archivo_url VARCHAR,
  fecha_subida TIMESTAMP,
  fecha_expiracion DATE,
  verificado BOOLEAN DEFAULT false
)

-- Certifications
certificaciones (
  id UUID PRIMARY KEY,
  proveedor_id UUID REFERENCES proveedores(id),
  nombre VARCHAR,
  archivo_url VARCHAR,
  fecha_obtencion DATE,
  fecha_expiracion DATE,
  verificado BOOLEAN DEFAULT false
)

-- Submitted quotes
cotizaciones (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  proveedor_id UUID REFERENCES proveedores(id),
  monto_total NUMERIC,
  sistema_kwp NUMERIC,
  detalles JSONB,
  tiempo_instalacion INTEGER,
  garantia_anos INTEGER,
  estado VARCHAR, -- 'pendiente', 'aceptada', 'rechazada'
  created_at TIMESTAMP
)

-- Active contracts
contratos (
  id UUID PRIMARY KEY,
  cotizacion_id UUID REFERENCES cotizaciones(id),
  proyecto_id UUID REFERENCES proyectos(id),
  proveedor_id UUID REFERENCES proveedores(id),
  usuario_id UUID REFERENCES usuarios(id),
  precio_total_sistema NUMERIC,
  estado VARCHAR, -- 'activo', 'completado', 'cancelado'
  fecha_inicio DATE,
  fecha_estimada_fin DATE,
  fecha_fin DATE,
  created_at TIMESTAMP
)
```

## Usage Examples

### Installer Dashboard Page
```jsx
// app/instalador-panel.jsx
import { useState } from 'react';
import InstallerAppLayout from '../src/instalador/components/layout/InstallerAppLayout';
import ProjectsTab from '../src/instalador/components/dashboard/ProjectsTab';
import ProfileTab from '../src/instalador/components/dashboard/ProfileTab';
import DocumentsTab from '../src/instalador/components/dashboard/DocumentsTab';

export default function InstallerDashboard() {
  const [activeTab, setActiveTab] = useState('proyectos');

  return (
    <InstallerAppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'proyectos' && <ProjectsTab />}
      {activeTab === 'perfil' && <ProfileTab />}
      {activeTab === 'documentos' && <DocumentsTab />}
    </InstallerAppLayout>
  );
}
```

### Submitting a Quote
```jsx
// Inside ProjectsTab.jsx
import SendQuoteModal from '../modals/SendQuoteModal';

const ProjectsTab = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  return (
    <>
      <QuotationCard
        quotation={project}
        onSubmitQuote={() => {
          setSelectedProject(project);
          setShowQuoteModal(true);
        }}
      />
      {showQuoteModal && (
        <SendQuoteModal
          project={selectedProject}
          setShowQuoteModal={setShowQuoteModal}
        />
      )}
    </>
  );
};
```

## Related Features

- **Cliente**: End customers who receive quotes from installers
- **Admin**: System administrators who verify installer documents
- **Lead**: Temporary users who may become clients

## Future Enhancements

- Real-time chat with clients
- Quote template library
- Project cost calculator
- Automated payment processing
- Performance analytics dashboard
- Referral rewards program
