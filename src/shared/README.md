# Shared Feature Module

This module contains all components, hooks, and utilities that are shared across multiple user roles in the Enerbook platform.

## Overview

The Shared module provides reusable components and utilities that are not specific to any single user role (Admin, Lead, Instalador, or Cliente). These are truly cross-cutting concerns used throughout the application.

## Directory Structure

```
src/shared/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx          # Main application layout wrapper
│   │   ├── Header.jsx             # Unified header component
│   │   └── UnifiedSidebar.jsx     # Role-aware sidebar navigation
│   │
│   ├── dashboard/
│   │   ├── MetricCard.jsx         # Reusable metric display card
│   │   ├── ChartCard.jsx          # Chart container with title and styling
│   │   └── MetricTile.jsx         # Compact metric tile
│   │
│   └── landing/
│       ├── Navbar.jsx             # Landing page navigation
│       ├── Hero.jsx               # Hero section
│       ├── HowItWorks.jsx         # How it works section
│       ├── Stats.jsx              # Statistics section
│       ├── Partners.jsx           # Partners showcase
│       ├── Experts.jsx            # Expert installers section
│       ├── Reviews.jsx            # Customer reviews
│       ├── InstallersCTA.jsx      # Call-to-action for installers
│       ├── Footer.jsx             # Footer component
│       └── Reveal.jsx             # Animation wrapper component
│
├── services/
│   ├── authService.js             # Authentication (login, signup, logout)
│   ├── projectService.js          # Projects CRUD (used by 3+ roles)
│   ├── quotationService.js        # Quotations management (4 roles)
│   ├── contractService.js         # Contracts handling (3 roles)
│   └── userService.js             # User management (all roles)
│
├── hooks/
│   └── (future shared hooks)
│
├── utils/
│   └── (future shared utilities)
│
└── README.md
```

---

## Components

### Layout Components

#### AppLayout
- **Purpose**: Main application wrapper providing consistent layout structure
- **Location**: `components/layout/AppLayout.jsx`
- **Props**:
  ```javascript
  {
    activeTab: string,      // Current active tab
    setActiveTab: Function, // Function to change active tab
    children: ReactNode     // Content to render
  }
  ```
- **Features**:
  - Responsive sidebar (mobile slide-in, desktop persistent)
  - Mobile overlay for sidebar
  - Integrated header and unified sidebar
  - Flexible content area
- **Used by**: All dashboard pages (Admin, Lead, Cliente, Instalador)
- **Usage**:
  ```jsx
  import AppLayout from '../src/shared/components/layout/AppLayout';

  <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
    {/* Dashboard content */}
  </AppLayout>
  ```

#### Header
- **Purpose**: Top navigation bar with user info and actions
- **Location**: `components/layout/Header.jsx`
- **Features**:
  - User profile display
  - Notifications
  - Mobile menu toggle
  - Role-specific actions
- **Used by**: AppLayout component

#### UnifiedSidebar
- **Purpose**: Role-aware navigation sidebar
- **Location**: `components/layout/UnifiedSidebar.jsx`
- **Features**:
  - Dynamic tabs based on user role
  - Active tab highlighting
  - Lead mode support
  - Responsive design (desktop/mobile)
- **Role-specific tabs**:
  - **Lead**: Dashboard, Consumo, Irradiación, Detalles
  - **Cliente**: Dashboard, Consumo, Irradiación, Proyectos, Detalles, Perfil
  - **Instalador**: Perfil, Proyectos, Documentos, Certificaciones
  - **Admin**: Resumen, Finanzas, Proveedores, Proyectos, Alertas
- **Used by**: AppLayout component

---

### Dashboard Components

#### MetricCard
- **Purpose**: Large card displaying a single metric with icon and description
- **Location**: `components/dashboard/MetricCard.jsx`
- **Props**:
  ```javascript
  {
    title: string,       // Card title
    value: string|number,// Main metric value
    icon: ReactNode,     // Icon component
    description: string, // Optional description
    trend: number        // Optional trend percentage
  }
  ```
- **Features**:
  - Icon display with colored background
  - Large value display
  - Optional trend indicator
  - Responsive design
- **Used by**: Admin ResumenTab, Lead MetricsGrid
- **Usage**:
  ```jsx
  import MetricCard from '../../../shared/components/dashboard/MetricCard';

  <MetricCard
    title="Usuarios Activos"
    value="1,234"
    icon={<FiUsers />}
    trend={12.5}
  />
  ```

