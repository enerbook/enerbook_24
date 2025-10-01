import React from 'react';
import UserInfoBar from '../common/UserInfoBar';
import QuotesCTA from '../common/QuotesCTA';
import MetricsGrid from '../common/MetricsGrid';
import AnalysisCharts from '../common/AnalysisCharts';

const DashboardTab = () => {
  return (
    <div className="w-full">
      <UserInfoBar />
      <div className="px-2 lg:px-4 pt-2 pb-8">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <QuotesCTA />
            <MetricsGrid />
          </div>
          <AnalysisCharts />
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;