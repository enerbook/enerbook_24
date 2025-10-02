import { supabase } from '../../lib/supabaseClient';

/**
 * Servicio para obtener estadísticas del landing desde Supabase
 */

/**
 * Obtiene las estadísticas activas del landing
 * @returns {Promise<Object>} Objeto con estadísticas o null si hay error
 */
export async function getLandingStats() {
  try {
    const { data, error } = await supabase
      .from('landing_stats')
      .select('proyectos_realizados, reduccion_promedio_recibos, energia_producida_anual, estados_cobertura')
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error fetching landing stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getLandingStats:', error);
    return null;
  }
}

/**
 * Valores de error cuando no se pueden cargar las estadísticas
 */
export const errorStats = {
  proyectos_realizados: 0,
  reduccion_promedio_recibos: 0,
  energia_producida_anual: 0,
  estados_cobertura: 0,
};

/**
 * Formatea el número de energía en formato legible (ej: "311,334 kWh")
 * @param {number} kwh - Cantidad en kWh
 * @returns {string} Número formateado
 */
export function formatEnergy(kwh) {
  if (!kwh || isNaN(kwh)) return '0 kWh';
  return `${Math.round(kwh).toLocaleString('es-MX')} kWh`;
}

/**
 * Formatea porcentaje
 * @param {number} percent - Porcentaje (0-100)
 * @returns {string} Porcentaje formateado (ej: "85%")
 */
export function formatPercent(percent) {
  if (!percent || isNaN(percent)) return '0%';
  return `${Math.round(percent)}%`;
}
