import React from 'react';
import ChartCard from '../ChartCard';

const AnalysisCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <ChartCard
        title="Consumo Histórico"
        subtitle="Seguimiento mensual de tu consumo eléctrico"
        gradientFrom="from-orange-100"
        gradientTo="to-orange-200"
        chartGradientFrom="from-orange-400"
        chartGradientTo="to-orange-300"
        className="min-h-[220px]"
      />
      <ChartCard
        title="Irradiación Mensual"
        subtitle="Seguimiento mensual de la irradiación solar en tu zona"
        gradientFrom="from-yellow-100"
        gradientTo="to-orange-200"
        chartGradientFrom="from-yellow-400"
        chartGradientTo="to-orange-300"
        className="min-h-[220px]"
      />
    </div>
  );
};

export default AnalysisCharts;
