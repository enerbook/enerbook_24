import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const DashboardDataContext = createContext();

export const DashboardDataProvider = ({ children }) => {
  const { leadData, userType, clientData } = useAuth();

  const dashboardData = useMemo(() => {
    let sourceData = null;

    if (userType === 'lead' && leadData) {
      sourceData = leadData;
    } else if (userType === 'cliente' && clientData?.cotizacion) {
      sourceData = clientData.cotizacion;
    }

    if (!sourceData) {
      return {
        consumoData: [],
        irradiacionData: [],
        metricsData: null,
        reciboData: null,
        resumenEnergetico: null,
        sistemaData: null,
        userData: userType === 'cliente' ? clientData?.user : null,
        isLoading: false,
        hasData: false
      };
    }

    const consumoData = sourceData.consumo_kwh_historico ?
      sourceData.consumo_kwh_historico
        .filter(item => item?.value !== undefined && item?.periodo !== undefined)
        .sort((a, b) => b.periodo.localeCompare(a.periodo))
      : [];

    const irradiacionData = sourceData.irradiacion_cache || sourceData.sizing_results ?
      (() => {
        const cacheData = sourceData.irradiacion_cache;
        const sizingInputs = sourceData.sizing_results?.inputs;

        const promedioAnual = cacheData?.irradiacion_promedio_anual
          || sizingInputs?.irr_avg_day
          || 5.5;
        const variacion = cacheData
          ? ((cacheData.irradiacion_promedio_max || 6.5) - (cacheData.irradiacion_promedio_min || 4.5)) / 2
          : sizingInputs
            ? ((sizingInputs.irr_max || 6.5) - (sizingInputs.irr_min || 4.5)) / 2
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

        return mesesData.map((mes, index) => {
          const factor = 0.5 + 0.5 * Math.cos((mes.orden - 5) * Math.PI / 6);
          const irradiacion = (promedioAnual + variacion * (factor - 0.5)).toFixed(2);

          return {
            mes: mes.mes,
            irradiacion,
            ranking: `#${index + 1}`,
            valor: parseFloat(irradiacion),
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

    // Calcular irradiación promedio
    // Prioridad: 1) irradiacion_cache, 2) sizing_results.inputs, 3) promedio de irradiacionData
    const irradiacionPromedio = sourceData.irradiacion_cache?.irradiacion_promedio_anual
      || sourceData.sizing_results?.irr_avg_day
      || sourceData.sizing_results?.inputs?.irr_avg_day
      || (irradiacionData.length > 0
          ? (irradiacionData.reduce((sum, item) => sum + item.value, 0) / irradiacionData.length).toFixed(2)
          : 0);

    const metricsData = sourceData.consumo_kwh_historico ? {
      consumoPromedio: Math.round(
        sourceData.consumo_kwh_historico
          .filter(i => i?.value !== undefined)
          .reduce((sum, item) => sum + item.value, 0) /
        sourceData.consumo_kwh_historico.filter(i => i?.value !== undefined).length
      ),
      consumoMaximo: Math.max(...sourceData.consumo_kwh_historico.filter(i => i?.value !== undefined).map(item => item.value)),
      irradiacionPromedio: parseFloat(irradiacionPromedio),
      sistemaRequerido: sourceData.sizing_results?.kWp_needed || sourceData.sizing_results?.results?.kWp_needed || 0
    } : null;

    return {
      consumoData,
      irradiacionData,
      metricsData,
      reciboData: sourceData.recibo_cfe,
      resumenEnergetico: sourceData.resumen_energetico,
      sistemaData: sourceData.sizing_results,
      userData: userType === 'cliente' ? clientData?.user : null,
      isLoading: false,
      hasData: true
    };
  }, [leadData, userType, clientData]);

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