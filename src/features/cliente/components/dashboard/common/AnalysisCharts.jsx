import React from 'react';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';
import ChartCard from '../../../../shared/components/dashboard/ChartCard';

const AnalysisCharts = () => {
  const { consumoData, irradiacionData, hasData } = useClienteDashboardData();

  // Preparar datos para las gráficas (solo los campos necesarios)
  const consumoChartData = consumoData.map(item => ({
    value: item.value,
    label: item.label,
    fullLabel: item.fullLabel
  })).reverse(); // Reverse to show chronologically

  const irradiacionChartData = irradiacionData.map(item => ({
    value: item.value,
    label: item.label,
    fullLabel: item.fullLabel
  }));

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
        data={consumoChartData}
      />
      <ChartCard
        title="Irradiación Mensual"
        subtitle="Seguimiento mensual de la irradiación solar en tu zona"
        gradientFrom="from-yellow-100"
        gradientTo="to-orange-200"
        chartGradientFrom="from-yellow-400"
        chartGradientTo="to-orange-300"
        className="min-h-[220px]"
        data={irradiacionChartData}
      />
    </div>
  );
};

export default AnalysisCharts;