import React from 'react';
import MetricTile from './MetricTile';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';

const MetricsGrid = ({ cotizacionInicial = null }) => {
  const dashboardData = useClienteDashboardData();

  // Usar datos del proyecto si existen, sino datos del dashboard
  const reciboData = cotizacionInicial?.recibo_cfe || dashboardData.reciboData;
  const sistemaData = cotizacionInicial?.sizing_results || dashboardData.sistemaData;
  const consumoHistorico = cotizacionInicial?.consumo_kwh_historico || dashboardData.consumoData;
  const irradiacionCache = cotizacionInicial?.irradiacion_cache || null;
  const hasData = !!(reciboData || sistemaData);

  console.log('📊 MetricsGrid - Data received:', {
    hasData,
    fromProyecto: !!cotizacionInicial,
    sistemaData,
    reciboData: reciboData ? { direccion: reciboData.direccion_formatted } : null,
    consumoHistorico: consumoHistorico?.length || 0
  });

  // Calcular métricas desde los datos disponibles
  let consumoPromedio = 'Sin datos';
  if (hasData && consumoHistorico && consumoHistorico.length > 0) {
    const validConsumos = consumoHistorico.filter(item => item?.value !== undefined);
    if (validConsumos.length > 0) {
      const promedio = Math.round(
        validConsumos.reduce((sum, item) => sum + item.value, 0) / validConsumos.length
      );
      consumoPromedio = `${promedio} kWh`;
    }
  }

  const sistemaRequerido = hasData && sistemaData
    ? `${sistemaData.kWp_needed || sistemaData.results?.kWp_needed || 0} kWp`
    : 'Sin datos';

  const nPaneles = hasData && sistemaData
    ? `${sistemaData.n_panels || sistemaData.results?.n_panels || 0} paneles`
    : 'Sin datos';

  // Irradiación: priorizar cache, luego sizing_results
  let irradiacionPromedio = 'Sin datos';
  if (hasData) {
    const irradiacion = irradiacionCache?.irradiacion_promedio_anual
      || sistemaData?.irr_avg_day
      || sistemaData?.inputs?.irr_avg_day
      || dashboardData.metricsData?.irradiacionPromedio;

    if (irradiacion) {
      irradiacionPromedio = `${parseFloat(irradiacion).toFixed(2)} kWh/m²/día`;
    }
  }

  const produccionAnual = hasData && sistemaData
    ? `${(sistemaData.yearly_prod || sistemaData.results?.yearly_prod || 0).toLocaleString()} kWh`
    : 'Sin datos';

  console.log('📊 MetricsGrid - Computed values:', {
    consumoPromedio,
    sistemaRequerido,
    nPaneles,
    irradiacionPromedio,
    produccionAnual
  });

  // Ubicación desde el recibo CFE
  let ubicacion = 'Sin datos';
  if (hasData && reciboData?.direccion_formatted) {
    const direccion = reciboData.direccion_formatted;
    const partes = direccion.split(',').map(p => p.trim());
    if (partes.length >= 3) {
      ubicacion = `${partes[partes.length - 3]}, ${partes[partes.length - 2]}`;
    } else {
      ubicacion = 'México';
    }
  }

  return (
    <div className="w-full lg:flex-1">
      <div className="grid grid-cols-2 gap-2 lg:gap-3">
        <MetricTile title="Consumo Promedio" value={consumoPromedio} subtitle="Mensual" />
        <MetricTile title="Sistema Requerido" value={sistemaRequerido} subtitle={nPaneles} />
        <MetricTile title="Irradiación Promedio" value={irradiacionPromedio} subtitle={ubicacion} />
        <MetricTile title="Producción Anual" value={produccionAnual} subtitle="Estimada" />
      </div>
    </div>
  );
};

export default MetricsGrid;