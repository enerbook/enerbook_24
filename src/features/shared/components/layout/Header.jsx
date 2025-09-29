import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../context/AuthContext';

const UnifiedHeader = () => {
  const { user, userType, leadData, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Header logout button clicked');
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const DashboardHeader = () => (
    <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Bienvenido a Enerbook</h2>
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
    </div>
  );

  const LeadHeader = () => {
    const userName = leadData?.recibo_cfe?.nombre || 'Usuario';
    return (
      <div className="bg-gray-50 px-8 py-4">
        <h2 className="text-sm font-bold text-gray-900">
          ¡Hola {userName}! Tu análisis energético está listo
        </h2>
        <p className="text-gray-400 text-sm">
          Descubre tu potencial de ahorro con energía solar • {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    );
  };

  return (
    <header className="w-full">
      {/* Mobile Header could be unified here as well if needed */}

      {/* Desktop Header Content */}
      {userType === 'instalador' || userType === 'cliente' ? (
        <DashboardHeader />
      ) : userType === 'lead' ? (
        <LeadHeader />
      ) : (
        <div className="px-8 py-4">
          <h2 className="text-sm font-bold">Dashboard</h2>
        </div>
      )}
    </header>
  );
};

export default UnifiedHeader;
