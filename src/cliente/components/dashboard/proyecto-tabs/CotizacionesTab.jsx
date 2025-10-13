import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import CotizacionesList from '../proyecto-details/CotizacionesList';
import AcceptQuotationModal from '../../modals/AcceptQuotationModal';

const CotizacionesTab = ({ proyecto, cotizaciones, onReload }) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [cotizacionToAccept, setCotizacionToAccept] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleAcceptQuotation = (cotizacion) => {
    setCotizacionToAccept(cotizacion);
    setShowAcceptModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Cotizaciones</h1>
            <p className="text-sm text-gray-600">
              {cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''} recibida{cotizaciones.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Proyecto</p>
            <p className="text-sm font-semibold text-gray-900">{proyecto.titulo}</p>
          </div>
        </div>
      </div>

      {/* Cotizaciones List */}
      {cotizaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No Hay Cotizaciones</h3>
          <p className="text-sm text-gray-500">
            Los instaladores enviarán sus cotizaciones pronto. Te notificaremos cuando recibas una nueva cotización.
          </p>
        </div>
      ) : (
        <CotizacionesList
          cotizaciones={cotizaciones}
          proyecto={proyecto}
          onAcceptQuotation={handleAcceptQuotation}
        />
      )}

      {/* Accept Quotation Modal */}
      {showAcceptModal && cotizacionToAccept && currentUserId && (
        <AcceptQuotationModal
          quotation={cotizacionToAccept}
          userId={currentUserId}
          onClose={() => {
            setShowAcceptModal(false);
            setCotizacionToAccept(null);
          }}
          onSuccess={() => {
            onReload(); // Reload project details after accepting
          }}
        />
      )}
    </div>
  );
};

export default CotizacionesTab;
