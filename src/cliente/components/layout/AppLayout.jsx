import React, { useState } from 'react';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../shared/config/colors';

const AppLayout = ({ children, SidebarComponent, sidebarProps = {} }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Header logout button clicked');
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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
          {...sidebarProps}
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
          <header className="w-full bg-gray-50 px-8 py-4 flex justify-between items-center">
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
                  style={{ color: COLORS.primary }}
                />
              </div>
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </header>
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
