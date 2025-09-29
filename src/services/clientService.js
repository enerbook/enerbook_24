import { supabase } from '../lib/supabaseClient';

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

  // Get client with initial quote
  getClientWithQuote: async (userId) => {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get initial quote
    const { data: cotizacionData, error: cotizacionError } = await supabase
      .from('cotizaciones_inicial')
      .select('*')
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Return user data even if no quote exists
    return {
      user: userData,
      cotizacion: cotizacionError ? null : cotizacionData
    };
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