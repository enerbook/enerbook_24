import React from 'react';

const DocumentosTab = ({ contrato, proyecto, onReload }) => {
  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos del Contrato</h2>
        <p className="text-sm text-gray-600">
          Gestiona documentos, permisos y certificaciones relacionados con el contrato
        </p>
      </div>

      {/* Placeholder para funcionalidad futura */}
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Documentos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta sección estará disponible próximamente para subir y gestionar documentos del contrato
        </p>
        {contrato?.archivo_contrato_url && (
          <a
            href={contrato.archivo_contrato_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Ver Contrato Firmado
          </a>
        )}
      </div>
    </div>
  );
};

export default DocumentosTab;
