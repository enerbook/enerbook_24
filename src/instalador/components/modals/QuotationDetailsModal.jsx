import React from 'react';
import { FiX } from 'react-icons/fi';

const QuotationDetailsModal = ({ quotation, setShowDetailsModal }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detalles de la Cotización</h2>
          <button
            onClick={() => setShowDetailsModal(false)}
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
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.projectName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Capacidad del Sistema (kWp)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.capacity}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Paneles</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.panels}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Inversor</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.inverter}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Producción Estimada (kWh/año)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.production}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Precio Final (MXN)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.totalAmount}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Estructura</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.structure}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Paneles (Años)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.panelWarranty}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Inversores (Años)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.inverterWarranty}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Garantía de Instalación (Años)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.installationWarranty}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tiempo Estimado de Instalación (días)</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.installationTime}
                </div>
              </div>

              {/* Payment Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Opciones de Pago</label>
                <div className="flex flex-wrap gap-4">
                  {quotation.details.paymentOptions.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notas Adicionales</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 min-h-[100px]">
                  {quotation.details.notes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsModal;