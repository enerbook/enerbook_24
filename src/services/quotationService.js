import { supabase } from '../lib/supabaseClient';

/**
 * Quotation Service
 * Handles all quotation-related API calls (cotizaciones_final table)
 */

export const quotationService = {
  // Get quotations for a project
  getProjectQuotations: async (projectId) => {
    const { data, error } = await supabase
      .from('cotizaciones_final')
      .select(`
        *,
        proveedores:proveedores_id (
          nombre_empresa,
          calificacion_promedio
        )
      `)
      .eq('proyectos_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get quotations for an installer with full project details
  getInstallerQuotations: async (installerId) => {
    const { data, error } = await supabase
      .from('cotizaciones_final')
      .select(`
        *,
        proyectos:proyectos_id (
          titulo,
          usuarios:usuarios_id (
            nombre,
            correo_electronico
          ),
          cotizaciones_inicial:cotizaciones_inicial_id (
            sizing_results
          )
        )
      `)
      .eq('proveedores_id', installerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create quotation
  createQuotation: async (quotationData) => {
    const { data, error } = await supabase
      .from('cotizaciones_final')
      .insert([quotationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update quotation status
  updateQuotationStatus: async (quotationId, status) => {
    const { data, error } = await supabase
      .from('cotizaciones_final')
      .update({ estado: status })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Request quotations for project
  requestQuotations: async (projectId, installerIds) => {
    const quotations = installerIds.map(installerId => ({
      proyectos_id: projectId,
      proveedores_id: installerId,
      estado: 'pendiente'
    }));

    const { data, error } = await supabase
      .from('cotizaciones_final')
      .insert(quotations)
      .select();

    if (error) throw error;
    return data;
  }
};