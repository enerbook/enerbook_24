import React from 'react';
import MetricTile from '../MetricTile';

const MetricsGrid = () => {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 gap-3">
        <MetricTile title="Consumo Promedio" value="272 kWh" subtitle="Mensual" />
        <MetricTile title="Sistema Requerido" value="3.73 kWp" subtitle="7 paneles" />
        <MetricTile title="Irradiación Promedio" value="3.85 kWh/m2/día" subtitle="Ciudad de México Centro" />
        <MetricTile title="Producción Anual" value="4,023 kWh" subtitle="Estimada" />
      </div>
    </div>
  );
};

export default MetricsGrid;
