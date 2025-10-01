/**
 * Services Index - DEPRECATED
 *
 * ⚠️ DO NOT USE THIS FILE ⚠️
 *
 * This centralized export approach has been deprecated in favor of role-specific services.
 * Each role now has its own independent service implementations to ensure complete
 * independence between roles.
 *
 * MIGRATION GUIDE:
 * Instead of: import { authService } from '../../../services';
 * Use:        import { authService } from '../services/authService';
 *
 * Service locations by role:
 *
 * - Cliente: src/features/cliente/services/
 *   - authService.js
 *   - projectService.js
 *   - quotationService.js
 *   - contractService.js
 *   - clientService.js
 *
 * - Instalador: src/features/instalador/services/
 *   - authService.js
 *   - quotationService.js
 *   - contractService.js
 *   - installerService.js
 *
 * - Lead: src/features/lead/services/
 *   - leadService.js
 *
 * - Admin: src/features/admin/services/
 *   - auth.js
 *   - queries.js
 *
 * NOTE: The shared services directory has been removed. Each role has its own
 * independent service implementations.
 */

// This file should be deleted once all legacy code is updated
console.warn('DEPRECATED: Do not import from src/services/index.js - use role-specific services instead');