#### ChartCard
- **Purpose**: Container for charts with title and consistent styling
- **Location**: `components/dashboard/ChartCard.jsx`
- **Props**:
  ```javascript
  {
    title: string,       // Chart title
    subtitle: string,    // Optional subtitle
    children: ReactNode, // Chart content
    action: ReactNode    // Optional header action
  }
  ```
- **Features**:
  - Consistent white card styling
  - Title and subtitle area
  - Optional header action button
  - Flexible content area
- **Used by**: Lead ConsumoTab, IrradiacionTab
- **Usage**:
  ```jsx
  import ChartCard from '../../../shared/components/dashboard/ChartCard';

  <ChartCard title="Consumo Histórico" subtitle="Últimos 12 meses">
    {/* Chart SVG or component */}
  </ChartCard>
  ```

#### MetricTile
- **Purpose**: Compact metric display for grid layouts
- **Location**: `components/dashboard/MetricTile.jsx`
- **Props**:
  ```javascript
  {
    label: string,       // Metric label
    value: string|number,// Metric value
    unit: string,        // Optional unit
    icon: ReactNode      // Optional icon
  }
  ```
- **Features**:
  - Compact design for grid layouts
  - Icon and value display
  - Optional unit label
  - Responsive sizing
- **Used by**: Lead MetricsGrid, Admin summary views
- **Usage**:
  ```jsx
  import MetricTile from '../../../shared/components/dashboard/MetricTile';

  <MetricTile
    label="Consumo Promedio"
    value="450"
    unit="kWh"
    icon={<FiZap />}
  />
  ```

---

### Landing Page Components

All landing page components are located in `components/landing/` and are used exclusively by the main landing page (`app/index.jsx`).

#### Navbar
- **Purpose**: Landing page navigation bar
- **Features**:
  - Logo and branding
  - Navigation links
  - CTA buttons
  - Mobile responsive menu

#### Hero
- **Purpose**: Main hero section with value proposition
- **Features**:
  - Headline and subheadline
  - Primary CTA (Analizar mi recibo)
  - Hero image/illustration
  - Animated elements

#### HowItWorks
- **Purpose**: Explains the platform process in 3-4 steps
- **Features**:
  - Step-by-step illustration
  - Clear process description
  - Visual indicators

#### Stats
- **Purpose**: Display platform statistics and social proof
- **Features**:
  - Number animations
  - Key metrics (projects, savings, installers)
  - Trust indicators

#### Partners
- **Purpose**: Showcase partner brands and certifications
- **Features**:
  - Logo grid
  - Credibility indicators

#### Experts
- **Purpose**: Highlight verified installer network
- **Features**:
  - Installer profiles
  - Certifications display
  - Social proof

#### Reviews
- **Purpose**: Display customer testimonials
- **Features**:
  - Review cards
  - Star ratings
  - Customer photos/avatars
  - Carousel navigation

#### InstallersCTA
- **Purpose**: Call-to-action for installers to join platform
- **Features**:
  - Benefits list
  - Registration CTA
  - Visual elements

#### Footer
- **Purpose**: Site footer with links and information
- **Features**:
  - Navigation links
  - Social media links
  - Legal links
  - Contact information

#### Reveal
- **Purpose**: Utility component for scroll animations
- **Features**:
  - Intersection Observer-based animations
  - Fade-in and slide-up effects
  - Configurable thresholds
- **Usage**:
  ```jsx
  import Reveal from '../src/shared/components/landing/Reveal';

  <Reveal>
    <div>Content with animation</div>
  </Reveal>
  ```

---

## Services

The shared services module contains all backend API interactions that are used by **2 or more roles**. These services implement the business logic layer and provide a clean interface to Supabase.

### authService
- **Purpose**: Handle all authentication operations
- **Location**: `services/authService.js`
- **Used by**: All roles (Admin, Lead, Cliente, Instalador)
- **Functions**:
  ```javascript
  {
    signUp: async (email, password, userType) => {},
    signIn: async (email, password) => {},
    signOut: async () => {},
    getSession: async () => {},
    getCurrentUser: async () => {}
  }
  ```
- **Usage**:
  ```javascript
  import { authService } from '../services';

  // Login
  const { user } = await authService.signIn(email, password);

  // Signup
  await authService.signUp(email, password, 'cliente');
  ```

