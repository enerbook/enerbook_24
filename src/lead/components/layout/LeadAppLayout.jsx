import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LeadSidebar from '../LeadSidebar';
import LeadHeader from './LeadHeader';
import ErrorBoundary from '../common/ErrorBoundary';
import { FiMenu } from 'react-icons/fi';

const LeadAppLayout = ({ activeTab, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop siempre visible, móvil con slide */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <LeadSidebar
          activeTab={activeTab}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-auto">
        {/* Header con botón de menú móvil */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={sidebarOpen}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <FiMenu className="w-5 h-5 text-gray-700" aria-hidden="true" />
            </button>
            <img
              src="/img/Fulllogonegro.svg"
              alt="Enerbook - Logo de la empresa"
              className="h-8 w-auto"
            />
            <div className="w-[44px]" aria-hidden="true" /> {/* Espaciador para centrar logo */}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block flex-shrink-0">
          <LeadHeader />
        </div>

        {/* Content area - único contenedor con scroll */}
        <main
          className="flex-1 px-4 lg:px-8 py-4 lg:py-6 bg-gray-50 overflow-y-auto overflow-x-hidden"
          role="main"
          aria-label="Contenido principal del dashboard"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

LeadAppLayout.propTypes = {
  activeTab: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default LeadAppLayout;
