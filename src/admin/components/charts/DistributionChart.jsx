import React from 'react';

const DistributionChart = ({ data = [], title = "Distribución" }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">No hay datos de distribución disponibles</p>
      </div>
    );
  }

  // Calculate percentages and segments
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    return {
      ...item,
      percentage,
      index
    };
  }).filter(s => s.percentage > 0); // Only show non-zero segments

  // Donut chart dimensions
  const size = 200;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate cumulative offsets for donut segments
  let cumulativePercent = 0;

  return (
    <div className="h-64 flex flex-col items-center justify-center">
      {/* Donut Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />

          {/* Colored segments */}
          {segments.map((segment) => {
            const segmentLength = (segment.percentage / 100) * circumference;
            const offset = ((100 - cumulativePercent) / 100) * circumference;

            const currentCumulative = cumulativePercent;
            cumulativePercent += segment.percentage;

            return (
              <circle
                key={segment.index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}

          {/* Center text */}
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fill="#111827"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {title}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 w-full max-w-xs">
        {segments.map((segment) => (
          <div key={segment.index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700 ml-2">{segment.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-bold text-gray-900 mr-1">
                {segment.value}
              </span>
              <span className="text-xs text-gray-500">
                ({segment.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;