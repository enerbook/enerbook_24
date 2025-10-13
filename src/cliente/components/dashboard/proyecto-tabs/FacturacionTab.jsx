import React from 'react';
import { FiDownload, FiFileText, FiDollarSign, FiCalendar } from 'react-icons/fi';

const FacturacionTab = ({ proyecto, cotizaciones }) => {
  // Filtrar cotizaciones aceptadas
  const cotizacionesAceptadas = cotizaciones.filter(c => c.estado === 'aceptada');

  // Mock data para documentos de facturación (esto se conectará a la base de datos)
  const documentos = [
    {
      id: 1,
      tipo: 'Factura',
      numero: 'FAC-2024-001',
      fecha: '2024-03-15',
      monto: 150000,
      estado: 'pagado',
      archivo: null
    },
    {
      id: 2,
      tipo: 'Anticipo',
      numero: 'ANT-2024-001',
      fecha: '2024-02-10',
      monto: 75000,
      estado: 'pagado',
      archivo: null
    }
  ];

  const totalPagado = documentos
    .filter(d => d.estado === 'pagado')
    .reduce((sum, d) => sum + d.monto, 0);

  const totalPendiente = cotizacionesAceptadas.reduce((sum, c) => sum + (c.precio_total || 0), 0) - totalPagado;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Facturación</h1>
            <p className="text-sm text-gray-600">Documentos financieros y pagos del proyecto</p>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiDollarSign className="w-4 h-4 text-green-600 mr-2" />
              <p className="text-xs text-gray-500">Total Pagado</p>
            </div>
            <p className="text-lg font-bold text-green-600">
              ${totalPagado.toLocaleString()} MXN
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiDollarSign className="w-4 h-4 text-orange-600 mr-2" />
              <p className="text-xs text-gray-500">Pendiente</p>
            </div>
            <p className="text-lg font-bold text-orange-600">
              ${totalPendiente.toLocaleString()} MXN
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiFileText className="w-4 h-4 text-blue-600 mr-2" />
              <p className="text-xs text-gray-500">Documentos</p>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {documentos.length}
            </p>
          </div>
        </div>
      </div>

      {/* Cotizaciones Aceptadas */}
      {cotizacionesAceptadas.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Cotizaciones Aceptadas</h2>
          <div className="space-y-3">
            {cotizacionesAceptadas.map((cotizacion) => (
              <div key={cotizacion.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cotizacion.proveedores?.nombre_empresa || 'Instalador'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Aceptada el {new Date(cotizacion.updated_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${cotizacion.precio_total?.toLocaleString()} MXN
                    </p>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aceptada
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos de Facturación */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Documentos</h2>

        {documentos.length === 0 ? (
          <div className="text-center py-8">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay documentos disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentos.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mr-3">
                      <FiFileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.tipo} - {doc.numero}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {new Date(doc.fecha).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-sm font-bold text-gray-900">
                      ${doc.monto.toLocaleString()} MXN
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.estado === 'pagado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {doc.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>

                  <button
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Descargar documento"
                  >
                    <FiDownload className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Información</h3>
            <p className="text-xs text-blue-700 mt-1">
              Los documentos de facturación estarán disponibles una vez que el instalador los genere.
              Recibirás una notificación por email cuando haya nuevos documentos disponibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturacionTab;
