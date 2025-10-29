import React from 'react';
import { FiUser, FiCheck, FiX } from 'react-icons/fi';

const PersonalSection = ({
  formData,
  isEditing,
  isLoading,
  error,
  userName,
  userEmail,
  onEdit,
  onCancel,
  onSave,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 border border-orange-200 text-orange-800 rounded-lg" style={{backgroundColor: '#FFF7ED'}}>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
            <FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{formData.nombre || userName}</h3>
            <p className="text-sm text-gray-600">{formData.correo_electronico || userEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="px-6 py-2 rounded-full text-white text-sm font-medium w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-1 flex-1 sm:flex-initial"
              >
                <FiX className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={onSave}
                disabled={isLoading}
                className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50 flex-1 sm:flex-initial"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
              >
                <FiCheck className="w-4 h-4" />
                {isLoading ? 'Guardando...' : 'Aceptar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Nombre Completo</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => onInputChange('nombre', e.target.value)}
            placeholder="Tu Nombre Completo"
            disabled={!isEditing}
            className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
          />
        </div>

        {/* RFC */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Registro Federal de Contribuyentes</label>
          <input
            type="text"
            value={formData.rfc}
            onChange={(e) => onInputChange('rfc', e.target.value)}
            placeholder="Tu RFC"
            disabled={!isEditing}
            className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
          />
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Género</label>
          <select
            value={formData.genero}
            onChange={(e) => onInputChange('genero', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
          >
            <option value="">Seleccionar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Número Celular</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => onInputChange('telefono', e.target.value)}
            placeholder="2223231891"
            disabled={!isEditing}
            className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Mi correo electrónico</label>
          <div className="relative">
            <input
              type="email"
              value={formData.correo_electronico}
              onChange={(e) => onInputChange('correo_electronico', e.target.value)}
              placeholder="ejemplo@enerbook.mx"
              disabled={!isEditing}
              className={`w-full px-4 py-2.5 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
            />
            <div className="absolute left-3 top-2.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" fill="none" />
                <path d="M22 6L12 13L2 6" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => onInputChange('fecha_nacimiento', e.target.value)}
            placeholder="dd/mm/yyyy"
            disabled={!isEditing}
            className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalSection;
