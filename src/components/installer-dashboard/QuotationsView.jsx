import React, { useState, useEffect } from 'react';
import QuotationCard from './QuotationCard';
import QuotationDetailsModal from './QuotationDetailsModal';
import { authService, installerService, quotationService } from '../../services';

const QuotationsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyQuotations();
  }, []);

  const loadMyQuotations = async () => {
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

      // Get quotations for this provider using quotationService
      const cotizaciones = await quotationService.getInstallerQuotations(proveedor.id);

      const formattedQuotations = cotizaciones?.map(cotizacion => {
        const proyecto = cotizacion.proyectos;
        const usuario = proyecto?.usuarios;
        const sizingResults = proyecto?.cotizaciones_inicial?.sizing_results;
        const precioFinal = cotizacion.precio_final;
        const paneles = cotizacion.paneles;
        const inversores = cotizacion.inversores;
        const estructura = cotizacion.estructura;
        const sistemaElectrico = cotizacion.sistema_electrico;
        const opcionesPago = cotizacion.opciones_pago;

        return {
          id: cotizacion.id,
          projectName: proyecto?.titulo || `Proyecto ${proyecto?.id?.slice(0, 8)}`,
          clientName: usuario?.nombre || 'Cliente no especificado',
          clientEmail: usuario?.correo_electronico,
          sentDate: new Date(cotizacion.created_at).toLocaleDateString('es-MX'),
          totalAmount: precioFinal?.total ?
            `$${precioFinal.total.toLocaleString()} MXN` :
            'Por definir',
          status: getStatusLabel(cotizacion.estado),
          rawStatus: cotizacion.estado,
          details: {
            capacity: sizingResults?.potencia_sistema ? `${sizingResults.potencia_sistema} kWp` : 'No especificada',
            panels: paneles?.modelo || 'No especificado',
            panelCount: paneles?.cantidad || 'N/A',
            inverter: inversores?.modelo || 'No especificado',
            production: sizingResults?.generacion_anual ?
              `${sizingResults.generacion_anual.toLocaleString()} kWh/año` :
              'No calculada',
            structure: estructura?.tipo || 'No especificada',
            panelWarranty: paneles?.garantia_anos ? `${paneles.garantia_anos} años` : 'No especificada',
            inverterWarranty: inversores?.garantia_anos ? `${inversores.garantia_anos} años` : 'No especificada',
            installationWarranty: sistemaElectrico?.garantia_instalacion_anos ?
              `${sistemaElectrico.garantia_instalacion_anos} años` :
              'No especificada',
            installationTime: estructura?.tiempo_instalacion_dias ?
              `${estructura.tiempo_instalacion_dias} días` :
              'No especificado',
            paymentOptions: opcionesPago?.tipos || ['Contado'],
            notes: cotizacion.notas_proveedor || 'Sin notas adicionales'
          },
          rawData: cotizacion
        };
      }) || [];

      setQuotations(formattedQuotations);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendiente':
        return 'En revisión';
      case 'aceptada':
        return 'Aceptada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return status || 'Sin estado';
    }
  };

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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          <p className="text-sm text-gray-600 ml-4">Cargando cotizaciones...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
          <p className="text-sm text-gray-600">Aún no has enviado cotizaciones a ningún proyecto.</p>
        </div>
      ) : (
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
      )}

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