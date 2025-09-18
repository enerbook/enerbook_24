import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useDashboardData } from '../../../context/DashboardDataContext';

const IrradiacionTab = () => {
  const { irradiacionData, hasData } = useDashboardData();

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
                        {hasData ? 'Cargando datos de irradiación...' : 'No hay datos de irradiación disponibles'}
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
