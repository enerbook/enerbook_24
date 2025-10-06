import React from 'react';

const EstructuraInfo = ({ estructura }) => {
  if (!estructura) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">Estructura</h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div><span className="font-medium">Tipo:</span> {estructura.tipo}</div>
        <div><span className="font-medium">Material:</span> {estructura.material}</div>
        {estructura.precio && (
          <div className="col-span-2">
            <span className="font-medium">Precio:</span> ${estructura.precio.toLocaleString()} MXN
          </div>
        )}
      </div>
    </div>
  );
};

export default EstructuraInfo;
