import React from 'react';
import MetricTile from './MetricTile';
import { useLeadDashboardData } from '../../../context/LeadDashboardDataContext';

const MetricsGrid = () => {
  const { metricsData, reciboData, sistemaData, hasData } = useLeadDashboardData();

  // Datos por defecto o calculados
  const consumoPromedio = hasData && metricsData ? `${metricsData.consumoPromedio} kWh` : '272 kWh';
  const sistemaRequerido = hasData && sistemaData ? `${sistemaData.sistema?.capacidad_sistema_kw || sistemaData.results?.kWp_needed || 0} kWp` : '3.73 kWp';
  const nPaneles = hasData && sistemaData ? `${sistemaData.sistema?.numero_paneles || sistemaData.results?.n_panels || 0} paneles` : '7 paneles';
  const irradiacionPromedio = hasData && metricsData ? `${metricsData.irradiacionPromedio} kWh/m²/día` : '3.85 kWh/m²/día';
  const produccionAnual = hasData && sistemaData ? `${(sistemaData.sistema?.produccion_anual_kwh || sistemaData.results?.yearly_prod || 0).toLocaleString()} kWh` : '4,023 kWh';

  // Ubicación desde el recibo CFE
  let ubicacion = 'Ciudad de México Centro';
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
