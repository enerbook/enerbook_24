// components/dashboard/MetricTile.jsx
import React from "react";

const MetricTile = ({ title, value, subtitle }) => {
  return (
    <div
      className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between"
      style={{ backgroundColor: "#fcfcfc" }} // sin sombras
    >
      <div className="min-w-0 pr-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-[17px] font-extrabold text-gray-900 mt-1 leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>
      </div>
      <div
        className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0"
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

export default MetricTile;
