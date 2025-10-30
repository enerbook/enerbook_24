import React from 'react';
import { FiX } from 'react-icons/fi';
import { GRADIENTS } from '../../../shared/config/gradients';

const UploadCertificationModal = ({ certificationAction, setShowCertificationModal, handleCertificationUpload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {certificationAction === 'Agregar' ? 'Agregar Certificación' : `${certificationAction} Certificación`}
          </h2>
          <button
            onClick={() => setShowCertificationModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="relative">
              {/* Document icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
              </svg>
              {/* Plus icon */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <button className="text-gray-900 font-medium mb-1 hover:text-gray-700 transition-colors">
            [Seleccionar archivo PDF]
          </button>
          <p className="text-gray-500 text-xs">Solo archivos .pdf</p>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleCertificationUpload}
            className="px-6 py-2 text-white rounded-lg font-medium transition-colors"
            style={{background: GRADIENTS.primary}}
          >
            {certificationAction === 'Agregar' ? 'AGREGAR' : certificationAction.toUpperCase()}
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Nombre de Certificación</label>
            <input
              type="text"
              placeholder="Ingresa el nombre de la certificación"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Fecha de Obtención</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seleccionar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-400"
                />
                <div className="absolute right-3 top-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" fill="#9CA3AF"/>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Fecha de Vencimiento</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seleccionar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-400"
                />
                <div className="absolute right-3 top-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" fill="#9CA3AF"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
            <textarea
              rows="3"
              placeholder="Escribe más detalles sobre la certificación"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCertificationModal;
