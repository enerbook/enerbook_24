import { supabase } from '../../lib/supabaseClient';

/**
 * Installer Service
 * Handles all installer-related API calls (proveedores table)
 */

export const installerService = {
  // Get all installers/providers
  getAllInstallers: async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('calificacion_promedio', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get installer by ID
  getInstallerById: async (installerId) => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', installerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get installer by auth user ID
  getInstallerByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update installer profile
  updateInstaller: async (installerId, updates) => {
    const { data, error } = await supabase
      .from('proveedores')
      .update(updates)
      .eq('id', installerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get installer reviews with full contract details
  getInstallerReviews: async (installerId) => {
    // Get contracts for this provider first
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select(`
        id,
        numero_contrato,
        precio_total_sistema,
        fecha_completado,
        usuarios:usuarios_id (
          nombre
        ),
        cotizaciones_final:cotizaciones_final_id (
          proyectos:proyectos_id (
            titulo,
            descripcion
          )
        )
      `)
      .eq('proveedores_id', installerId);

    if (contratosError) throw contratosError;

    if (!contratos || contratos.length === 0) {
      return [];
    }

    // Get reviews for these contracts
    const contratoIds = contratos.map(c => c.id);
    const { data: resenas, error } = await supabase
      .from('resenas')
      .select('*')
      .in('contratos_id', contratoIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Combine contract and review data
    return resenas?.map(resena => {
      const contrato = contratos.find(c => c.id === resena.contratos_id);
      return {
        ...resena,
        contrato
      };
    }) || [];
  }
};