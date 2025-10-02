/**
 * Security Utilities
 * Funciones para validación y sanitización de datos
 */

/**
 * Valida formato de UUID v4
 * @param {string} uuid - UUID a validar
 * @returns {boolean}
 */
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Valida que temp_lead_id tenga formato correcto y no sea enumerable
 * @param {string} tempLeadId - ID temporal del lead
 * @returns {boolean}
 */
export const validateTempLeadId = (tempLeadId) => {
  if (!tempLeadId || typeof tempLeadId !== 'string') {
    return false;
  }

  // Debe ser UUID válido
  if (!isValidUUID(tempLeadId)) {
    return false;
  }

  // Longitud mínima de seguridad (UUID = 36 caracteres)
  if (tempLeadId.length < 36) {
    return false;
  }

  return true;
};

/**
 * Sanitiza temp_lead_id para prevenir inyección
 * @param {string} tempLeadId - ID a sanitizar
 * @returns {string|null} - ID sanitizado o null si inválido
 */
export const sanitizeTempLeadId = (tempLeadId) => {
  if (!validateTempLeadId(tempLeadId)) {
    return null;
  }

  // Remover cualquier carácter no permitido (solo alphanumeric + guiones)
  return tempLeadId.replace(/[^a-zA-Z0-9-]/g, '');
};

/**
 * Verifica que un lead no esté expirado (más de 7 días)
 * @param {Date|string} createdAt - Fecha de creación del lead
 * @returns {boolean}
 */
export const isLeadExpired = (createdAt) => {
  if (!createdAt) return true;

  const created = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

  return daysDiff > 7;
};

/**
 * Valida estructura de recibo CFE para prevenir inyección maliciosa
 * @param {Object} reciboCFE - Objeto con datos del recibo
 * @returns {boolean}
 */
export const validateReciboCFE = (reciboCFE) => {
  if (!reciboCFE || typeof reciboCFE !== 'object') {
    return false;
  }

  // Validar campos requeridos
  const requiredFields = ['nombre', 'direccion', 'consumo_kwh'];
  for (const field of requiredFields) {
    if (!(field in reciboCFE)) {
      return false;
    }
  }

  // Validar tipos de datos
  if (typeof reciboCFE.nombre !== 'string' || reciboCFE.nombre.length === 0) {
    return false;
  }

  if (typeof reciboCFE.consumo_kwh !== 'number' || reciboCFE.consumo_kwh < 0) {
    return false;
  }

  // Validar coordenadas GPS si existen
  if (reciboCFE.lat !== undefined || reciboCFE.lng !== undefined) {
    const lat = parseFloat(reciboCFE.lat);
    const lng = parseFloat(reciboCFE.lng);

    // México: lat entre 14° y 33°, lng entre -118° y -86°
    if (isNaN(lat) || lat < 14 || lat > 33) {
      return false;
    }
    if (isNaN(lng) || lng < -118 || lng > -86) {
      return false;
    }
  }

  return true;
};

/**
 * Rate limiting simple basado en localStorage
 * @param {string} key - Clave única para el recurso
 * @param {number} maxAttempts - Número máximo de intentos
 * @param {number} windowMs - Ventana de tiempo en ms
 * @returns {Object} - { allowed: boolean, remainingAttempts: number }
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    // En servidor o sin localStorage, permitir
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  const rateLimitKey = `rateLimit_${key}`;
  const now = Date.now();

  // Obtener datos actuales
  const dataStr = localStorage.getItem(rateLimitKey);
  let data = dataStr ? JSON.parse(dataStr) : { attempts: 0, resetAt: now + windowMs };

  // Resetear si la ventana expiró
  if (now > data.resetAt) {
    data = { attempts: 0, resetAt: now + windowMs };
  }

  // Incrementar intentos
  data.attempts++;
  localStorage.setItem(rateLimitKey, JSON.stringify(data));

  const allowed = data.attempts <= maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - data.attempts);

  return { allowed, remainingAttempts, resetAt: data.resetAt };
};

/**
 * Sanitiza string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida email con regex estricto
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valida teléfono mexicano
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
export const isValidMexicanPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;

  // Remover espacios y caracteres especiales
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Formatos válidos: 10 dígitos o +52 + 10 dígitos
  const phoneRegex = /^(\+?52)?[0-9]{10}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Genera un token CSRF simple para formularios
 * @returns {string}
 */
export const generateCSRFToken = () => {
  if (typeof window === 'undefined' || !window.crypto) {
    // Fallback para entornos sin crypto API
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifica token CSRF almacenado en sessionStorage
 * @param {string} token - Token a verificar
 * @returns {boolean}
 */
export const verifyCSRFToken = (token) => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }

  const storedToken = sessionStorage.getItem('csrf_token');
  return storedToken === token;
};

/**
 * Limpia datos sensibles antes de logging
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} - Objeto sin datos sensibles
 */
export const sanitizeForLogging = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitiveKeys = [
    'password',
    'token',
    'api_key',
    'apiKey',
    'secret',
    'authorization',
    'credit_card',
    'ssn',
    'rfc'
  ];

  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
};

export default {
  isValidUUID,
  validateTempLeadId,
  sanitizeTempLeadId,
  isLeadExpired,
  validateReciboCFE,
  checkRateLimit,
  sanitizeString,
  isValidEmail,
  isValidMexicanPhone,
  generateCSRFToken,
  verifyCSRFToken,
  sanitizeForLogging
};
