import React from 'react';
import { FiUser, FiEdit3 } from 'react-icons/fi';

const ProfileTab = ({ userProfile }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Company Profile Card */}
      <div className="p-6 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
        {/* Company Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{userProfile.companyName}</h3>
              <p className="text-sm text-gray-600">{userProfile.email}</p>
            </div>
          </div>
          <button
            className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
          >
            <FiEdit3 className="w-4 h-4" />
            Editar
          </button>
        </div>

        {/* Form Fields Grid - 2 columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Nombre del Representante Legal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nombre del Representante Legal</label>
            <input
              type="text"
              placeholder="Nombre del Representante Legal"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
            />
          </div>

          {/* Fecha de Fundación */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Fundación</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Seleccionar"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
              />
              <div className="absolute right-3 top-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Teléfono Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono Celular</label>
            <input
              type="tel"
              placeholder="Tu Teléfono Celular"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
            />
          </div>

          {/* CURP del Representante Legal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">CURP del Representante Legal</label>
            <input
              type="text"
              placeholder="Tu CURP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
            />
          </div>

          {/* Dirección Fiscal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Dirección Fiscal</label>
            <input
              type="text"
              placeholder="Tu Dirección Fiscal"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
            />
          </div>

          {/* Descripción de la Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Descripción de la Empresa</label>
            <textarea
              placeholder="Escribe aquí más detalles de la empresa"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500 resize-none"
            ></textarea>
          </div>

          {/* Registro Federal de Contribuyentes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Registro Federal de Contribuyentes</label>
            <input
              type="text"
              placeholder="Tu RFC"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500"
            />
          </div>

          {/* Estados de Operación */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Estados de Operación</label>
            <div className="relative">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-500 appearance-none">
                <option>Seleccionar</option>
                <option>Ciudad de México</option>
                <option>Estado de México</option>
                <option>Jalisco</option>
                <option>Nuevo León</option>
                <option>Puebla</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10l5 5 5-5z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