### projectService
- **Purpose**: Manage solar energy projects
- **Location**: `services/projectService.js`
- **Used by**: Cliente (create), Instalador (read), Admin (monitor), Lead (convert)
- **Database Table**: `proyectos`
- **Functions**:
  ```javascript
  {
    getAll: async () => {},
    getById: async (projectId) => {},
    create: async (projectData) => {},
    update: async (projectId, updates) => {},
    delete: async (projectId) => {},
    getByUserId: async (userId) => {}
  }
  ```

### quotationService
- **Purpose**: Handle quotation requests and responses
- **Location**: `services/quotationService.js`
- **Used by**: Lead (request), Cliente (request/view), Instalador (create/manage), Admin (monitor)
- **Database Tables**: `cotizaciones`, `cotizaciones_leads_temp`
- **Functions**:
  ```javascript
  {
    createQuotation: async (quotationData) => {},
    getQuotationsByProject: async (projectId) => {},
    getQuotationsByInstaller: async (installerId) => {},
    updateQuotation: async (quotationId, updates) => {},
    acceptQuotation: async (quotationId) => {}
  }
  ```

### contractService
- **Purpose**: Manage contracts between clients and installers
- **Location**: `services/contractService.js`
- **Used by**: Cliente (sign/view), Instalador (manage), Admin (monitor)
- **Database Table**: `contratos`
- **Functions**:
  ```javascript
  {
    createContract: async (contractData) => {},
    getContractsByClient: async (clientId) => {},
    getContractsByInstaller: async (installerId) => {},
    updateContractStatus: async (contractId, status) => {},
    signContract: async (contractId, signature) => {}
  }
  ```

### userService
- **Purpose**: General user management operations
- **Location**: `services/userService.js`
- **Used by**: All roles for profile updates and user queries
- **Database Tables**: `usuarios`, `proveedores`, `administradores`
- **Functions**:
  ```javascript
  {
    getUserProfile: async (userId) => {},
    updateUserProfile: async (userId, updates) => {},
    getUserByEmail: async (email) => {},
    deleteUser: async (userId) => {}
  }
  ```

### Service Import Pattern

All services are exported through `src/services/index.js` for clean imports:

```javascript
// From any feature module
import {
  authService,
  projectService,
  quotationService
} from '../../../services';

// Usage
const projects = await projectService.getAll();
```

### Why Services are Shared

Services are placed in `shared/` when they meet these criteria:

1. **Multi-role usage**: Used by 2+ different roles
2. **Core business logic**: Handle main application entities (projects, quotes, contracts)
3. **Avoid duplication**: Single source of truth prevents code duplication
4. **Prevent circular dependencies**: Features don't depend on each other

**Role-specific services** remain in their respective feature modules:
- `src/lead/services/leadService.js` - Temporary lead data
- `src/instalador/services/installerService.js` - Installer-only operations
- `src/cliente/services/clientService.js` - Client-specific operations

---

## Future Additions

### Shared Hooks (Planned)
```
hooks/
├── useRealtimeUpdates.js    # Real-time Supabase subscriptions
├── useDebounce.js           # Debounce utility hook
├── useMediaQuery.js         # Responsive breakpoint hook
└── useLocalStorage.js       # localStorage persistence hook
```

### Shared Utilities (Planned)
```
utils/
├── formatters.js            # Number, date, currency formatters
├── validators.js            # Form validation utilities
├── constants.js             # Shared constants
└── helpers.js               # General helper functions
```

---

## Usage Patterns

### Importing Shared Components

From app pages (level 1):
```javascript
import AppLayout from '../src/shared/components/layout/AppLayout';
import Navbar from '../src/shared/components/landing/Navbar';
```

From feature modules (level 3+):
```javascript
// From src/admin/components/tabs/
import MetricCard from '../../../shared/components/dashboard/MetricCard';

// From src/lead/components/dashboard/tabs/
import ChartCard from '../../../../shared/components/dashboard/ChartCard';
```

### Adding New Shared Components

When adding a new shared component:

1. **Determine if it's truly shared**
   - Used by 2+ different roles?
   - No role-specific business logic?
   - Purely presentational or utility?

2. **Place in appropriate subdirectory**
   - `layout/` - Page structure components
   - `dashboard/` - Dashboard-specific UI components
   - `landing/` - Public landing page components

