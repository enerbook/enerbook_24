import React from 'react';
import { FiX } from 'react-icons/fi';

const QuotationDetailsModal = ({ quotation, setShowDetailsModal }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalles de la Cotización</h2>
            <p className="text-sm text-gray-600 mt-1">{quotation.projectName}</p>
          </div>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* General Info Section - Full Width */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Capacidad del Sistema</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.capacity || 'No especificada'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Producción Estimada</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {quotation.details.production || 'No calculada'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Precio Final</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-400 rounded-lg text-lg font-bold text-gray-900">
                  {quotation.totalAmount}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">

              {/* Paneles Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Paneles Solares</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Marca</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panelBrand || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Modelo</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panels || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panelCount || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Potencia</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panelPower || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Precio</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panelPrice || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Garantía</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.panelWarranty || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inversores Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Inversor</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Marca</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverterBrand || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Modelo</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverter || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverterType || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Potencia</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverterPower || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Precio</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverterPrice || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Garantía</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.inverterWarranty || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Estructura Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Estructura</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.structure || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Material</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.structureMaterial || '-'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Precio</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                      {quotation.details.structurePrice || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sistema Eléctrico Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sistema Eléctrico e Instalación</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 min-h-[80px]">
                      {quotation.details.electricalSystem || '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Precio</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.electricalSystemPrice || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiempo de Instalación</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {quotation.details.installationTime || '-'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Garantía de Instalación</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                      {quotation.details.installationWarranty || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Opciones de Pago</label>
                <div className="flex flex-wrap gap-3">
                  {quotation.details.paymentOptions.map((option, index) => (
                    <div key={index} className="flex items-center px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="ml-2 text-sm text-gray-900 font-medium">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Notas Adicionales</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 min-h-[100px] whitespace-pre-wrap">
                  {quotation.details.notes || '-'}
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
