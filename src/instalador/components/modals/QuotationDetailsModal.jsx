import React from 'react';
import { FiX } from 'react-icons/fi';

const QuotationDetailsModal = ({ quotation, setShowDetailsModal }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-6xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-auto">
        {/* Modal Header - Fixed positioning */}
        <div className="sticky top-0 bg-white z-50 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Detalles de la Cotización</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{quotation.projectName}</p>
          </div>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content - Responsive padding */}
        <div className="p-4 sm:p-6">
          {/* General Info Section - Responsive grid */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Capacidad del Sistema</label>
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 flex-1 flex items-center">
                  {quotation.details.capacity || 'No especificada'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Producción Estimada</label>
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-600 flex-1 flex items-center">
                  {quotation.details.production || 'No calculada'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Precio Final</label>
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-900 flex-1 flex items-center">
                  {quotation.totalAmount}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">

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
            <div className="space-y-4 sm:space-y-6">
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
                <div className="flex flex-wrap gap-2">
                  {quotation.details.paymentOptions.map((option, index) => (
                    <div key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                      {option}
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
