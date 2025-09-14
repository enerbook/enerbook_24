import React from 'react';
import { FiChevronRight, FiUser } from 'react-icons/fi';

const PerfilTab = () => {
  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="p-8 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="ml-12">
              <button className="bg-gray-900 hover:bg-black text-white rounded-2xl px-8 py-6 transition-all group">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-1">SOLICITAR</h3>
                  <h3 className="text-lg font-bold mb-3">COTIZACIONES</h3>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FiChevronRight className="w-4 h-4 text-gray-900" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="py-4"></div>

        {/* Welcome Message */}
        <div className="ml-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, Diego Herold Carranza Juárez</h2>
          <p className="text-gray-400 text-sm">Miércoles Agosto 6 del 2025</p>
        </div>

        <div className="py-4"></div>

        {/* Profile Form */}
        <div className="p-8 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Diego Herold Carranza Juárez</h3>
                <p className="text-sm text-gray-600">diegocarranzajuarez@enerbook.mx</p>
              </div>
            </div>
            <button
              className="px-6 py-2 rounded-full text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
            >
              Editar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Nombre Completo</label><input type="text" placeholder="Tu Nombre Completo" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Registro Federal de Contribuyentes</label><input type="text" placeholder="Tu RFC" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Género</label><select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"><option>Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Número Celular</label><input type="tel" placeholder="Tu Número Celular" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Mi correo electrónico</label>
              <div className="relative">
                <input type="email" placeholder="ejemplo@enerbook.mx" className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <div className="absolute left-3 top-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" fill="none" /><path d="M22 6L12 13L2 6" stroke="white" strokeWidth="2" fill="none" /></svg></div>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Nacimiento</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" /></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerfilTab;
