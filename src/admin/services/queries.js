import { supabase } from '../../lib/supabaseClient';
import { checkAdminAccess, hasAdminLevel } from './auth';
import { calculateDaysDifference, calculateHoursDifference } from '../utils/formatters';
import logger from '../utils/logger';
import {
  STRIPE_FEES,
  PROJECT_STATUS_COLORS,
  STRIPE_ACCOUNT_COLORS,
  PAYMENT_TYPE_COLORS,
  MILESTONE_STATUS_COLORS,
  ALERT_THRESHOLDS,
  CHART_COLORS
} from '../config/constants';

export const adminQueries = {
  // Validar acceso admin antes de ejecutar queries
  async validateAdminAccess(userId) {
    const adminData = await checkAdminAccess(userId);
    if (!adminData) {
      throw new Error('Acceso denegado: Se requieren permisos de administrador');
    }
    return adminData;
  },

  // Métricas de usuarios
  async getUserMetrics(userId = null) {
    if (userId) {
      await this.validateAdminAccess(userId);
    }
    const { data: usuarios, count: totalUsuarios } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' });

    const { count: totalLeads } = await supabase
      .from('cotizaciones_leads_temp')
      .select('*', { count: 'exact' });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const nuevosUsuarios = usuarios?.filter(u =>
      new Date(u.created_at) > thirtyDaysAgo
    ).length || 0;

    return {
      totalUsuarios: totalUsuarios || 0,
      totalLeads: totalLeads || 0,
      nuevosUsuarios,
      admins: usuarios?.filter(u => u.es_admin).length || 0
    };
  },

  // Métricas de proyectos
  async getProjectMetrics() {
    const { data: proyectos } = await supabase
      .from('proyectos')
      .select('*');

    const estados = {
      total: proyectos?.length || 0,
      enProgreso: 0,
      completados: 0,
      cancelados: 0,
      cotizacion: 0
    };

    proyectos?.forEach(p => {
      switch (p.estado) {
        case 'en_progreso':
          estados.enProgreso++;
          break;
        case 'completado':
          estados.completados++;
          break;
        case 'cancelado':
          estados.cancelados++;
          break;
        case 'cotizacion':
          estados.cotizacion++;
          break;
      }
    });

    return estados;
  },

  // Métricas financieras
  async getFinanceMetrics() {
    const [comisiones, contratos, milestones] = await Promise.all([
      supabase.from('comisiones_enerbook').select('*'),
      supabase.from('contratos').select('*'),
      supabase.from('pagos_milestones').select('*')
    ]);

    const totalComisiones = comisiones.data?.reduce((sum, c) =>
      sum + (parseFloat(c.monto_comision) || 0), 0
    ) || 0;

    const comisionesPendientes = comisiones.data?.filter(c =>
      c.estado_pago === 'pendiente'
    ).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0;

    const valorTotalContratos = contratos.data?.reduce((sum, c) =>
      sum + (parseFloat(c.precio_total_sistema) || 0), 0
    ) || 0;

    const milestonesVencidos = milestones.data?.filter(m =>
      m.estado === 'pendiente' && new Date(m.fecha_objetivo) < new Date()
    ).length || 0;

    return {
      totalComisiones,
      comisionesPendientes,
      valorTotalContratos,
      milestonesVencidos,
      totalContratos: contratos.data?.length || 0,
      contratosPorTipo: groupByPaymentType(contratos.data)
    };
  },

  // Métricas de proveedores
  async getProviderMetrics() {
    const { data: proveedores } = await supabase
      .from('proveedores')
      .select('*');

    return {
      total: proveedores?.length || 0,
      activos: proveedores?.filter(p => p.activo).length || 0,
      stripeCompleto: proveedores?.filter(p => p.stripe_onboarding_completed).length || 0,
      stripePendiente: proveedores?.filter(p => !p.stripe_onboarding_completed).length || 0,
      conFinanciamiento: proveedores?.filter(p => p.acepta_financiamiento_externo).length || 0
    };
  },

  // Análisis regional
  async getRegionalAnalysis() {
    const [proyectos, irradiacion] = await Promise.all([
      supabase.from('proyectos').select('*'),
      supabase.from('irradiacion_cache').select('*')
    ]);

    const regiones = {};

    for (const proyecto of proyectos.data || []) {
      const region = await getProjectRegion(proyecto, irradiacion.data);
      if (!regiones[region]) {
        regiones[region] = {
          nombre: region,
          proyectos: 0,
          completados: 0,
          valorTotal: 0
        };
      }
      regiones[region].proyectos++;
      if (proyecto.estado === 'completado') {
        regiones[region].completados++;
      }
    }

    return Object.values(regiones);
  },

  // Alertas del sistema
  async getSystemAlerts() {
    const alerts = [];

    // Milestones vencidos
    const { data: milestones } = await supabase
      .from('pagos_milestones')
      .select('*')
      .eq('estado', 'pendiente')
      .lt('fecha_objetivo', new Date().toISOString());

    milestones?.forEach(m => {
      alerts.push({
        tipo: 'milestone',
        severidad: 'alta',
        mensaje: `Milestone vencido: ${m.descripcion}`,
        fecha: m.fecha_objetivo
      });
    });

    // Webhooks fallidos
    const { data: webhooks } = await supabase
      .from('stripe_webhooks_log')
      .select('*')
      .eq('processed', false)
      .limit(5);

    webhooks?.forEach(w => {
      alerts.push({
        tipo: 'webhook',
        severidad: 'media',
        mensaje: `Webhook sin procesar: ${w.event_type}`,
        fecha: w.created_at
      });
    });

    // Proveedores sin Stripe
    const { data: proveedores } = await supabase
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .eq('stripe_onboarding_completed', false);

    if (proveedores?.length > 0) {
      alerts.push({
        tipo: 'onboarding',
        severidad: 'baja',
        mensaje: `${proveedores.length} proveedores sin completar Stripe`,
        fecha: new Date().toISOString()
      });
    }

    return alerts;
  },

  // Tendencias temporales (optimizado)
  async getTrends(period = 'month') {
    const periods = getPeriodDates(period);
    const oldestDate = periods[0]?.start;

    if (!oldestDate) return [];

    try {
      // Una sola query por tabla con todos los datos
      const [usuarios, proyectos, comisiones] = await Promise.all([
        supabase
          .from('usuarios')
          .select('created_at')
          .gte('created_at', oldestDate),
        supabase
          .from('proyectos')
          .select('created_at')
          .gte('created_at', oldestDate),
        supabase
          .from('comisiones_enerbook')
          .select('created_at, monto_comision')
          .gte('created_at', oldestDate)
      ]);

      // Procesar en memoria agrupando por periodo
      return periods.map(period => {
        const periodStart = new Date(period.start);
        const periodEnd = new Date(period.end);

        return {
          periodo: period.label,
          usuarios: usuarios.data?.filter(u => {
            const date = new Date(u.created_at);
            return date >= periodStart && date <= periodEnd;
          }).length || 0,
          proyectos: proyectos.data?.filter(p => {
            const date = new Date(p.created_at);
            return date >= periodStart && date <= periodEnd;
          }).length || 0,
          ingresos: comisiones.data?.filter(c => {
            const date = new Date(c.created_at);
            return date >= periodStart && date <= periodEnd;
          }).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0
        };
      });
    } catch (error) {
      logger.error('Error getting trends:', error);
      return [];
    }
  },

  // NUEVAS QUERIES PARA TABS

  // AlertasTab - Obtener todas las alertas del sistema
  async getAlertas() {
    try {
      const alertasList = [];

      // Milestones vencidos
      const { data: milestones } = await supabase
        .from('pagos_milestones')
        .select('*')
        .eq('estado', 'pendiente')
        .lt('fecha_objetivo', new Date().toISOString());

      milestones?.forEach(milestone => {
        const diasVencido = calculateDaysDifference(milestone.fecha_objetivo);

        alertasList.push({
          id: `milestone-${milestone.id}`,
          tipo: diasVencido > ALERT_THRESHOLDS.MILESTONE_CRITICAL_DAYS ? 'critica' : 'advertencia',
          categoria: 'Milestone',
          titulo: 'Milestone Vencido',
          descripcion: `${milestone.descripcion || 'Milestone'} vencido hace ${diasVencido} días`,
          fecha: milestone.fecha_objetivo,
          accion: 'Contactar al proveedor',
          icono: 'calendar',
          color: diasVencido > ALERT_THRESHOLDS.MILESTONE_CRITICAL_DAYS ? CHART_COLORS.dark : CHART_COLORS.warning
        });
      });

      // Webhooks fallidos
      const { data: webhooks } = await supabase
        .from('stripe_webhooks_log')
        .select('*')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      webhooks?.forEach(webhook => {
        const horasDesde = calculateHoursDifference(webhook.created_at);

        alertasList.push({
          id: `webhook-${webhook.id}`,
          tipo: horasDesde > ALERT_THRESHOLDS.WEBHOOK_CRITICAL_HOURS ? 'critica' : 'advertencia',
          categoria: 'Webhook',
          titulo: 'Webhook No Procesado',
          descripcion: `Webhook tipo ${webhook.event_type} sin procesar desde hace ${horasDesde} horas`,
          fecha: webhook.created_at,
          accion: 'Revisar logs de Stripe',
          icono: 'alert-circle',
          color: horasDesde > ALERT_THRESHOLDS.WEBHOOK_CRITICAL_HOURS ? CHART_COLORS.dark : CHART_COLORS.warning
        });
      });

      // Onboarding Stripe pendiente
      const { data: proveedores } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .eq('stripe_onboarding_completed', false);

      proveedores?.forEach(proveedor => {
        const diasDesde = calculateDaysDifference(proveedor.created_at);

        if (diasDesde > 3) {
          alertasList.push({
            id: `onboarding-${proveedor.id}`,
            tipo: diasDesde > ALERT_THRESHOLDS.ONBOARDING_WARNING_DAYS ? 'advertencia' : 'info',
            categoria: 'Onboarding',
            titulo: 'Onboarding Pendiente',
            descripcion: `${proveedor.nombre_empresa} sin completar Stripe desde hace ${diasDesde} días`,
            fecha: proveedor.created_at,
            accion: 'Enviar recordatorio',
            icono: 'person-add',
            color: diasDesde > ALERT_THRESHOLDS.ONBOARDING_WARNING_DAYS ? CHART_COLORS.warning : CHART_COLORS.dark
          });
        }
      });

      // Disputas activas
      const { data: disputes } = await supabase
        .from('stripe_disputes')
        .select('*')
        .or('status.eq.warning_needs_response,status.eq.needs_response');

      disputes?.forEach(dispute => {
        alertasList.push({
          id: `dispute-${dispute.id}`,
          tipo: 'critica',
          categoria: 'Disputa',
          titulo: 'Disputa Activa',
          descripcion: `Disputa por ${dispute.amount / 100} requiere respuesta`,
          fecha: dispute.created,
          accion: 'Responder en Stripe',
          icono: 'warning',
          color: CHART_COLORS.danger
        });
      });

      // Contratos sin pago inicial
      const { data: contratos } = await supabase
        .from('contratos')
        .select('*')
        .eq('estado', 'activo')
        .eq('estado_pago', 'pendiente');

      contratos?.forEach(contrato => {
        const diasDesde = calculateDaysDifference(contrato.created_at);

        if (diasDesde > 2) {
          alertasList.push({
            id: `pago-${contrato.id}`,
            tipo: diasDesde > ALERT_THRESHOLDS.PAYMENT_WARNING_DAYS ? 'advertencia' : 'info',
            categoria: 'Pago',
            titulo: 'Pago Inicial Pendiente',
            descripcion: `Contrato ${contrato.id.slice(0, 8)} sin pago inicial desde hace ${diasDesde} días`,
            fecha: contrato.created_at,
            accion: 'Enviar recordatorio de pago',
            icono: 'card',
            color: diasDesde > ALERT_THRESHOLDS.PAYMENT_WARNING_DAYS ? CHART_COLORS.warning : CHART_COLORS.dark
          });
        }
      });

      // Proyectos sin actividad
      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('*')
        .eq('estado', 'en_progreso');

      proyectos?.forEach(proyecto => {
        const diasInactivo = calculateDaysDifference(proyecto.updated_at);

        if (diasInactivo > 14) {
          alertasList.push({
            id: `inactivo-${proyecto.id}`,
            tipo: 'info',
            categoria: 'Proyecto',
            titulo: 'Proyecto Sin Actividad',
            descripcion: `${proyecto.nombre_proyecto || 'Proyecto'} sin actualizaciones desde hace ${diasInactivo} días`,
            fecha: proyecto.updated_at,
            accion: 'Contactar proveedor',
            icono: 'time',
            color: CHART_COLORS.gray
          });
        }
      });

      // Calcular estadísticas
      const stats = {
        total: alertasList.length,
        criticas: alertasList.filter(a => a.tipo === 'critica').length,
        advertencias: alertasList.filter(a => a.tipo === 'advertencia').length,
        info: alertasList.filter(a => a.tipo === 'info').length
      };

      // Ordenar por tipo y fecha
      alertasList.sort((a, b) => {
        const tipoOrder = { critica: 0, advertencia: 1, info: 2 };
        if (tipoOrder[a.tipo] !== tipoOrder[b.tipo]) {
          return tipoOrder[a.tipo] - tipoOrder[b.tipo];
        }
        return new Date(b.fecha) - new Date(a.fecha);
      });

      return { alertas: alertasList, stats };
    } catch (error) {
      logger.error('Error loading alertas:', error);
      return { alertas: [], stats: { total: 0, criticas: 0, advertencias: 0, info: 0 } };
    }
  },

  // ProveedoresTab - Obtener proveedores con proyectos
  async getProveedoresConProyectos() {
    try {
      const { data: proveedoresData, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular estadísticas
      const stats = {
        total: proveedoresData?.length || 0,
        activos: proveedoresData?.filter(p => p.activo).length || 0,
        inactivos: proveedoresData?.filter(p => !p.activo).length || 0,
        stripeCompleto: proveedoresData?.filter(p => p.stripe_onboarding_completed).length || 0,
        stripePendiente: proveedoresData?.filter(p => !p.stripe_onboarding_completed).length || 0,
        conFinanciamiento: proveedoresData?.filter(p => p.acepta_financiamiento_externo).length || 0,
        tiposCuenta: processTiposCuenta(proveedoresData)
      };

      // Obtener proyectos de los proveedores
      if (proveedoresData && proveedoresData.length > 0) {
        const proveedorIds = proveedoresData.map(p => p.id);
        const { data: contratos } = await supabase
          .from('contratos')
          .select('proveedores_id, estado')
          .in('proveedores_id', proveedorIds);

        const proyectosMap = {};
        contratos?.forEach(contrato => {
          if (!proyectosMap[contrato.proveedores_id]) {
            proyectosMap[contrato.proveedores_id] = {
              total: 0,
              completados: 0,
              enProgreso: 0
            };
          }
          proyectosMap[contrato.proveedores_id].total++;
          if (contrato.estado === 'completado') {
            proyectosMap[contrato.proveedores_id].completados++;
          } else if (contrato.estado === 'activo') {
            proyectosMap[contrato.proveedores_id].enProgreso++;
          }
        });

        const proveedoresConProyectos = proveedoresData.map(p => ({
          ...p,
          proyectos: proyectosMap[p.id] || { total: 0, completados: 0, enProgreso: 0 }
        }));

        return { proveedores: proveedoresConProyectos, stats };
      }

      return { proveedores: proveedoresData || [], stats };
    } catch (error) {
      logger.error('Error loading proveedores:', error);
      return { proveedores: [], stats: {} };
    }
  },

  // ProyectosTab - Análisis completo de proyectos
  async getProyectosAnalysis() {
    try {
      const [proyectos, contratos] = await Promise.all([
        supabase.from('proyectos').select('*'),
        supabase.from('contratos').select('id, precio_total_sistema')
      ]);

      const total = proyectos.data?.length || 0;
      const enProgreso = proyectos.data?.filter(p => p.estado === 'en_progreso').length || 0;
      const completados = proyectos.data?.filter(p => p.estado === 'completado').length || 0;
      const cancelados = proyectos.data?.filter(p => p.estado === 'cancelado').length || 0;

      const valorTotal = contratos.data?.reduce((sum, c) =>
        sum + (parseFloat(c.precio_total_sistema) || 0), 0
      ) || 0;

      const tasaCompletacion = total > 0 ? (completados / total) * 100 : 0;
      const tasaCancelacion = total > 0 ? (cancelados / total) * 100 : 0;

      const resumen = {
        total,
        enProgreso,
        completados,
        cancelados,
        valorTotal,
        tasaCompletacion,
        tasaCancelacion
      };

      const porEstado = calculatePorEstado(proyectos.data);

      return { resumen, porEstado };
    } catch (error) {
      logger.error('Error loading proyectos data:', error);
      return { resumen: {}, porEstado: [] };
    }
  },

  // FinanzasTab - Análisis financiero completo
  async getFinanceAnalysis() {
    try {
      const [comisiones, contratos, milestones, disputes] = await Promise.all([
        supabase.from('comisiones_enerbook').select('*'),
        supabase.from('contratos').select('*'),
        supabase.from('pagos_milestones').select('*'),
        supabase.from('stripe_disputes').select('*')
      ]);

      const totalComisiones = comisiones.data?.reduce((sum, c) =>
        sum + (parseFloat(c.monto_comision) || 0), 0
      ) || 0;

      const comisionesPendientes = comisiones.data?.filter(c =>
        c.estado === 'pendiente'
      ).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0;

      const comisionesPagadas = comisiones.data?.filter(c =>
        c.estado === 'cobrado'
      ).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0;

      const valorTotalContratos = contratos.data?.reduce((sum, c) =>
        sum + (parseFloat(c.precio_total_sistema) || 0), 0
      ) || 0;

      const serviceFees = calculateServiceFees(comisiones.data);

      const disputasActivas = disputes.data?.filter(d =>
        d.status === 'warning_needs_response' || d.status === 'needs_response'
      ).length || 0;

      const milestonesVencidos = milestones.data?.filter(m =>
        m.estado === 'pendiente' && new Date(m.fecha_objetivo) < new Date()
      ).length || 0;

      const resumen = {
        totalComisiones,
        comisionesPendientes,
        comisionesPagadas,
        valorTotalContratos,
        serviceFees,
        disputasActivas,
        milestonesVencidos
      };

      const tiposPagoData = processTiposPagoData(contratos.data);
      const comisionesData = processComisionesData(comisiones.data);
      const milestonesData = processMilestonesData(milestones.data);

      return { resumen, tiposPagoData, comisionesData, milestonesData };
    } catch (error) {
      logger.error('Error loading finance data:', error);
      return { resumen: {}, tiposPagoData: [], comisionesData: [], milestonesData: [] };
    }
  }
};

// Helper functions
function groupByPaymentType(contratos) {
  const tipos = {
    contado: 0,
    financiamiento: 0,
    tarjeta: 0,
    transferencia: 0
  };

  contratos?.forEach(c => {
    const tipo = c.tipo_pago_seleccionado || 'contado';
    if (tipos[tipo] !== undefined) {
      tipos[tipo]++;
    }
  });

  return tipos;
}

async function getProjectRegion(proyecto, irradiacionData) {
  if (!proyecto.ubicacion) return 'Sin Región';

  const lat = proyecto.ubicacion.lat || proyecto.ubicacion.latitude;
  const lon = proyecto.ubicacion.lon || proyecto.ubicacion.longitude;

  if (!lat || !lon) return 'Sin Región';

  const nearestCache = irradiacionData?.find(cache => {
    const cacheLat = parseFloat(cache.latitude);
    const cacheLon = parseFloat(cache.longitude);
    const distance = Math.sqrt(
      Math.pow(cacheLat - lat, 2) + Math.pow(cacheLon - lon, 2)
    );
    return distance < 0.5;
  });

  return nearestCache?.region_nombre || 'Otra Región';
}

function getPeriodDates(period) {
  const dates = [];
  const now = new Date();

  if (period === 'month') {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dates.push({
        start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
        label: date.toLocaleDateString('es-MX', { month: 'short' })
      });
    }
  } else if (period === 'week') {
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      dates.push({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        label: `Sem ${4 - i}`
      });
    }
  }

  return dates;
}

function processTiposCuenta(proveedores) {
  const tipos = {
    express: 0,
    standard: 0,
    custom: 0,
    pendiente: 0
  };

  proveedores?.forEach(p => {
    if (!p.stripe_account_type) {
      tipos.pendiente++;
    } else {
      tipos[p.stripe_account_type] = (tipos[p.stripe_account_type] || 0) + 1;
    }
  });

  return [
    { name: 'Express', value: tipos.express, color: STRIPE_ACCOUNT_COLORS.express },
    { name: 'Standard', value: tipos.standard, color: STRIPE_ACCOUNT_COLORS.standard },
    { name: 'Custom', value: tipos.custom, color: STRIPE_ACCOUNT_COLORS.custom },
    { name: 'Pendiente', value: tipos.pendiente, color: STRIPE_ACCOUNT_COLORS.pendiente }
  ].filter(t => t.value > 0);
}

function calculatePorEstado(proyectos) {
  const estados = {
    'Cotización': 0,
    'En Progreso': 0,
    'Completado': 0,
    'Cancelado': 0,
    'En Espera': 0
  };

  proyectos?.forEach(p => {
    switch (p.estado) {
      case 'cotizacion':
        estados['Cotización']++;
        break;
      case 'en_progreso':
        estados['En Progreso']++;
        break;
      case 'completado':
        estados['Completado']++;
        break;
      case 'cancelado':
        estados['Cancelado']++;
        break;
      case 'en_espera':
        estados['En Espera']++;
        break;
    }
  });

  return [
    { name: 'Cotización', value: estados['Cotización'], color: PROJECT_STATUS_COLORS.cotizacion },
    { name: 'En Progreso', value: estados['En Progreso'], color: PROJECT_STATUS_COLORS.en_progreso },
    { name: 'Completado', value: estados['Completado'], color: PROJECT_STATUS_COLORS.completado },
    { name: 'Cancelado', value: estados['Cancelado'], color: PROJECT_STATUS_COLORS.cancelado },
    { name: 'En Espera', value: estados['En Espera'], color: PROJECT_STATUS_COLORS.en_espera }
  ].filter(e => e.value > 0);
}

function calculateServiceFees(comisiones) {
  if (!comisiones) return 0;
  return comisiones.reduce((sum, c) => {
    const serviceFee = (parseFloat(c.monto_comision) || 0) * STRIPE_FEES.PERCENTAGE + STRIPE_FEES.FIXED_USD;
    return sum + serviceFee;
  }, 0);
}

function processComisionesData(comisiones) {
  if (!comisiones) return [];
  const tiposComision = {};
  comisiones.forEach(c => {
    const tipo = c.tipo_comision || 'standard';
    if (!tiposComision[tipo]) {
      tiposComision[tipo] = { tipo, total: 0, cantidad: 0 };
    }
    tiposComision[tipo].total += parseFloat(c.monto_comision) || 0;
    tiposComision[tipo].cantidad += 1;
  });
  return Object.values(tiposComision);
}

function processTiposPagoData(contratos) {
  if (!contratos) return [];
  const tipos = {
    contado: { name: 'Contado', value: 0, color: PAYMENT_TYPE_COLORS.contado },
    financiamiento: { name: 'Financiamiento', value: 0, color: PAYMENT_TYPE_COLORS.financiamiento },
    tarjeta: { name: 'Tarjeta', value: 0, color: PAYMENT_TYPE_COLORS.tarjeta },
    transferencia: { name: 'Transferencia', value: 0, color: PAYMENT_TYPE_COLORS.transferencia }
  };

  contratos.forEach(c => {
    const tipo = c.tipo_pago_seleccionado || 'contado';
    if (tipos[tipo]) {
      tipos[tipo].value += 1;
    }
  });

  return Object.values(tipos).filter(t => t.value > 0);
}

function processMilestonesData(milestones) {
  if (!milestones) return [];
  const estados = {
    pendiente: 0,
    pagado: 0,
    vencido: 0
  };

  const now = new Date();
  milestones.forEach(m => {
    if (m.estado === 'pagado') {
      estados.pagado += 1;
    } else if (m.estado === 'pendiente' && new Date(m.fecha_objetivo) < now) {
      estados.vencido += 1;
    } else {
      estados.pendiente += 1;
    }
  });

  return [
    { name: 'Pendientes', value: estados.pendiente, color: MILESTONE_STATUS_COLORS.pendiente },
    { name: 'Pagados', value: estados.pagado, color: MILESTONE_STATUS_COLORS.pagado },
    { name: 'Vencidos', value: estados.vencido, color: MILESTONE_STATUS_COLORS.vencido }
  ];
}

export default adminQueries;