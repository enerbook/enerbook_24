import React from 'react';

const ChartCard = ({ title, subtitle, gradientFrom, gradientTo, chartGradientFrom, chartGradientTo, className = "" }) => {
  return (
    <div className={`p-8 rounded-lg border border-gray-100 ${className}`} style={{backgroundColor: '#fcfcfc'}}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6">
        {subtitle}
      </p>
      <div className="h-64 relative overflow-hidden rounded-lg" style={{background: 'linear-gradient(to bottom, rgba(245,158,11,0.1) 0%, rgba(255,203,69,0.05) 100%)'}}>
        {/* Line chart simulation */}
        <div className="absolute bottom-0 left-0 w-full h-40">
          <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`line-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FFCB45" />
              </linearGradient>
            </defs>
            {/* Main line with gradient */}
            <path
              d="M0,120 L50,100 L100,80 L150,70 L200,85 L250,75 L300,60 L350,65 L400,50"
              stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border-r border-b border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-400">
          <span>300</span>
          <span>250</span>
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-2 left-8 right-4 flex justify-between text-xs text-gray-400">
          <span>Ene</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;