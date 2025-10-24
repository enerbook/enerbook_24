import React, { useState } from 'react';
import CotizacionCard from './CotizacionCard';

const CotizacionesList = ({ cotizaciones, proyecto, onAcceptQuotation }) => {
  const [selectedCotizacionId, setSelectedCotizacionId] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleToggle = (cotizacionId) => {
    setSelectedCotizacionId(prevId => prevId === cotizacionId ? null : cotizacionId);
  };

  // Validar si el proyecto ha expirado (30 días desde created_at)
  const isProjectExpired = () => {
    if (!proyecto?.created_at) return false;

    const createdDate = new Date(proyecto.created_at);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(expirationDate.getDate() + 30);

    return new Date() > expirationDate;
  };

  // Calcular fecha límite (preferir fecha_limite de BD, fallback a created_at + 30 días)
  const getDeadlineDate = () => {
    if (proyecto?.fecha_limite) {
      return proyecto.fecha_limite;
    }

    // Fallback: calcular desde created_at
    if (proyecto?.created_at) {
      const createdDate = new Date(proyecto.created_at);
      createdDate.setDate(createdDate.getDate() + 30);
      return createdDate.toISOString();
    }

    return null;
  };

  const deadlineDate = getDeadlineDate();
  const expired = isProjectExpired();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">
          Cotizaciones Recibidas ({cotizaciones.length})
        </h2>
        {expired && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Período Cerrado
          </span>
        )}
      </div>

      {cotizaciones.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {expired ? 'Período de Cotización Cerrado' : 'Aún No Hay Cotizaciones'}
          </h3>
          <p className="text-sm text-gray-500">
            {expired
              ? `El período de cotización finalizó el ${deadlineDate ? formatDate(deadlineDate) : 'N/A'}`
              : `Los instaladores tienen hasta el ${deadlineDate ? formatDate(deadlineDate) : 'N/A'} para enviar sus propuestas`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cotizaciones.map((cotizacion, index) => (
            <CotizacionCard
              key={cotizacion.id}
              cotizacion={cotizacion}
              cotizacionIndex={index + 1}
              isExpanded={selectedCotizacionId === cotizacion.id}
              onToggle={() => handleToggle(cotizacion.id)}
              onAcceptQuotation={onAcceptQuotation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CotizacionesList;
