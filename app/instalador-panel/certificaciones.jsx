import React, { useState } from 'react';
import CertificationsTab from '../../src/instalador/components/dashboard/CertificationsTab';
import UploadCertificationModal from '../../src/instalador/components/modals/UploadCertificationModal';

export default function InstaladorCertificacionesScreen() {
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [uploadingCertification, setUploadingCertification] = useState(null);
  const [certificationAction, setCertificationAction] = useState('');
  const [certificationStatus, setCertificationStatus] = useState({
    'ISO 9001:2015': { uploaded: true, filename: 'certificado___ISO_9001.pdf', obtainedDate: '2024-05-14', expirationDate: '2025-05-14', description: 'Certificación de calidad ISO 9001:2015' },
    'CE': { uploaded: true, filename: 'certificado_CE.pdf', obtainedDate: '2023-03-09', expirationDate: '2024-03-09', description: 'Certificación CE para productos' },
    'UL': { uploaded: true, filename: 'certificado_UL.pdf', obtainedDate: '2024-01-31', expirationDate: '2026-01-31', description: 'Certificación UL de seguridad' }
  });

  const handleCertificationAction = (certName, action) => {
    setUploadingCertification(certName);
    setCertificationAction(action);
    setShowCertificationModal(true);
  };

  const handleCertificationUpload = () => {
    if (uploadingCertification) {
      setCertificationStatus(prev => ({ ...prev, [uploadingCertification]: { ...prev[uploadingCertification], uploaded: true } }));
      setShowCertificationModal(false);
      setUploadingCertification(null);
      setCertificationAction('');
    }
  };

  return (
    <>
      <CertificationsTab certificationStatus={certificationStatus} handleCertificationAction={handleCertificationAction} />
      {showCertificationModal && (
        <UploadCertificationModal
          certificationAction={certificationAction}
          setShowCertificationModal={setShowCertificationModal}
          handleCertificationUpload={handleCertificationUpload}
        />
      )}
    </>
  );
}
