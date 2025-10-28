import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const LeadDashboardDataContext = createContext();

// Constantes fuera del componente para evitar re-creación
const PERIODO_MAP = {
  'ENE': 'Ene', 'FEB': 'Feb', 'MAR': 'Mar', 'ABR': 'Abr',
  'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul', 'AGO': 'Ago',
  'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov', 'DIC': 'Dic'
};

const MESES_DATA = [
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

export const LeadDashboardDataProvider = ({ children }) => {
  const { leadData, userType, clientData } = useAuth();

  const dashboardData = useMemo(() => {
    let sourceData = null;

    if (userType === 'lead' && leadData) {
      sourceData = leadData;
      console.log('🔍 [DEBUG LeadDashboardDataContext] Lead mode - sourceData:', sourceData);
    } else if (userType === 'cliente' && clientData?.cotizacion) {
      sourceData = clientData.cotizacion;
      console.log('🔍 [DEBUG LeadDashboardDataContext] Cliente mode - sourceData:', sourceData);
    }

    console.log('🔍 [DEBUG LeadDashboardDataContext] userType:', userType);
    console.log('🔍 [DEBUG LeadDashboardDataContext] leadData:', leadData);
    console.log('🔍 [DEBUG LeadDashboardDataContext] sourceData:', sourceData);

    if (!sourceData) {
      console.log('🔍 [DEBUG LeadDashboardDataContext] No sourceData - returning empty dashboard');
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

    // Normalizar consumo_kwh_historico desde formato DB al formato esperado por componentes
    console.log('🔍 [DEBUG LeadDashboardDataContext] consumo_kwh_historico raw:', sourceData.consumo_kwh_historico);
    const consumoData = sourceData.consumo_kwh_historico ?
      (() => {
        const rawData = sourceData.consumo_kwh_historico
          .filter(item => (item?.kwh !== undefined || item?.value !== undefined) && item?.periodo !== undefined);

        // Calcular promedio para los porcentajes
        const valores = rawData.map(item => item.kwh !== undefined ? item.kwh : item.value);
        const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;

        return rawData.map(item => {
          // Normalizar: DB usa "kwh", componentes esperan "value" y "consumo"
          const valorKwh = item.kwh !== undefined ? item.kwh : item.value;

          // Convertir periodo "ENE25" a formato legible usando constante global
          const mesAbrev = item.periodo.substring(0, 3).toUpperCase();
          const año = item.periodo.substring(3);
          const label = PERIODO_MAP[mesAbrev] || mesAbrev;
          const fullLabel = `${PERIODO_MAP[mesAbrev] || mesAbrev} ${año}`;

          // Calcular porcentaje respecto al promedio
          const porcentajeValor = Math.round((valorKwh / promedio) * 100);
          const porcentaje = `${porcentajeValor}%`;

          // Determinar color según el porcentaje
          let color = 'green'; // Por debajo del promedio
          if (porcentajeValor >= 110) {
            color = 'red'; // 10% o más arriba del promedio
          } else if (porcentajeValor >= 90) {
            color = 'gradient'; // Cerca del promedio
          }

          return {
            periodo: item.periodo,
            value: valorKwh,
            consumo: valorKwh,
            kwh: valorKwh,
            label: label,
            fullLabel: fullLabel,
            porcentaje: porcentaje,
            porcentajeValor: porcentajeValor,
            color: color
          };
        }).sort((a, b) => b.periodo.localeCompare(a.periodo));
      })()
      : [];

    console.log('🔍 [DEBUG LeadDashboardDataContext] irradiacion_cache:', sourceData.irradiacion_cache);
    console.log('🔍 [DEBUG LeadDashboardDataContext] sizing_results:', sourceData.sizing_results);
    const irradiacionData = sourceData.irradiacion_cache || sourceData.sizing_results ?
      (() => {
        const cacheData = sourceData.irradiacion_cache;

        // Prioridad 1: Usar datos_nasa_mensuales reales si existen
        const nasaData = cacheData?.datos_nasa_mensuales?.irradiacion_promedio;
        if (nasaData && Array.isArray(nasaData)) {
          console.log('═══════════════════════════════════════════════════════════════');
          console.log('🔍 [DEBUG LeadDashboardDataContext] PROCESANDO DATOS NASA');
          console.log('🔍 [DEBUG LeadDashboardDataContext] irradiacion_promedio RAW:', nasaData);

          // Primero ordenar por valor para calcular rankings
          const sortedByValue = [...nasaData]
            .sort((a, b) => b.irradiacion - a.irradiacion);

          console.log('🔍 [DEBUG LeadDashboardDataContext] Ordenado por valor:', sortedByValue);

          // Crear mapa de rankings (mes -> ranking)
          const rankingMap = {};
          sortedByValue.forEach((item, index) => {
            rankingMap[item.mes] = index + 1;
          });

          console.log('🔍 [DEBUG LeadDashboardDataContext] Ranking map:', rankingMap);

          // Retornar en orden cronológico original (usando campo orden)
          const result = nasaData
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

          console.log('🔍 [DEBUG LeadDashboardDataContext] RESULTADO FINAL (orden cronológico):', result);
          console.log('═══════════════════════════════════════════════════════════════');

          return result;
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

        return MESES_DATA.map((mes, index) => {
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

    // Calcular métricas usando datos normalizados
    const metricsData = consumoData.length > 0 ? {
      consumoPromedio: Math.round(
        consumoData.reduce((sum, item) => sum + item.value, 0) / consumoData.length
      ),
      consumoMaximo: Math.max(...consumoData.map(item => item.value)),
      irradiacionPromedio: parseFloat(irradiacionPromedio),
      sistemaRequerido: sourceData.sizing_results?.sistema?.capacidad_sistema_kw || sourceData.sizing_results?.results?.kWp_needed || sourceData.sizing_results?.kWp_needed || 0
    } : null;

    console.log('🔍 [DEBUG LeadDashboardDataContext] metricsData calculated:', metricsData);

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
    <LeadDashboardDataContext.Provider value={dashboardData}>
      {children}
    </LeadDashboardDataContext.Provider>
  );
};

export const useLeadDashboardData = () => {
  const context = useContext(LeadDashboardDataContext);
  if (!context) {
    throw new Error('useLeadDashboardData must be used within a LeadDashboardDataProvider');
  }
  return context;
};

export default LeadDashboardDataContext;