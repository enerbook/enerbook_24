import React from 'react';

// Generate smooth SVG path from data points
const generatePath = (data, width, height, padding) => {
  if (!data || data.length === 0) return "";
  if (data.length === 1) return `M${width/2},${height/2}`;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = data.length === 1 ? width/2 : (index / (data.length - 1)) * (width - padding * 2) + padding;
    const normalizedValue = (point.value - minValue) / range;
    const y = height - padding - (normalizedValue * (height - padding * 2));
    return { x, y, value: point.value, label: point.label };
  });

  // Smooth curve using Catmull-Rom spline
  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const tension = 0.2;
    const prev = points[i - 1] || current;
    const after = points[i + 2] || next;

    const cp1x = current.x + (next.x - prev.x) * tension;
    const cp1y = current.y + (next.y - prev.y) * tension;
    const cp2x = next.x - (after.x - current.x) * tension;
    const cp2y = next.y - (after.y - current.y) * tension;

    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }

  return { path, points };
};

const getYAxisLabels = (data, steps = 5) => {
  if (!data || data.length === 0) return ['100', '80', '60', '40', '20'];

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  const step = range / (steps - 1);

  return Array.from({ length: steps }, (_, i) =>
    Math.round(maxValue - (step * i)).toString()
  );
};

const TrendChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState(null);
  const svgRef = React.useRef(null);
  const [chartWidth, setChartWidth] = React.useState(500);
  const chartHeight = 240;
  const padding = 40;

  // Update chart width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement.offsetWidth;
        setChartWidth(containerWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const { path, points } = data.length > 0
    ? generatePath(data, chartWidth, chartHeight, padding)
    : { path: "", points: [] };

  const yLabels = getYAxisLabels(data);

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-500">No hay datos de tendencias disponibles</p>
        </div>
      ) : (
        <svg
          ref={svgRef}
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Line gradient */}
            <linearGradient id="trend-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
            {/* Area fill gradient */}
            <linearGradient id="trend-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59f0b" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#FFCB45" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFCB45" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + (i * (chartHeight - padding * 2) / 4);
            return (
              <line
                key={`grid-${i}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const y = padding + (i * (chartHeight - padding * 2) / 4);
            return (
              <text
                key={`ylabel-${i}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#9ca3af"
              >
                {label}
              </text>
            );
          })}

          {/* X-axis labels */}
          {points.map((point, i) => (
            <text
              key={`xlabel-${i}`}
              x={point.x}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#9ca3af"
            >
              {point.label || ''}
            </text>
          ))}

          {/* Area fill */}
          {path && points.length > 0 && (
            <path
              d={`${path} L${points[points.length - 1].x},${chartHeight - padding} L${points[0].x},${chartHeight - padding} Z`}
              fill="url(#trend-area-gradient)"
              stroke="none"
            />
          )}

          {/* Line path */}
          {path && (
            <path
              d={path}
              fill="none"
              stroke="url(#trend-line-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point, i) => (
            <g key={`point-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="15"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === i ? "6" : "4"}
                fill="#F59E0B"
                stroke="white"
                strokeWidth="2"
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </g>
          ))}

          {/* Tooltip */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <g>
              <rect
                x={points[hoveredPoint].x - 35}
                y={points[hoveredPoint].y - 40}
                width="70"
                height="30"
                rx="6"
                fill="#F59E0B"
                fillOpacity="0.95"
              />
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 20}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="white"
              >
                {points[hoveredPoint].value}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

export default TrendChart;