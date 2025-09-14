import React, { useState } from 'react';
import ContractCard from './ContractCard';
import ContractDetailsModal from './ContractDetailsModal';
import UpdateStatusModal from './UpdateStatusModal';

const ContractsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Mock data basado en la imagen
  const contracts = [
    {
      id: 1,
      projectName: 'Proyecto 1',
      projectDescription: 'Instalación en Los Fuentes 9 kWp',
      clientName: 'Luis Raúl Morales Hernández',
      totalAmount: '$87,500 MXN',
      status: 'Contrato Activo',
      details: {
        projectTitle: 'Instalación en Lomas 9 wKp',
        systemCapacity: '5.4 kWp',
        panelType: '10 x Longi 550W',
        inverterType: '2 x Huawei 5KW',
        estimatedProduction: '8,540 kWh/año',
        structureType: 'Coplanar, techo de lámina',
        contractNumber: '#CNTR-239823',
        paymentType: 'Financiamiento (48 meses)',
        additionalNotes: 'El sistema fue diseñado para un voltaje de 220V, sin embargo se dejó capacidad e infraestructura para soportar hasta 440V.',
        signatureDate: '8/11/2025',
        phone: '222 707 8965',
        installationWarranty: '10 años',
        inverterWarranty: '18 años',
        panelWarranty: '20 años'
      }
    },
    {
      id: 2,
      projectName: 'Proyecto 2',
      projectDescription: '30 paneles en mercado "La Cruz"',
      clientName: 'Daniela Hernández Cortes',
      totalAmount: '$54,000 MXN',
      status: 'Instalación en Proceso',
      details: {
        capacity: '16.35 kWp',
        panels: 'Canadian Solar 545W',
        inverter: 'SolarEdge SE15000H-RW',
        production: '26,500 kWh/año',
        structure: 'Estructura comercial elevada',
        contractDate: '02/02/2025',
        installationDate: '01/03/2025',
        expectedCompletion: '15/03/2025',
        paymentMethod: 'Contado',
        notes: 'Instalación comercial en proceso. Estimado de finalización: 15 de marzo.'
      }
    },
    {
      id: 3,
      projectName: 'Proyecto 3',
      projectDescription: 'Sistema solar para Sodium',
      clientName: 'Rodrigo Herrera Herrera',
      totalAmount: '$440,000 MXN',
      status: 'Contrato Finalizado',
      details: {
        capacity: '50.0 kWp',
        panels: 'Trina Solar 545W',
        inverter: 'Fronius Eco 50.0-3-S',
        production: '85,000 kWh/año',
        structure: 'Sistema industrial con seguimiento solar',
        contractDate: '10/10/2024',
        installationDate: '15/11/2024',
        completionDate: '20/12/2024',
        paymentMethod: 'Contado',
        customerRating: 5,
        customerReview: 'Excelente trabajo, muy profesional y cumplieron con todos los tiempos.',
        notes: 'Proyecto industrial completado exitosamente. Cliente muy satisfecho con el resultado.'
      }
    }
  ];

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (contract) => {
    setSelectedContract(contract);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = (selectedStatuses) => {
    // Aquí iría la lógica para guardar los estatus actualizados
    console.log('Actualizando estatus del contrato:', selectedContract.id, selectedStatuses);
  };

  const handleViewReview = (contract) => {
    // Aquí iría la lógica para ver la reseña
    console.log('Ver reseña del contrato:', contract.id);
  };

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {contracts.map((contract) => (
          <ContractCard 
            key={contract.id}
            contract={contract}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
            onViewReview={handleViewReview}
          />
        ))}
      </div>

      {showDetailsModal && selectedContract && (
        <ContractDetailsModal 
          contract={selectedContract} 
          setShowDetailsModal={setShowDetailsModal} 
        />
      )}

      {showStatusModal && selectedContract && (
        <UpdateStatusModal 
          contract={selectedContract} 
          setShowStatusModal={setShowStatusModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ContractsView;