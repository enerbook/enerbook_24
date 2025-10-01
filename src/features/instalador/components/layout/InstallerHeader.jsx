import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../context/AuthContext';

const InstallerHeader = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Installer header logout button clicked');
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="w-full bg-gray-50 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Panel de Instalador</h2>
        <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center px-2 py-1.5 text-left rounded-md transition-colors text-gray-400 hover:bg-white hover:text-gray-700"
      >
        <div className="w-5 h-5 rounded-md flex items-center justify-center mr-2 bg-transparent">
          <FiLogOut
            className="w-2.5 h-2.5"
            style={{ color: '#F59E0B' }}
          />
        </div>
        <span className="text-sm font-medium">Cerrar Sesión</span>
      </button>
    </header>
  );
};

export default InstallerHeader;
