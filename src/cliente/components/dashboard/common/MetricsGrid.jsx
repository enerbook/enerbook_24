import React from 'react';
import MetricTile from './MetricTile';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';

const MetricsGrid = () => {
  const { metricsData, reciboData, sistemaData, hasData } = useClienteDashboardData();

  console.log('📊 MetricsGrid - Data received:', {
    hasData,
    metricsData,
    sistemaData,
    reciboData: reciboData ? { direccion: reciboData.direccion_formatted } : null
  });

  // Datos por defecto o calculados
  const consumoPromedio = hasData && metricsData ? `${metricsData.consumoPromedio} kWh` : 'Sin datos';
  const sistemaRequerido = hasData && sistemaData ? `${sistemaData.kWp_needed || sistemaData.results?.kWp_needed || 0} kWp` : 'Sin datos';
  const nPaneles = hasData && sistemaData ? `${sistemaData.n_panels || sistemaData.results?.n_panels || 0} paneles` : 'Sin datos';
  const irradiacionPromedio = hasData && metricsData ? `${metricsData.irradiacionPromedio} kWh/m²/día` : 'Sin datos';
  const produccionAnual = hasData && sistemaData ? `${(sistemaData.yearly_prod || sistemaData.results?.yearly_prod || 0).toLocaleString()} kWh` : 'Sin datos';

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