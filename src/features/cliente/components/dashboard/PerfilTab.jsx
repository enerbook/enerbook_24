import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiUser, FiCheck, FiX } from 'react-icons/fi';
import { useDashboardData } from '../../../../context/DashboardDataContext';
import { useAuth } from '../../../../context/AuthContext';
import { supabase } from '../../../../lib/supabaseClient';

const PerfilTab = () => {
  const { userData, reciboData } = useDashboardData();
  const { userType, user, fetchClientData, setClientData } = useAuth();

  // Estados para modo edición
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determinar nombre del usuario
  const userName = (() => {
    if (userType === 'cliente' && userData?.nombre) {
      return userData.nombre;
    } else if (reciboData?.nombre) {
      return reciboData.nombre;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  })();

  const userEmail = user?.email || userData?.correo_electronico || 'email@ejemplo.com';

  // Estados para valores de los campos
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    genero: '',
    telefono: '',
    correo_electronico: '',
    fecha_nacimiento: ''
  });

  // Inicializar valores cuando se carga userData
  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || userName,
        rfc: userData.rfc || '',
        genero: userData.genero || '',
        telefono: userData.telefono || '',
        correo_electronico: userData.correo_electronico || userEmail,
        fecha_nacimiento: userData.fecha_nacimiento || ''
      });
    }
  }, [userData, userName, userEmail]);

  // Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Guardar cambios en Supabase
  const handleSave = async () => {
    console.log('handleSave - Starting save process');
    console.log('handleSave - user:', user);
    console.log('handleSave - formData:', formData);

    if (!user?.id) {
      setError('No se puede guardar: usuario no identificado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('handleSave - Updating Supabase for user ID:', user.id);

      const updateData = {
        nombre: formData.nombre,
        rfc: formData.rfc,
        genero: formData.genero,
        telefono: formData.telefono,
        correo_electronico: formData.correo_electronico,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };

      console.log('handleSave - Update data:', updateData);

      // Actualizar en Supabase
      const { data: updateResult, error: updateError } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', user.id);

      console.log('handleSave - Supabase update result:', updateResult);
      console.log('handleSave - Supabase update error:', updateError);

      if (updateError) {
        throw updateError;
      }

      console.log('handleSave - Update successful, fetching client data');

      // Actualizar datos en el contexto
      const updatedClientData = await fetchClientData(user.id);
      console.log('handleSave - Updated client data:', updatedClientData);

      setClientData(updatedClientData);

      // Salir del modo edición
      setIsEditing(false);
      console.log('Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al guardar los cambios: ' + error.message);
    } finally {
      console.log('handleSave - Setting loading to false');
      setIsLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    // Restaurar valores originales
    if (userData) {
      setFormData({
        nombre: userData.nombre || userName,
        rfc: userData.rfc || '',
        genero: userData.genero || '',
        telefono: userData.telefono || '',
        correo_electronico: userData.correo_electronico || userEmail,
        fecha_nacimiento: userData.fecha_nacimiento || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  // Fecha actual
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        {/* Top Section - Cotizar energía solar */}
        <div className="p-8 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                Cotiza energía solar de forma segura
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
              </p>
            </div>
            <div className="ml-12">
              <button className="bg-gray-900 hover:bg-black text-white rounded-2xl px-8 py-6 transition-all group">
                <div className="text-center">
                  <h3 className="text-sm font-bold mb-1">Solicitar</h3>
                  <h3 className="text-sm font-bold mb-3">Cotizaciones</h3>
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
          <h2 className="text-sm font-bold text-gray-900 mb-2">Bienvenido, {formData.nombre || userName}</h2>
          <p className="text-gray-400 text-sm">{currentDate}</p>
        </div>

        <div className="py-4"></div>

        {/* Profile Form */}
        <div className="p-8 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-orange-200 text-orange-800 rounded-lg" style={{backgroundColor: '#FFF7ED'}}>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{formData.nombre || userName}</h3>
                <p className="text-sm text-gray-600">{formData.correo_electronico || userEmail}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-full text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
                >
                  Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                  >
                    <FiX className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
                  >
                    <FiCheck className="w-4 h-4" />
                    {isLoading ? 'Guardando...' : 'Aceptar'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Tu Nombre Completo"
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
              />
            </div>

            {/* RFC */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Registro Federal de Contribuyentes</label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => handleInputChange('rfc', e.target.value)}
                placeholder="Tu RFC"
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Género</label>
              <select
                value={formData.genero}
                onChange={(e) => handleInputChange('genero', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
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
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="Tu Número Celular"
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Mi correo electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.correo_electronico}
                  onChange={(e) => handleInputChange('correo_electronico', e.target.value)}
                  placeholder="ejemplo@enerbook.mx"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                />
                <div className="absolute left-3 top-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}>
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
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerfilTab;
