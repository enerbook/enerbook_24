import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseClient';

const AlertasTab = () => {
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [filterType, setFilterType] = useState('todas');
  const [stats, setStats] = useState({
    total: 0,
    criticas: 0,
    advertencias: 0,
    info: 0
  });

  useEffect(() => {
    loadAlertas();
    const interval = setInterval(loadAlertas, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadAlertas = async () => {
    setLoading(true);
    try {
      const alertasList = [];

      // Milestones vencidos
      const { data: milestones } = await supabase
        .from('pagos_milestones')
        .select('*')
        .eq('estado', 'pendiente')
        .lt('fecha_objetivo', new Date().toISOString());

      milestones?.forEach(milestone => {
        const diasVencido = Math.floor(
          (new Date() - new Date(milestone.fecha_objetivo)) / (1000 * 60 * 60 * 24)
        );

        alertasList.push({
          id: `milestone-${milestone.id}`,
          tipo: diasVencido > 7 ? 'critica' : 'advertencia',
          categoria: 'Milestone',
          titulo: 'Milestone Vencido',
          descripcion: `${milestone.descripcion || 'Milestone'} vencido hace ${diasVencido} días`,
          fecha: milestone.fecha_objetivo,
          accion: 'Contactar al proveedor',
          icono: 'calendar',
          color: diasVencido > 7 ? '#090e1a' : '#f59e0b'
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
        const horasDesde = Math.floor(
          (new Date() - new Date(webhook.created_at)) / (1000 * 60 * 60)
        );

        alertasList.push({
          id: `webhook-${webhook.id}`,
          tipo: horasDesde > 24 ? 'critica' : 'advertencia',
          categoria: 'Webhook',
          titulo: 'Webhook No Procesado',
          descripcion: `Webhook tipo ${webhook.event_type} sin procesar desde hace ${horasDesde} horas`,
          fecha: webhook.created_at,
          accion: 'Revisar logs de Stripe',
          icono: 'alert-circle',
          color: horasDesde > 24 ? '#090e1a' : '#f59e0b'
        });
      });

      // Onboarding Stripe pendiente
      const { data: proveedores } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .eq('stripe_onboarding_completed', false);

      proveedores?.forEach(proveedor => {
        const diasDesde = Math.floor(
          (new Date() - new Date(proveedor.created_at)) / (1000 * 60 * 60 * 24)
        );

        if (diasDesde > 3) {
          alertasList.push({
            id: `onboarding-${proveedor.id}`,
            tipo: diasDesde > 7 ? 'advertencia' : 'info',
            categoria: 'Onboarding',
            titulo: 'Onboarding Pendiente',
            descripcion: `${proveedor.nombre_empresa} sin completar Stripe desde hace ${diasDesde} días`,
            fecha: proveedor.created_at,
            accion: 'Enviar recordatorio',
            icono: 'person-add',
            color: diasDesde > 7 ? '#f59e0b' : '#090e1a'
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
          descripcion: `Disputa por ${formatCurrency(dispute.amount)} requiere respuesta`,
          fecha: dispute.created,
          accion: 'Responder en Stripe',
          icono: 'warning',
          color: '#090e1a'
        });
      });

      // Contratos sin pago inicial
      const { data: contratos } = await supabase
        .from('contratos')
        .select('*')
        .eq('estado', 'activo')
        .eq('estado_pago', 'pendiente');

      contratos?.forEach(contrato => {
        const diasDesde = Math.floor(
          (new Date() - new Date(contrato.created_at)) / (1000 * 60 * 60 * 24)
        );

        if (diasDesde > 2) {
          alertasList.push({
            id: `pago-${contrato.id}`,
            tipo: diasDesde > 5 ? 'advertencia' : 'info',
            categoria: 'Pago',
            titulo: 'Pago Inicial Pendiente',
            descripcion: `Contrato ${contrato.id.slice(0, 8)} sin pago inicial desde hace ${diasDesde} días`,
            fecha: contrato.created_at,
            accion: 'Enviar recordatorio de pago',
            icono: 'card',
            color: diasDesde > 5 ? '#f59e0b' : '#090e1a'
          });
        }
      });

      // Proyectos sin actividad
      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('*')
        .eq('estado', 'en_progreso');

      proyectos?.forEach(proyecto => {
        const diasInactivo = Math.floor(
          (new Date() - new Date(proyecto.updated_at)) / (1000 * 60 * 60 * 24)
        );

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
            color: '#090e1a'
          });
        }
      });

      // Calcular estadísticas
      const statsCalculadas = {
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

      setAlertas(alertasList);
      setStats(statsCalculadas);
    } catch (error) {
      console.error('Error loading alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilteredAlertas = () => {
    if (filterType === 'todas') return alertas;
    return alertas.filter(a => a.tipo === filterType);
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'critica':
        return 'Crítica';
      case 'advertencia':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return tipo;
    }
  };

  const getTipoBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'critica':
        return 'bg-gray-800 text-white';
      case 'advertencia':
        return 'bg-orange-100 text-orange-700';
      case 'info':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && alertas.length === 0) {
    return (
      <div className="flex-1 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
        <p className="text-sm text-gray-600 mt-4">Cargando Alertas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold text-gray-900">
              Centro de Alertas
            </p>
            <button
              onClick={loadAlertas}
              className="p-2 rounded-lg bg-gray-100"
            >
              <Ionicons name="refresh" size={20} color="#6B7280" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilterType('todas')}
              className={`p-4 rounded-lg border ${
                filterType === 'todas'
                  ? 'bg-gray-800 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-sm ${
                filterType === 'todas' ? 'text-white' : 'text-gray-600'
              }`}>
                Total
              </p>
              <p className={`text-2xl font-bold ${
                filterType === 'todas' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.total}
              </p>
            </button>

            <button
              onClick={() => setFilterType('critica')}
              className={`p-4 rounded-lg border ${
                filterType === 'critica'
                  ? 'bg-gray-800 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-sm ${
                filterType === 'critica' ? 'text-white' : 'text-gray-600'
              }`}>
                Críticas
              </p>
              <p className={`text-2xl font-bold ${
                filterType === 'critica' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.criticas}
              </p>
            </button>

            <button
              onClick={() => setFilterType('advertencia')}
              className={`p-4 rounded-lg border ${
                filterType === 'advertencia'
                  ? 'bg-orange-500 border-orange-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-sm ${
                filterType === 'advertencia' ? 'text-white' : 'text-gray-600'
              }`}>
                Advertencias
              </p>
              <p className={`text-2xl font-bold ${
                filterType === 'advertencia' ? 'text-white' : 'text-orange-600'
              }`}>
                {stats.advertencias}
              </p>
            </button>

            <button
              onClick={() => setFilterType('info')}
              className={`p-4 rounded-lg border ${
                filterType === 'info'
                  ? 'bg-gray-600 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-sm ${
                filterType === 'info' ? 'text-white' : 'text-gray-600'
              }`}>
                Información
              </p>
              <p className={`text-2xl font-bold ${
                filterType === 'info' ? 'text-white' : 'text-gray-600'
              }`}>
                {stats.info}
              </p>
            </button>
          </div>

          {getFilteredAlertas().length === 0 ? (
            <div className="py-12 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#f59e0b" />
              <p className="text-lg font-medium text-gray-900 mt-4">
                No hay alertas activas
              </p>
              <p className="text-sm text-gray-600 mt-1">
                El sistema está funcionando correctamente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredAlertas().map((alerta) => (
                <div
                  key={alerta.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center flex-1">
                      <div
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${alerta.color}20` }}
                      >
                        <Ionicons
                          name={alerta.icono}
                          size={20}
                          color={alerta.color}
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {alerta.titulo}
                          </p>
                          <div className={`ml-2 px-2 py-1 rounded-full ${getTipoBadgeStyle(alerta.tipo)}`}>
                            <p className="text-xs">{getTipoLabel(alerta.tipo)}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {alerta.descripcion}
                        </p>
                        <div className="flex items-center mt-2">
                          <p className="text-xs text-gray-500">
                            {alerta.categoria} • {formatDate(alerta.fecha)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {alerta.accion && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center">
                        <Ionicons name="arrow-forward-circle" size={16} color="#f59e0b" />
                        <p className="text-sm text-orange-600 ml-2 font-medium">
                          {alerta.accion}
                        </p>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {stats.criticas > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-start">
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Atención Inmediata Requerida
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Hay {stats.criticas} alertas críticas que requieren atención inmediata.
                  Estas incluyen milestones muy vencidos, disputas activas y webhooks sin procesar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasTab;