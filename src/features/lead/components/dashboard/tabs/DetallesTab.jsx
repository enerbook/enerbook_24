import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useRouter } from 'expo-router';
import { useLeadDashboardData } from '../../../context/LeadDashboardDataContext';

const DetallesTab = () => {
  const { reciboData, resumenEnergetico, sistemaData, consumoData, hasData } = useLeadDashboardData();
  const router = useRouter();

  const handleSolicitarCotizaciones = () => {
    // Leads siempre redirigen a signup
    router.push('/signup');
  };

  return (
    <main className="flex-1 px-2 lg:px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-6 lg:space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="w-full lg:w-1/2">
          <div className="p-4 lg:p-6 rounded-lg border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#fcfcfc' }}>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="w-full lg:w-auto lg:ml-8">
              <button
                onClick={handleSolicitarCotizaciones}
                className="bg-gray-900 hover:bg-black text-white rounded-2xl px-5 py-3 transition-all group w-full lg:w-auto"
              >
                <div className="text-center">
                  <h3 className="text-sm font-bold mb-1">Solicitar</h3>
                  <h3 className="text-sm font-bold mb-2">Cotizaciones</h3>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FiChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Datos del Recibo CFE Section */}
        <div className="w-full lg:w-1/2">
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Datos del Recibo Cfe</h2>
            <div className="space-y-3">
              {hasData && reciboData ? (
                <>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Cliente</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.nombre || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">No. de Servicio</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.no_servicio || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">RMU</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.RMU || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Cuenta</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.cuenta || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Tarifa</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.tarifa || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Multiplicador</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.multiplicador || 'No disponible'}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Dirección</p>
                    <p className="font-semibold text-gray-900 text-sm">{reciboData.direccion || reciboData.direccion_formatted || 'No disponible'}</p>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                  <p className="text-gray-500 text-sm">Cargando datos del recibo CFE...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="py-4"></div>

        {/* Barras de Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Resumen Energético */}
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h3 className="text-sm font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-3">Resumen Energético</h3>
            <div className="space-y-3">
              {hasData ? (
                <>
                  <div className="rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
                    <span className="text-sm">{resumenEnergetico?.consumo_max || Math.max(...(consumoData.map(item => parseInt(item.consumo)) || [0]))}</span>
                    <span className="text-sm">Consumo Máximo (kWh)</span>
                  </div>
                  <div className="rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
                    <span className="text-sm">{resumenEnergetico?.consumo_promedio || Math.round((consumoData.reduce((sum, item) => sum + parseInt(item.consumo), 0) || 0) / (consumoData.length || 1))}</span>
                    <span className="text-sm">Consumo Promedio (kWh)</span>
                  </div>
                  <div className="rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
                    <span className="text-sm">{resumenEnergetico?.periodos_analizados || consumoData.length || '0'}</span>
                    <span className="text-sm">Períodos Analizados</span>
                  </div>
                  <div className="rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
                    <span className="text-sm">{((resumenEnergetico?.consumo_max || Math.max(...(consumoData.map(item => parseInt(item.consumo)) || [0]))) * 12).toLocaleString()}</span>
                    <span className="text-sm">Consumo Anual Máx (kWh)</span>
                  </div>
                </>
              ) : (
                <div className="rounded-lg h-10 flex items-center justify-center px-4 text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
                  <span className="text-sm">Cargando datos energéticos...</span>
                </div>
              )}
            </div>
          </div>

          {/* Dimensionamiento del Sistema Solar */}
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Dimensionamiento del Sistema Solar</h3>
            <div className="space-y-3">
              {hasData && sistemaData ? (
                <>
                  <div className="bg-gray-900 rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm">
                    <span className="text-sm">{sistemaData.results?.kWp_needed || '0'}</span>
                    <span className="text-sm">kWp Requeridos</span>
                  </div>
                  <div className="bg-gray-900 rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm">
                    <span className="text-sm">{sistemaData.results?.panel_wp || '550'}</span>
                    <span className="text-sm">Wp por Panel</span>
                  </div>
                  <div className="bg-gray-900 rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm">
                    <span className="text-sm">{sistemaData.results?.n_panels || '0'}</span>
                    <span className="text-sm">Número de Paneles</span>
                  </div>
                  <div className="bg-gray-900 rounded-lg h-10 flex items-center justify-between px-4 text-white font-bold shadow-sm">
                    <span className="text-sm">{(sistemaData.results?.yearly_prod || 0).toLocaleString()}</span>
                    <span className="text-sm">Producción Anual (kWh)</span>
                  </div>
                </>
              ) : (
                <div className="bg-gray-900 rounded-lg h-10 flex items-center justify-center px-4 text-white font-bold shadow-sm">
                  <span className="text-sm">Cargando dimensionamiento...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetallesTab;
