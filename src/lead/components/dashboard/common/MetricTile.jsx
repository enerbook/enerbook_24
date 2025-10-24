// components/dashboard/MetricTile.jsx
import React from "react";
import PropTypes from 'prop-types';

const MetricTile = ({ title, value, subtitle }) => {
  return (
    <div
      className="p-3 xs:p-4 rounded-xl xs:rounded-2xl border border-gray-100 flex items-center justify-between min-h-[80px] xs:min-h-0"
      style={{ backgroundColor: "#fcfcfc" }} // sin sombras
    >
      <div className="min-w-0 pr-2 xs:pr-3">
        <p className="text-[10px] xs:text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-[15px] xs:text-[17px] font-extrabold text-gray-900 mt-1 leading-none truncate">{value}</p>
        <p className="text-[10px] xs:text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>
      </div>
      <div
        className="w-7 h-7 xs:w-8 xs:h-8 rounded-full grid place-items-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FFCB45 100%)" }}
      >
        {/* “documento” blanco (igual al mockup) */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z" fill="white"/>
          <path d="M14,2V8H20" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

MetricTile.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired
};

// Memoizar componente para evitar re-renders innecesarios
export default React.memo(MetricTile);
