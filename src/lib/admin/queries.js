import { supabase } from '../supabaseClient';
import { checkAdminAccess, hasAdminLevel } from './auth';

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

  // Tendencias temporales
  async getTrends(period = 'month') {
    const periods = getPeriodDates(period);
    const trends = [];

    for (const periodDate of periods) {
      const [usuarios, proyectos, comisiones] = await Promise.all([
        supabase
          .from('usuarios')
          .select('*')
          .gte('created_at', periodDate.start)
          .lte('created_at', periodDate.end),
        supabase
          .from('proyectos')
          .select('*')
          .gte('created_at', periodDate.start)
          .lte('created_at', periodDate.end),
        supabase
          .from('comisiones_enerbook')
          .select('*')
          .gte('created_at', periodDate.start)
          .lte('created_at', periodDate.end)
      ]);

      trends.push({
        periodo: periodDate.label,
        usuarios: usuarios.data?.length || 0,
        proyectos: proyectos.data?.length || 0,
        ingresos: comisiones.data?.reduce((sum, c) =>
          sum + (parseFloat(c.monto_comision) || 0), 0
        ) || 0
      });
    }

    return trends;
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

export default adminQueries;