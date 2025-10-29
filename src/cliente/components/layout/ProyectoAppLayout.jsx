import React from 'react';
import ProyectoSidebar from './ProyectoSidebar';
import AppLayout from './AppLayout';

const ProyectoAppLayout = ({ activeTab, onTabChange, proyecto, children }) => {
  return (
    <AppLayout
      SidebarComponent={ProyectoSidebar}
      sidebarProps={{ activeTab, onTabChange, proyecto }}
    >
      {children}
    </AppLayout>
  );
};

export default ProyectoAppLayout;
