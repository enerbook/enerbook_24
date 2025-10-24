import React from 'react';
import PanelesInfo from './PanelesInfo';
import InversoresInfo from './InversoresInfo';
import EstructuraInfo from './EstructuraInfo';
import SistemaElectricoInfo from './SistemaElectricoInfo';

const CotizacionDetalles = ({ cotizacion, onAcceptQuotation }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      {/* Resumen Principal: Capacidad, Producción y Precio */}
      {(cotizacion.precio_final?.capacidad_sistema_kwp || cotizacion.precio_final?.produccion_anual_kwh || cotizacion.precio_final?.total) && (
        <div className="grid grid-cols-3 gap-3">
          {cotizacion.precio_final?.capacidad_sistema_kwp && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Capacidad del Sistema</p>
              <p className="text-sm font-bold text-gray-900">
                {cotizacion.precio_final.capacidad_sistema_kwp.toFixed(2)} kWp
              </p>
            </div>
          )}
          {cotizacion.precio_final?.produccion_anual_kwh && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Producción Estimada</p>
              <p className="text-sm font-bold text-gray-900">
                {Math.round(cotizacion.precio_final.produccion_anual_kwh).toLocaleString('es-MX')} kWh/año
              </p>
            </div>
          )}
          {cotizacion.precio_final?.total && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Precio Final</p>
              <p className="text-sm font-bold text-gray-900">
                ${Math.round(cotizacion.precio_final.total).toLocaleString('es-MX')} MXN
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paneles */}
      <PanelesInfo paneles={cotizacion.paneles} />

      {/* Inversores */}
      <InversoresInfo inversores={cotizacion.inversores} />

      {/* Estructura */}
      <EstructuraInfo estructura={cotizacion.estructura} />

      {/* Sistema Eléctrico */}
      <SistemaElectricoInfo sistemaElectrico={cotizacion.sistema_electrico} />

      {/* Notas del proveedor */}
      {cotizacion.notas_proveedor && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-900 mb-2">Notas del Proveedor</h4>
          <p className="text-xs text-gray-700">{cotizacion.notas_proveedor}</p>
        </div>
      )}

      {/* Contacto - Solo después de aceptar */}
      {cotizacion.estado !== 'pendiente' && (
        <div className="pt-3">
          <div className="text-xs text-gray-600 space-y-1 mb-3">
            <p className="font-semibold text-gray-900 mb-2">Información de Contacto</p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {cotizacion.proveedores?.email}
            </p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {cotizacion.proveedores?.telefono}
            </p>
          </div>
        </div>
      )}

      {/* Botón aceptar - Solo si está pendiente */}
      {cotizacion.estado === 'pendiente' && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => onAcceptQuotation(cotizacion)}
            className="px-6 py-3 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            Aceptar Cotización
          </button>
        </div>
      )}
    </div>
  );
};

export default CotizacionDetalles;
