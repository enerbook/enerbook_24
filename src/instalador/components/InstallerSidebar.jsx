import React from 'react';
import { FiFileText, FiFolder, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS } from '../../shared/config/colors';

// Navigation button component
const NavButton = ({ item, activeTab, onClose, router }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    if (item.action) {
      item.action();
    } else {
      const route = item.id === 'proyectos' ? '/instalador-panel' : `/instalador-panel/${item.id}`;
      router.push(route);
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
          style={isActive ? {} : { color: COLORS.primary }}
        />
      </div>
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
};

const InstallerSidebar = ({ activeTab, onClose }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const sidebarItems = [
    { id: 'cotizaciones', label: 'Cotizaciones', icon: FiFileText },
    { id: 'mis-cotizaciones', label: 'Mis Cotizaciones', icon: FiFileText },
    { id: 'proyectos', label: 'Proyectos', icon: FiFolder },
  ];

  const accountItems = [
    { id: 'perfil', label: 'Perfil', icon: FiUser },
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
        {/* Main Navigation */}
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} onClose={onClose} router={router} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Account Navigation */}
        <div>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <NavButton key={item.id} item={item} activeTab={activeTab} onClose={onClose} router={router} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default InstallerSidebar;
