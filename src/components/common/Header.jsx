import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UnifiedHeader = () => {
  const { user, userType, leadData } = useAuth();

  const DashboardHeader = () => (
    <div className="bg-gray-50 px-8 py-4">
      <h2 className="text-sm font-bold text-gray-900">Bienvenido a Enerbook</h2>
      <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
