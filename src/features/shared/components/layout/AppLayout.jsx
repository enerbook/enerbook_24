import React, { useState } from 'react';
import ClientSidebar from '../../../cliente/components/ClientSidebar';
import InstallerSidebar from '../../../instalador/components/InstallerSidebar';
import LeadSidebar from '../../../lead/components/LeadSidebar';
import UnifiedHeader from './Header';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../../../context/AuthContext';

const AppLayout = ({ activeTab, setActiveTab, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userType } = useAuth();

  // Seleccionar el sidebar apropiado según el tipo de usuario
  let SidebarComponent;
  if (userType === 'cliente') {
    SidebarComponent = ClientSidebar;
  } else if (userType === 'instalador') {
    SidebarComponent = InstallerSidebar;
  } else if (userType === 'lead') {
    SidebarComponent = LeadSidebar;
  } else {
    // Fallback: usar ClientSidebar por defecto
    SidebarComponent = ClientSidebar;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop siempre visible, móvil con slide */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <SidebarComponent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen w-full lg:w-auto">
        {/* Header con botón de menú móvil */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-5 h-5 text-gray-700" />
            </button>
            <img
              src="/img/Fulllogonegro.svg"
              alt="Enerbook"
              className="h-8 w-auto"
            />
            <div className="w-9" /> {/* Espaciador para centrar logo */}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <UnifiedHeader />
        </div>

        {/* Content area con padding para header móvil */}
        <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 bg-gray-50 overflow-y-auto mt-14 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;