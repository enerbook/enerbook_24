/**
 * Data Formatters
 * Utilidades compartidas para formatear datos de proyectos, cotizaciones y contratos
 * Elimina duplicación de lógica de transformación
 */

/**
 * Formatea datos de proyecto disponible
 */
export const formatProjectData = (proyecto) => {
  const cotizacion = proyecto.cotizaciones_inicial;
  const sizingResults = cotizacion?.sizing_results;
  const reciboData = cotizacion?.recibo_cfe;
  const consumoHistorico = cotizacion?.consumo_kwh_historico;
  const resumenEnergetico = cotizacion?.resumen_energetico;
  const irradiacionData = cotizacion?.irradiacion_cache;

  // Calcular datos de consumo
  let consumoAnual = 'No disponible';
  if (consumoHistorico && Array.isArray(consumoHistorico) && consumoHistorico.length > 0) {
    const totalConsumo = consumoHistorico.reduce((sum, item) => sum + (item.consumo || item.kwh || 0), 0);
    consumoAnual = `${totalConsumo.toLocaleString()} kWh`;
  } else if (resumenEnergetico?.consumo_promedio) {
    consumoAnual = `${(resumenEnergetico.consumo_promedio * 12).toLocaleString()} kWh`;
  }

  // Datos de potencia y dimensionamiento
  let powerInfo = 'Información no disponible';
  if (sizingResults?.kWp_needed) {
    const paneles = sizingResults.n_panels || Math.ceil((sizingResults.kWp_needed * 1000) / (sizingResults.panel_wp || 550));
    powerInfo = `${sizingResults.kWp_needed} kW (${paneles} paneles)`;
  }

  return {
    id: proyecto.id,
    name: proyecto.titulo || `Proyecto ${proyecto.id.slice(0, 8)}`,
    power: powerInfo,
    consumption: consumoAnual,
    tariff: reciboData?.tarifa || 'No especificada',
    location: reciboData?.codigo_postal || 'No especificado',
    irradiation: irradiacionData?.irradiacion_promedio_anual
      ? `${irradiacionData.irradiacion_promedio_anual.toFixed(1)} kWh/m²/día`
      : '5.2 kWh/m²/día',
    deadline: proyecto.fecha_limite
      ? new Date(proyecto.fecha_limite).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'Sin fecha límite',
    capacity: sizingResults?.kWp_needed ? `${sizingResults.kWp_needed} kWp` : 'N/A',
    production: sizingResults?.yearly_prod
      ? `${sizingResults.yearly_prod.toLocaleString()} kWh/año`
      : 'No calculada',
    description: proyecto.descripcion || 'Sin descripción',
    clientName: proyecto.usuarios?.nombre || reciboData?.nombre || 'Cliente no especificado',
    clientEmail: proyecto.usuarios?.correo_electronico,
    region: irradiacionData?.region_nombre || 'México',
    rawData: proyecto
  };
};

/**
 * Formatea datos de cotización
 */
export const formatQuotationData = (cotizacion) => {
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
    totalAmount: precioFinal?.total
      ? `$${precioFinal.total.toLocaleString()} MXN`
      : 'Por definir',
    status: getQuotationStatusLabel(cotizacion.estado),
    rawStatus: cotizacion.estado,
    details: {
      capacity: sizingResults?.potencia_sistema ? `${sizingResults.potencia_sistema} kWp` : 'No especificada',
      panels: paneles?.modelo || 'No especificado',
      panelCount: paneles?.cantidad || 'N/A',
      inverter: inversores?.modelo || 'No especificado',
      production: sizingResults?.generacion_anual
        ? `${sizingResults.generacion_anual.toLocaleString()} kWh/año`
        : 'No calculada',
      structure: estructura?.tipo || 'No especificada',
      panelWarranty: paneles?.garantia_anos ? `${paneles.garantia_anos} años` : 'No especificada',
      inverterWarranty: inversores?.garantia_anos ? `${inversores.garantia_anos} años` : 'No especificada',
      installationWarranty: sistemaElectrico?.garantia_instalacion_anos
        ? `${sistemaElectrico.garantia_instalacion_anos} años`
        : 'No especificada',
      installationTime: estructura?.tiempo_instalacion_dias
        ? `${estructura.tiempo_instalacion_dias} días`
        : 'No especificado',
      paymentOptions: opcionesPago?.tipos || ['Contado'],
      notes: cotizacion.notas_proveedor || 'Sin notas adicionales'
    },
    rawData: cotizacion
  };
};

/**
 * Formatea datos de contrato
 */
export const formatContractData = (contrato) => {
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
      panelType: paneles?.cantidad && paneles?.modelo
        ? `${paneles.cantidad} x ${paneles.modelo}`
        : 'No especificado',
      inverterType: inversores?.cantidad && inversores?.modelo
        ? `${inversores.cantidad} x ${inversores.modelo}`
        : 'No especificado',
      estimatedProduction: sizingResults?.generacion_anual
        ? `${sizingResults.generacion_anual.toLocaleString()} kWh/año`
        : 'No calculada',
      structureType: estructura?.tipo || 'No especificada',
      contractNumber: contrato.numero_contrato || `#${contrato.id.slice(0, 8)}`,
      paymentType: getPaymentTypeLabel(contrato.tipo_pago_seleccionado),
      additionalNotes: proyecto?.descripcion || 'Sin notas adicionales',
      signatureDate: contrato.fecha_firma
        ? new Date(contrato.fecha_firma).toLocaleDateString('es-MX')
        : 'No especificada',
      installationDate: contrato.fecha_inicio_instalacion
        ? new Date(contrato.fecha_inicio_instalacion).toLocaleDateString('es-MX')
        : null,
      completionDate: contrato.fecha_completado
        ? new Date(contrato.fecha_completado).toLocaleDateString('es-MX')
        : null,
      phone: usuario?.telefono || 'No disponible',
      installationWarranty: sistemaElectrico?.garantia_instalacion_anos
        ? `${sistemaElectrico.garantia_instalacion_anos} años`
        : 'No especificada',
      inverterWarranty: inversores?.garantia_anos
        ? `${inversores.garantia_anos} años`
        : 'No especificada',
      panelWarranty: paneles?.garantia_anos
        ? `${paneles.garantia_anos} años`
        : 'No especificada',
      customerRating: resena?.puntuacion || null,
      customerReview: resena?.comentario || null,
      paymentStatus: getPaymentStatusLabel(contrato.estado_pago)
    },
    rawData: contrato
  };
};

/**
 * Formatea datos de reseña
 */
export const formatReviewData = (resena, contrato) => {
  return {
    ...resena,
    contrato: {
      numero_contrato: contrato?.numero_contrato || `#${contrato?.id?.slice(0, 8)}`,
      precio_total_sistema: contrato?.precio_total_sistema,
      fecha_completado: contrato?.fecha_completado,
      usuario_nombre: contrato?.usuarios?.nombre,
      proyecto_titulo: contrato?.cotizaciones_final?.proyectos?.titulo,
      proyecto_descripcion: contrato?.cotizaciones_final?.proyectos?.descripcion
    }
  };
};

// Helpers para etiquetas de estado

export const getQuotationStatusLabel = (status) => {
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

export const getContractStatusLabel = (status) => {
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

export const getPaymentTypeLabel = (paymentType) => {
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

export const getPaymentStatusLabel = (paymentStatus) => {
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
