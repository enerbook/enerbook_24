import React from 'react';
import { FiCheckCircle, FiCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const StatusTrackingTab = ({ proyecto, cotizaciones }) => {
  // Determinar el estado actual del proyecto
  const getProjectPhase = () => {
    const cotizacionAceptada = cotizaciones.find(c => c.estado === 'aceptada');

    if (cotizacionAceptada) {
      return 'instalacion'; // Fase de instalación
    } else if (cotizaciones.length > 0) {
      return 'revision'; // Fase de revisión de cotizaciones
    } else if (proyecto.estado === 'abierto') {
      return 'abierto'; // Fase de recepción de cotizaciones
    } else {
      return 'pausado'; // Proyecto pausado
    }
  };

  const currentPhase = getProjectPhase();

  // Timeline de hitos del proyecto
  const timeline = [
    {
      id: 'creacion',
      titulo: 'Proyecto Creado',
      descripcion: 'El proyecto fue creado y publicado',
      fecha: proyecto.created_at,
      completado: true,
      tipo: 'success'
    },
    {
      id: 'publicacion',
      titulo: 'Publicado para Instaladores',
      descripcion: 'Los instaladores pueden ver y cotizar el proyecto',
      fecha: proyecto.created_at,
      completado: proyecto.estado === 'abierto',
      tipo: proyecto.estado === 'abierto' ? 'success' : 'warning'
    },
    {
      id: 'cotizaciones',
      titulo: `${cotizaciones.length} Cotización${cotizaciones.length !== 1 ? 'es' : ''} Recibida${cotizaciones.length !== 1 ? 's' : ''}`,
      descripcion: cotizaciones.length > 0
        ? `Has recibido ${cotizaciones.length} propuesta${cotizaciones.length !== 1 ? 's' : ''} de instaladores`
        : 'Esperando propuestas de instaladores',
      fecha: cotizaciones.length > 0 ? cotizaciones[0].created_at : null,
      completado: cotizaciones.length > 0,
      tipo: cotizaciones.length > 0 ? 'success' : 'pending'
    },
    {
      id: 'aceptacion',
      titulo: 'Cotización Aceptada',
      descripcion: cotizaciones.find(c => c.estado === 'aceptada')
        ? `Cotización de ${cotizaciones.find(c => c.estado === 'aceptada').proveedores?.nombre_empresa} aceptada`
        : 'Pendiente de seleccionar un instalador',
      fecha: cotizaciones.find(c => c.estado === 'aceptada')?.updated_at || null,
      completado: cotizaciones.some(c => c.estado === 'aceptada'),
      tipo: cotizaciones.some(c => c.estado === 'aceptada') ? 'success' : 'pending'
    },
    {
      id: 'instalacion',
      titulo: 'Instalación en Progreso',
      descripcion: 'El instalador está trabajando en tu proyecto',
      fecha: null,
      completado: false,
      tipo: 'pending'
    },
    {
      id: 'finalizacion',
      titulo: 'Proyecto Completado',
      descripcion: 'Instalación finalizada y sistema operativo',
      fecha: null,
      completado: false,
      tipo: 'pending'
    }
  ];

  const getIconComponent = (tipo, completado) => {
    if (completado) return FiCheckCircle;
    if (tipo === 'warning') return FiAlertCircle;
    if (tipo === 'pending') return FiCircle;
    return FiClock;
  };

  const getIconColor = (tipo, completado) => {
    if (completado) return 'text-green-600';
    if (tipo === 'warning') return 'text-orange-600';
    return 'text-gray-400';
  };

  const getLineColor = (completado) => {
    return completado ? 'bg-green-600' : 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Status Tracking</h1>
            <p className="text-sm text-gray-600">Seguimiento en tiempo real del progreso del proyecto</p>
          </div>
        </div>

        {/* Estado Actual */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-orange-400 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs text-orange-600 font-medium">Estado Actual</p>
              <p className="text-sm font-bold text-gray-900">
                {currentPhase === 'abierto' && 'Recibiendo Cotizaciones'}
                {currentPhase === 'revision' && 'Revisión de Propuestas'}
                {currentPhase === 'instalacion' && 'En Instalación'}
                {currentPhase === 'pausado' && 'Proyecto Pausado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-6">Timeline del Proyecto</h2>

        <div className="space-y-6">
          {timeline.map((item, index) => {
            const IconComponent = getIconComponent(item.tipo, item.completado);
            const iconColor = getIconColor(item.tipo, item.completado);
            const isLast = index === timeline.length - 1;

            return (
              <div key={item.id} className="relative">
                {/* Línea conectora */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-10 w-0.5 h-12 ${getLineColor(item.completado)}`}
                  />
                )}

                {/* Contenido del hito */}
                <div className="flex items-start">
                  {/* Icono */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                    item.completado ? 'bg-green-100' : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${iconColor}`} />
                  </div>

                  {/* Información */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${
                        item.completado ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.titulo}
                      </h3>
                      {item.fecha && (
                        <span className="text-xs text-gray-500">
                          {new Date(item.fecha).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información de Fecha Límite */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Plazos del Proyecto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Fecha Límite para Cotizaciones</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(proyecto.fecha_limite).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.ceil((new Date(proyecto.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24))} días restantes
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Duración Estimada de Instalación</p>
            <p className="text-sm font-semibold text-gray-900">
              {cotizaciones.find(c => c.estado === 'aceptada')?.plazo_entrega || 'Por definir'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Según cotización aceptada
            </p>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Nota</h3>
            <p className="text-xs text-blue-700 mt-1">
              El timeline se actualizará automáticamente conforme avance tu proyecto.
              Recibirás notificaciones por email en cada hito importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTrackingTab;
