import { supabase } from '../../../lib/supabaseClient';

/**
 * Cliente Contract Service
 * Handles contract-related operations for cliente role
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
  },

  // Accept quotation and create contract
  acceptQuotation: async (quotationId, paymentType, userId) => {
    // 1. Get quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from('cotizaciones_final')
      .select(`
        *,
        proyectos:proyectos_id (
          id,
          titulo,
          usuarios_id
        )
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError) throw quotationError;
    if (!quotation) throw new Error('Cotización no encontrada');

    // Verify user owns the project
    if (quotation.proyectos.usuarios_id !== userId) {
      throw new Error('No tienes permiso para aceptar esta cotización');
    }

    const precioTotal = quotation.precio_final?.total || 0;

    // 2. Generate unique contract number
    const contractNumber = `CONT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 3. Prepare payment configuration based on payment type
    let configuracion_pago = {};
    if (paymentType === 'upfront') {
      configuracion_pago = {
        tipo: 'upfront',
        monto_total: precioTotal,
        descripcion: 'Pago único al inicio del proyecto'
      };
    } else if (paymentType === 'milestones') {
      configuracion_pago = {
        tipo: 'milestones',
        milestones: [
          { nombre: 'Acepta oferta', porcentaje: 30, monto: precioTotal * 0.30 },
          { nombre: 'Inicio instalación', porcentaje: 40, monto: precioTotal * 0.40 },
          { nombre: 'Entrega final', porcentaje: 30, monto: precioTotal * 0.30 }
        ]
      };
    } else if (paymentType === 'financing') {
      configuracion_pago = {
        tipo: 'financing',
        monto_total: precioTotal,
        pendiente_configuracion_financiera: true,
        descripcion: 'Financiamiento externo pendiente de configuración'
      };
    }

    // 4. Create contract
    const { data: contract, error: contractError } = await supabase
      .from('contratos')
      .insert([{
        cotizaciones_final_id: quotationId,
        usuarios_id: userId,
        proveedores_id: quotation.proveedores_id,
        numero_contrato: contractNumber,
        precio_total_sistema: precioTotal,
        tipo_pago_seleccionado: paymentType,
        configuracion_pago,
        estado: 'activo',
        estado_pago: 'pendiente'
      }])
      .select()
      .single();

    if (contractError) throw contractError;

    // 5. Create milestones if payment type is milestones
    if (paymentType === 'milestones') {
      const milestones = [
        {
          contratos_id: contract.id,
          numero_milestone: 1,
          nombre_milestone: 'Acepta oferta',
          descripcion: 'Pago inicial al aceptar la cotización',
          porcentaje_pago: 30,
          monto_pago: precioTotal * 0.30,
          estado: 'pendiente',
          comision_enerbook_monto: precioTotal * 0.30 * 0.05 // 5% commission
        },
        {
          contratos_id: contract.id,
          numero_milestone: 2,
          nombre_milestone: 'Inicio instalación',
          descripcion: 'Pago al iniciar la instalación del sistema',
          porcentaje_pago: 40,
          monto_pago: precioTotal * 0.40,
          estado: 'pendiente',
          comision_enerbook_monto: precioTotal * 0.40 * 0.05
        },
        {
          contratos_id: contract.id,
          numero_milestone: 3,
          nombre_milestone: 'Entrega final',
          descripcion: 'Pago final al completar la instalación',
          porcentaje_pago: 30,
          monto_pago: precioTotal * 0.30,
          estado: 'pendiente',
          comision_enerbook_monto: precioTotal * 0.30 * 0.05
        }
      ];

      const { error: milestonesError } = await supabase
        .from('pagos_milestones')
        .insert(milestones);

      if (milestonesError) throw milestonesError;
    }

    // 6. Update quotation status to 'aceptada'
    const { error: updateQuotationError } = await supabase
      .from('cotizaciones_final')
      .update({ estado: 'aceptada' })
      .eq('id', quotationId);

    if (updateQuotationError) throw updateQuotationError;

    // 7. Update project status to 'adjudicado'
    const { error: updateProjectError } = await supabase
      .from('proyectos')
      .update({ estado: 'adjudicado' })
      .eq('id', quotation.proyectos.id);

    if (updateProjectError) throw updateProjectError;

    // 8. Reject other quotations for the same project
    const { error: rejectOthersError } = await supabase
      .from('cotizaciones_final')
      .update({ estado: 'rechazada' })
      .eq('proyectos_id', quotation.proyectos.id)
      .neq('id', quotationId)
      .eq('estado', 'pendiente');

    if (rejectOthersError) throw rejectOthersError;

    return contract;
  }
};
