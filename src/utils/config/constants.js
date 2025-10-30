/**
 * Security and Validation Constants
 * Centralized configuration for security utilities
 */

// Geographic Boundaries - Mexico
export const MEXICO_BOUNDARIES = {
  lat: { min: 14, max: 33 },
  lng: { min: -118, max: -86 }
};

// Business Rules
export const LEAD_EXPIRATION_DAYS = 7;

// Rate Limiting Configuration
export const RATE_LIMITS = {
  default: {
    maxAttempts: 5,
    windowMs: 60000  // 1 minute
  },
  login: {
    maxAttempts: 3,
    windowMs: 300000  // 5 minutes
  },
  api: {
    maxAttempts: 10,
    windowMs: 60000  // 1 minute
  }
};

// Security Token Configuration
export const SECURITY = {
  csrfTokenBytes: 32,
  maxEmailLength: 254,  // RFC 5321 standard
  sessionStorageKeys: {
    csrfToken: 'csrf_token'
  },
  localStorageKeys: {
    rateLimitPrefix: 'rateLimit_'
  }
};

// Sensitive Data Keys (for sanitization)
export const SENSITIVE_KEYS = [
  'password',
  'token',
  'api_key',
  'apiKey',
  'secret',
  'authorization',
  'credit_card',
  'ssn',
  'rfc',
  'access_token',
  'refresh_token',
  'bearer'
];

// Validation Patterns (Regex)
export const VALIDATION_REGEX = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  tempLeadId: /^lead_\d{13}_[a-z0-9]{8,12}$/i,
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  mexicanPhone: /^(\+?52)?[0-9]{10}$/
};

// Required Fields for CFE Receipt Validation
export const CFE_RECEIPT_FIELDS = {
  required: ['nombre', 'direccion', 'consumo_kwh'],
  optionalNumeric: ['lat', 'lng']
};

// Redaction Patterns (for logging)
export const REDACTION_PATTERNS = {
  bearerToken: /Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi,
  hashLike: /[a-f0-9]{32,}/gi,
  redactionText: '***REDACTED***'
};

// Time Conversions (for readability)
export const TIME_MS = {
  second: 1000,
  minute: 60000,
  hour: 3600000,
  day: 86400000
};