import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

const ConsumoTab = () => {
  const { leadData, userType } = useAuth();

  // Procesar datos reales del lead
  const getConsumoData = () => {
    if (userType !== 'lead' || !leadData?.consumo_kwh_historico) {
      return [];
    }

    const historico = leadData.consumo_kwh_historico;
    const promedio = historico.reduce((sum, item) => sum + item.kwh, 0) / historico.length;

    return historico.map(item => {
      const porcentaje = ((item.kwh / promedio) * 100).toFixed(1);
      const porcentajeNum = parseFloat(porcentaje);

      let color = 'gradient';
      if (porcentajeNum > 110) color = 'red';
      else if (porcentajeNum < 85) color = 'green';

      return {
        periodo: item.periodo,
        consumo: item.kwh.toString(),
        porcentaje: `${porcentaje}%`,
        color
      };
    }).sort((a, b) => {
      // Ordenar por período (más reciente primero)
      return b.periodo.localeCompare(a.periodo);
    });
  };

  const consumoData = getConsumoData();

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

        {/* Historial de Consumo */}
        <div className="w-1/2">
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-6">Historial de Consumo</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Período</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Consumo (kWh)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">% del Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoData.length > 0 ? (
                    consumoData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900 text-sm">{item.periodo}</td>
                        <td className="py-3 px-4 text-gray-900 text-sm">{item.consumo}</td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
                            style={{
                              background: item.color === 'gradient'
                                ? 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'
                                : item.color === 'red'
                                  ? '#DC2626'
                                  : '#16A34A'
                            }}
                          >
                            {item.porcentaje}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 px-4 text-center text-gray-500">
                        {userType === 'lead' ? 'Cargando datos de consumo...' : 'No hay datos de consumo disponibles'}
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

export default ConsumoTab;
