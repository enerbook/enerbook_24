/**
 * Funciones de formateo compartidas para el panel de administrador
 */

/**
 * Formatea un número como moneda mexicana (MXN)
 * @param {number} value - Valor a formatear
 * @param {boolean} fromCents - Si el valor está en centavos (para Stripe)
 * @returns {string} Valor formateado
 */
export const formatCurrency = (value, fromCents = false) => {
  const amount = fromCents ? value / 100 : value;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Formatea una fecha en formato corto español
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha como tiempo relativo ("Hace 2 días", "Ayer", etc.)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Hace menos de 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return formatDate(dateString);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor decimal (0-1) o entero (0-100)
 * @param {number} decimals - Cantidad de decimales
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formatea días de diferencia entre dos fechas
 * @param {string|Date} startDate - Fecha inicial
 * @param {string|Date} endDate - Fecha final (por defecto: ahora)
 * @returns {number} Cantidad de días
 */
export const calculateDaysDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Formatea horas de diferencia entre dos fechas
 * @param {string|Date} startDate - Fecha inicial
 * @param {string|Date} endDate - Fecha final (por defecto: ahora)
 * @returns {number} Cantidad de horas
 */
export const calculateHoursDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / (1000 * 60 * 60));
};
