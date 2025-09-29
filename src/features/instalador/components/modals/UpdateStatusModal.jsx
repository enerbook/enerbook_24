import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

const UpdateStatusModal = ({ contract, setShowStatusModal, onStatusUpdate }) => {
  const [selectedStatuses, setSelectedStatuses] = useState({
    'Visita Técnica Realizada (presencial o remota)': false,
    'Materiales Recibidos': false,
    'Instalación Iniciada': false,
    'Instalación Finalizada': false,
    'Entrega al Cliente': false,
    'Monitoreo Configurado': false
  });

  const handleStatusToggle = (statusName) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [statusName]: !prev[statusName]
    }));
  };

  const handleSave = () => {
    // Here you would normally save the status updates
    console.log('Selected statuses:', selectedStatuses);
    if (onStatusUpdate) {
      onStatusUpdate(selectedStatuses);
    }
    setShowStatusModal(false);
  };

  const statusList = [
    'Visita Técnica Realizada (presencial o remota)',
    'Materiales Recibidos',
    'Instalación Iniciada',
    'Instalación Finalizada',
    'Entrega al Cliente',
    'Monitoreo Configurado'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Actualizar Estatus</h2>
          <button
            onClick={() => setShowStatusModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          <div className="space-y-6">
            {statusList.map((status, index) => (
              <div key={status} className="flex items-center">
                <button
                  onClick={() => handleStatusToggle(status)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    selectedStatuses[status] 
                      ? 'bg-orange-400 text-white' 
                      : 'bg-gray-200 text-gray-400 hover:bg-orange-100'
                  }`}
                >
                  {selectedStatuses[status] && <FiCheck className="w-5 h-5" />}
                </button>
                <span 
                  className={`ml-4 text-base transition-colors cursor-pointer ${
                    selectedStatuses[status] ? 'text-gray-900' : 'text-gray-600'
                  }`}
                  onClick={() => handleStatusToggle(status)}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => setShowStatusModal(false)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 text-white rounded-lg text-sm font-medium transition-colors"
            style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
          >
            Actualizar Estatus
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;