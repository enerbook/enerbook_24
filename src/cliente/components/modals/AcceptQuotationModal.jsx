import React, { useState } from 'react';
import { contractService } from '../../services/contractService';

const AcceptQuotationModal = ({ quotation, onClose, onSuccess, userId }) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);

  const precioTotal = quotation?.precio_final?.total || 0;

  // Get available payment options from quotation
  const availableOptions = quotation?.opciones_pago || [];

  const paymentOptions = [
    {
      type: 'upfront',
      title: 'Pago Total',
      description: 'Pago único al inicio del proyecto',
      amount: precioTotal,
      details: 'Un solo pago de',
      available: availableOptions.some(opt => opt.tipo === 'upfront')
    },
    {
      type: 'milestones',
      title: 'Pagos por Hitos',
      description: 'Pagos divididos según avance del proyecto',
      amount: precioTotal,
      details: '3 pagos: 30% - 40% - 30%',
      milestones: [
        { name: 'Acepta oferta', percentage: 30, amount: precioTotal * 0.30 },
        { name: 'Inicio instalación', percentage: 40, amount: precioTotal * 0.40 },
        { name: 'Entrega final', percentage: 30, amount: precioTotal * 0.30 }
      ],
      available: availableOptions.some(opt => opt.tipo === 'milestones')
    }
  ];

  const handleAccept = async () => {
    if (!selectedPaymentType) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setLoading(true);
    try {
      const contract = await contractService.acceptQuotation(
        quotation.id,
        selectedPaymentType,
        userId
      );

      alert('¡Cotización aceptada exitosamente! Se ha creado tu contrato.');
      if (onSuccess) {
        onSuccess(contract);
      }
      onClose();
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert(error.message || 'Error al aceptar la cotización. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">Aceptar Cotización</h2>
              <p className="text-sm text-black mt-1">
                {quotation?.proveedores?.nombre_empresa}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Summary */}
          <div className="border border-card rounded-card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Precio Total del Sistema</p>
                <p className="text-2xl font-bold text-black">
                  ${precioTotal.toLocaleString()} MXN
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-card flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-black">Selecciona tu Método de Pago</h3>

            {paymentOptions.filter(opt => opt.available).map((option) => (
              <div
                key={option.type}
                onClick={() => !loading && setSelectedPaymentType(option.type)}
                className={`border-2 rounded-card p-4 cursor-pointer transition-all ${
                  selectedPaymentType === option.type
                    ? 'border-brand'
                    : 'border-card'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentType === option.type
                          ? 'border-brand bg-brand'
                          : 'border-card'
                      }`}
                    >
                      {selectedPaymentType === option.type && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-black">{option.title}</h4>
                      <span className="text-sm font-bold text-black">
                        ${option.amount.toLocaleString()} MXN
                      </span>
                    </div>
                    <p className="text-xs text-black mb-2">{option.description}</p>
                    <p className="text-xs text-black italic">{option.details}</p>

                    {/* Milestone breakdown */}
                    {option.type === 'milestones' && selectedPaymentType === 'milestones' && (
                      <div className="mt-3 pt-3 border-t border-card">
                        <p className="text-xs font-medium text-black mb-2">Desglose de pagos:</p>
                        <div className="space-y-1">
                          {option.milestones.map((milestone, index) => (
                            <div key={index} className="flex justify-between text-xs text-black">
                              <span>• {milestone.name} ({milestone.percentage}%)</span>
                              <span className="font-medium">${milestone.amount.toLocaleString()} MXN</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="border border-card rounded-card p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-black mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-black mb-1 text-sm">¿Qué sucede después?</h4>
                <ul className="text-xs text-black space-y-1">
                  <li>• Se creará un contrato formal con el instalador</li>
                  <li>• Las demás cotizaciones serán rechazadas automáticamente</li>
                  <li>• El instalador será notificado de tu aceptación</li>
                  <li>• Podrás ver el progreso en la sección "Mis Contratos"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-card text-black rounded-card font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !selectedPaymentType}
              className={`flex-1 py-3 px-4 text-white rounded-card font-medium transition-colors ${
                loading || !selectedPaymentType ? 'bg-gray-400' : 'bg-brand'
              }`}
            >
              {loading ? 'Procesando...' : 'Confirmar y Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptQuotationModal;
