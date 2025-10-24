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

    // Parse JSON fields from strings to objects
    const parsedData = (data || []).map(cotizacion => {
      return {
        ...cotizacion,
        paneles: typeof cotizacion.paneles === 'string' ? JSON.parse(cotizacion.paneles) : cotizacion.paneles,
        inversores: typeof cotizacion.inversores === 'string' ? JSON.parse(cotizacion.inversores) : cotizacion.inversores,
        estructura: typeof cotizacion.estructura === 'string' ? JSON.parse(cotizacion.estructura) : cotizacion.estructura,
        sistema_electrico: typeof cotizacion.sistema_electrico === 'string' ? JSON.parse(cotizacion.sistema_electrico) : cotizacion.sistema_electrico,
        precio_final: typeof cotizacion.precio_final === 'string' ? JSON.parse(cotizacion.precio_final) : cotizacion.precio_final,
        opciones_pago: typeof cotizacion.opciones_pago === 'string' ? JSON.parse(cotizacion.opciones_pago) : cotizacion.opciones_pago
      };
    });

    return parsedData;
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
