import React, { useState } from 'react';
import MisCotizacionesTab from '../../src/instalador/components/dashboard/MisCotizacionesTab';
import QuotationDetailsModal from '../../src/instalador/components/modals/QuotationDetailsModal';

export default function InstaladorMisCotizacionesScreen() {
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  return (
    <>
      <MisCotizacionesTab
        setSelectedQuotation={setSelectedQuotation}
        setShowQuotationModal={setShowQuotationModal}
      />
      {showQuotationModal && selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          setShowDetailsModal={setShowQuotationModal}
        />
      )}
    </>
  );
}
