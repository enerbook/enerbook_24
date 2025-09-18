import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const DashboardDataContext = createContext();

export const DashboardDataProvider = ({ children }) => {
  const { leadData, userType } = useAuth();

  // Procesar todos los datos una sola vez cuando cambien los datos del lead
  const dashboardData = useMemo(() => {
    if (userType !== 'lead' || !leadData) {
      return {
        consumoData: [],
        irradiacionData: [],
        metricsData: null,
        reciboData: null,
        resumenEnergetico: null,
        sistemaData: null,
        isLoading: false,
        hasData: false
      };
    }

    // Procesar datos de consumo histórico
    const consumoData = leadData.consumo_kwh_historico ?
      leadData.consumo_kwh_historico.map((item) => {
        const promedio = leadData.consumo_kwh_historico.reduce((sum, item) => sum + item.kwh, 0) / leadData.consumo_kwh_historico.length;
        const porcentaje = ((item.kwh / promedio) * 100).toFixed(1);
        const porcentajeNum = parseFloat(porcentaje);

        let color = 'gradient';
        if (porcentajeNum > 110) color = 'red';
        else if (porcentajeNum < 85) color = 'green';

        return {
          periodo: item.periodo,
          consumo: item.kwh.toString(),
          porcentaje: `${porcentaje}%`,
          color,
          // Para las gráficas
          value: item.kwh,
          label: item.periodo.replace(/\d{2}$/, ''),
          fullLabel: item.periodo
        };
      }).sort((a, b) => b.periodo.localeCompare(a.periodo))
      : [];

    // Procesar datos de irradiación
    const irradiacionData = leadData.sizing_results?.inputs ?
      (() => {
        const nasaData = leadData.sizing_results.inputs;
        const promedioAnual = nasaData.irr_avg_day || 5.5;
        const variacion = (nasaData.irr_max - nasaData.irr_min) / 2 || 1;

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

        return mesesData.map((mes, index) => {
          const factor = 0.5 + 0.5 * Math.cos((mes.orden - 5) * Math.PI / 6);
          const irradiacion = (promedioAnual + variacion * (factor - 0.5)).toFixed(2);

          return {
            mes: mes.mes,
            irradiacion,
            ranking: `#${index + 1}`,
            valor: parseFloat(irradiacion),
            // Para las gráficas
            value: parseFloat(irradiacion),
            label: mes.mes.substring(0, 3),
            fullLabel: mes.mes
          };
        }).sort((a, b) => b.valor - a.valor).map((item, index) => ({
          ...item,
          ranking: `#${index + 1}`
        }));
      })()
      : [];

    // Calcular métricas
    const metricsData = leadData.consumo_kwh_historico ? {
      consumoPromedio: Math.round(leadData.consumo_kwh_historico.reduce((sum, item) => sum + item.kwh, 0) / leadData.consumo_kwh_historico.length),
      consumoMaximo: Math.max(...leadData.consumo_kwh_historico.map(item => item.kwh)),
      irradiacionPromedio: leadData.sizing_results?.inputs?.irr_avg_day || 0,
      sistemaRequerido: leadData.sizing_results?.results?.kWp_needed || 0
    } : null;

    return {
      consumoData,
      irradiacionData,
      metricsData,
      reciboData: leadData.recibo_cfe,
      resumenEnergetico: leadData.resumen_energetico,
      sistemaData: leadData.sizing_results,
      isLoading: false,
      hasData: true
    };
  }, [leadData, userType]);

  return (
    <DashboardDataContext.Provider value={dashboardData}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};

export default DashboardDataContext;