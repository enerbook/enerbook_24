import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UnifiedHeader = () => {
  const { user, userType } = useAuth();

  const DashboardHeader = () => (
    <div className="bg-gray-50 px-8 py-4">
      <h2 className="text-2xl font-bold text-gray-900">Bienvenido a enerbook</h2>
      <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  );

  return (
    <header className="w-full">
      {/* Mobile Header could be unified here as well if needed */}
      
      {/* Desktop Header Content */}
      {userType === 'instalador' || userType === 'cliente' ? (
        <DashboardHeader />
      ) : (
        <div className="px-8 py-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </div>
      )}
    </header>
  );
};

export default UnifiedHeader;
