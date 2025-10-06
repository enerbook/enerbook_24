import React from 'react';

const PanelesInfo = ({ paneles }) => {
  if (!paneles) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">Paneles Solares</h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div><span className="font-medium">Marca:</span> {paneles.marca}</div>
        <div><span className="font-medium">Modelo:</span> {paneles.modelo}</div>
        <div><span className="font-medium">Cantidad:</span> {paneles.cantidad}</div>
        <div><span className="font-medium">Potencia:</span> {paneles.potencia_wp}W</div>
        {paneles.precio && (
          <div className="col-span-2">
            <span className="font-medium">Precio:</span> ${paneles.precio.toLocaleString()} MXN
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelesInfo;
