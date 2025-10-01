import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

const LeadHeader = () => {
  const { leadData } = useAuth();
  const userName = leadData?.recibo_cfe?.nombre || 'Usuario';

  return (
    <header className="w-full bg-gray-50 px-8 py-4">
      <h2 className="text-sm font-bold text-gray-900">
        ¡Hola {userName}! Tu análisis energético está listo
      </h2>
      <p className="text-gray-400 text-sm">
        Descubre tu potencial de ahorro con energía solar • {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </header>
  );
};

export default LeadHeader;
