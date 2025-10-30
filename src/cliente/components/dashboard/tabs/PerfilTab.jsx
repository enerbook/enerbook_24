import React, { useState, useEffect } from 'react';
import { FiUser, FiBell, FiLock, FiCreditCard } from 'react-icons/fi';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';
import { useClienteAuth } from '../../../context/ClienteAuthContext';
import { GRADIENTS } from '../../../../shared/config/gradients';

// Import section components
import PersonalSection from './perfil-sections/PersonalSection';
import NotificacionesSection from './perfil-sections/NotificacionesSection';
import SeguridadSection from './perfil-sections/SeguridadSection';
import PagosSection from './perfil-sections/PagosSection';

const PerfilTab = () => {
  const { userData, reciboData } = useClienteDashboardData();
  const { userType, user, updateClientProfile, refreshClientData } = useClienteAuth();

  // Estado para tabs internos
  const [activeSubTab, setActiveSubTab] = useState('personal');

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

  // Guardar cambios usando el contexto de cliente
  const handleSave = async () => {
    if (!user?.id) {
      setError('No se puede guardar: usuario no identificado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        nombre: formData.nombre,
        rfc: formData.rfc,
        genero: formData.genero,
        telefono: formData.telefono,
        correo_electronico: formData.correo_electronico,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };

      // Actualizar perfil usando el contexto de cliente
      await updateClientProfile(updateData);

      // Salir del modo edición
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al guardar los cambios: ' + error.message);
    } finally {
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

  // Definición de tabs
  const tabs = [
    { id: 'personal', label: 'Personal', icon: FiUser },
    { id: 'notificaciones', label: 'Notificaciones', icon: FiBell },
    { id: 'seguridad', label: 'Seguridad', icon: FiLock },
    { id: 'pagos', label: 'Pagos', icon: FiCreditCard }
  ];

  // Renderizar contenido según tab activo
  const renderContent = () => {
    switch (activeSubTab) {
      case 'personal':
        return (
          <PersonalSection
            formData={formData}
            isEditing={isEditing}
            isLoading={isLoading}
            error={error}
            userName={userName}
            userEmail={userEmail}
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            onInputChange={handleInputChange}
          />
        );
      case 'notificaciones':
        return <NotificacionesSection userId={user?.id} />;
      case 'seguridad':
        return <SeguridadSection userEmail={userEmail} />;
      case 'pagos':
        return <PagosSection userId={user?.id} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-4">
        {/* Tabs Navigation + Content */}
        <div className="p-4 lg:p-8 rounded-lg border border-gray-200" style={{ backgroundColor: '#fcfcfc' }}>
          {/* Horizontal Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive ? { background: GRADIENTS.primary } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerfilTab;