3. **Update this README** with:
   - Component purpose
   - Props documentation
   - Usage examples
   - Which roles use it

4. **Keep dependencies minimal**
   - Avoid role-specific imports
   - Use prop injection for data
   - Keep components pure when possible

---

## Integration Points

### With Feature Modules

Shared components are imported by:
- **Admin**: MetricCard for dashboard metrics
- **Lead**: ChartCard, MetricTile for data visualization
- **Instalador**: AppLayout for dashboard structure
- **Cliente**: AppLayout, UnifiedSidebar for navigation

### With Context

- **AppLayout** uses `AuthContext` for user type detection
- **UnifiedSidebar** adapts tabs based on `userType` from `AuthContext`
- **Header** displays user info from `AuthContext`

### With Routing

- **UnifiedSidebar** uses `activeTab` and `setActiveTab` props
- No direct routing logic in shared components
- Parent components handle route changes

---

## Design Principles

### 1. Pure Components
Shared components should be as pure as possible:
- Receive data via props
- No direct API calls
- No role-specific business logic

### 2. Composability
Components should be easily composable:
- Small, focused components
- Clear prop interfaces
- Flexible children prop support

### 3. Responsiveness
All shared components must support:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

### 4. Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

### 5. Performance
- Lazy load when possible
- Memoize expensive computations
- Optimize re-renders
- Use React.memo for pure components

---

## Styling

All components use **TailwindCSS** with **NativeWind**:

```jsx
// Good: Utility classes
<div className="bg-white p-6 rounded-lg shadow-md">

// Avoid: Inline styles (unless dynamic)
<div style={{ backgroundColor: 'white' }}>
```

### Common Patterns

**Card container:**
```jsx
<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
```

**Metric display:**
```jsx
<div className="text-3xl font-bold text-gray-900">
  {value}
</div>
```

**Icon wrapper:**
```jsx
<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
  <Icon className="w-6 h-6 text-blue-600" />
</div>
```

---

## Testing Considerations

When testing shared components:

1. **Isolation**: Test component in isolation with mock props
2. **Props variations**: Test all prop combinations
3. **Responsive behavior**: Test different viewport sizes
4. **Accessibility**: Test keyboard navigation and screen readers
5. **Cross-role usage**: Verify component works for all roles

---

## Migration Notes

### Components Migrated
- **From**: `src/components/common/` → **To**: `src/shared/components/layout/`
- **From**: `src/components/dashboard/` → **To**: `src/shared/components/dashboard/`
- **From**: `src/components/landing/` → **To**: `src/shared/components/landing/`

### Import Updates
All references updated in:
- `app/*.jsx` - Dashboard and landing pages
- `src/admin/components/` - Admin tabs
- `src/lead/components/` - Lead dashboard components

### Original Files
Original files in `src/components/` are marked for cleanup after verification.

---

## Related Modules

- **Admin**: Uses MetricCard for system metrics
- **Lead**: Uses ChartCard and MetricTile for analytics
- **Instalador**: Uses AppLayout for dashboard
- **Cliente**: Uses AppLayout and navigation components

---

## Maintenance

### When to Extract to Shared

Extract a component to shared when:
- ✅ Used by 2+ different roles
- ✅ No role-specific business logic
- ✅ Stable API (props unlikely to change frequently)
- ✅ Purely presentational

### When to Keep in Feature Module

Keep in feature module when:
- ❌ Only used by one role
- ❌ Contains role-specific business logic
- ❌ Tightly coupled to feature workflow
- ❌ Frequently changing requirements

---

## Contributing

When adding or modifying shared components:

1. **Document changes** in this README
2. **Update prop types** if using TypeScript/PropTypes
3. **Add usage examples** for clarity
4. **Test across all roles** that use the component
5. **Verify responsive behavior** on all breakpoints

---

## Future Enhancements

1. **Component Library**: Storybook integration for visual component catalog
2. **TypeScript**: Migrate to TypeScript for better type safety
3. **Theme System**: Centralized theme configuration
4. **Animation Library**: Standardized animation utilities
5. **Form Components**: Shared form inputs and validation
6. **Table Components**: Reusable data table with sorting/filtering
7. **Modal System**: Centralized modal management
8. **Toast Notifications**: Global notification system

---

## Contact

For questions about shared components, refer to the main project documentation or reach out to the development team.

---

**Last Updated**: 29 de septiembre de 2025
**Maintainer**: Enerbook Development Team