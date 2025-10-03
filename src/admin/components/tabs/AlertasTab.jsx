import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../../utils/formatters';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';

const AlertasTab = () => {
  const { data, loading, refresh } = useAdminMetrics('alerts', 30000); // Auto-refresh cada 30s
  const [filterType, setFilterType] = useState('todas');

  const alertas = data?.alertas || [];
  const stats = data?.stats || { total: 0, criticas: 0, advertencias: 0, info: 0 };

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
              onClick={refresh}
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
                            {alerta.categoria} • {formatRelativeTime(alerta.fecha)}
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
