import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const SendQuoteModal = ({ project, setShowQuoteModal }) => {
  const [paymentOptions, setPaymentOptions] = useState({
    contado: true,
    mensualidades: true,
    financiamiento: true
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Enviar Cotización</h2>
          <button
            onClick={() => setShowQuoteModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Nombre del Proyecto</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: Potencia recomendada: ${project.power || '5.2 kW (14 paneles de 370W)'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Capacidad del Sistema (kWp)</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.capacity || '5.6 kWp'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Paneles</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.panels || 'JA Solar 545W'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Inversor</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.inverter || 'Huawei SUN2000-3/4/5/6/8/10KTL-M1'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Producción Estimada (kWh/año)</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.production || '8,250 kWh/año'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Precio Final (MXN)</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.price || '$102,000 MXN'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Estructura</label>
                <input
                  type="text"
                  placeholder={`Ejemplo: ${project.structure || 'Coplanar, techo de lámina'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Paneles (Años)</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 25 años"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Inversores (Años)</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 20 años"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Instalación (Años)</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 10 años"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tiempo Estimado de Instalación (días)</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 30 días"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              {/* Payment Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Opciones de Pago</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                      style={paymentOptions.contado ? 
                        {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : 
                        {backgroundColor: '#d1d5db'}
                      }
                      onClick={() => setPaymentOptions(prev => ({...prev, contado: !prev.contado}))}
                    >
                      {paymentOptions.contado && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-900">Contado</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                      style={paymentOptions.mensualidades ? 
                        {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : 
                        {backgroundColor: '#d1d5db'}
                      }
                      onClick={() => setPaymentOptions(prev => ({...prev, mensualidades: !prev.mensualidades}))}
                    >
                      {paymentOptions.mensualidades && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-900">Mensualidades</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                      style={paymentOptions.financiamiento ? 
                        {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : 
                        {backgroundColor: '#d1d5db'}
                      }
                      onClick={() => setPaymentOptions(prev => ({...prev, financiamiento: !prev.financiamiento}))}
                    >
                      {paymentOptions.financiamiento && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-900">Financiamiento</span>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notas Adicionales</label>
                <textarea
                  rows="4"
                  placeholder="Ejemplo: El sistema fue diseñado para un voltaje de 220V, sin embargo se dejó capacidad e infraestructura para soportar hasta 440V."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                className="w-full py-4 px-6 text-white rounded-2xl text-sm font-medium transition-colors"
                style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
              >
                Enviar Cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;
