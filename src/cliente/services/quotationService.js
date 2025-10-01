import { supabase } from '../../lib/supabaseClient';

/**
 * Cliente Quotation Service
 * Handles quotation-related operations for cliente role
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
          nombre_contacto,
          email,
          telefono
        )
      `)
      .eq('proyectos_id', projectId)
      .order('created_at', { ascending: false });

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
