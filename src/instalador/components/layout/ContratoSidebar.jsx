import React from 'react';
import { FiFileText, FiFolder, FiDollarSign, FiMessageSquare, FiActivity, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'expo-router';

// Navigation button component
const NavButton = ({ item, activeTab, onTabChange, onClose }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.id;

  const handleClick = () => {
    if (item.action) {
      item.action();
    } else {
      onTabChange(item.id);
      if (onClose) onClose();
    }
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

const ContratoSidebar = ({ activeTab, onTabChange, onClose, contrato, proyecto }) => {
  const router = useRouter();

  const handleBackToProyectos = () => {
    router.push('/instalador-panel');
  };

  const sidebarItems = [
    { id: 'resumen', label: 'Resumen', icon: FiFileText },
    { id: 'documentos', label: 'Documentos', icon: FiFolder },
    { id: 'pagos', label: 'Pagos', icon: FiDollarSign },
    { id: 'comunicacion', label: 'Comunicación', icon: FiMessageSquare },
    { id: 'estado', label: 'Status Tracking', icon: FiActivity },
  ];

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'completado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex w-64 lg:w-48 bg-white lg:bg-gray-50 flex-col h-full lg:max-h-screen shadow-xl lg:shadow-none">
      <div className="p-2 -mt-6 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src="/img/FulllogoColor.svg" alt="Enerbook" className="h-32 w-auto" />
        </div>
      </div>

      {/* Contract/Project Info */}
      {(contrato || proyecto) && (
        <div className="px-2 pb-3 border-b border-gray-200 -mt-6">
          <div className="bg-white rounded-lg p-2 border border-gray-200">
            {proyecto?.titulo && (
              <h3 className="text-xs font-semibold text-gray-900 truncate">{proyecto.titulo}</h3>
            )}
            {contrato?.numero_contrato && (
              <p className="text-xs text-gray-500 mt-0.5">
                {contrato.numero_contrato}
              </p>
            )}
            {contrato?.estado && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getEstadoBadgeColor(contrato.estado)}`}>
                {contrato.estado}
              </span>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 mt-4 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              activeTab={activeTab}
              onTabChange={onTabChange}
              onClose={onClose}
            />
          ))}
        </div>
      </nav>

      {/* Back Button */}
      <div className="px-2 pb-4 border-t border-gray-200 pt-4">
        <button
          onClick={handleBackToProyectos}
          className="w-full flex items-center px-2 py-1.5 text-left rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
        >
          <div className="w-5 h-5 rounded-md flex items-center justify-center mr-2 bg-transparent">
            <FiArrowLeft className="w-2.5 h-2.5" style={{ color: '#F59E0B' }} />
          </div>
          <span className="text-sm font-medium">Volver a Proyectos</span>
        </button>
      </div>
    </div>
  );
};

export default ContratoSidebar;
