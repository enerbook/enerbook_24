import React from 'react';
import { FiX, FiStar } from 'react-icons/fi';

const ContractDetailsModal = ({ contract, setShowDetailsModal }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar 
        key={index} 
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detalles del Contrato</h2>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {/* First Row - 3 columns */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Proyecto</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">Instalación en Lomas 9 wKp</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Capacidad del Sistema</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">5.4 kWp</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tipo de Paneles</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">10 x Longi 550W</p>
              </div>
            </div>
          </div>

          {/* Second Row - 2 columns */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Cliente</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">Luis Raúl Morales Hernández</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tipo de Inversor</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">2 x Huawei 5KW</p>
              </div>
            </div>
          </div>

          {/* Third Row - 4 columns */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Producción Estimada</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">8,540 kWh/año</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Precio Final</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">$87,500 MXN</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tipo de Estructura</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">Coplanar, techo de lámina</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Estatus</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">Contrato Activo</p>
              </div>
            </div>
          </div>

          {/* Fourth Row - 2 columns */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Contrato</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">#CNTR-239823</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tipo de Pago</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">Financiamiento (48 meses)</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Notas Adicionales</h4>
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 leading-relaxed">El sistema fue diseñado para un voltaje de 220V, sin embargo se dejó capacidad e infraestructura para soportar hasta 440V.</p>
            </div>
          </div>

          {/* Fifth Row - 4 columns */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Fecha de Firma</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">8/11/2025</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Teléfono</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">222 707 8965</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Garantía de Instalación</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">10 años</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Garantía de Inversores</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">18 años</p>
              </div>
            </div>
          </div>

          {/* Final Row - Guarantee */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Garantía de Paneles</h4>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">20 años</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center">
                <span>Ver Pagos</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contactar
              </button>
              
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center">
                <span>Ver PDF del Contrato</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsModal;