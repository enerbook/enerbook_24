import React from 'react';

const SistemaElectricoInfo = ({ sistemaElectrico }) => {
  if (!sistemaElectrico) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">Sistema Eléctrico</h4>
      <div className="text-xs text-gray-700">
        {sistemaElectrico.descripcion && (
          <p className="mb-2">{sistemaElectrico.descripcion}</p>
        )}
        {sistemaElectrico.precio && (
          <div>
            <span className="font-medium">Precio:</span> ${sistemaElectrico.precio.toLocaleString()} MXN
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaElectricoInfo;
