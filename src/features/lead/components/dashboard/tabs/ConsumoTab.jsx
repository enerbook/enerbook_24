import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useDashboardData } from '../../../../../context/DashboardDataContext';
import { useSolicitarCotizaciones } from '../../../../cliente/hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../../../../cliente/components/modals/SolicitarCotizacionesModal';

const ConsumoTab = () => {
  const { consumoData, hasData } = useDashboardData();
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();

  return (
    <main className="flex-1 px-2 lg:px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-6 lg:space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="w-full lg:w-1/2">
          <div className="p-4 lg:p-6 rounded-lg border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#fcfcfc' }}>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="w-full lg:w-auto lg:ml-8">
              <button
                onClick={openModal}
                className="bg-gray-900 hover:bg-black text-white rounded-2xl px-5 py-3 transition-all group w-full lg:w-auto"
              >
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
        <div className="w-full lg:w-1/2">
          <div className="p-4 lg:p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4 lg:mb-6">Historial de Consumo</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-600 text-xs lg:text-sm">Período</th>
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-600 text-xs lg:text-sm">Consumo</th>
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-600 text-xs lg:text-sm whitespace-nowrap">% Prom</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoData.length > 0 ? (
                    consumoData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-900 text-xs lg:text-sm">{item.periodo}</td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-gray-900 text-xs lg:text-sm">{item.consumo}</td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4">
                          <span
                            className="inline-block px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-white text-xs lg:text-sm font-medium"
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
                      <td colSpan="3" className="py-6 lg:py-8 px-2 lg:px-4 text-center text-gray-500 text-xs lg:text-sm">
                        {hasData ? 'Cargando datos de consumo...' : 'No hay datos de consumo disponibles'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <SolicitarCotizacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </main>
  );
};

export default ConsumoTab;
