import React, { useState } from 'react';
import DocumentsTab from '../../src/instalador/components/dashboard/DocumentsTab';
import UploadDocumentModal from '../../src/instalador/components/modals/UploadDocumentModal';

export default function InstaladorDocumentosScreen() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [uploadAction, setUploadAction] = useState('');
  const [documentStatus, setDocumentStatus] = useState({
    'IDENTIFICACIÓN OFICIAL': { uploaded: true, filename: 'ine_adj.pdf' },
    'ACTA CONSTITUTIVA': { uploaded: true, filename: 'acta.pdf' },
    'DECLARACIÓN NO DEUDOR': { uploaded: false, filename: 'declaracion_x39742.pdf' },
    'DECLARACIÓN JURADA': { uploaded: false, filename: 'AYYUUDAMEJ.pdf' },
    'PODER NOTARIAL': { uploaded: true, filename: 'notarial_V1.pdf' },
    'DOCUMENTO X': { uploaded: true, filename: 'documento_x.pdf' },
    'DOCUMENTO Y': { uploaded: true, filename: 'documento_y.pdf' },
    'DOCUMENTO Z': { uploaded: false, filename: 'documento_z.pdf' }
  });

  const handleDocumentAction = (docName, action) => {
    setUploadingDocument(docName);
    setUploadAction(action);
    setShowUploadModal(true);
  };

  const handleDocumentUpload = () => {
    if (uploadingDocument) {
      setDocumentStatus(prev => ({ ...prev, [uploadingDocument]: { ...prev[uploadingDocument], uploaded: true } }));
      setShowUploadModal(false);
      setUploadingDocument(null);
      setUploadAction('');
    }
  };

  return (
    <>
      <DocumentsTab documentStatus={documentStatus} handleDocumentAction={handleDocumentAction} />
      {showUploadModal && (
        <UploadDocumentModal
          uploadAction={uploadAction}
          setShowUploadModal={setShowUploadModal}
          handleDocumentUpload={handleDocumentUpload}
        />
      )}
    </>
  );
}
