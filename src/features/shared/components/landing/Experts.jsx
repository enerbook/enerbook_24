
import React from "react";
import Reveal from "./Reveal";

const Experts = () => {
  return (
<section
  id="experts"
  className="relative bg-[#090e1a] min-h-screen flex items-center py-12 sm:py-16 md:py-20 z-10 overflow-visible"
>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <Reveal>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6 sm:mb-8 px-4">
              <span className="block">LA RED DE</span>
              <span className="block">EXPERTOS</span>
              <span className="block">SOLARES MÁS</span>
              <span className="block">CONFIABLE</span>
            </h2>

            <a href="#partners" className="mt-4 sm:mt-6 inline-block text-base sm:text-lg xl:text-xl text-white/70 hover:text-white transition-colors duration-300">
              Leer más
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="w-full">
          <div className="relative flex justify-center px-4">
            <img
              src="/img/ener.png"
              alt="Expertos Enerbook"
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px] xl:max-w-[560px] h-auto mt-8 sm:mt-12 md:mt-16"
            />
            <div className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-24 sm:h-32 md:h-40 blue-glow opacity-70" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Experts;
