import React, { useState } from 'react';
import { useClienteDashboardData } from '../../context/ClienteDashboardDataContext';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
import { clientService } from '../../services/clientService';

const SolicitarCotizacionesModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { reciboData, sistemaData, hasData, consumoData, resumenEnergetico } = useClienteDashboardData();

  const handleSolicitarCotizaciones = async () => {
    setLoading(true);
    try {
      // Obtener usuario actual
      const user = await authService.getCurrentUser();
      if (!user) {
        alert('Usuario no autenticado');
        return;
      }

      // Buscar o crear cotización inicial del usuario
      let cotizacionInicial;
      try {
        cotizacionInicial = await clientService.getInitialQuote(user.id);

        // Si existe, actualizar con los datos actuales
        await clientService.updateInitialQuote(cotizacionInicial.id, {
          recibo_cfe: reciboData || {},
          consumo_kwh_historico: consumoData || [],
          resumen_energetico: resumenEnergetico || {},
          sizing_results: sistemaData?.results || {}
        });
      } catch (error) {
        // Si no existe, crear una nueva con los datos actuales
        cotizacionInicial = await clientService.createInitialQuote({
          usuarios_id: user.id,
          recibo_cfe: reciboData || {},
          consumo_kwh_historico: consumoData || [],
          resumen_energetico: resumenEnergetico || {},
          sizing_results: sistemaData?.results || {}
        });
      }

      // Crear proyecto
      const projectTitle = `Proyecto Solar - ${reciboData?.nombre || 'Cliente'}`;
      const projectDescription = `Sistema solar de ${sistemaData?.results?.kWp_needed || 'N/A'} kWp para ${reciboData?.direccion || 'ubicación no especificada'}. Consumo promedio: ${resumenEnergetico?.consumo_promedio || 'N/A'} kWh/mes.`;

      const proyecto = await projectService.createProject({
        titulo: projectTitle,
        descripcion: projectDescription,
        estado: 'abierto',
        usuarios_id: user.id,
        cotizaciones_inicial_id: cotizacionInicial.id,
        fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde hoy
      });

      // Éxito
      if (onSuccess) {
        onSuccess(proyecto);
      }
      onClose();
      alert('¡Solicitud enviada exitosamente! Los instaladores verificados recibirán una notificación y podrán enviarte cotizaciones.');
    } catch (error) {
      console.error('Error:', error);
      alert('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Solicitar Cotizaciones</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirmar Solicitud de Cotizaciones
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              La siguiente información técnica será enviada a instaladores verificados. No se compartirá información personal sensible.
            </p>
          </div>

          {/* Información del proyecto (como en quote.png) */}
          {hasData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Información del Proyecto para Cotizar:</h4>

              {/* Grid de información principal */}
              <div className="grid grid-cols-1 gap-4 mb-4">
                {/* Potencia y Dimensionamiento Sugerido */}
                <div className="bg-white rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 mb-1">Potencia y Dimensionamiento Sugerido</h5>
                  <p className="text-sm font-medium text-gray-900">
                    Potencia recomendada: {sistemaData?.results?.kWp_needed || 'N/A'} kW ({sistemaData?.results?.n_panels || 'N/A'} paneles de {sistemaData?.results?.panel_wp || '370'}W)
                  </p>
                </div>

                {/* Consumo Anual Histórico */}
                <div className="bg-white rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 mb-1">Consumo Anual Histórico</h5>
                  <p className="text-sm font-medium text-gray-900">{(sistemaData?.results?.yearly_prod || resumenEnergetico?.consumo_promedio * 12 || 0).toLocaleString()} kWh</p>
                </div>

                {/* Grid de 2 columnas para el resto */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-gray-500 mb-1">Tipo de Tarifa</h5>
                    <p className="text-sm font-medium text-gray-900">{reciboData?.tarifa || 'No especificada'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-gray-500 mb-1">Ubicación General</h5>
                    <p className="text-sm font-medium text-gray-900">{reciboData?.codigo_postal || 'No especificado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-gray-500 mb-1">Irradiación Promedio</h5>
                    <p className="text-sm font-medium text-gray-900">5.2 kWh/m²/día</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-gray-500 mb-1">Estado</h5>
                    <p className="text-sm font-medium text-orange-600">Abierto para cotizar</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 mb-1">Fecha Límite para Cotizar</h5>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Historial de Consumo (tabla) */}
              {consumoData && consumoData.length > 0 && (
                <div className="bg-white rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-500 mb-3">Historial de Consumo</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Período</th>
                          <th className="text-left py-2 font-medium text-gray-600">Consumo (kWh)</th>
                          <th className="text-left py-2 font-medium text-gray-600">% del Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumoData.slice(0, 6).map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 font-medium text-gray-900">{item.periodo}</td>
                            <td className="py-2 text-gray-900">{item.consumo}</td>
                            <td className="py-2">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium"
                                style={{
                                  background: item.color === 'gradient'
                                    ? 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'
                                    : item.color === 'red'
                                      ? '#DC2626'
                                      : '#16A34A'
                                }}
                              >
                                {item.porcentaje}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 text-sm">¿Qué sucede después?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Los instaladores verificados recibirán tu solicitud</li>
                  <li>• Tendrán 30 días para enviarte cotizaciones</li>
                  <li>• Podrás revisar y comparar todas las propuestas</li>
                  <li>• Elige la mejor opción para tu proyecto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSolicitarCotizaciones}
              disabled={loading}
              className="flex-1 py-3 px-4 text-white rounded-xl font-medium transition-colors"
              style={{background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
            >
              {loading ? 'Enviando...' : 'Solicitar Cotizaciones'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarCotizacionesModal;