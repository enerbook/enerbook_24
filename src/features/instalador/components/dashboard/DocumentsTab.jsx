import React from 'react';

const DocumentsTab = ({ documentStatus, handleDocumentAction }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos del proveedor</h2>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">DOCUMENTO</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">ESTATUS</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">ARCHIVO</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(documentStatus).map(([docName, docData]) => (
                <tr key={docName} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{docName}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      docData.uploaded
                        ? 'text-green-800 bg-green-100'
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {docData.uploaded ? 'SUBIDO' : 'NO SUBIDO'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{docData.filename}</td>
                  <td className="py-4 px-6">
                    {docData.uploaded ? (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                          Ver
                        </button>
                        <button className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                          Descargar
                        </button>
                        <button
                          onClick={() => handleDocumentAction(docName, 'Reemplazar')}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                        >
                          Reemplazar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDocumentAction(docName, 'Subir')}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                      >
                        Subir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
