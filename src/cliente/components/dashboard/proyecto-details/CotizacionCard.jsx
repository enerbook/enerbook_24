import React from 'react';
import CotizacionDetalles from './CotizacionDetalles';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { GRADIENTS } from '../../../../shared/config/gradients';

const CotizacionCard = ({ cotizacion, cotizacionIndex, isExpanded, onToggle, onAcceptQuotation }) => {
  const getCotizacionEstadoBadge = (estado) => {
    const badges = {
      'pendiente': {
        gradient: GRADIENTS.pendiente,
        text: 'Pendiente',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      },
      'aceptada': {
        gradient: GRADIENTS.aceptada,
        text: 'Aceptada',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      },
      'rechazada': {
        gradient: GRADIENTS.rechazada,
        text: 'Rechazada',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700'
      }
    };
    return badges[estado] || badges['pendiente'];
  };

  const badge = getCotizacionEstadoBadge(cotizacion.estado);
  const precioFinal = cotizacion.precio_final?.total || 0;
  const cotizacionLabel = `Cotización ${cotizacionIndex}`;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 p-5 transition-all cursor-pointer"
      onClick={onToggle}
    >
      {/* Header de la cotización */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: GRADIENTS.primary }}
          >
            {cotizacionIndex}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {cotizacionLabel}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Propuesta de Instalador
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900">
            ${Math.round(precioFinal).toLocaleString('es-MX')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">MXN</p>
        </div>
      </div>

      {/* Estado Badge */}
      <span
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
        style={{ background: badge.gradient }}
      >
        {badge.text}
      </span>

      {/* Información breve */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cotizacion.paneles?.marca && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: GRADIENTS.primary }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: GRADIENTS.primary }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
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
          <p className="text-xs font-semibold text-gray-700 mb-2">Opciones de Pago</p>
          <div className="flex flex-wrap gap-2">
            {cotizacion.opciones_pago.map((opcion, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
              >
                {opcion.tipo === 'upfront' && 'Pago Contado'}
                {opcion.tipo === 'milestones' && 'Pagos por Hitos'}
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
      <div className="text-center pt-3">
        <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 mx-auto transition-colors">
          {isExpanded ? (
            <>
              <FiChevronUp className="w-4 h-4" />
              <span>Ver Menos</span>
            </>
          ) : (
            <>
              <FiChevronDown className="w-4 h-4" />
              <span>Ver Detalles Completos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CotizacionCard;
