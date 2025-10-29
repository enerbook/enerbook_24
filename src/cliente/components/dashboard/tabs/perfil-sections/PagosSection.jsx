import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiTrash2, FiFileText } from 'react-icons/fi';

const PagosSection = ({ userId }) => {
  const [savedCards, setSavedCards] = useState([
    // Placeholder data - replace with real Stripe data
    // { id: '1', last4: '4242', brand: 'Visa', exp_month: 12, exp_year: 2025 }
  ]);

  const handleAddCard = () => {
    // TODO: Integrar con Stripe Elements para agregar tarjeta
    alert('Funcionalidad de agregar tarjeta en desarrollo');
  };

  const handleRemoveCard = (cardId) => {
    const confirmed = window.confirm('¿Eliminar este método de pago?');
    if (confirmed) {
      // TODO: Eliminar tarjeta de Stripe
      setSavedCards(cards => cards.filter(c => c.id !== cardId));
    }
  };

  const cardBrandLogo = (brand) => {
    const logos = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return logos[brand?.toLowerCase()] || '💳';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <FiCreditCard className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Métodos de Pago</h3>
          <p className="text-sm text-gray-500">Gestiona tus tarjetas y métodos de pago</p>
        </div>
      </div>

      {/* Tarjetas Guardadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Tarjetas Guardadas</h4>
          <button
            onClick={handleAddCard}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            <FiPlus className="w-4 h-4" />
            Agregar Tarjeta
          </button>
        </div>

        {savedCards.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">No tienes métodos de pago guardados</p>
            <button
              onClick={handleAddCard}
              className="px-4 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Agregar Primera Tarjeta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{cardBrandLogo(card.brand)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {card.brand} •••• {card.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expira {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar tarjeta"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de Facturación */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Información de Facturación</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">RFC:</span>
            <span className="font-medium text-gray-900">Por definir</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Razón Social:</span>
            <span className="font-medium text-gray-900">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dirección Fiscal:</span>
            <span className="font-medium text-gray-900">-</span>
          </div>
        </div>
        <button className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600">
          Actualizar Información Fiscal →
        </button>
      </div>

      {/* Historial de Pagos */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">Historial de Pagos</h4>
          <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            Ver Todo →
          </button>
        </div>

        <div className="space-y-3">
          {/* Placeholder - replace with real payment history */}
          <div className="text-center py-8">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay pagos registrados</p>
          </div>
        </div>
      </div>

      {/* Información de Stripe */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Pagos seguros</strong> - Tus pagos son procesados de forma segura mediante Stripe.
          Enerbook no almacena información de tarjetas.
        </p>
      </div>
    </div>
  );
};

export default PagosSection;
