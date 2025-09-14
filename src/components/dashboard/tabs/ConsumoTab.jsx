import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

const ConsumoTab = () => {
  const consumoData = [
    { periodo: 'ABR25', consumo: '315', porcentaje: '115.8%', color: 'red' },
    { periodo: 'FEB25', consumo: '247', porcentaje: '90.8%', color: 'gradient' },
    { periodo: 'DIC24', consumo: '280', porcentaje: '102.9%', color: 'gradient' },
    { periodo: 'OCT24', consumo: '254', porcentaje: '93.4%', color: 'gradient' },
    { periodo: 'AGO24', consumo: '242', porcentaje: '89.0%', color: 'gradient' },
    { periodo: 'JUN24', consumo: '319', porcentaje: '117.3%', color: 'red' },
    { periodo: 'ABR24', consumo: '278', porcentaje: '102.2%', color: 'gradient' },
    { periodo: 'FEB24', consumo: '257', porcentaje: '94.5%', color: 'gradient' },
    { periodo: 'DIC23', consumo: '225', porcentaje: '82.7%', color: 'green' },
    { periodo: 'OCT23', consumo: '261', porcentaje: '96.0%', color: 'gradient' },
    { periodo: 'AGO23', consumo: '272', porcentaje: '100.0%', color: 'gradient' }
  ];

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="w-1/2">
          <div className="p-6 rounded-lg border border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fcfcfc' }}>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="ml-8">
              <button className="bg-gray-900 hover:bg-black text-white rounded-2xl px-5 py-3 transition-all group">
                <div className="text-center">
                  <h3 className="text-sm font-bold mb-1">SOLICITAR</h3>
                  <h3 className="text-sm font-bold mb-2">COTIZACIONES</h3>
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
            <h2 className="text-lg font-bold text-gray-900 mb-6">Historial de Consumo</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">PERIODO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CONSUMO (kWh)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">% DEL PROMEDIO</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 text-base">{item.periodo}</td>
                      <td className="py-3 px-4 text-gray-900 text-base">{item.consumo}</td>
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
                  ))}
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
