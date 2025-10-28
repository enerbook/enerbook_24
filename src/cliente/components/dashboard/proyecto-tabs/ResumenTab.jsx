import React, { useState } from 'react';
import { projectService } from '../../../services/projectService';
import { authService } from '../../../services/authService';
import UserInfoBar from '../common/UserInfoBar';
import MetricsGrid from '../common/MetricsGrid';
import AnalysisCharts from '../common/AnalysisCharts';
import HistorialConsumoTable from '../proyecto-details/HistorialConsumoTable';
import ProyectoHeader from '../proyecto-details/ProyectoHeader';

const ResumenTab = ({ proyecto, cotizacionInicial, cotizaciones, onReload }) => {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const getDiasRestantes = (fechaLimite) => {
    return Math.ceil((new Date(fechaLimite) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleToggleStatus = async () => {
    const isOpen = proyecto.estado === 'abierto';
    const action = isOpen ? 'pausar' : 'publicar';
    const newStatus = isOpen ? 'cerrado' : 'abierto';

    if (!confirm(`¿Estás seguro de que deseas ${action} este proyecto?`)) {
      return;
    }

    setIsTogglingStatus(true);
    try {
      await projectService.toggleProjectStatus(proyecto.id, newStatus);
      onReload(); // Reload project data
    } catch (error) {
      console.error('Error toggling project status:', error);
      alert('Error al cambiar el estado del proyecto. Por favor intenta de nuevo.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const diasRestantes = getDiasRestantes(proyecto.fecha_limite);

  // Debug: Exponer globalmente para inspección en DevTools
  if (typeof window !== 'undefined') {
    window.__COTIZACION_INICIAL__ = cotizacionInicial;
  }

  console.log('🔍 DEBUG: cotizacionInicial disponible en window.__COTIZACION_INICIAL__');
  console.log('🔍 sizing_results KEYS:', cotizacionInicial?.sizing_results ? Object.keys(cotizacionInicial.sizing_results) : 'NO EXISTE');
  console.log('🔍 recibo_cfe KEYS:', cotizacionInicial?.recibo_cfe ? Object.keys(cotizacionInicial.recibo_cfe) : 'NO EXISTE');
  console.log('🔍 consumo_kwh_historico LENGTH:', cotizacionInicial?.consumo_kwh_historico?.length || 'NO EXISTE');
  console.log('🔍 resumen_energetico KEYS:', cotizacionInicial?.resumen_energetico ? Object.keys(cotizacionInicial.resumen_energetico) : 'NO EXISTE');

  // Extraer datos técnicos
  // IMPORTANTE: projectService ya normaliza sizing_results para tener acceso directo a los campos
  // No extraer .results, usar directamente sizing_results
  const sizingResults = cotizacionInicial?.sizing_results || {};
  const reciboData = cotizacionInicial?.recibo_cfe || {};
  const resumenEnergetico = cotizacionInicial?.resumen_energetico || {};

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{proyecto.titulo}</h1>
            <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            {proyecto.estado === 'abierto' ? 'Abierto' : 'Pausado'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Fecha Límite</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(proyecto.fecha_limite).toLocaleDateString('es-MX')}
            </p>
            <p className={`text-xs mt-1 ${
              diasRestantes > 7 ? 'text-green-600' : diasRestantes > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencido'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Cotizaciones Recibidas</p>
            <p className="text-sm font-semibold text-gray-900">{cotizaciones.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {cotizaciones.filter(c => c.estado === 'pendiente').length} pendientes
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Creado</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(proyecto.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          disabled={isTogglingStatus}
          className={`w-full px-3 py-2 rounded-lg text-white text-sm font-medium transition-opacity ${
            isTogglingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
        >
          {isTogglingStatus ? 'Procesando...' : proyecto.estado === 'abierto' ? 'Pausar Proyecto' : 'Publicar Proyecto'}
        </button>
      </div>

      {/* User Info Bar + Metrics Grid - Combined in 2 rows of 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
        <UserInfoBar cotizacionInicial={cotizacionInicial} />
        <MetricsGrid cotizacionInicial={cotizacionInicial} />
      </div>

      {/* Analysis Charts */}
      <AnalysisCharts cotizacionInicial={cotizacionInicial} />

      {/* Información Técnica */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Información Técnica</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Potencia Recomendada</p>
            <p className="text-sm font-semibold text-gray-900">
              {sizingResults?.kWp_needed ? parseFloat(sizingResults.kWp_needed).toFixed(2) : 'N/A'} kW
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Paneles Sugeridos</p>
            <p className="text-sm font-semibold text-gray-900">
              {sizingResults?.n_panels || 'N/A'} paneles
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Consumo Promedio</p>
            <p className="text-sm font-semibold text-gray-900">
              {resumenEnergetico?.consumo_promedio ? Math.round(resumenEnergetico.consumo_promedio) : 'N/A'} kWh/mes
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Tarifa CFE</p>
            <p className="text-sm font-semibold text-gray-900">
              {reciboData?.tarifa || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas: Datos del Recibo CFE + Historial de Consumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Datos del Recibo CFE */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Datos del Recibo CFE</h2>
          <div className="space-y-3">
            {reciboData && Object.keys(reciboData).length > 0 ? (
              <>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">Cliente</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.nombre || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">No. de Servicio</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.no_servicio || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">RMU</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.RMU || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">Cuenta</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.cuenta || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">Tarifa</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.tarifa || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">Multiplicador</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.multiplicador || 'No disponible'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 font-medium mb-1 text-sm">Dirección</p>
                  <p className="font-semibold text-gray-900 text-sm">{reciboData.direccion || reciboData.direccion_formatted || 'No disponible'}</p>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                <p className="text-gray-500 text-sm">No hay datos del recibo CFE disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de Consumo */}
        {cotizacionInicial?.consumo_kwh_historico && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Historial de Consumo</h2>
            <HistorialConsumoTable consumoHistorico={cotizacionInicial.consumo_kwh_historico} />
          </div>
        )}
      </div>

      {/* Tabla de Irradiación Solar */}
      {cotizacionInicial?.irradiacion_cache?.datos_nasa_mensuales?.irradiacion_promedio && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Datos Detallados sobre Histórico de Irradiación</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Mes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Irradiación</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Ranking</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const nasaData = cotizacionInicial.irradiacion_cache.datos_nasa_mensuales.irradiacion_promedio;

                  // Ordenar por valor para calcular rankings
                  const sortedByValue = [...nasaData].sort((a, b) => b.irradiacion - a.irradiacion);
                  const rankingMap = {};
                  sortedByValue.forEach((item, index) => {
                    rankingMap[item.mes] = index + 1;
                  });

                  // Mostrar en orden cronológico
                  return nasaData
                    .sort((a, b) => a.orden - b.orden)
                    .map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900 text-sm">{item.mes}</td>
                        <td className="py-3 px-4 text-gray-900 text-sm">{item.irradiacion.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">#{rankingMap[item.mes]}</td>
                      </tr>
                    ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenTab;
