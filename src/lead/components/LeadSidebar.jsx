import React from 'react';
import PropTypes from 'prop-types';
import { FiGrid, FiPieChart, FiFileText, FiSun } from 'react-icons/fi';
import { useRouter } from 'expo-router';

// Navigation button component
const NavButton = ({ item, activeTab, onClose }) => {
  const router = useRouter();
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    // Navegación por URL
    const route = item.id === 'dashboard' ? '/lead-panel' : `/lead-panel/${item.id}`;
    router.push(route);
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      key={item.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Navegar a ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
      role="tab"
      tabIndex={0}
      className={`w-full flex items-center px-2 py-1.5 text-left rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-400 hover:bg-white hover:text-gray-700'
      }`}>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 ${
          isActive ? 'bg-gray-800' : 'bg-transparent'
        }`}>
        <Icon
          className={`w-2.5 h-2.5 ${isActive ? 'text-white' : ''}`}
          style={isActive ? {} : { color: '#F59E0B' }}
        />
      </div>
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
};

const LeadSidebar = ({ activeTab, onClose }) => {
  const router = useRouter();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'consumo', label: 'Consumo', icon: FiPieChart },
    { id: 'irradiacion', label: 'Irradiación', icon: FiSun },
    { id: 'detalles', label: 'Detalles', icon: FiFileText },
  ];

  return (
    <div className="flex w-64 lg:w-48 bg-white lg:bg-gray-50 flex-col h-full lg:max-h-screen shadow-xl lg:shadow-none">
      <div className="p-2 -mt-6 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src="/img/FulllogoColor.svg" alt="Enerbook" className="h-32 w-auto" />
        </div>
      </div>

      <nav className="flex-1 px-2 -mt-6 overflow-y-auto" aria-label="Navegación principal">
        {/* Main Navigation */}
        <div className="space-y-1" role="tablist" aria-label="Pestañas de navegación">
          {sidebarItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} onClose={onClose} />
          ))}
        </div>

        {/* Lead CTA */}
        <div className="mt-6 px-2">
          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg p-3 text-center" role="region" aria-label="Llamado a la acción">
            <h3 className="text-sm font-bold text-white mb-1">¡Regístrate!</h3>
            <p className="text-sm text-white mb-2 leading-tight">Guarda tu análisis y recibe cotizaciones</p>
            <button
              onClick={() => router.push('/signup')}
              aria-label="Crear cuenta de usuario en Enerbook"
              className="w-full bg-white font-semibold py-1.5 px-2 rounded text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-400"
              style={{ color: '#090e1a' }}
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

NavButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

LeadSidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

export default LeadSidebar;
