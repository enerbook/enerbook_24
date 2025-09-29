import React from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useDashboardData } from '../../../../../context/DashboardDataContext';

const UserInfoBar = () => {
  const { userType } = useAuth();
  const { reciboData, userData, hasData } = useDashboardData();

  // Determinar datos según tipo de usuario
  let userName = 'Usuario';
  let serviceNumber = 'N/A';
  let address = 'Dirección no disponible';

  if ((userType === 'lead' || userType === 'cliente') && hasData && reciboData) {
    // Para leads y clientes con datos de recibo
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
    <div className="bg-gray-50 px-4 py-2">
      <div className="grid grid-cols-2 gap-4 max-w-full mx-auto">
        {/* Usuario */}
        <div
          className="p-4 rounded-2xl border border-gray-100 min-h-[84px] flex items-center justify-between"
          style={{ backgroundColor: "#fcfcfc" }}
        >
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {userName}
            </p>
            <p className="text-sm text-orange-500 font-semibold mt-1">No. Servicio</p>
            <p className="text-sm text-gray-500">{serviceNumber}</p>
          </div>
          <div
            className="w-9 h-9 rounded-full grid place-items-center"
            style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* Dirección */}
        <div
          className="p-4 rounded-2xl border border-gray-100 min-h-[84px] flex items-center justify-between"
          style={{ backgroundColor: "#fcfcfc" }}
        >
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Dirección</p>
            <p className="text-sm text-gray-500 mt-1">
              {address}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-full grid place-items-center"
            style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 11.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Zm0-9a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoBar;
