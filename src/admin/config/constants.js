/**
 * Constantes del sistema de administración
 */

// Stripe fees (actualizado mayo 2024)
export const STRIPE_FEES = {
  PERCENTAGE: 0.029, // 2.9%
  FIXED_USD: 3.00    // $3 USD por transacción
};

// Colores del tema Enerbook (sync con tailwind.config.js)
export const CHART_COLORS = {
  primary: '#f59e0b',      // brand (naranja Enerbook)
  primaryLight: '#FFCB45', // brandLight (amarillo degradado)
  dark: '#090e1a',         // ink (negro Enerbook)
  success: '#10b981',      // green-500
  warning: '#f59e0b',      // brand (naranja)
  danger: '#ef4444',       // red-500
  gray: '#6b7280',         // gray-500
  grayLight: '#9ca3af'     // gray-400
};

// Estados de proyectos con sus colores
export const PROJECT_STATUS_COLORS = {
  cotizacion: CHART_COLORS.dark,
  en_progreso: CHART_COLORS.primary,
  completado: CHART_COLORS.success,
  cancelado: CHART_COLORS.gray,
  en_espera: CHART_COLORS.primaryLight
};

// Tipos de cuenta Stripe con colores
export const STRIPE_ACCOUNT_COLORS = {
  express: CHART_COLORS.primary,
  standard: CHART_COLORS.dark,
  custom: CHART_COLORS.dark,
  pendiente: CHART_COLORS.gray
};

// Tipos de pago con colores
export const PAYMENT_TYPE_COLORS = {
  contado: CHART_COLORS.primary,
  financiamiento: CHART_COLORS.dark,
  tarjeta: CHART_COLORS.primary,
  transferencia: CHART_COLORS.dark
};

// Estados de milestones con colores
export const MILESTONE_STATUS_COLORS = {
  pendiente: CHART_COLORS.warning,
  pagado: CHART_COLORS.success,
  vencido: CHART_COLORS.danger
};

// Umbrales de alertas (en días/horas)
export const ALERT_THRESHOLDS = {
  MILESTONE_CRITICAL_DAYS: 7,      // Milestone vencido hace más de 7 días es crítico
  WEBHOOK_CRITICAL_HOURS: 24,      // Webhook sin procesar hace más de 24h es crítico
  ONBOARDING_WARNING_DAYS: 7,      // Onboarding sin completar hace más de 7 días
  PAYMENT_WARNING_DAYS: 5,         // Pago pendiente hace más de 5 días
  PROJECT_INACTIVE_DAYS: 14,       // Proyecto sin actividad hace más de 14 días
  DISPUTE_RESPONSE_DAYS: 7         // Días para responder disputa
};

// Severidades de alertas con colores
export const ALERT_SEVERITY_COLORS = {
  critical: CHART_COLORS.danger,
  high: CHART_COLORS.warning,
  medium: CHART_COLORS.primary,
  low: CHART_COLORS.grayLight
};

// Límites de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

export default {
  STRIPE_FEES,
  CHART_COLORS,
  PROJECT_STATUS_COLORS,
  STRIPE_ACCOUNT_COLORS,
  PAYMENT_TYPE_COLORS,
  MILESTONE_STATUS_COLORS,
  ALERT_THRESHOLDS,
  ALERT_SEVERITY_COLORS,
  PAGINATION
};