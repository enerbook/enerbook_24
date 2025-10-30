import React from 'react';
import { GRADIENTS } from '../../../shared/config/gradients';

const ResumenTab = ({ contrato, proyecto, cotizacion, cliente, instalador, onReload }) => {
  // Debug: Ver qué datos llegan
  console.log('📊 ResumenTab - proyecto data:', proyecto);
  console.log('📊 ResumenTab - cotizacion data:', cotizacion);

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
    // Todos los estados usan el degradado naranja Enerbook con letras blancas
    return { background: GRADIENTS.primary };
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getEstadoPagoColor = (estadoPago) => {
    // Todos los estados de pago usan el degradado naranja Enerbook con letras blancas
    return { background: GRADIENTS.primary };
  };

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Proyecto {proyecto?.titulo || 'sin título'}
            </h2>
            <p className="text-sm text-gray-600">
              Contrato: {contrato?.numero_contrato || 'N/A'}
            </p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-medium text-white" style={getEstadoBadgeColor(contrato?.estado)}>
            {capitalizeFirstLetter(contrato?.estado) || 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información del Cliente
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm text-gray-500 italic">
                {contrato?.estado_pago === 'succeeded'
                  ? (cliente?.nombre || 'N/A')
                  : 'Se mostrará cuando el cliente realice el pago'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm text-gray-500 italic">
                {contrato?.estado_pago === 'succeeded'
                  ? (cliente?.correo_electronico || 'N/A')
                  : 'Se mostrará cuando el cliente realice el pago'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teléfono</p>
              <p className="text-sm text-gray-500 italic">
                {contrato?.estado_pago === 'succeeded'
                  ? (cliente?.telefono || 'N/A')
                  : 'Se mostrará cuando el cliente realice el pago'}
              </p>
            </div>
          </div>
        </div>

        {/* Información del Contrato */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white" style={getEstadoPagoColor(contrato?.estado_pago)}>
                {capitalizeFirstLetter(contrato?.estado_pago) || 'N/A'}
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
            <svg className="w-5 h-5 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Información del Instalador */}
      {instalador && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Información del Instalador
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Empresa</p>
              <p className="text-sm text-gray-900">{instalador.nombre_empresa || 'N/A'}</p>
            </div>
            {instalador.rfc && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">RFC</p>
                <p className="text-sm text-gray-900">{instalador.rfc}</p>
              </div>
            )}
            {instalador.telefono && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Teléfono</p>
                <p className="text-sm text-gray-900">{instalador.telefono}</p>
              </div>
            )}
            {instalador.correo_electronico && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-sm text-gray-900">{instalador.correo_electronico}</p>
              </div>
            )}
            {instalador.direccion && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Dirección</p>
                <p className="text-sm text-gray-900">{instalador.direccion}</p>
              </div>
            )}
            {instalador.ciudad && instalador.estado && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ubicación</p>
                <p className="text-sm text-gray-900">{instalador.ciudad}, {instalador.estado}</p>
              </div>
            )}
            {instalador.codigo_postal && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Código Postal</p>
                <p className="text-sm text-gray-900">{instalador.codigo_postal}</p>
              </div>
            )}
            {instalador.certificaciones && instalador.certificaciones.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 mb-1">Certificaciones</p>
                <p className="text-sm text-gray-900">{instalador.certificaciones.join(', ')}</p>
              </div>
            )}
            {instalador.anos_experiencia && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Años de Experiencia</p>
                <p className="text-sm text-gray-900">{instalador.anos_experiencia} años</p>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Paneles</p>
                <div className="space-y-2">
                  {cotizacion.paneles.marca && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Marca:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.paneles.marca}</span>
                    </div>
                  )}
                  {cotizacion.paneles.modelo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Modelo:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.paneles.modelo}</span>
                    </div>
                  )}
                  {cotizacion.paneles.potencia_wp && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Potencia:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.paneles.potencia_wp} Wp</span>
                    </div>
                  )}
                  {cotizacion.paneles.cantidad && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cantidad:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.paneles.cantidad}</span>
                    </div>
                  )}
                  {cotizacion.paneles.precio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(cotizacion.paneles.precio)}</span>
                    </div>
                  )}
                  {cotizacion.paneles.garantia_anos && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Garantía:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.paneles.garantia_anos} años</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {cotizacion.inversores && (
              <div className="p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Inversores</p>
                <div className="space-y-2">
                  {cotizacion.inversores.tipo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.inversores.tipo}</span>
                    </div>
                  )}
                  {cotizacion.inversores.marca && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Marca:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.inversores.marca}</span>
                    </div>
                  )}
                  {cotizacion.inversores.modelo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Modelo:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.inversores.modelo}</span>
                    </div>
                  )}
                  {cotizacion.inversores.potencia_kw && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Potencia:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.inversores.potencia_kw} W</span>
                    </div>
                  )}
                  {cotizacion.inversores.precio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(cotizacion.inversores.precio)}</span>
                    </div>
                  )}
                  {cotizacion.inversores.garantia_anos && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Garantía:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.inversores.garantia_anos} años</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {cotizacion.estructura && (
              <div className="p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Estructura</p>
                <div className="space-y-2">
                  {cotizacion.estructura.tipo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.estructura.tipo}</span>
                    </div>
                  )}
                  {cotizacion.estructura.material && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Material:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.estructura.material}</span>
                    </div>
                  )}
                  {cotizacion.estructura.precio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(cotizacion.estructura.precio)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {cotizacion.sistema_electrico && (
              <div className="p-4 rounded-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Sistema Eléctrico</p>
                <div className="space-y-2">
                  {cotizacion.sistema_electrico.descripcion && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Descripción:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.sistema_electrico.descripcion}</span>
                    </div>
                  )}
                  {cotizacion.sistema_electrico.tiempo_instalacion_dias && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tiempo de Instalación:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.sistema_electrico.tiempo_instalacion_dias} días</span>
                    </div>
                  )}
                  {cotizacion.sistema_electrico.garantia_instalacion_anos && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Garantía:</span>
                      <span className="text-sm text-gray-900 font-medium">{cotizacion.sistema_electrico.garantia_instalacion_anos} años</span>
                    </div>
                  )}
                  {cotizacion.sistema_electrico.precio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(cotizacion.sistema_electrico.precio)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenTab;
