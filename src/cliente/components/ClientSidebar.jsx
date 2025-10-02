import React from 'react';
import { FiUser, FiLogOut, FiFolder, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// Navigation button component
const NavButton = ({ item, activeTab, setActiveTab, onClose }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
      if (onClose) onClose();
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
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
};

const ClientSidebar = ({ activeTab, setActiveTab, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const sidebarItems = [
    { id: 'proyectos', label: 'Proyectos', icon: FiFolder },
    { id: 'perfil', label: 'Perfil', icon: FiUser },
    { id: 'configuracion', label: 'Configuración', icon: FiSettings },
    { id: 'cerrar-sesion', label: 'Cerrar Sesión', icon: FiLogOut, action: handleLogout },
  ];

  return (
    <div className="flex w-64 lg:w-48 bg-white lg:bg-gray-50 flex-col h-full lg:max-h-screen shadow-xl lg:shadow-none">
      <div className="p-2 -mt-6 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src="/img/FulllogoColor.svg" alt="Enerbook" className="h-32 w-auto" />
        </div>
      </div>

      <nav className="flex-1 px-2 -mt-6 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ClientSidebar;
