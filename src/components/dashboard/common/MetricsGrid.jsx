import React from 'react';
import MetricTile from '../MetricTile';
import { useAuth } from '../../../context/AuthContext';

const MetricsGrid = () => {
  const { userType, leadData } = useAuth();

  // Datos por defecto
  let consumoPromedio = '272 kWh';
  let sistemaRequerido = '3.73 kWp';
  let nPaneles = '7 paneles';
  let irradiacionPromedio = '3.85 kWh/m²/día';
  let ubicacion = 'Ciudad de México Centro';
  let produccionAnual = '4,023 kWh';

  // Si estamos en modo lead, usar datos reales
  if (userType === 'lead' && leadData) {
    // Calcular consumo promedio de los datos históricos
    if (leadData.consumo_kwh_historico?.length > 0) {
      const totalConsumo = leadData.consumo_kwh_historico.reduce((sum, periodo) => sum + (periodo.kwh || 0), 0);
      const promedioMensual = Math.round(totalConsumo / leadData.consumo_kwh_historico.length);
      consumoPromedio = `${promedioMensual} kWh`;
    }

    // Datos del sizing si existen
    if (leadData.sizing_results?.results) {
      const sizing = leadData.sizing_results.results;
      sistemaRequerido = `${sizing.kWp_needed || 0} kWp`;
      nPaneles = `${sizing.n_panels || 0} paneles`;
      produccionAnual = `${sizing.yearly_prod?.toLocaleString() || 0} kWh`;
    }

    // Datos de irradiación
    if (leadData.sizing_results?.inputs) {
      const inputs = leadData.sizing_results.inputs;
      irradiacionPromedio = `${inputs.irr_avg_day || 0} kWh/m²/día`;
    }

    // Ubicación desde el recibo CFE
    if (leadData.recibo_cfe?.direccion_formatted) {
      // Extraer ciudad/estado de la dirección
      const direccion = leadData.recibo_cfe.direccion_formatted;
      const partes = direccion.split(',').map(p => p.trim());
      if (partes.length >= 3) {
        ubicacion = `${partes[partes.length - 3]}, ${partes[partes.length - 2]}`;
      } else {
        ubicacion = 'México';
      }
    }
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 gap-3">
        <MetricTile title="Consumo Promedio" value={consumoPromedio} subtitle="Mensual" />
        <MetricTile title="Sistema Requerido" value={sistemaRequerido} subtitle={nPaneles} />
        <MetricTile title="Irradiación Promedio" value={irradiacionPromedio} subtitle={ubicacion} />
        <MetricTile title="Producción Anual" value={produccionAnual} subtitle="Estimada" />
      </div>
    </div>
  );
};

export default MetricsGrid;
