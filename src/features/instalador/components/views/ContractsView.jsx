import React, { useState, useEffect } from 'react';
import ContractCard from '../cards/ContractCard';
import ContractDetailsModal from '../modals/ContractDetailsModal';
import UpdateStatusModal from '../modals/UpdateStatusModal';
import { authService, installerService, contractService } from '../../../../services';

const ContractsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyContracts();
  }, []);

  const loadMyContracts = async () => {
    setLoading(true);
    try {
      // Get current user's provider ID
      const user = await authService.getCurrentUser();
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Find provider by auth user ID
      const proveedor = await installerService.getInstallerByUserId(user.id);
      if (!proveedor) {
        console.error('No provider found for user');
        return;
      }

      // Get contracts for this provider using contractService
      const contratos = await contractService.getInstallerContracts(proveedor.id);

      const formattedContracts = contratos?.map(contrato => {
        const usuario = contrato.usuarios;
        const cotizacion = contrato.cotizaciones_final;
        const proyecto = cotizacion?.proyectos;
        const sizingResults = proyecto?.cotizaciones_inicial?.sizing_results;
        const paneles = cotizacion?.paneles;
        const inversores = cotizacion?.inversores;
        const estructura = cotizacion?.estructura;
        const sistemaElectrico = cotizacion?.sistema_electrico;
        const resena = contrato.resenas?.length > 0 ? contrato.resenas[0] : null;

        return {
          id: contrato.id,
          projectName: proyecto?.titulo || `Proyecto ${proyecto?.id?.slice(0, 8)}`,
          projectDescription: proyecto?.descripcion || 'Sin descripción',
          clientName: usuario?.nombre || 'Cliente no especificado',
          clientEmail: usuario?.correo_electronico,
          clientPhone: usuario?.telefono,
          totalAmount: `$${contrato.precio_total_sistema?.toLocaleString()} MXN`,
          status: getContractStatusLabel(contrato.estado),
          rawStatus: contrato.estado,
          details: {
            projectTitle: proyecto?.titulo || 'Sin título',
            systemCapacity: sizingResults?.potencia_sistema ? `${sizingResults.potencia_sistema} kWp` : 'No especificada',
            panelType: paneles?.cantidad && paneles?.modelo ?
              `${paneles.cantidad} x ${paneles.modelo}` :
              'No especificado',
            inverterType: inversores?.cantidad && inversores?.modelo ?
              `${inversores.cantidad} x ${inversores.modelo}` :
              'No especificado',
            estimatedProduction: sizingResults?.generacion_anual ?
              `${sizingResults.generacion_anual.toLocaleString()} kWh/año` :
              'No calculada',
            structureType: estructura?.tipo || 'No especificada',
            contractNumber: contrato.numero_contrato || `#${contrato.id.slice(0, 8)}`,
            paymentType: getPaymentTypeLabel(contrato.tipo_pago_seleccionado),
            additionalNotes: proyecto?.descripcion || 'Sin notas adicionales',
            signatureDate: contrato.fecha_firma ?
              new Date(contrato.fecha_firma).toLocaleDateString('es-MX') :
              'No especificada',
            installationDate: contrato.fecha_inicio_instalacion ?
              new Date(contrato.fecha_inicio_instalacion).toLocaleDateString('es-MX') :
              null,
            completionDate: contrato.fecha_completado ?
              new Date(contrato.fecha_completado).toLocaleDateString('es-MX') :
              null,
            phone: usuario?.telefono || 'No disponible',
            installationWarranty: sistemaElectrico?.garantia_instalacion_anos ?
              `${sistemaElectrico.garantia_instalacion_anos} años` :
              'No especificada',
            inverterWarranty: inversores?.garantia_anos ?
              `${inversores.garantia_anos} años` :
              'No especificada',
            panelWarranty: paneles?.garantia_anos ?
              `${paneles.garantia_anos} años` :
              'No especificada',
            customerRating: resena?.puntuacion || null,
            customerReview: resena?.comentario || null,
            paymentStatus: getPaymentStatusLabel(contrato.estado_pago)
          },
          rawData: contrato
        };
      }) || [];

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContractStatusLabel = (status) => {
    switch (status) {
      case 'activo':
        return 'Contrato Activo';
      case 'completado':
        return 'Contrato Finalizado';
      case 'cancelado':
        return 'Contrato Cancelado';
      default:
        return status || 'Sin estado';
    }
  };

  const getPaymentTypeLabel = (paymentType) => {
    switch (paymentType) {
      case 'upfront':
        return 'Pago por adelantado';
      case 'milestones':
        return 'Pago por hitos';
      case 'financing':
        return 'Financiamiento';
      default:
        return paymentType || 'No especificado';
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pendiente':
        return 'Pago Pendiente';
      case 'processing':
        return 'Procesando Pago';
      case 'succeeded':
        return 'Pago Completado';
      case 'canceled':
        return 'Pago Cancelado';
      case 'requires_action':
        return 'Acción Requerida';
      default:
        return paymentStatus || 'Sin estado';
    }
  };

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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          <p className="text-sm text-gray-600 ml-4">Cargando contratos...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos</h3>
          <p className="text-sm text-gray-600">Aún no tienes contratos firmados con clientes.</p>
        </div>
      ) : (
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
      )}

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