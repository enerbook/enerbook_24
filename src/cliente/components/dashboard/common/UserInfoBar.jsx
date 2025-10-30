import React from 'react';
import { useClienteAuth } from '../../../context/ClienteAuthContext';
import { useClienteDashboardData } from '../../../context/ClienteDashboardDataContext';
import { GRADIENTS } from '../../../../shared/config/gradients';

const UserInfoBar = ({ cotizacionInicial = null }) => {
  const { userType } = useClienteAuth();
  const dashboardData = useClienteDashboardData();

  // Usar cotizacionInicial del proyecto si existe, sino datos del dashboard
  const reciboData = cotizacionInicial?.recibo_cfe || dashboardData.reciboData;
  const userData = dashboardData.userData;
  const hasData = !!reciboData;

  // Determinar datos según tipo de usuario
  let userName = 'Usuario';
  let serviceNumber = 'N/A';
  let address = 'Dirección no disponible';

  if (userType === 'cliente' && hasData && reciboData) {
    // Para clientes con datos de recibo
    userName = reciboData.nombre || 'Usuario';
    serviceNumber = reciboData.no_servicio || 'N/A';
    address = reciboData.direccion_formatted || reciboData.direccion || 'Dirección no disponible';
  } else if (userType === 'cliente' && userData) {
    // Para clientes sin recibo pero con datos de usuario
    userName = userData.nombre || 'Cliente';
    serviceNumber = 'Sin recibo';
    address = 'Dirección no registrada';
  }

  return (
    <>
      {/* Usuario */}
      <div
        className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between overflow-hidden"
        style={{ backgroundColor: "#fcfcfc" }}
      >
        <div className="min-w-0 pr-3 flex-1 overflow-hidden">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">Usuario</p>
          <p className="text-[17px] font-extrabold text-gray-900 mt-1 leading-none truncate">
            {userName}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">No. Servicio: {serviceNumber}</p>
        </div>
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0"
          style={{ background: GRADIENTS.primary }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Dirección */}
      <div
        className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between overflow-hidden"
        style={{ backgroundColor: "#fcfcfc" }}
      >
        <div className="min-w-0 pr-3 flex-1 overflow-hidden">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">Dirección</p>
          <p className="text-[17px] font-extrabold text-gray-900 mt-1 leading-none truncate">
            {address}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">Ubicación del servicio</p>
        </div>
        <div
          className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0"
          style={{ background: GRADIENTS.primary }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 11.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Zm0-9a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" fill="white" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default UserInfoBar;
