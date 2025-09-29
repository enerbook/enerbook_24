import React from 'react';

const ContractCard = ({ contract, onViewDetails, onUpdateStatus, onViewReview }) => {
  const getSecondButton = () => {
    if (contract.status === 'Contrato Finalizado') {
      return (
        <button
          onClick={() => onViewReview(contract)}
          className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          Ver Reseña
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onUpdateStatus(contract)}
          className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          Actualizar Estatus
        </button>
      );
    }
  };

  return (
    <div className="p-8 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{contract.projectName}</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Proyecto</span>
          <span className="text-sm text-gray-900">{contract.projectDescription}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Cliente</span>
          <span className="text-sm text-gray-900">{contract.clientName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Monto Total</span>
          <span className="text-sm text-gray-900">{contract.totalAmount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Estatus</span>
          <span className="text-sm text-gray-900">{contract.status}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(contract)}
          className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          Ver Detalles
        </button>
        {getSecondButton()}
      </div>
    </div>
  );
};

export default ContractCard;