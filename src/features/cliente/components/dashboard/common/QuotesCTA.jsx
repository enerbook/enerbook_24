import React from 'react';
import { useSolicitarCotizaciones } from '../../../hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../../modals/SolicitarCotizacionesModal';

const QuotesCTA = () => {
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();

  return (
    <div className="w-full lg:flex-1">
      <div
        className="p-4 lg:p-3 rounded-2xl border border-gray-100 h-full flex flex-col lg:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: "#fcfcfc" }}
      >
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-sm font-extrabold text-gray-900 mb-1">
            Cotiza energía solar de forma segura
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Recibe propuestas de instaladores verificados y selecciona la mejor opción para tu proyecto.
          </p>
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto">
          <button
            onClick={openModal}
            className="rounded-2xl w-full lg:w-[280px] h-[120px] lg:h-[160px] grid place-items-center hover:opacity-90 transition-opacity"
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

      <SolicitarCotizacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default QuotesCTA;