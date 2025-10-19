import React, { useState } from 'react';
import CotizacionesTab from '../../src/instalador/components/dashboard/CotizacionesTab';
import ProjectDetailsModal from '../../src/instalador/components/modals/ProjectDetailsModal';
import SendQuoteModal from '../../src/instalador/components/modals/SendQuoteModal';

export default function InstaladorCotizacionesScreen() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  return (
    <>
      <CotizacionesTab
        setSelectedProject={setSelectedProject}
        setShowProjectModal={setShowProjectModal}
        setShowQuoteModal={setShowQuoteModal}
      />
      {showProjectModal && selectedProject && (
        <ProjectDetailsModal project={selectedProject} setShowProjectModal={setShowProjectModal} />
      )}
      {showQuoteModal && selectedProject && (
        <SendQuoteModal project={selectedProject} setShowQuoteModal={setShowQuoteModal} />
      )}
    </>
  );
}
