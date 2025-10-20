import React from 'react';

const CertificationsTab = ({ certificationStatus, handleCertificationAction }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-gray-900">Certificaciones del proveedor</h2>
        <button
          onClick={() => handleCertificationAction('Nueva certificación', 'Agregar')}
          className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
          </svg>
          Agrega Certificación
        </button>
      </div>

      {/* Certifications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm tracking-wider">Certificación</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm tracking-wider">Archivo Pdf</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm tracking-wider">Vigencia</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(certificationStatus).map(([certName, certData]) => (
                <tr key={certName} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{certName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{certData.filename}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{certData.expirationDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                        Ver
                      </button>
                      <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                        Descargar
                      </button>
                      <button
                        onClick={() => handleCertificationAction(certName, 'Reemplazar')}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        Reemplazar
                      </button>
                    </div>
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

export default CertificationsTab;
