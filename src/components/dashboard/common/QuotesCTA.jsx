import React from 'react';

const QuotesCTA = () => {
  return (
    <div className="flex-1">
      <div
        className="p-3 rounded-2xl border border-gray-100 h-full flex items-center justify-between"
        style={{ backgroundColor: "#fcfcfc" }}
      >
        <div className="flex-1 pr-3">
          <h2 className="text-sm font-extrabold text-gray-900 mb-1">
            Cotiza energía solar de forma segura
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            className="rounded-2xl w-[280px] h-[160px] grid place-items-center"
            style={{ backgroundColor: "#0b0f17" }}
          >
            <div className="text-center leading-[1.05]">
              <span className="block text-white font-extrabold tracking-wide text-sm">Solicitar</span>
              <span className="block text-white font-extrabold tracking-wide text-sm">Cotizaciones</span>
              <div className="mt-3 w-10 h-10 bg-white rounded-full grid place-items-center mx-auto">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M10 6l6 6-6 6" stroke="#0b0f17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotesCTA;
