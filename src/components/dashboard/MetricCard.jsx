import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: IconComponent, className = "" }) => {
  // Función para obtener el SVG correcto según el tipo de métrica
  const getSvgIcon = () => {
    const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;
    
    if (title.includes('Consumo')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
          </defs>
          <path d="M3,3H5V13H9V7H11V13H15V10H17V13H19V15H17V18H19V20H5V18H7V15H5V13H3V3M7,5V13H9V9H11V13H13V5H7Z" fill={`url(#${gradientId})`} />
        </svg>
      );
    }
    
    if (title.includes('Sistema') || title.includes('Requerido')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
          </defs>
          <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" fill={`url(#${gradientId})`} />
        </svg>
      );
    }
    
    if (title.includes('Irradiación')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
          </defs>
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18M20,12.5H23V11.5H20V12.5M1,12.5H4V11.5H1V12.5M12.5,1V4H11.5V1H12.5M12.5,20V23H11.5V20H12.5M6.05,6.05L7.46,4.64L6.76,3.93L5.34,5.34L6.05,6.05M17.24,17.24L18.66,15.83L17.95,15.12L16.54,16.54L17.24,17.24M18.66,8.17L17.24,6.76L16.54,7.46L17.95,8.88L18.66,8.17M5.34,18.66L6.76,17.24L6.05,16.54L4.64,17.95L5.34,18.66Z" fill={`url(#${gradientId})`} />
        </svg>
      );
    }
    
    if (title.includes('Producción')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
          </defs>
          <path d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16C14.89,22 14,21.1 14,20V19H8V20C8,21.1 7.11,22 6,22H2V20H4A1,1 0 0,0 5,19V5A1,1 0 0,0 4,4H2V2H6C7.11,2 8,2.9 8,4V5H14V4C14,2.9 14.89,2 16,2H20V4H18A1,1 0 0,0 17,5V7M15,9V15H9V9H15M13,11H11V13H13V11Z" fill={`url(#${gradientId})`} />
        </svg>
      );
    }
    
    // Fallback icon
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FFCB45" />
          </linearGradient>
        </defs>
        <path d="M3,3H5V13H9V7H11V13H15V10H17V13H19V15H17V18H19V20H5V18H7V15H5V13H3V3M7,5V13H9V9H11V13H13V5H7Z" fill={`url(#${gradientId})`} />
      </svg>
    );
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-100 relative ${className}`} style={{backgroundColor: '#fcfcfc'}}>
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 flex flex-col justify-center">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</h4>
          <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ml-4"
          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;