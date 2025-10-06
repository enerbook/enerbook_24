import React from 'react';

const HistorialConsumoTable = ({ consumoHistorico }) => {
  if (!consumoHistorico || consumoHistorico.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold text-gray-900 mb-3">Historial de Consumo</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Período</th>
              <th className="text-right py-2 font-medium text-gray-600">Consumo (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {consumoHistorico.slice(0, 6).map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 font-medium text-gray-900">{item.periodo}</td>
                <td className="py-2 text-right text-gray-900">{item.kwh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialConsumoTable;
