import React from 'react';

const ResumenTab = ({ contrato, proyecto, cotizacion, cliente, onReload }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'completado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoPagoColor = (estadoPago) => {
    switch (estadoPago) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-orange-100 text-orange-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {proyecto?.titulo || 'Proyecto sin título'}
            </h2>
            <p className="text-sm text-gray-600">
              Contrato: {contrato?.numero_contrato || 'N/A'}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEstadoBadgeColor(contrato?.estado)}`}>
            {contrato?.estado || 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información del Cliente
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm text-gray-900">{cliente?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm text-gray-900">{cliente?.correo_electronico || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teléfono</p>
              <p className="text-sm text-gray-900">{cliente?.telefono || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Información del Contrato */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalles del Contrato
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(contrato?.precio_total_sistema)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tipo de Pago</p>
              <p className="text-sm text-gray-900 capitalize">{contrato?.tipo_pago_seleccionado || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estado de Pago</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoPagoColor(contrato?.estado_pago)}`}>
                {contrato?.estado_pago || 'N/A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de Firma</p>
              <p className="text-sm text-gray-900">{formatDate(contrato?.fecha_firma)}</p>
            </div>
          </div>
        </div>

        {/* Fechas Importantes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Fechas Importantes
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
              <p className="text-sm text-gray-900">{formatDate(contrato?.created_at)}</p>
            </div>
            {contrato?.fecha_inicio_instalacion && (
              <div>
                <p className="text-sm font-medium text-gray-600">Inicio de Instalación</p>
                <p className="text-sm text-gray-900">{formatDate(contrato.fecha_inicio_instalacion)}</p>
              </div>
            )}
            {contrato?.fecha_completado && (
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Completado</p>
                <p className="text-sm text-gray-900">{formatDate(contrato.fecha_completado)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descripción del Proyecto */}
      {proyecto?.descripcion && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Descripción del Proyecto</h3>
          <p className="text-sm text-gray-700">{proyecto.descripcion}</p>
        </div>
      )}

      {/* Especificaciones de la Cotización */}
      {cotizacion && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Especificaciones Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cotizacion.paneles && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Paneles</p>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(cotizacion.paneles, null, 2)}
                </pre>
              </div>
            )}
            {cotizacion.inversores && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Inversores</p>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(cotizacion.inversores, null, 2)}
                </pre>
              </div>
            )}
            {cotizacion.estructura && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Estructura</p>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(cotizacion.estructura, null, 2)}
                </pre>
              </div>
            )}
            {cotizacion.sistema_electrico && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Sistema Eléctrico</p>
                <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(cotizacion.sistema_electrico, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenTab;
