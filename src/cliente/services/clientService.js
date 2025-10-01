import { supabase } from '../../lib/supabaseClient';
import { clienteProjectService } from './api/clienteProjectService';

/**
 * Client Service
 * Handles all client-related API calls (usuarios table)
 */

export const clientService = {
  // Get client by user ID
  getClientByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get client with initial analysis data
  // Note: cotizaciones_inicial contains the CFE receipt analysis (consumo_kwh_historico, sizing_results, etc.)
  // This is different from 'proyectos' table which is for managing quote requests to installers
  getClientWithQuote: async (userId) => {
    console.log('🔍 clientService.getClientWithQuote - userId:', userId);

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      throw userError;
    }
    console.log('✅ User data fetched:', { userId: userData?.id, nombre: userData?.nombre });

    // Get initial quote/analysis with irradiation data
    const { data: cotizacionData, error: cotizacionError } = await supabase
      .from('cotizaciones_inicial')
      .select(`
        *,
        irradiacion_cache:irradiacion_cache_id (
          irradiacion_promedio_anual,
          irradiacion_promedio_min,
          irradiacion_promedio_max,
          datos_nasa_mensuales
        )
      `)
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cotizacionError) {
      console.warn('⚠️ No cotizacion_inicial found:', cotizacionError.message, cotizacionError.code);
    } else {
      console.log('✅ Cotizacion inicial found:', {
        id: cotizacionData?.id,
        hasConsumo: !!cotizacionData?.consumo_kwh_historico,
        hasSizing: !!cotizacionData?.sizing_results,
        hasRecibo: !!cotizacionData?.recibo_cfe
      });
    }

    // Return user data even if no quote exists
    const result = {
      user: userData,
      cotizacion: cotizacionError ? null : cotizacionData
    };

    console.log('📤 clientService returning:', {
      hasUser: !!result.user,
      hasCotizacion: !!result.cotizacion
    });

    return result;
  },

  // Create or update client profile
  upsertClient: async (userId, clientData) => {
    const { data, error } = await supabase
      .from('usuarios')
      .upsert({
        id: userId,
        ...clientData
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update client profile
  updateClient: async (userId, updates) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get initial quote by user ID
  getInitialQuote: async (userId) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .select('*')
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  // Create initial quote
  createInitialQuote: async (quoteData) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .insert([quoteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update initial quote
  updateInitialQuote: async (quoteId, updates) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .update(updates)
      .eq('id', quoteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Migrate lead data to client
  migrateLeadToClient: async (userId, leadData) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .insert({
        usuarios_id: userId,
        recibo_cfe: leadData.recibo_cfe,
        consumo_kwh_historico: leadData.consumo_kwh_historico,
        resumen_energetico: leadData.resumen_energetico,
        sizing_results: leadData.sizing_results,
        irradiacion_cache_id: leadData.irradiacion_cache_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};