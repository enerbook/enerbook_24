/**
 * Logger Utility
 * Logging condicional según entorno (desarrollo vs producción)
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Logger que solo registra en desarrollo
 */
export const logger = {
  /**
   * Log normal - solo en desarrollo
   * @param {...any} args - Argumentos a loguear
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log('[Lead Module]', ...args);
    }
  },

  /**
   * Log de información - solo en desarrollo
   * @param {...any} args - Argumentos a loguear
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('[Lead Module - INFO]', ...args);
    }
  },

  /**
   * Log de advertencia - siempre se muestra
   * @param {...any} args - Argumentos a loguear
   */
  warn: (...args) => {
    console.warn('[Lead Module - WARN]', ...args);
  },

  /**
   * Log de error - siempre se muestra
   * @param {...any} args - Argumentos a loguear
   */
  error: (...args) => {
    console.error('[Lead Module - ERROR]', ...args);
  },

  /**
   * Log de debug - solo en desarrollo
   * @param {...any} args - Argumentos a loguear
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[Lead Module - DEBUG]', ...args);
    }
  },

  /**
   * Log con tabla - solo en desarrollo
   * @param {any} data - Datos a mostrar en tabla
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Agrupa logs - solo en desarrollo
   * @param {string} label - Etiqueta del grupo
   */
  group: (label) => {
    if (isDevelopment) {
      console.group(`[Lead Module] ${label}`);
    }
  },

  /**
   * Cierra grupo de logs
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
};

/**
 * Logger para análisis y tracking (siempre activo)
 * Útil para enviar a servicios de analytics
 */
export const analyticsLogger = {
  /**
   * Registra evento de usuario
   * @param {string} event - Nombre del evento
   * @param {object} data - Datos del evento
   */
  trackEvent: (event, data = {}) => {
    // En producción esto podría enviar a Google Analytics, Mixpanel, etc.
    if (isDevelopment) {
      console.log('[Analytics]', event, data);
    }

    // TODO: Integrar con servicio de analytics
    // analytics.track(event, data);
  },

  /**
   * Registra error para monitoreo
   * @param {Error} error - Error a registrar
   * @param {object} context - Contexto adicional
   */
  trackError: (error, context = {}) => {
    console.error('[Analytics - Error]', error, context);

    // TODO: Integrar con Sentry u otro servicio de monitoreo
    // Sentry.captureException(error, { extra: context });
  },

  /**
   * Registra conversión de lead
   * @param {string} tempLeadId - ID temporal del lead
   * @param {string} action - Acción realizada
   */
  trackLeadConversion: (tempLeadId, action) => {
    if (isDevelopment) {
      console.log('[Analytics - Lead Conversion]', { tempLeadId, action });
    }

    // TODO: Enviar a sistema de tracking de conversiones
  }
};

export default logger;
