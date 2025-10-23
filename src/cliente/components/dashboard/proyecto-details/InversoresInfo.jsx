import React from 'react';

const InversoresInfo = ({ inversores }) => {
  if (!inversores) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">Inversor</h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div><span className="font-medium">Marca:</span> {inversores.marca}</div>
        <div><span className="font-medium">Modelo:</span> {inversores.modelo}</div>
        <div><span className="font-medium">Tipo:</span> {inversores.tipo}</div>
        <div><span className="font-medium">Potencia:</span> {inversores.potencia_kw} kW</div>
        {inversores.precio && (
          <div className="col-span-2">
            <span className="font-medium">Precio:</span> ${inversores.precio.toLocaleString()} MXN
          </div>
        )}
      </div>
    </div>
  );
};

export default InversoresInfo;
