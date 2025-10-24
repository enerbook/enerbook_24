/**
 * Secure Logger Utility
 * Previene exposición de datos sensibles en producción
 */

import { sanitizeForLogging } from './security';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Niveles de logging
 */
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Configuración de logging por entorno
 */
const CONFIG = {
  production: {
    enabled: true,
    levels: [LogLevel.ERROR, LogLevel.WARN],
    sanitize: true,
    sendToService: true // Enviar a servicio externo (Sentry, LogRocket, etc.)
  },
  development: {
    enabled: true,
    levels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG],
    sanitize: false,
    sendToService: false
  },
  test: {
    enabled: false,
    levels: [],
    sanitize: true,
    sendToService: false
  }
};

/**
 * Obtiene configuración según entorno actual
 */
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return CONFIG[env] || CONFIG.development;
};

/**
 * Verifica si el nivel de log está habilitado
 */
const isLevelEnabled = (level) => {
  const config = getConfig();
  return config.enabled && config.levels.includes(level);
};

/**
 * Procesa argumentos del log (sanitiza si es necesario)
 */
const processArgs = (...args) => {
  const config = getConfig();

  if (!config.sanitize) {
    return args;
  }

  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return sanitizeForLogging(arg);
    }
    if (typeof arg === 'string') {
      // Redactar posibles tokens/keys en strings
      return arg
        .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, 'Bearer ***REDACTED***')
        .replace(/[a-f0-9]{32,}/gi, '***REDACTED***'); // Hash-like strings
    }
    return arg;
  });
};

/**
 * Envía log a servicio externo (Sentry, LogRocket, etc.)
 */
const sendToExternalService = (level, message, ...args) => {
  const config = getConfig();

  if (!config.sendToService) {
    return;
  }

  // TODO: Implementar integración con servicio de logging
  // Ejemplo con Sentry:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   if (level === LogLevel.ERROR) {
  //     window.Sentry.captureException(new Error(message), { extra: args });
  //   } else {
  //     window.Sentry.captureMessage(message, { level, extra: args });
  //   }
  // }
};

/**
 * Logger principal
 */
const logger = {
  /**
   * Log de error (siempre se muestra en producción)
   */
  error: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.ERROR)) return;

    const processedArgs = processArgs(...args);
    console.error(`❌ [ERROR]`, message, ...processedArgs);
    sendToExternalService(LogLevel.ERROR, message, ...processedArgs);
  },

  /**
   * Log de advertencia
   */
  warn: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.WARN)) return;

    const processedArgs = processArgs(...args);
    console.warn(`⚠️  [WARN]`, message, ...processedArgs);
    sendToExternalService(LogLevel.WARN, message, ...processedArgs);
  },

  /**
   * Log informativo (solo en desarrollo)
   */
  info: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.INFO)) return;

    const processedArgs = processArgs(...args);
    console.log(`ℹ️  [INFO]`, message, ...processedArgs);
  },

  /**
   * Log genérico (alias de info)
   */
  log: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.INFO)) return;

    const processedArgs = processArgs(...args);
    console.log(`📝 [LOG]`, message, ...processedArgs);
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.DEBUG)) return;

    const processedArgs = processArgs(...args);
    console.log(`🐛 [DEBUG]`, message, ...processedArgs);
  },

  /**
   * Log de éxito (solo en desarrollo)
   */
  success: (message, ...args) => {
    if (!isLevelEnabled(LogLevel.INFO)) return;

    const processedArgs = processArgs(...args);
    console.log(`✅ [SUCCESS]`, message, ...processedArgs);
  },

  /**
   * Group logs (solo en desarrollo)
   */
  group: (label, fn) => {
    if (!IS_DEVELOPMENT) {
      fn();
      return;
    }

    console.group(label);
    fn();
    console.groupEnd();
  },

  /**
   * Table log (solo en desarrollo)
   */
  table: (data) => {
    if (!IS_DEVELOPMENT) return;

    const sanitized = processArgs(data);
    console.table(sanitized);
  },

  /**
   * Performance timing
   */
  time: (label) => {
    if (!IS_DEVELOPMENT) return;
    console.time(label);
  },

  timeEnd: (label) => {
    if (!IS_DEVELOPMENT) return;
    console.timeEnd(label);
  },

  /**
   * Log de datos sensibles (solo en desarrollo estricto)
   */
  sensitive: (message, ...args) => {
    if (IS_PRODUCTION) {
      console.warn('⚠️ Attempted to log sensitive data in production');
      return;
    }

    console.log(`🔐 [SENSITIVE]`, message, ...args);
  }
};

/**
 * Wrapper para servicios específicos
 */
export const createServiceLogger = (serviceName) => {
  return {
    error: (message, ...args) => logger.error(`[${serviceName}] ${message}`, ...args),
    warn: (message, ...args) => logger.warn(`[${serviceName}] ${message}`, ...args),
    info: (message, ...args) => logger.info(`[${serviceName}] ${message}`, ...args),
    debug: (message, ...args) => logger.debug(`[${serviceName}] ${message}`, ...args),
    success: (message, ...args) => logger.success(`[${serviceName}] ${message}`, ...args)
  };
};

/**
 * Helper para logging de queries de Supabase
 */
export const logSupabaseQuery = (tableName, operation, details = {}) => {
  if (!IS_DEVELOPMENT) return;

  logger.debug(`Supabase Query: ${operation} on ${tableName}`, sanitizeForLogging(details));
};

/**
 * Helper para logging de errores de Supabase
 */
export const logSupabaseError = (tableName, operation, error) => {
  logger.error(`Supabase Error: ${operation} on ${tableName}`, {
    code: error.code,
    message: error.message,
    details: sanitizeForLogging(error.details)
  });
};

/**
 * Analytics Logger
 * Para tracking de eventos y conversiones
 */
export const analyticsLogger = {
  /**
   * Track un evento genérico
   */
  trackEvent: (eventName, data = {}) => {
    if (!IS_DEVELOPMENT) return;
    logger.info(`📊 [ANALYTICS] Event: ${eventName}`, sanitizeForLogging(data));
  },

  /**
   * Track una conversión de lead
   */
  trackLeadConversion: (leadId, source) => {
    if (!IS_DEVELOPMENT) return;
    logger.info(`📊 [ANALYTICS] Lead Conversion`, { leadId, source });
  },

  /**
   * Track un error
   */
  trackError: (error, context = {}) => {
    logger.error(`📊 [ANALYTICS] Error tracked`, {
      message: error?.message || 'Unknown error',
      context: sanitizeForLogging(context)
    });
  }
};

export default logger;
export { LogLevel };
