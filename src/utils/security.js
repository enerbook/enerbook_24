/**
 * Security Utilities
 * Funciones para validaci��n y sanitización de datos
 */

import {
  MEXICO_BOUNDARIES,
  LEAD_EXPIRATION_DAYS,
  RATE_LIMITS,
  SECURITY,
  SENSITIVE_KEYS,
  VALIDATION_REGEX,
  CFE_RECEIPT_FIELDS,
  TIME_MS
} from './config/constants';

/**
 * Valida formato de UUID v4
 * @param {string} uuid - UUID a validar
 * @returns {boolean}
 */
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;

  return VALIDATION_REGEX.uuid.test(uuid);
};

/**
 * Valida que temp_lead_id tenga formato correcto y no sea enumerable
 * Formato esperado: "lead_timestamp_randomstring"
 * Ejemplo: "lead_1759432944463_4ohw3cmg8"
 * @param {string} tempLeadId - ID temporal del lead
 * @returns {boolean}
 */
export const validateTempLeadId = (tempLeadId) => {
  if (!tempLeadId || typeof tempLeadId !== 'string') {
    return false;
  }

  // Formato 1: UUID v4 estándar (para compatibilidad futura)
  if (isValidUUID(tempLeadId)) {
    return true;
  }

  // Formato 2: lead_timestamp_randomstring (formato actual de N8N)
  // Ejemplo: lead_1759432944463_4ohw3cmg8
  if (VALIDATION_REGEX.tempLeadId.test(tempLeadId)) {
    return true;
  }

  // Rechazar cualquier otro formato
  return false;
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

  // Remover cualquier carácter no permitido
  // Permitir: alphanumeric, guiones y guiones bajos
  return tempLeadId.replace(/[^a-zA-Z0-9\-_]/g, '');
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
  const daysDiff = (now - created) / TIME_MS.day;

  return daysDiff > LEAD_EXPIRATION_DAYS;
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
  for (const field of CFE_RECEIPT_FIELDS.required) {
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

    // México: validar límites geográficos
    if (isNaN(lat) || lat < MEXICO_BOUNDARIES.lat.min || lat > MEXICO_BOUNDARIES.lat.max) {
      return false;
    }
    if (isNaN(lng) || lng < MEXICO_BOUNDARIES.lng.min || lng > MEXICO_BOUNDARIES.lng.max) {
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
export const checkRateLimit = (
  key,
  maxAttempts = RATE_LIMITS.default.maxAttempts,
  windowMs = RATE_LIMITS.default.windowMs
) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    // En servidor o sin localStorage, permitir
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  const rateLimitKey = `${SECURITY.localStorageKeys.rateLimitPrefix}${key}`;
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

  return VALIDATION_REGEX.email.test(email) && email.length <= SECURITY.maxEmailLength;
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
  return VALIDATION_REGEX.mexicanPhone.test(cleaned);
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

  const array = new Uint8Array(SECURITY.csrfTokenBytes);
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

  const storedToken = sessionStorage.getItem(SECURITY.sessionStorageKeys.csrfToken);
  return storedToken === token;
};

/**
 * Limpia datos sensibles antes de logging
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} - Objeto sin datos sensibles
 */
export const sanitizeForLogging = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
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
