import React from 'react';
import { FiGrid, FiPieChart, FiFileText, FiSun, FiUser, FiLogOut, FiAward, FiFolder } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// Combined navigation button component for consistency
const NavButton = ({ item, activeTab, setActiveTab }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    console.log('NavButton clicked:', item.id, 'has action:', !!item.action);
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <button
      key={item.id}
      onClick={handleClick}
      className={`w-full flex items-center px-2 py-1.5 text-left rounded-md transition-colors ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:bg-white hover:text-gray-700'
      }`}>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 ${
          isActive ? 'bg-gray-800' : 'bg-transparent'
        }`}>
        <Icon 
          className={`w-2.5 h-2.5 ${isActive ? 'text-white' : ''}`}
          style={isActive ? {} : { color: '#F59E0B' }}
        />
      </div>
      <span className="text-xs font-medium">{item.label}</span>
    </button>
  );
};


const UnifiedSidebar = ({ activeTab, setActiveTab }) => {
  const { user, userType, logout } = useAuth();
  const router = useRouter();

  // Debug log
  console.log('UnifiedSidebar - user:', user?.email, 'userType:', userType);

  const handleLogout = async () => {
    console.log('Logout button clicked, router:', router);
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Define navigation items for each role
  const baseClientSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'consumo', label: 'Consumo', icon: FiPieChart },
    { id: 'irradiacion', label: 'Irradiación', icon: FiSun },
    { id: 'detalles', label: 'Detalles', icon: FiFileText },
  ];

  const clientSidebarItems = user
    ? [
        ...baseClientSidebarItems,
        { id: 'proyectos', label: 'Proyectos', icon: FiFolder },
      ]
    : baseClientSidebarItems;

  const installerSidebarItems = [
    { id: 'documentos', label: 'Documentos', icon: FiFileText },
    { id: 'certificaciones', label: 'Certificaciones', icon: FiAward },
    { id: 'proyectos', label: 'Proyectos', icon: FiFolder },
  ];

  const commonAccountItems = [
    { id: 'perfil', label: 'Perfil', icon: FiUser },
    { id: 'cerrar-sesion', label: 'Cerrar Sesión', icon: FiLogOut, action: handleLogout },
  ];

  // Determinar qué items mostrar basado en el tipo de usuario
  let sidebarItems;
  if (userType === 'instalador') {
    sidebarItems = installerSidebarItems;
  } else if (userType === 'cliente') {
    sidebarItems = clientSidebarItems;
  } else {
    // Si no hay userType definido, mostrar items básicos
    sidebarItems = [];
  }

  console.log('Sidebar items to show:', sidebarItems.map(item => item.label));

  return (
    <div className="hidden lg:flex lg:w-54 bg-gray-50 flex-col max-h-screen">
      <div className="p-2 -mt-6 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src="/img/FulllogoColor.svg" alt="Enerbook" className="h-32 w-auto" />
        </div>
      </div>

      <nav className="flex-1 px-2 -mt-6 overflow-y-auto">
        {/* Main Navigation */}
        {userType && sidebarItems.length > 0 && (
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <NavButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
            ))}
          </div>
        )}

        {/* Account Navigation */}
        {userType && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
              Cuenta
            </h3>
            <div className="space-y-1">
              {commonAccountItems.map((item) => (
                 <NavButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {!userType && user && (
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-gray-400 text-xs">Cargando...</div>
          </div>
        )}

        {/* TODO: Add ProgressTracker and Chatbot back for client users */}
      </nav>
    </div>
  );
};

export default UnifiedSidebar;
