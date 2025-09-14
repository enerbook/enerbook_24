import React from 'react';

const ProyectosTab = () => {
  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Cotizaciones */}
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Cotizaciones</h2>
            {/* Proyecto 1 */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">Proyecto 1</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Proyecto:</span><span className="text-gray-900">Paneles para Casa en Cholula</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Estado:</span><span className="text-gray-900">Abierto</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Cotizaciones:</span><span className="text-gray-900">3</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fecha límite:</span><span className="text-gray-900">12 de agosto 2025</span></div>
              </div>
              <button className="w-full mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>Ver Cotizaciones</button>
            </div>
            {/* Proyecto 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Proyecto 2</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Proyecto:</span><span className="text-gray-900">Paneles para tienda de abarrotes</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Estado:</span><span className="text-gray-900">Cerrado</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Cotizaciones:</span><span className="text-gray-900">7</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fecha límite:</span><span className="text-gray-900">25 de abril 2025</span></div>
              </div>
              <button className="w-full mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>Ver Cotizaciones</button>
            </div>
          </div>

          {/* Mis Contratos */}
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Contratos</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Proyecto 1</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Proyecto:</span><span className="text-gray-900">Sistema Solar Casa Metepec</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Proveedor:</span><span className="text-gray-900">Solaris Energy</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Producción Estimada:</span><span className="text-gray-900">5,410 kWh/año</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Precio Final:</span><span className="text-gray-900">$55,000 MXN</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Garantía:</span><span className="text-gray-900">POPTR 238043</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tipo de Pago:</span><span className="text-gray-900">Financiamiento (48 meses)</span></div>
              </div>
              <button className="w-full mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>Ver Proyecto</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProyectosTab;
