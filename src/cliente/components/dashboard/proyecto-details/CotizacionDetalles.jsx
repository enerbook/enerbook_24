import React from 'react';
import PanelesInfo from './PanelesInfo';
import InversoresInfo from './InversoresInfo';
import EstructuraInfo from './EstructuraInfo';
import SistemaElectricoInfo from './SistemaElectricoInfo';

const CotizacionDetalles = ({ cotizacion, onAcceptQuotation }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
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
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">Notas del Proveedor</h4>
          <p className="text-xs text-blue-800">{cotizacion.notas_proveedor}</p>
        </div>
      )}

      {/* Contacto */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <p>📧 {cotizacion.proveedores?.email}</p>
          <p>📞 {cotizacion.proveedores?.telefono}</p>
        </div>
        {cotizacion.estado === 'pendiente' && (
          <button
            onClick={() => onAcceptQuotation(cotizacion)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            Aceptar Cotización
          </button>
        )}
      </div>
    </div>
  );
};

export default CotizacionDetalles;
