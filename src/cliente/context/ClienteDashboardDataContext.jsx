import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const ClienteDashboardDataContext = createContext();

export const ClienteDashboardDataProvider = ({ children }) => {
  const { clientData, userType } = useAuth();

  // Procesar todos los datos del cliente una sola vez cuando cambien
  const dashboardData = useMemo(() => {
    // Solo procesar si es cliente y tiene datos de cotización
    if (userType !== 'cliente' || !clientData?.cotizacion) {
      console.log('⚠️ ClienteDashboardDataContext - No client data', {
        userType,
        hasClientData: !!clientData,
        hasCotizacion: !!clientData?.cotizacion
      });
      return {
        consumoData: [],
        irradiacionData: [],
        metricsData: null,
        reciboData: null,
        resumenEnergetico: null,
        sistemaData: null,
        userData: clientData?.user || null,
        isLoading: false,
        hasData: false
      };
    }

    const sourceData = clientData.cotizacion;

    console.log('📊 ClienteDashboardDataContext - Cliente data loaded:', {
      hasClientData: !!clientData,
      hasCotizacion: !!clientData?.cotizacion,
      cotizacionKeys: Object.keys(sourceData),
      hasConsumo: !!sourceData.consumo_kwh_historico,
      hasSizing: !!sourceData.sizing_results,
      hasIrradiacionCache: !!sourceData.irradiacion_cache
    });

    // Procesar datos de consumo histórico
    // Los datos ya vienen procesados desde la DB con los campos: value, consumo, periodo, color, etc.
    const consumoData = sourceData.consumo_kwh_historico ?
      sourceData.consumo_kwh_historico
        .filter(item => item?.value !== undefined && item?.periodo !== undefined)
        .sort((a, b) => b.periodo.localeCompare(a.periodo))
      : [];

    // Procesar datos de irradiación
    // Prioridad: 1) datos_nasa_mensuales reales, 2) cálculo artificial con promedios
    const irradiacionData = sourceData.irradiacion_cache || sourceData.sizing_results ?
      (() => {
        const cacheData = sourceData.irradiacion_cache;

        // Prioridad 1: Usar datos_nasa_mensuales reales si existen
        const nasaData = cacheData?.datos_nasa_mensuales?.irradiacion_promedio;
        if (nasaData && Array.isArray(nasaData)) {
          console.log('🔍 [DEBUG Cliente] Usando datos_nasa_mensuales reales:', nasaData);

          // Primero ordenar por valor para calcular rankings
          const sortedByValue = [...nasaData]
            .sort((a, b) => b.irradiacion - a.irradiacion);

          // Crear mapa de rankings (mes -> ranking)
          const rankingMap = {};
          sortedByValue.forEach((item, index) => {
            rankingMap[item.mes] = index + 1;
          });

          // Retornar en orden cronológico original (usando campo orden)
          return nasaData
            .sort((a, b) => a.orden - b.orden)
            .map(item => ({
              mes: item.mes,
              irradiacion: item.irradiacion.toFixed(2),
              ranking: `#${rankingMap[item.mes]}`,
              valor: parseFloat(item.irradiacion),
              value: parseFloat(item.irradiacion),
              label: item.mes.substring(0, 3),
              fullLabel: item.mes,
              orden: item.orden
            }));
        }

        // Fallback: Generar datos artificiales (código anterior)
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
    console.log('🔍 ClienteDashboardDataContext - Processing metrics:', {
      hasConsumo: !!sourceData.consumo_kwh_historico,
      consumoSample: sourceData.consumo_kwh_historico?.[0],
      hasSizing: !!sourceData.sizing_results,
      sizingStructure: {
        hasInputs: !!sourceData.sizing_results?.inputs,
        hasResults: !!sourceData.sizing_results?.results,
        irr_avg_day: sourceData.sizing_results?.inputs?.irr_avg_day,
        kWp_needed: sourceData.sizing_results?.kWp_needed
      },
      fullSizingResults: sourceData.sizing_results
    });

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
      userData: clientData?.user || null,
      isLoading: false,
      hasData: true
    };
  }, [clientData, userType]);

  return (
    <ClienteDashboardDataContext.Provider value={dashboardData}>
      {children}
    </ClienteDashboardDataContext.Provider>
  );
};

export const useClienteDashboardData = () => {
  const context = useContext(ClienteDashboardDataContext);
  if (!context) {
    throw new Error('useClienteDashboardData must be used within a ClienteDashboardDataProvider');
  }
  return context;
};

export default ClienteDashboardDataContext;