import React from "react";
import { FiArrowRight } from "react-icons/fi";
import Reveal from "./Reveal";

export default function Stats() {
  return (
    <section id="stats" className="relative overflow-hidden bg-white min-h-screen flex items-center py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Decorative background circle */}
      <div className="absolute left-1/4 sm:left-1/3 lg:left-1/4 top-2 sm:top-4 -translate-x-1/2 -translate-y-1/4 w-[250px] sm:w-[350px] md:w-[400px] lg:w-[450px] h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-100 rounded-full opacity-40 sm:opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Fila Superior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
            {/* 1+ */}
            <Reveal className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">1+</div>
              <div className="text-xs sm:text-xs font-bold text-gray-600 uppercase tracking-wide leading-tight">
                PROYECTOS SOLARES REALIZADOS
              </div>
            </Reveal>

            {/* 85% */}
            <Reveal delay={0.1} className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">85%</div>
              <div className="text-xs sm:text-xs font-bold text-gray-600 uppercase tracking-wide leading-tight">
                REDUCCIÓN PROMEDIO EN RECIBOS
              </div>
            </Reveal>

            {/* ESTO ES ENERBOOK */}
            <Reveal delay={0.2} className="text-center sm:text-left lg:col-span-1 sm:col-span-2 lg:col-span-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 uppercase">
                ESTO ES ENERBOOK
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg xl:text-xl max-w-xs sm:max-w-sm mx-auto sm:mx-0">
                Estos son los valores que impulsan nuestro avance tecnológico, conectando energía, innovación y confianza en una sola plataforma.
              </p>
              <a 
                href="#partners" 
                className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors text-base sm:text-lg xl:text-xl"
              >
                Leer más
                <FiArrowRight className="ml-2" />
              </a>
            </Reveal>
          </div>

          {/* Fila Inferior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* 311,334 kWh */}
            <Reveal delay={0.3} className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">311,334 kWh</div>
              <div className="text-xs sm:text-xs font-bold text-gray-600 uppercase tracking-wide leading-tight">
                ENERGÍA PRODUCIDA AL AÑO
              </div>
            </Reveal>

            {/* 2+ */}
            <Reveal delay={0.4} className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">2+</div>
              <div className="text-xs sm:text-xs font-bold text-gray-600 uppercase tracking-wide leading-tight">
                ESTADOS CON COBERTURA NACIONAL
              </div>
            </Reveal>

            {/* Logo */}
            <Reveal delay={0.5} className="flex justify-center sm:justify-end lg:justify-end -mt-4 sm:-mt-6 md:-mt-8 sm:col-span-2 lg:col-span-1 order-first sm:order-last">
              <img
                src="/img/FulllogoColor.svg"
                alt="enerbook"
                className="h-24 sm:h-32 md:h-36 lg:h-40 xl:h-44 w-auto"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
