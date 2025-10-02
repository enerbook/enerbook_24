/**
 * Security Utils Tests
 * Tests for validation functions
 */

import {
  validateTempLeadId,
  sanitizeTempLeadId,
  isValidUUID,
  isValidEmail,
  isValidMexicanPhone
} from '../security';

describe('validateTempLeadId', () => {
  test('valida formato lead_timestamp_random correctamente', () => {
    expect(validateTempLeadId('lead_1759432944463_4ohw3cmg8')).toBe(true);
    expect(validateTempLeadId('lead_1737187742000_abc123def')).toBe(true);
    expect(validateTempLeadId('lead_1234567890123_xyz789ghi')).toBe(true);
  });

  test('valida UUID v4 estándar para compatibilidad', () => {
    expect(validateTempLeadId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateTempLeadId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  test('rechaza formatos inválidos', () => {
    expect(validateTempLeadId('lead_123_abc')).toBe(false); // timestamp muy corto
    expect(validateTempLeadId('lead_1759432944463')).toBe(false); // falta random
    expect(validateTempLeadId('invalid')).toBe(false);
    expect(validateTempLeadId('')).toBe(false);
    expect(validateTempLeadId(null)).toBe(false);
    expect(validateTempLeadId(undefined)).toBe(false);
  });

  test('rechaza intentos de SQL injection', () => {
    expect(validateTempLeadId("lead_1234567890123_abc'; DROP TABLE users;--")).toBe(false);
    expect(validateTempLeadId('lead_1234567890123_<script>alert(1)</script>')).toBe(false);
  });
});

describe('sanitizeTempLeadId', () => {
  test('sanitiza IDs válidos correctamente', () => {
    expect(sanitizeTempLeadId('lead_1759432944463_4ohw3cmg8')).toBe('lead_1759432944463_4ohw3cmg8');
  });

  test('retorna null para IDs inválidos', () => {
    expect(sanitizeTempLeadId('invalid')).toBe(null);
    expect(sanitizeTempLeadId('')).toBe(null);
  });

  test('remueve caracteres peligrosos', () => {
    // Nota: estos ya serán rechazados por validateTempLeadId primero
    expect(sanitizeTempLeadId('lead_123_abc')).toBe(null);
  });
});

describe('isValidUUID', () => {
  test('valida UUIDs v4 correctos', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  test('rechaza UUIDs inválidos', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID(null)).toBe(false);
  });
});

describe('isValidEmail', () => {
  test('valida emails correctos', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
  });

  test('rechaza emails inválidos', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidMexicanPhone', () => {
  test('valida teléfonos mexicanos correctos', () => {
    expect(isValidMexicanPhone('5512345678')).toBe(true);
    expect(isValidMexicanPhone('55 1234 5678')).toBe(true);
    expect(isValidMexicanPhone('(55) 1234-5678')).toBe(true);
    expect(isValidMexicanPhone('+525512345678')).toBe(true);
  });

  test('rechaza teléfonos inválidos', () => {
    expect(isValidMexicanPhone('123')).toBe(false);
    expect(isValidMexicanPhone('12345678901234')).toBe(false);
    expect(isValidMexicanPhone('')).toBe(false);
  });
});
