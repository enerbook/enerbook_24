import React from "react";
import Reveal from "./Reveal";
import { router } from 'expo-router';

const InstallersCTA = () => {
  const handleLoginClick = (e) => {
    e.preventDefault();
    router.push('/installer-login');
  };

  return (
    <section
      id="installers"
      className="relative z-[2] bg-white mt-0 py-16 sm:py-20 md:py-24 lg:py-28 min-h-[60vh] flex items-center"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-y-6 sm:gap-y-8 md:gap-y-10 lg:gap-10 items-start">
        {/* Izquierda: título */}
        <Reveal className="lg:col-span-5 text-center lg:text-left">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900">
            ¿Eres instalador?
            <br />
            Esto es para ti
          </h3>
        </Reveal>

        {/* Derecha: texto + botón */}
        <Reveal className="lg:col-span-7" delay={0.05}>
          <div className="max-w-2xl lg:ml-2 mx-auto lg:mx-0">
            <p className="text-base sm:text-lg xl:text-xl leading-6 sm:leading-7 text-gray-700 text-center lg:text-left">
              En <a href="#" className="text-brand font-semibold">enerbook</a> estamos formando el Power Team: una red
              exclusiva de instaladores solares verificados y profesionales. Únete y recibe clientes listos para comprar,
              sin llamadas innecesarias ni pérdida de tiempo. Nosotros te conectamos. Tú haces lo que mejor sabes:
              instalar energía que transforma.
            </p>

          <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
            <div className="relative p-1 rounded-3xl bg-[#5a7cfa]">
              <button
                onClick={handleLoginClick}
                className="
                  block px-4 sm:px-6 xl:px-8 py-3 sm:py-4
                  bg-[#0b1220] rounded-3xl
                  font-extrabold uppercase tracking-wide
                  text-white text-xs sm:text-sm xl:text-base
                  transition-transform hover:scale-105
                  min-h-[48px] flex items-center justify-center
                  cursor-pointer
                "
              >
                UNIRME AL POWER TEAM
              </button>
            </div>
          </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default InstallersCTA;
  