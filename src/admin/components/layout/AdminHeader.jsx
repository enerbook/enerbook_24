import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import logger from '../../utils/logger';

const AdminHeader = ({ adminTabs, activeTab }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    logger.info('Admin logout initiated');
    try {
      await logout(router);
    } catch (error) {
      logger.error('Error during admin logout:', error);
    }
  };

  const handleTabClick = (tabId) => {
    const route = tabId === 'resumen' ? '/admin-panel' : `/admin-panel/${tabId}`;
    router.push(route);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/img/FulllogoColor.svg"
            alt="Enerbook"
            className="h-20 w-auto mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
            <p className="text-sm text-gray-600 mt-1">Panel de Control y Métricas del Sistema</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-2 py-1.5 text-left rounded-md transition-colors text-gray-400 hover:bg-white hover:text-gray-700"
        >
          <div className="w-5 h-5 rounded-md flex items-center justify-center mr-2 bg-transparent">
            <Ionicons name="log-out-outline" size={16} color="#F59E0B" />
          </div>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-100">
        <div className="px-6">
          <div className="flex overflow-x-auto">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={`ion-${tab.icon} mr-2 text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
