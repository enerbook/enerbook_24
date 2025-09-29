/**
 * Services Index
 * Central export point for all service modules
 *
 * This file acts as a barrel export for all services across the application.
 * Services are organized in features/ by their specificity:
 * - Shared services (used by 2+ roles): features/shared/services/
 * - Role-specific services: features/[role]/services/
 */

// Shared services (used by multiple roles)
export { authService } from '../features/shared/services/authService';
export { projectService } from '../features/shared/services/projectService';
export { quotationService } from '../features/shared/services/quotationService';
export { contractService } from '../features/shared/services/contractService';
export { userService } from '../features/shared/services/userService';

// Role-specific services
export { installerService } from '../features/instalador/services/installerService';
export { leadService } from '../features/lead/services/leadService';
export { clientService } from '../features/cliente/services/clientService';