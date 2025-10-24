import { supabase } from '../../lib/supabaseClient';

/**
 * Instalador Quotation Service
 * Handles quotation-related operations for instalador role
 */

export const quotationService = {
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

  // Get current provider ID from authenticated user
  getCurrentProviderId: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('proveedores')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No se encontró perfil de proveedor');

    return data.id;
  },

  // Submit complete quotation from installer to project
  submitQuotation: async (projectId, quotationFormData) => {
    // Get provider ID
    const providerId = await quotationService.getCurrentProviderId();

    // Structure quotation data according to schema
    const quotationData = {
      proyectos_id: projectId,
      proveedores_id: providerId,
      paneles: {
        marca: quotationFormData.paneles_marca,
        modelo: quotationFormData.paneles_modelo,
        cantidad: parseInt(quotationFormData.paneles_cantidad) || 0,
        potencia_wp: parseInt(quotationFormData.paneles_potencia_wp) || 0,
        precio: parseFloat(quotationFormData.paneles_precio) || 0,
        garantia_anos: parseInt(quotationFormData.paneles_garantia) || 0
      },
      inversores: {
        marca: quotationFormData.inversores_marca,
        modelo: quotationFormData.inversores_modelo,
        tipo: quotationFormData.inversores_tipo,
        potencia_kw: parseFloat(quotationFormData.inversores_potencia_kw) || 0,
        precio: parseFloat(quotationFormData.inversores_precio) || 0,
        garantia_anos: parseInt(quotationFormData.inversores_garantia) || 0
      },
      estructura: {
        tipo: quotationFormData.estructura_tipo,
        material: quotationFormData.estructura_material,
        precio: parseFloat(quotationFormData.estructura_precio) || 0
      },
      sistema_electrico: {
        descripcion: quotationFormData.sistema_electrico_descripcion,
        precio: parseFloat(quotationFormData.sistema_electrico_precio) || 0,
        tiempo_instalacion_dias: parseInt(quotationFormData.tiempo_instalacion_dias) || 0,
        garantia_instalacion_anos: parseInt(quotationFormData.garantia_instalacion) || 0
      },
      precio_final: {
        total: parseFloat(quotationFormData.precio_total) || 0,
        produccion_anual_kwh: parseFloat(quotationFormData.produccion_anual_kwh) || 0,
        capacidad_sistema_kwp: parseFloat(quotationFormData.capacidad_sistema_kwp) || 0
      },
      opciones_pago: quotationFormData.opciones_pago || [],
      notas_proveedor: quotationFormData.notas_proveedor || '',
      estado: 'pendiente'
    };

    const { data, error } = await supabase
      .from('cotizaciones_final')
      .insert([quotationData])
      .select()
      .single();

    if (error) {
      // Check for duplicate constraint violation
      if (error.code === '23505') {
        throw new Error('Ya has enviado una cotización para este proyecto');
      }
      throw error;
    }

    return data;
  }
};
