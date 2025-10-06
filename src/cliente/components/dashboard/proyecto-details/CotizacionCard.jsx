import React from 'react';
import CotizacionDetalles from './CotizacionDetalles';

const CotizacionCard = ({ cotizacion, isExpanded, onToggle, onAcceptQuotation }) => {
  const getCotizacionEstadoBadge = (estado) => {
    const badges = {
      'pendiente': {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        text: 'Pendiente',
        icon: '⏳'
      },
      'aceptada': {
        gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        text: 'Aceptada',
        icon: '✅'
      },
      'rechazada': {
        gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        text: 'Rechazada',
        icon: '❌'
      }
    };
    return badges[estado] || badges['pendiente'];
  };

  const badge = getCotizacionEstadoBadge(cotizacion.estado);
  const precioFinal = cotizacion.precio_final?.total || 0;

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border-2 p-5 transition-all cursor-pointer ${
        isExpanded ? 'border-orange-300 shadow-lg' : 'border-gray-200 hover:border-orange-200 hover:shadow-md'
      }`}
      onClick={onToggle}
    >
      {/* Decorative gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' }}
      />

      {/* Header de la cotización */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }}
          >
            {cotizacion.proveedores?.nombre_empresa?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {cotizacion.proveedores?.nombre_empresa || 'Proveedor'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {cotizacion.proveedores?.nombre_contacto}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">
            ${(precioFinal / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500 mt-0.5">MXN</p>
        </div>
      </div>

      {/* Estado Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold mb-4"
        style={{ background: badge.gradient }}
      >
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </div>

      {/* Información breve con iconos */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cotizacion.paneles?.marca && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm">☀️</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Paneles</p>
              <p className="text-xs font-bold text-gray-900 truncate">
                {cotizacion.paneles.marca} ({cotizacion.paneles.cantidad})
              </p>
            </div>
          </div>
        )}
        {cotizacion.inversores?.marca && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚡</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Inversor</p>
              <p className="text-xs font-bold text-gray-900 truncate">
                {cotizacion.inversores.marca}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Opciones de pago */}
      {cotizacion.opciones_pago && cotizacion.opciones_pago.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <span>💳</span> Opciones de Pago
          </p>
          <div className="flex flex-wrap gap-2">
            {cotizacion.opciones_pago.map((opcion, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
              >
                {opcion.tipo === 'upfront' && 'Pago Total'}
                {opcion.tipo === 'milestones' && 'Pagos por Hitos'}
                {opcion.tipo === 'financing' && 'Financiamiento'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detalles expandibles */}
      {isExpanded && (
        <CotizacionDetalles
          cotizacion={cotizacion}
          onAcceptQuotation={onAcceptQuotation}
        />
      )}

      {/* Click indicator */}
      <div className="text-center pt-3 border-t border-gray-200">
        <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 mx-auto transition-colors">
          {isExpanded ? (
            <>
              <span>▲</span> <span>Ver menos</span>
            </>
          ) : (
            <>
              <span>▼</span> <span>Ver detalles completos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CotizacionCard;
