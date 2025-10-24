import React from 'react';

const SistemaElectricoInfo = ({ sistemaElectrico }) => {
  if (!sistemaElectrico) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">Sistema Eléctrico e Instalación</h4>
      <div className="space-y-2 text-xs text-gray-700">
        {sistemaElectrico.descripcion && (
          <div>
            <span className="font-medium">Descripción:</span>
            <p className="mt-1">{sistemaElectrico.descripcion}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {sistemaElectrico.precio && (
            <div><span className="font-medium">Precio:</span> ${sistemaElectrico.precio.toLocaleString()} MXN</div>
          )}
          {sistemaElectrico.tiempo_instalacion_dias && (
            <div><span className="font-medium">Tiempo de Instalación:</span> {sistemaElectrico.tiempo_instalacion_dias} días</div>
          )}
          {sistemaElectrico.garantia_instalacion_anos && (
            <div className="col-span-2"><span className="font-medium">Garantía de Instalación:</span> {sistemaElectrico.garantia_instalacion_anos} años</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SistemaElectricoInfo;
