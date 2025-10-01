import React from 'react';
import { FiGrid, FiPieChart, FiFileText, FiSun } from 'react-icons/fi';
import { useRouter } from 'expo-router';

// Navigation button component
const NavButton = ({ item, activeTab, setActiveTab, onClose }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    setActiveTab(item.id);
    if (onClose) onClose();
  };

  return (
    <button
      key={item.id}
      onClick={handleClick}
      className={`w-full flex items-center px-2 py-1.5 text-left rounded-md transition-colors ${
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

const LeadSidebar = ({ activeTab, setActiveTab, onClose }) => {
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

      <nav className="flex-1 px-2 -mt-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} />
          ))}
        </div>

        {/* Lead CTA */}
        <div className="mt-6 px-2">
          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg p-3 text-center">
            <h3 className="text-sm font-bold text-white mb-1">¡Regístrate!</h3>
            <p className="text-sm text-white mb-2 leading-tight">Guarda tu análisis y recibe cotizaciones</p>
            <button
              onClick={() => router.push('/signup')}
              className="w-full bg-white font-semibold py-1.5 px-2 rounded text-sm hover:bg-gray-100 transition-colors"
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

export default LeadSidebar;
