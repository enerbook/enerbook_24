import React from 'react';
import AdminHeader from './AdminHeader';

const AdminAppLayout = ({ adminTabs, activeTab, setActiveTab, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen w-full">
        {/* Header */}
        <AdminHeader
          adminTabs={adminTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content area */}
        <main className="flex-1 px-6 py-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminAppLayout;
