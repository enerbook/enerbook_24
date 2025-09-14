import React from 'react';
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedHeader from './Header';

const AppLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <UnifiedSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col max-h-screen">
        <UnifiedHeader />
        <main className="flex-1 px-8 py-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
