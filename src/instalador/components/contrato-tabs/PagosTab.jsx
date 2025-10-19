import React from 'react';

const PagosTab = ({ contrato, proyecto, cliente }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const getEstadoPagoColor = (estadoPago) => {
    switch (estadoPago) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-orange-100 text-orange-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagos y Facturación</h2>
        <p className="text-sm text-gray-600">
          Estado de pagos, milestones y facturación del contrato
        </p>
      </div>

      {/* Resumen de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Monto Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(contrato?.precio_total_sistema)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Tipo de Pago</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">{contrato?.tipo_pago_seleccionado || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Estado</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoPagoColor(contrato?.estado_pago)}`}>
            {contrato?.estado_pago || 'N/A'}
          </span>
        </div>
      </div>

      {/* Placeholder para milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Pagos</h3>
        <p className="text-sm text-gray-600">
          La gestión detallada de milestones de pago estará disponible próximamente
        </p>
      </div>
    </div>
  );
};

export default PagosTab;
