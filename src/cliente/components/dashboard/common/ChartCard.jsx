import React from 'react';
import PropTypes from 'prop-types';

// Helper functions for chart data processing
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

  // Generate smooth curve using Catmull-Rom spline
  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Calculate control points for smooth curve
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

const getYAxisLabels = (data, steps = 6) => {
  if (!data || data.length === 0) return ['300', '250', '200', '150', '100', '50'];

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  const step = range / (steps - 1);

  return Array.from({ length: steps }, (_, i) =>
    Math.round(maxValue - (step * i)).toString()
  );
};

const ChartCard = ({ title, subtitle, className = "", data = [], chartType = "default" }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState(null);
  const svgRef = React.useRef(null);
  const [chartWidth, setChartWidth] = React.useState(500);
  const chartHeight = 240;
  const padding = 40;

  // Calculate thresholds based on percentiles
  const calculateThresholds = React.useMemo(() => {
    if (!data || data.length === 0) return { low: 0, medium: 0, high: Infinity };

    const values = data.map(d => d.value).sort((a, b) => a - b);
    const p33 = values[Math.floor(values.length * 0.33)] || values[0];
    const p66 = values[Math.floor(values.length * 0.66)] || values[values.length - 1];

    return {
      low: p33,
      medium: p66,
      high: values[values.length - 1]
    };
  }, [data]);

  // Get color based on value and chart type
  const getPointColor = (value) => {
    if (chartType === 'consumo') {
      // High consumption = darker (alert)
      if (value >= calculateThresholds.medium) return '#C2640A'; // Dark orange (high cost)
      if (value >= calculateThresholds.low) return '#F59E0B';    // Medium orange (normal)
      return '#FFCB45';                                           // Light yellow (efficient)
    } else if (chartType === 'irradiacion') {
      // High irradiation = darker (opportunity)
      if (value >= calculateThresholds.medium) return '#C2640A'; // Dark orange (excellent)
      if (value >= calculateThresholds.low) return '#F59E0B';    // Medium orange (good)
      return '#FFCB45';                                           // Light yellow (moderate)
    }
    return '#F59E0B'; // Default color
  };

  // Get point size based on value
  const getPointRadius = (value) => {
    const isExtreme = value >= calculateThresholds.medium || value < calculateThresholds.low;
    return hoveredPoint !== null ? "7" : (isExtreme ? "6" : "5");
  };

  // Get contextual label for tooltip
  const getValueLabel = (value) => {
    if (chartType === 'consumo') {
      if (value >= calculateThresholds.medium) return 'Alto';
      if (value >= calculateThresholds.low) return 'Medio';
      return 'Bajo';
    } else if (chartType === 'irradiacion') {
      if (value >= calculateThresholds.medium) return 'Excelente';
      if (value >= calculateThresholds.low) return 'Bueno';
      return 'Moderado';
    }
    return '';
  };

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

  // Generate gradient stops based on chart type
  const getAreaGradientStops = () => {
    if (chartType === 'consumo') {
      // Consumo Histórico: Simple gradiente de naranja Enerbook
      return [
        { offset: '0%', color: '#f59f0b', opacity: 0.4 },    // Naranja Enerbook
        { offset: '50%', color: '#FFCB45', opacity: 0.2 },   // Amarillo Enerbook
        { offset: '100%', color: '#FFCB45', opacity: 0.05 }  // Amarillo muy transparente
      ];
    } else if (chartType === 'irradiacion') {
      // Irradiación Mensual: Gradiente más intenso para mostrar oportunidad
      return [
        { offset: '0%', color: '#f59f0b', opacity: 0.5 },    // Naranja Enerbook
        { offset: '50%', color: '#FFCB45', opacity: 0.25 },  // Amarillo Enerbook
        { offset: '100%', color: '#FFCB45', opacity: 0.08 }  // Amarillo muy transparente
      ];
    } else {
      // Default: Original gradient
      return [
        { offset: '0%', color: '#F59E0B', opacity: 0.3 },
        { offset: '50%', color: '#FFCB45', opacity: 0.15 },
        { offset: '100%', color: '#FFCB45', opacity: 0.05 }
      ];
    }
  };

  const areaGradientStops = getAreaGradientStops();

  return (
    <div
      className={`p-8 rounded-2xl border border-gray-200 ${className}`}
      style={{backgroundColor: '#fcfcfc'}}
    >
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

      {data.length === 0 && (
        <div className="mb-4 px-3 py-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </div>
      )}

      <div className="relative w-full" style={{ height: chartHeight }}>
        <svg
          ref={svgRef}
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="rounded-lg"
        >
          <defs>
            {/* Gradient for line */}
            <linearGradient id={`line-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
            {/* Gradient for area fill - dynamic based on chart type */}
            <linearGradient id={`area-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              {areaGradientStops.map((stop, index) => (
                <stop
                  key={index}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = padding + (i * (chartHeight - padding * 2) / 5);
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
            const y = padding + (i * (chartHeight - padding * 2) / 5);
            return (
              <text
                key={`ylabel-${i}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
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
              fontSize="12"
              fill="#9ca3af"
            >
              {point.label || ''}
            </text>
          ))}

          {/* Area fill under the line */}
          {path && points.length > 0 && (
            <path
              d={`${path} L${points[points.length - 1].x},${chartHeight - padding} L${points[0].x},${chartHeight - padding} Z`}
              fill={`url(#area-gradient-${title.replace(/\s+/g, '-')})`}
              stroke="none"
            />
          )}

          {/* Line path */}
          {path && (
            <path
              d={path}
              fill="none"
              stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points with hover */}
          {points.map((point, i) => {
            const color = getPointColor(point.value);
            const radius = hoveredPoint === i ? "7" : getPointRadius(point.value);

            return (
              <g key={`point-${i}`}>
                {/* Larger invisible circle for easier hover */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Visible dot with dynamic color */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    pointerEvents: 'none',
                    transition: 'all 0.2s'
                  }}
                />
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredPoint !== null && points[hoveredPoint] && (() => {
            const value = points[hoveredPoint].value;
            const label = getValueLabel(value);
            const color = getPointColor(value);
            const tooltipWidth = 80;
            const tooltipHeight = 45;

            return (
              <g>
                {/* Tooltip background with dynamic color */}
                <rect
                  x={points[hoveredPoint].x - tooltipWidth / 2}
                  y={points[hoveredPoint].y - tooltipHeight - 10}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="6"
                  fill={color}
                  fillOpacity="0.9"
                />
                {/* Value text */}
                <text
                  x={points[hoveredPoint].x}
                  y={points[hoveredPoint].y - 30}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="700"
                  fill="white"
                >
                  {value.toFixed(2)}
                </text>
                {/* Label text */}
                <text
                  x={points[hoveredPoint].x}
                  y={points[hoveredPoint].y - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="white"
                  fillOpacity="0.9"
                >
                  {label}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  className: PropTypes.string,
  chartType: PropTypes.oneOf(['consumo', 'irradiacion', 'default']),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string,
      fullLabel: PropTypes.string
    })
  )
};

ChartCard.defaultProps = {
  className: "",
  chartType: "default",
  data: []
};

export default ChartCard;
