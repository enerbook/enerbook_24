import React, { useState } from 'react';
import QuotationCard from './QuotationCard';
import QuotationDetailsModal from './QuotationDetailsModal';

const QuotationsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Mock data basado en la imagen
  const quotations = [
    {
      id: 1,
      projectName: 'Paneles para Lomas 3',
      clientName: 'Daniel Ruiz Herrera',
      sentDate: '09/09/2025',
      totalAmount: '$110,000 MXN',
      status: 'En revisión',
      details: {
        capacity: '9.62 kWp',
        panels: 'JA Solar 545W',
        inverter: 'Huawei SUN2000-3/4/5/6/8/10KTL-M1',
        production: '18,350 kWh/año',
        structure: 'Coplanar',
        panelWarranty: '22 años',
        inverterWarranty: '18 años',
        installationWarranty: '7 años',
        installationTime: '21 días',
        paymentOptions: ['Contado', 'Mensualidades', 'Financiamiento'],
        notes: 'El sistema está diseñado para una posible expansión, debido a que el consumo histórico muestra una tendencia a seguir incrementando.'
      }
    },
    {
      id: 2,
      projectName: 'Proyecto 2',
      clientName: 'Victor Varela Morales',
      sentDate: '11/06/2025',
      totalAmount: '$320,600 MXN',
      status: 'Rechazada',
      details: {
        capacity: '15.2 kWp',
        panels: 'Canadian Solar 560W',
        inverter: 'SolarEdge SE15000H-RW',
        production: '24,180 kWh/año',
        structure: 'Elevada, techo inclinado',
        panelWarranty: '25 años',
        inverterWarranty: '25 años',
        installationWarranty: '15 años',
        installationTime: '45 días',
        paymentOptions: ['Contado', 'Financiamiento'],
        notes: 'Sistema comercial de gran capacidad con estructura elevada especializada.'
      }
    }
  ];

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const handleCancel = (quotation) => {
    // Aquí iría la lógica para cancelar la cotización
    console.log('Cancelar cotización:', quotation.id);
  };

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {quotations.map((quotation) => (
          <QuotationCard 
            key={quotation.id}
            quotation={quotation}
            onViewDetails={handleViewDetails}
            onCancel={handleCancel}
          />
        ))}
      </div>

      {showDetailsModal && selectedQuotation && (
        <QuotationDetailsModal 
          quotation={selectedQuotation} 
          setShowDetailsModal={setShowDetailsModal} 
        />
      )}
    </div>
  );
};

export default QuotationsView;