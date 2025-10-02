import { supabase } from '../../lib/supabaseClient';
import {
  validateTempLeadId,
  sanitizeTempLeadId,
  isLeadExpired,
  validateReciboCFE,
  checkRateLimit
} from '../../utils/security';
import { logger } from '../utils/logger';

/**
 * Lead Service
 * Handles all lead-related API calls (temporary quotes for anonymous users)
 * Enhanced with security validations
 */

export const leadService = {
  // Get lead data by temp_lead_id
  getLeadData: async (tempLeadId) => {
    // Security: Validar formato de temp_lead_id
    if (!validateTempLeadId(tempLeadId)) {
      throw new Error('ID de lead inválido o formato incorrecto');
    }

    // Security: Sanitizar input
    const sanitizedId = sanitizeTempLeadId(tempLeadId);
    if (!sanitizedId) {
      throw new Error('No se pudo validar el ID del lead');
    }

    // Security: Rate limiting (máximo 10 intentos por minuto)
    const rateLimit = checkRateLimit(`lead_access_${sanitizedId}`, 10, 60000);
    if (!rateLimit.allowed) {
      throw new Error('Demasiados intentos de acceso. Por favor espera un momento.');
    }

    // Query con campos específicos (no SELECT *)
    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .select(`
        id,
        temp_lead_id,
        created_at,
        recibo_cfe,
        consumo_kwh_historico,
        resumen_energetico,
        sizing_results,
        irradiacion_cache_id
      `)
      .eq('temp_lead_id', sanitizedId)
      .single();

    if (error) {
      // No revelar detalles del error al cliente
      if (error.code === 'PGRST116') {
        throw new Error('Lead no encontrado o acceso no autorizado');
      }
      throw new Error('Error al cargar los datos del lead');
    }

    // Security: Verificar que el lead no esté expirado
    if (isLeadExpired(data.created_at)) {
      throw new Error('Este análisis ha expirado. Por favor genera uno nuevo.');
    }

    return data;
  },

  // Create lead data
  createLeadData: async (leadData) => {
    // Security: Validar estructura del recibo CFE
    if (leadData.recibo_cfe && !validateReciboCFE(leadData.recibo_cfe)) {
      throw new Error('Datos del recibo CFE inválidos');
    }

    // Security: Validar temp_lead_id si se proporciona
    if (leadData.temp_lead_id && !validateTempLeadId(leadData.temp_lead_id)) {
      throw new Error('ID de lead generado es inválido');
    }

    // Security: Rate limiting para creación (máximo 3 leads por hora)
    const userIdentifier = typeof window !== 'undefined' ?
      `${window.navigator.userAgent}-${Date.now()}` :
      'server';
    const rateLimit = checkRateLimit(`lead_creation_${userIdentifier}`, 3, 3600000);

    if (!rateLimit.allowed) {
      throw new Error('Has alcanzado el límite de análisis por hora. Por favor intenta más tarde.');
    }

    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .insert([leadData])
      .select(`
        id,
        temp_lead_id,
        created_at,
        recibo_cfe,
        consumo_kwh_historico,
        resumen_energetico,
        sizing_results,
        irradiacion_cache_id
      `)
      .single();

    if (error) {
      logger.error('Error creating lead:', error.message);
      throw new Error('No se pudo crear el análisis. Por favor intenta nuevamente.');
    }

    return data;
  },

  // Update lead data
  updateLeadData: async (tempLeadId, updates) => {
    // Security: Validar temp_lead_id
    if (!validateTempLeadId(tempLeadId)) {
      throw new Error('ID de lead inválido');
    }

    const sanitizedId = sanitizeTempLeadId(tempLeadId);

    // Security: No permitir actualizar temp_lead_id ni created_at
    const { temp_lead_id: _, created_at: __, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .update(safeUpdates)
      .eq('temp_lead_id', sanitizedId)
      .select(`
        id,
        temp_lead_id,
        created_at,
        recibo_cfe,
        consumo_kwh_historico,
        resumen_energetico,
        sizing_results,
        irradiacion_cache_id
      `)
      .single();

    if (error) {
      throw new Error('No se pudo actualizar el lead');
    }

    return data;
  },

  // Delete lead data
  deleteLeadData: async (tempLeadId) => {
    // Security: Validar temp_lead_id
    if (!validateTempLeadId(tempLeadId)) {
      throw new Error('ID de lead inválido');
    }

    const sanitizedId = sanitizeTempLeadId(tempLeadId);

    const { error } = await supabase
      .from('cotizaciones_leads_temp')
      .delete()
      .eq('temp_lead_id', sanitizedId);

    if (error) {
      throw new Error('No se pudo eliminar el lead');
    }
  }
};