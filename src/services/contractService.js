import { supabase } from '../lib/supabaseClient';

/**
 * Contract Service
 * Handles all contract-related API calls
 */

export const contractService = {
  // Get contracts for a project
  getProjectContracts: async (projectId) => {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        instaladores (
          nombre_empresa
        )
      `)
      .eq('id_proyecto', projectId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get contracts for an installer with full details
  getInstallerContracts: async (installerId) => {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        usuarios:usuarios_id (
          nombre,
          correo_electronico,
          telefono
        ),
        cotizaciones_final:cotizaciones_final_id (
          paneles,
          inversores,
          estructura,
          sistema_electrico,
          proyectos:proyectos_id (
            titulo,
            descripcion,
            cotizaciones_inicial:cotizaciones_inicial_id (
              sizing_results
            )
          )
        ),
        resenas:resenas (
          puntuacion,
          comentario,
          puntuacion_calidad,
          puntuacion_tiempo,
          puntuacion_comunicacion,
          recomendaria
        )
      `)
      .eq('proveedores_id', installerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create contract
  createContract: async (contractData) => {
    const { data, error } = await supabase
      .from('contratos')
      .insert([contractData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update contract status
  updateContractStatus: async (contractId, status) => {
    const { data, error } = await supabase
      .from('contratos')
      .update({ estado: status })
      .eq('id_contrato', contractId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get contracts for a client (user)
  getClientContracts: async (userId) => {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        proveedores:proveedores_id (
          nombre_empresa
        ),
        cotizaciones_final:cotizaciones_final_id (
          proyectos:proyectos_id (
            titulo
          )
        )
      `)
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};