import React from 'react';
import { FiUser, FiLogOut, FiFolder } from 'react-icons/fi';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { useRouter } from 'expo-router';
import NavButton from './common/NavButton';

const ClientSidebar = ({ activeTab, onClose }) => {
  const { user, logout } = useClienteAuth();
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
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            const handleClick = () => {
              if (item.action) {
                item.action();
              } else {
                router.push(`/cliente-panel/${item.id}`);
                if (onClose) onClose();
              }
            };

            return (
              <NavButton
                key={item.id}
                item={item}
                isActive={isActive}
                onClick={handleClick}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ClientSidebar;
