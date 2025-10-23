import React from 'react';

const ProyectoHeader = ({ proyecto, onClose, diasRestantes, cotizacionesCount }) => {
  const getEstadoBadge = (estado) => {
    const badges = {
      'abierto': {
        gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        text: 'Abierto',
        icon: '🟢'
      },
      'cerrado': {
        gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
        text: 'Cerrado',
        icon: '⚫'
      },
      'adjudicado': {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
        text: 'Adjudicado',
        icon: '🏆'
      },
      'en_progreso': {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        text: 'En Progreso',
        icon: '⚙️'
      },
      'completado': {
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
        text: 'Completado',
        icon: '✅'
      },
      'cancelado': {
        gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        text: 'Cancelado',
        icon: '❌'
      }
    };
    return badges[estado] || badges['abierto'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const estadoBadge = getEstadoBadge(proyecto.estado);

  return (
    <div className="bg-gray-50 px-4 py-3">
      <div className="max-w-full mx-auto">
        {/* Top Row - Back button and Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Proyectos
          </button>

          <div
            className="px-4 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5"
            style={{ background: estadoBadge.gradient }}
          >
            <span>{estadoBadge.icon}</span>
            <span>{estadoBadge.text}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 min-h-[84px] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Fecha Límite</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(proyecto.fecha_limite)}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full grid place-items-center"
              style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 min-h-[84px] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tiempo Restante</p>
              <p className={`text-sm font-bold ${diasRestantes > 7 ? 'text-green-600' : diasRestantes > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full grid place-items-center"
              style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 min-h-[84px] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Cotizaciones</p>
              <p className="text-sm font-bold text-gray-900">{cotizacionesCount} recibida{cotizacionesCount !== 1 ? 's' : ''}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full grid place-items-center"
              style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProyectoHeader;
