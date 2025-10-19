import React from 'react';

const EstadoTab = ({ contrato, proyecto, onReload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  // Timeline de estados
  const timeline = [
    {
      id: 1,
      title: 'Contrato Firmado',
      date: contrato?.fecha_firma,
      completed: !!contrato?.fecha_firma,
      icon: '📝'
    },
    {
      id: 2,
      title: 'Instalación Iniciada',
      date: contrato?.fecha_inicio_instalacion,
      completed: !!contrato?.fecha_inicio_instalacion,
      icon: '🔧'
    },
    {
      id: 3,
      title: 'Instalación Completada',
      date: contrato?.fecha_completado,
      completed: !!contrato?.fecha_completado,
      icon: '✅'
    },
  ];

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Status Tracking</h2>
            <p className="text-sm text-gray-600">
              Seguimiento del progreso de la instalación
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEstadoBadgeColor(contrato?.estado)}`}>
            {contrato?.estado || 'N/A'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Progreso del Proyecto</h3>
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={item.id} className="flex items-start">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                item.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {item.icon}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.title}
                  </h4>
                  {item.completed && item.date && (
                    <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                  )}
                </div>
                {!item.completed && (
                  <p className="text-sm text-gray-400 mt-1">Pendiente</p>
                )}
              </div>

              {/* Connector Line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-5 mt-10 w-0.5 h-12 bg-gray-200" style={{ marginLeft: '-2.5rem' }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Estado del Proyecto */}
      {proyecto && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Estado del Proyecto</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Estado Actual</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">{proyecto.estado || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Fecha de Creación</span>
              <span className="text-sm text-gray-900">{formatDate(proyecto.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Última Actualización</span>
              <span className="text-sm text-gray-900">{formatDate(proyecto.updated_at)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder para funcionalidad de actualización */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-orange-900 mb-1">Actualizar Estado</h4>
            <p className="text-sm text-orange-700">
              Próximamente podrás actualizar el estado del proyecto y notificar al cliente sobre el progreso de la instalación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadoTab;
