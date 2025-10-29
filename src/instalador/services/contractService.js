import { supabase } from '../../lib/supabaseClient';

/**
 * Instalador Contract Service
 * Handles contract-related operations for instalador role
 */

export const contractService = {
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
          precio_final,
          proyectos:proyectos_id (
            id,
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
  }
};
