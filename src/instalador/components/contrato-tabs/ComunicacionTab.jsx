import React from 'react';

const ComunicacionTab = ({ contrato, cliente }) => {
  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Comunicación con el Cliente</h2>
        <p className="text-sm text-gray-600">
          Chat y mensajes con {cliente?.nombre || 'el cliente'}
        </p>
      </div>

      {/* Información del Cliente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm text-gray-900">{cliente?.nombre || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm text-gray-900">{cliente?.correo_electronico || 'N/A'}</p>
            </div>
          </div>
          {cliente?.telefono && (
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Teléfono</p>
                <p className="text-sm text-gray-900">{cliente.telefono}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Placeholder para chat */}
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Mensajería</h3>
        <p className="text-sm text-gray-600">
          El chat en tiempo real con el cliente estará disponible próximamente
        </p>
      </div>
    </div>
  );
};

export default ComunicacionTab;
