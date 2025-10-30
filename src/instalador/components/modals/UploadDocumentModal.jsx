import React from 'react';
import { FiX } from 'react-icons/fi';
import { GRADIENTS } from '../../../shared/config/gradients';

const UploadDocumentModal = ({ uploadAction, setShowUploadModal, handleDocumentUpload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            {uploadAction} Documento
          </h2>
          <button
            onClick={() => setShowUploadModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <div className="relative">
              {/* Document icon */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
              </svg>
              {/* Plus icon */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleDocumentUpload}
            className="text-gray-900 font-medium mb-2 hover:text-gray-700 transition-colors"
          >
            [Seleccionar archivo PDF]
          </button>
          <p className="text-gray-500 text-sm">Solo archivos .pdf</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowUploadModal(false)}
            className="flex-1 text-gray-900 font-bold text-lg hover:text-gray-700 transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={handleDocumentUpload}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
            style={{background: GRADIENTS.primary}}
          >
            {uploadAction.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
