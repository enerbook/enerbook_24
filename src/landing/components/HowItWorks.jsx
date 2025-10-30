
import React from "react";
import Reveal from "./Reveal";
import { GRADIENTS } from '../../shared/config/gradients';

export default function HowItWorks({ onNavigate, onOpenModal }) {
  return (
    <section id="how" className="relative bg-white overflow-hidden min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título con logo */}
<header className="mb-6 sm:mb-8 md:mb-10">
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
     <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold uppercase text-[#0b1220] leading-tight text-center sm:text-left">
      CÓMO FUNCIONA
    </h2>

    {/* LOGO MÁS GRANDE */}
    <img
      src="/img/Iconcolor.svg"
      alt="Enerbook" 
      className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-18 lg:w-18 xl:h-20 xl:w-20 select-none pointer-events-none"
    />
  </div>
</header>




        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Columna izquierda (pasos) */}
       <div className="space-y-6 max-w-lg mx-auto md:mx-0 order-2 md:order-1 px-4 sm:px-0 md:px-0">

            {/* Paso 1 */}
            <div>
              <div className="bg-[#0b1220] text-white rounded-md sm:rounded-lg md:rounded-xl lg:rounded-xl px-3 sm:px-3 md:px-3 lg:px-4 xl:px-5 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 text-center transition-all duration-300">
                <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl uppercase leading-tight transition-all duration-300">
                  SUBE TU RECIBO
                </h3>
              </div>
              <p className="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm 2xl:text-base text-gray-800 mt-1 sm:mt-2 md:mt-3 lg:mt-3 xl:mt-3 text-left leading-tight transition-all duration-300">
                Toma una foto o súbelo desde tu celular o computadora.<br />
                Analizamos tu consumo automáticamente.
              </p>
            </div>

            {/* Paso 2 */}
            <div>
              <div className="bg-[#0b1220] text-white rounded-md sm:rounded-lg md:rounded-xl lg:rounded-xl px-3 sm:px-3 md:px-3 lg:px-4 xl:px-5 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 text-center transition-all duration-300">
                <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl uppercase leading-tight transition-all duration-300">
                  RECIBE PROPUESTAS<br />VERIFICADAS
                </h3>
              </div>
              <p className="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm 2xl:text-base text-gray-800 mt-1 sm:mt-2 md:mt-3 lg:mt-3 xl:mt-3 text-left leading-tight transition-all duration-300">
                Instaladores certificados analizan tu caso y te<br />
                mandan cotizaciones. Sin llamadas ni compromisos.
              </p>
            </div>

            {/* Paso 3 */}
            <div>
              <div className="bg-[#0b1220] text-white rounded-md sm:rounded-lg md:rounded-xl lg:rounded-xl px-3 sm:px-3 md:px-3 lg:px-4 xl:px-5 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 text-center transition-all duration-300">
                <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl uppercase leading-tight transition-all duration-300">
                  COMPARA Y CONTRATA 100%<br />ONLINE
                </h3>
              </div>
              <p className="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm 2xl:text-base text-gray-800 mt-1 sm:mt-2 md:mt-3 lg:mt-3 xl:mt-3 text-left leading-tight transition-all duration-300">
                Evalúa beneficios, precios y garantías.<br />
                Elige la mejor opción desde <span className="text-orange-500 font-semibold">enerbook</span>, rápido y seguro.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-8 relative z-20">
              <button
                onClick={onOpenModal}
                className="inline-flex items-center justify-center text-white font-bold py-2 sm:py-3 md:py-3 lg:py-4 xl:py-4 px-3 sm:px-6 md:px-6 lg:px-8 xl:px-10 rounded-md sm:rounded-lg md:rounded-xl lg:rounded-xl uppercase transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg"
                style={{ background: GRADIENTS.primary }}
              >
                CONECTAR RECIBO
              </button>
            </div>
          </div>

          {/* Columna derecha: personaje */}
          <div className="relative flex justify-center md:justify-end order-1 md:order-2">
            <div className="relative">
              {/* Fondo gris */}
              <div className="hidden md:block absolute inset-0 bg-gray-200 rounded-[60px] transform translate-x-4 translate-y-8 -z-10"></div>
              <img
                src="/img/personaje.png"
                alt="Personaje Enerbook"
                className="w-full max-w-[320px] md:max-w-[400px] h-auto select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
