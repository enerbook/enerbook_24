import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AppLayout from '../src/components/common/AppLayout';
import { useAuth } from '../src/context/AuthContext';
import ProfileTab from '../src/components/installer-dashboard/ProfileTab';
import DocumentsTab from '../src/components/installer-dashboard/DocumentsTab';
import CertificationsTab from '../src/components/installer-dashboard/CertificationsTab';
import ProjectsTab from '../src/components/installer-dashboard/ProjectsTab';
import ProjectDetailsModal from '../src/components/installer-dashboard/ProjectDetailsModal';
import SendQuoteModal from '../src/components/installer-dashboard/SendQuoteModal';
import UploadDocumentModal from '../src/components/installer-dashboard/UploadDocumentModal';
import UploadCertificationModal from '../src/components/installer-dashboard/UploadCertificationModal';

const InstallerDashboard = () => {
  const [activeTab, setActiveTab] = useState('proyectos');
  const { user } = useAuth();

  // Si no hay usuario, redirigir al login (esto debería manejarse por el routing)
  useEffect(() => {
    if (!user) {
      console.log('Usuario no autenticado - debería redirigir al login');
    }
  }, [user]);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [uploadAction, setUploadAction] = useState('');
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [uploadingCertification, setUploadingCertification] = useState(null);
  const [certificationAction, setCertificationAction] = useState('');
  const [userProfile, setUserProfile] = useState({
    companyName: 'Solarize Energy',
    email: 'juan.perez@proveedor.com'
  });

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

  const [certificationStatus, setCertificationStatus] = useState({
    'ISO 9001:2015': { uploaded: true, filename: 'certificado___ISO_9001.pdf', obtainedDate: '2024-05-14', expirationDate: '2025-05-14', description: 'Certificación de calidad ISO 9001:2015' },
    'CE': { uploaded: true, filename: 'certificado_CE.pdf', obtainedDate: '2023-03-09', expirationDate: '2024-03-09', description: 'Certificación CE para productos' },
    'UL': { uploaded: true, filename: 'certificado_UL.pdf', obtainedDate: '2024-01-31', expirationDate: '2026-01-31', description: 'Certificación UL de seguridad' }
  });

  const handleDocumentAction = (docName, action) => {
    setUploadingDocument(docName);
    setUploadAction(action);
    setShowUploadModal(true);
  };

  const handleCertificationAction = (certName, action) => {
    setUploadingCertification(certName);
    setCertificationAction(action);
    setShowCertificationModal(true);
  };

  const handleDocumentUpload = () => {
    if (uploadingDocument) {
      setDocumentStatus(prev => ({ ...prev, [uploadingDocument]: { ...prev[uploadingDocument], uploaded: true } }));
      setShowUploadModal(false);
      setUploadingDocument(null);
      setUploadAction('');
    }
  };

  const handleCertificationUpload = () => {
    if (uploadingCertification) {
      setCertificationStatus(prev => ({ ...prev, [uploadingCertification]: { ...prev[uploadingCertification], uploaded: true } }));
      setShowCertificationModal(false);
      setUploadingCertification(null);
      setCertificationAction('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <ProfileTab userProfile={userProfile} />;
      case 'documentos':
        return <DocumentsTab documentStatus={documentStatus} handleDocumentAction={handleDocumentAction} />;
      case 'certificaciones':
        return <CertificationsTab certificationStatus={certificationStatus} handleCertificationAction={handleCertificationAction} />;
      case 'proyectos':
        return <ProjectsTab setSelectedProject={setSelectedProject} setShowProjectModal={setShowProjectModal} setShowQuoteModal={setShowQuoteModal} />;
      default:
        return <ProjectsTab setSelectedProject={setSelectedProject} setShowProjectModal={setShowProjectModal} setShowQuoteModal={setShowQuoteModal} />;
    }
  };

  if (!user) {
    return <View />;
  }

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
      {showProjectModal && selectedProject && (
        <ProjectDetailsModal project={selectedProject} setShowProjectModal={setShowProjectModal} />
      )}
      {showQuoteModal && selectedProject && (
        <SendQuoteModal project={selectedProject} setShowQuoteModal={setShowQuoteModal} />
      )}
      {showUploadModal && (
        <UploadDocumentModal
          uploadAction={uploadAction}
          setShowUploadModal={setShowUploadModal}
          handleDocumentUpload={handleDocumentUpload}
        />
      )}
      {showCertificationModal && (
        <UploadCertificationModal
          certificationAction={certificationAction}
          setShowCertificationModal={setShowCertificationModal}
          handleCertificationUpload={handleCertificationUpload}
        />
      )}
    </AppLayout>
  );
};

export default InstallerDashboard;
