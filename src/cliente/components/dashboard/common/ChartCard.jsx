import React from 'react';

// Helper functions for chart data processing
const generatePath = (data) => {
  if (!data || data.length === 0) return "";
  if (data.length === 1) return `M200,80`; // Center point for single data

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = data.length === 1 ? 200 : (index / (data.length - 1)) * 380 + 10; // 10px padding on sides
    const normalizedValue = (point.value - minValue) / range;
    const y = 140 - (normalizedValue * 100) - 20; // Better padding
    return `${x},${y}`;
  });

  return `M${points.join(' L')}`;
};

const getYAxisLabels = (data) => {
  if (!data || data.length === 0) return ['300', '250', '200', '150', '100', '50'];

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  const step = range / 5;

  return Array.from({ length: 6 }, (_, i) =>
    Math.round(maxValue - (step * i)).toString()
  );
};

const getXAxisLabels = (data) => {
  if (!data || data.length === 0) return ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];

  // Show labels for first, middle, and last points
  const step = Math.max(1, Math.floor(data.length / 5));
  const labels = [];

  for (let i = 0; i < data.length; i += step) {
    if (labels.length < 6) {
      labels.push(data[i].label || `P${i + 1}`);
    }
  }

  // Ensure we have 6 labels for spacing
  while (labels.length < 6) {
    labels.push('');
  }

  return labels.slice(0, 6);
};

const ChartCard = ({ title, subtitle, gradientFrom, gradientTo, chartGradientFrom, chartGradientTo, className = "", data = [] }) => {
  return (
    <div className={`p-8 rounded-lg border border-gray-100 ${className}`} style={{backgroundColor: '#fcfcfc'}}>
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6">
        {subtitle}
      </p>
      {data.length === 0 && (
        <div className="mb-4 px-3 py-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </div>
      )}
      <div className="h-64 relative overflow-hidden rounded-lg" style={{background: 'linear-gradient(to bottom, rgba(245,158,11,0.1) 0%, rgba(255,203,69,0.05) 100%)'}}>
        {/* Line chart with real data */}
        <div className="absolute bottom-0 left-0 w-full h-40">
          <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`line-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FFCB45" />
              </linearGradient>
            </defs>
            {/* Main line with gradient */}
            {data.length > 0 ? (
              <path
                d={generatePath(data)}
                stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
                strokeWidth="4"
                fill="none"
              />
            ) : (
              <path
                d="M10,120 L70,100 L130,80 L190,70 L250,85 L310,75 L370,60"
                stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
                strokeWidth="4"
                fill="none"
                opacity="0.3"
              />
            )}
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
        <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-sm text-gray-400">
          {getYAxisLabels(data).map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-2 left-8 right-4 flex justify-between text-sm text-gray-400">
          {getXAxisLabels(data).map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;