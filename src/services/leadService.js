import { supabase } from '../lib/supabaseClient';

/**
 * Lead Service
 * Handles all lead-related API calls (temporary quotes for anonymous users)
 */

export const leadService = {
  // Get lead data by temp_lead_id
  getLeadData: async (tempLeadId) => {
    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .select('*')
      .eq('temp_lead_id', tempLeadId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create lead data
  createLeadData: async (leadData) => {
    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update lead data
  updateLeadData: async (tempLeadId, updates) => {
    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .update(updates)
      .eq('temp_lead_id', tempLeadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete lead data
  deleteLeadData: async (tempLeadId) => {
    const { error } = await supabase
      .from('cotizaciones_leads_temp')
      .delete()
      .eq('temp_lead_id', tempLeadId);

    if (error) throw error;
  }
};