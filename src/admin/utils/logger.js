/**
 * Sistema de logging para el panel de administrador
 * Solo muestra logs en desarrollo, silencioso en producción
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Log de debugging (solo en desarrollo)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[Admin Debug]', ...args);
    }
  },

  /**
   * Log de información
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('[Admin Info]', ...args);
    }
  },

  /**
   * Log de advertencia
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[Admin Warning]', ...args);
    }
  },

  /**
   * Log de error (siempre se muestra)
   */
  error: (...args) => {
    console.error('[Admin Error]', ...args);
    // TODO: Enviar a servicio de logging (Sentry, LogRocket, etc.)
  },

  /**
   * Log de métricas/analytics
   */
  metric: (metricName, value, metadata = {}) => {
    if (isDevelopment) {
      console.log('[Admin Metric]', metricName, value, metadata);
    }
    // TODO: Enviar a servicio de analytics
  }
};

export default logger;
