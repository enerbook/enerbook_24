import React from 'react';

const QuotationCard = ({ quotation, onViewDetails, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'En revisión':
        return 'bg-orange-400';
      case 'Rechazada':
        return 'bg-red-500';
      case 'Aceptada':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-8 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{quotation.projectName}</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Cliente</span>
          <span className="text-sm text-gray-900">{quotation.clientName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Fecha de Envío</span>
          <span className="text-sm text-gray-900">{quotation.sentDate}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Monto Total</span>
          <span className="text-sm text-gray-900">{quotation.totalAmount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Estatus</span>
          <span className="text-sm text-gray-900">{quotation.status}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(quotation)}
          className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          Ver Detalles
        </button>
        {quotation.status === 'En revisión' && (
          <button
            onClick={() => onCancel(quotation)}
            className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-black transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotationCard;