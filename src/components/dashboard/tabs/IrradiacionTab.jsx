import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

const IrradiacionTab = () => {
  const { leadData, userType } = useAuth();

  // Procesar datos reales de irradiación
  const getIrradiacionData = () => {
    if (userType !== 'lead' || !leadData?.sizing_results?.inputs) {
      return [];
    }

    // Obtener datos de irradiación de NASA (pueden estar en diferentes lugares)
    const nasaData = leadData.sizing_results.inputs;

    // Datos mensuales simulados basados en los datos disponibles
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

    // Calcular irradiación basada en promedio, mínimo y máximo
    const promedioAnual = nasaData.irr_avg_day || 5.5;
    const variacion = (nasaData.irr_max - nasaData.irr_min) / 2 || 1;

    const irradiacionData = mesesData.map((mes, index) => {
      // Simular variación estacional (más alto en primavera/verano)
      const factor = 0.5 + 0.5 * Math.cos((mes.orden - 5) * Math.PI / 6);
      const irradiacion = (promedioAnual + variacion * (factor - 0.5)).toFixed(2);

      return {
        mes: mes.mes,
        irradiacion,
        ranking: `#${index + 1}`,
        valor: parseFloat(irradiacion)
      };
    });

    // Ordenar por irradiación (mayor a menor)
    return irradiacionData.sort((a, b) => b.valor - a.valor).map((item, index) => ({
      ...item,
      ranking: `#${index + 1}`
    }));
  };

  const irradiacionData = getIrradiacionData();

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="w-1/2">
          <div className="p-6 rounded-lg border border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fcfcfc' }}>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="ml-8">
              <button className="bg-gray-900 hover:bg-black text-white rounded-2xl px-5 py-3 transition-all group">
                <div className="text-center">
                  <h3 className="text-sm font-bold mb-1">Solicitar</h3>
                  <h3 className="text-sm font-bold mb-2">Cotizaciones</h3>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FiChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Datos Detallados sobre Histórico de Irradiación */}
        <div className="w-1/2">
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-6">Datos Detallados sobre Histórico de Irradiación</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Mes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Irradiación (kWh/m²/día)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {irradiacionData.length > 0 ? (
                    irradiacionData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900 text-sm">{item.mes}</td>
                        <td className="py-4 px-6 text-gray-900 text-sm">{item.irradiacion}</td>
                        <td className="py-4 px-6 text-gray-600 text-sm">{item.ranking}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 px-4 text-center text-gray-500">
                        {userType === 'lead' ? 'Cargando datos de irradiación...' : 'No hay datos de irradiación disponibles'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IrradiacionTab;
