import React, { useState } from 'react';
import ProjectsTab from '../../src/instalador/components/dashboard/ProjectsTab';
import ProjectDetailsModal from '../../src/instalador/components/modals/ProjectDetailsModal';
import SendQuoteModal from '../../src/instalador/components/modals/SendQuoteModal';

export default function InstaladorProyectosScreen() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  return (
    <>
      <ProjectsTab
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
