import React, { useMemo } from 'react';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';
import ChartCard from './ChartCard';

const AnalysisCharts = ({ cotizacionInicial = null }) => {
  const dashboardData = useClienteDashboardData();

  // Usar datos del proyecto si existen, sino datos del dashboard
  const consumoHistorico = cotizacionInicial?.consumo_kwh_historico || dashboardData.consumoData;
  const irradiacionCache = cotizacionInicial?.irradiacion_cache || null;
  const sizingResults = cotizacionInicial?.sizing_results || dashboardData.sistemaData;

  // Procesar datos de consumo
  const consumoChartData = useMemo(() => {
    if (!consumoHistorico || consumoHistorico.length === 0) return [];

    return consumoHistorico
      .filter(item => item?.value !== undefined && item?.periodo !== undefined)
      .map(item => ({
        value: item.value,
        label: item.label || item.periodo?.substring(0, 3) || '',
        fullLabel: item.fullLabel || item.periodo || ''
      }))
      .reverse(); // Reverse to show chronologically
  }, [consumoHistorico]);

  // Procesar datos de irradiación
  const irradiacionChartData = useMemo(() => {
    // PRIORIDAD 1: Usar datos reales de NASA si existen en el cache
    if (irradiacionCache?.datos_nasa_mensuales?.irradiacion_promedio) {
      return irradiacionCache.datos_nasa_mensuales.irradiacion_promedio.map(item => ({
        value: item.irradiacion,
        label: item.mes.substring(0, 3),
        fullLabel: item.mes
      }));
    }

    // PRIORIDAD 2: Si tenemos datos del dashboard, úsalos
    if (!cotizacionInicial && dashboardData.irradiacionData?.length > 0) {
      return dashboardData.irradiacionData.map(item => ({
        value: item.value,
        label: item.label,
        fullLabel: item.fullLabel
      }));
    }

    // PRIORIDAD 3 (FALLBACK): Generar datos sintéticos basados en promedio anual
    const promedioAnual = irradiacionCache?.irradiacion_promedio_anual
      || sizingResults?.irr_avg_day
      || sizingResults?.inputs?.irr_avg_day
      || 5.5;

    const variacion = irradiacionCache
      ? ((irradiacionCache.irradiacion_promedio_max || 6.5) - (irradiacionCache.irradiacion_promedio_min || 4.5)) / 2
      : sizingResults?.inputs
        ? ((sizingResults.inputs.irr_max || 6.5) - (sizingResults.inputs.irr_min || 4.5)) / 2
        : 1;

    const mesesData = [
      { mes: 'Enero', orden: 1 },
      { mes: 'Febrero', orden: 2 },
      { mes: 'Marzo', orden: 3 },
      { mes: 'Abril', orden: 4 },
      { mes: 'Mayo', orden: 5 },
      { mes: 'Junio', orden: 6 },
      { mes: 'Julio', orden: 7 },
      { mes: 'Agosto', orden: 8 },
      { mes: 'Septiembre', orden: 9 },
      { mes: 'Octubre', orden: 10 },
      { mes: 'Noviembre', orden: 11 },
      { mes: 'Diciembre', orden: 12 }
    ];

    return mesesData.map((mes) => {
      const factor = 0.5 + 0.5 * Math.cos((mes.orden - 5) * Math.PI / 6);
      const irradiacion = (promedioAnual + variacion * (factor - 0.5)).toFixed(2);

      return {
        value: parseFloat(irradiacion),
        label: mes.mes.substring(0, 3),
        fullLabel: mes.mes
      };
    });
  }, [cotizacionInicial, irradiacionCache, sizingResults, dashboardData.irradiacionData]);

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