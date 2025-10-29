import React from 'react';
import ClientSidebar from '../ClientSidebar';
import AppLayout from './AppLayout';

const ClienteAppLayout = ({ activeTab, children }) => {
  return (
    <AppLayout
      SidebarComponent={ClientSidebar}
      sidebarProps={{ activeTab }}
    >
      {children}
    </AppLayout>
  );
};

export default ClienteAppLayout;
