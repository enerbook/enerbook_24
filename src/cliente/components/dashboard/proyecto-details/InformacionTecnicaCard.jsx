import React from 'react';
import HistorialConsumoTable from './HistorialConsumoTable';
import { GRADIENTS } from '../../../../shared/config/gradients';

const InformacionTecnicaCard = ({ cotizacionInicial }) => {
  if (!cotizacionInicial) {
    return null;
  }

  const { sizing_results, recibo_cfe, resumen_energetico, consumo_kwh_historico } = cotizacionInicial;

  const MetricCard = ({ icon, title, value, subtitle, gradient }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-lg font-extrabold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: GRADIENTS.info }}
        >
          <span className="text-lg">📊</span>
        </div>
        <h2 className="text-base font-bold text-gray-900">Información Técnica del Proyecto</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sistema recomendado */}
        {sizing_results?.results && (
          <>
            <MetricCard
              icon="⚡"
              title="Sistema Recomendado"
              value={`${sizing_results.results.kWp_needed} kWp`}
              subtitle={`${sizing_results.results.n_panels} paneles de ${sizing_results.results.panel_wp}W`}
              gradient={GRADIENTS.sistema}
            />

            <MetricCard
              icon="☀️"
              title="Producción Anual"
              value={`${sizing_results.results.yearly_prod?.toLocaleString()} kWh`}
              gradient={GRADIENTS.produccion}
            />
          </>
        )}

        {/* Información del recibo */}
        {recibo_cfe && (
          <>
            <MetricCard
              icon="📄"
              title="Tarifa CFE"
              value={recibo_cfe.tarifa || 'No especificada'}
              gradient={GRADIENTS.tarifa}
            />

            <MetricCard
              icon="📍"
              title="Ubicación"
              value={`CP ${recibo_cfe.codigo_postal || 'No especificado'}`}
              gradient={GRADIENTS.ubicacion}
            />
          </>
        )}

        {/* Consumo promedio */}
        {resumen_energetico?.consumo_promedio && (
          <MetricCard
            icon="🔌"
            title="Consumo Promedio"
            value={`${resumen_energetico.consumo_promedio} kWh/mes`}
            gradient={GRADIENTS.consumo}
          />
        )}

        {/* Irradiación */}
        {sizing_results?.inputs?.irr_avg_day && (
          <MetricCard
            icon="🌞"
            title="Irradiación"
            value={`${sizing_results.inputs.irr_avg_day} kWh/m²/día`}
            gradient={GRADIENTS.irradiacion}
          />
        )}
      </div>

      {/* Historial de Consumo */}
      <HistorialConsumoTable consumoHistorico={consumo_kwh_historico} />
    </div>
  );
};

export default InformacionTecnicaCard;
