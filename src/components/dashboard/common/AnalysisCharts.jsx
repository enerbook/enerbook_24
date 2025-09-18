import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import ChartCard from '../ChartCard';

const AnalysisCharts = () => {
  const { leadData, userType } = useAuth();

  // Procesar datos de consumo histórico
  const getConsumoData = () => {
    if (userType !== 'lead' || !leadData?.consumo_kwh_historico) {
      return [];
    }

    return leadData.consumo_kwh_historico.map((item, index) => ({
      value: item.kwh,
      label: item.periodo.replace(/\d{2}$/, ''), // Remove year (24/25)
      fullLabel: item.periodo
    })).reverse(); // Reverse to show chronologically
  };

  // Procesar datos de irradiación mensual
  const getIrradiacionData = () => {
    if (userType !== 'lead' || !leadData?.sizing_results?.inputs) {
      return [];
    }

    const nasaData = leadData.sizing_results.inputs;
    const promedioAnual = nasaData.irr_avg_day || 5.5;
    const variacion = (nasaData.irr_max - nasaData.irr_min) / 2 || 1;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return meses.map((mes, index) => {
      // Simular variación estacional (más alto en primavera/verano)
      const factor = 0.5 + 0.5 * Math.cos((index - 4) * Math.PI / 6);
      const irradiacion = promedioAnual + variacion * (factor - 0.5);

      return {
        value: parseFloat(irradiacion.toFixed(2)),
        label: mes,
        fullLabel: mes
      };
    });
  };

  const consumoData = getConsumoData();
  const irradiacionData = getIrradiacionData();
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
        data={consumoData}
      />
      <ChartCard
        title="Irradiación Mensual"
        subtitle="Seguimiento mensual de la irradiación solar en tu zona"
        gradientFrom="from-yellow-100"
        gradientTo="to-orange-200"
        chartGradientFrom="from-yellow-400"
        chartGradientTo="to-orange-300"
        className="min-h-[220px]"
        data={irradiacionData}
      />
    </div>
  );
};

export default AnalysisCharts;
