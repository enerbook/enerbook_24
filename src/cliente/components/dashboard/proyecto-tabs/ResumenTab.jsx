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

  // Extraer datos técnicos
  const sizingResults = cotizacionInicial?.sizing_results?.results || {};
  const reciboData = cotizacionInicial?.recibo_cfe || {};
  const resumenEnergetico = cotizacionInicial?.resumen_energetico || {};

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{proyecto.titulo}</h1>
            <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            proyecto.estado === 'abierto'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
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
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            proyecto.estado === 'abierto'
              ? 'border border-orange-300 text-orange-600 hover:bg-orange-50'
              : 'border border-green-300 text-green-600 hover:bg-green-50'
          } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTogglingStatus ? 'Procesando...' : proyecto.estado === 'abierto' ? 'Pausar Proyecto' : 'Publicar Proyecto'}
        </button>
      </div>

      {/* User Info Bar */}
      <UserInfoBar />

      {/* Metrics Grid */}
      <MetricsGrid />

      {/* Analysis Charts */}
      <AnalysisCharts />

      {/* Información Técnica */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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

      {/* Historial de Consumo */}
      {cotizacionInicial?.consumo_kwh_historico && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Historial de Consumo</h2>
          <HistorialConsumoTable consumoHistorico={cotizacionInicial.consumo_kwh_historico} />
        </div>
      )}
    </div>
  );
};

export default ResumenTab;
