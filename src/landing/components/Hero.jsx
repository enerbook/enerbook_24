
import React from "react";
import '../../styles/global.css';

export default function Hero({ onNavigate, onOpenModal }) {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#090e1a] min-h-screen">
      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid min-h-screen grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-12 lg:gap-16 pt-16 sm:pt-20 pb-8 sm:pb-12">
        {/* Columna de texto */}
        <div className="text-white text-center lg:text-left order-2 lg:order-1 px-2 sm:px-4 lg:-ml-8 xl:-ml-12"> 
          <h1 className="font-extrabold leading-tight text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            <div className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent lg:whitespace-nowrap">
            La Plataforma Más Rápida
            </div>
            <div className="text-white mt-1 sm:mt-2 lg:whitespace-nowrap">
              Para Cotizar Energía Solar
            </div>
          </h1>

          <p className="mt-6 sm:mt-8 lg:mt-10 text-white text-base sm:text-lg xl:text-xl leading-relaxed max-w-xl sm:max-w-2xl mx-auto lg:mx-0">
            <span className="block">Cotiza energía solar 100% en línea con instaladores verificados.</span>
            <span className="block mt-1">Sin presión, sin llamadas, solo ofertas reales.</span>
          </p>

   {/* CTAs + glow effects */}
<div className="relative mt-8 sm:mt-12 md:mt-16 lg:mt-20 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start max-w-md sm:max-w-none mx-auto lg:mx-0">
  
   {/* Glow azul detrás de los personajes - responsive */}
  <span
    aria-hidden="true" 
    className="absolute left-20 sm:left-32 lg:left-64 xl:left-80 -top-10 sm:-top-20 rounded-full z-10 hidden lg:block"
    style={{
      width: "1400px",
      height: "300px", 
      background: "radial-gradient(50% 50% at 50% 50%, rgba(30,64,175,0.4) 0%, rgba(30,64,175,0.2) 40%, transparent 70%)",
      filter: "blur(30px)",
    }}
  />

  {/* Glow blanco detrás de los botones - responsive */}
  <span
    aria-hidden="true"
    className="absolute -left-2 sm:-left-6 lg:-left-8 top-0 rounded-full z-20 hidden sm:block"
    style={{
      width: "400px",
      height: "60px",
      background: "radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.05) 70%, transparent 100%)",
      filter: "blur(20px)",
    }}
  />

  {/* Botón amarillo */}
  <button
    onClick={onOpenModal}
    className="relative z-30 inline-flex items-center justify-center rounded-[12px] font-bold text-white border-2 border-[#F59E0B] px-4 sm:px-6 xl:px-8 py-3 sm:py-4 uppercase shadow-xl text-xs sm:text-sm xl:text-base transition-transform hover:scale-105 w-full sm:w-auto min-h-[48px]"
    style={{
      background: "linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%)",
      boxShadow: "0 0 0 2px rgba(245,158,11,.4), 0 8px 20px rgba(0,0,0,.3)",
    }}
  >
    CONECTAR RECIBO
  </button>

  {/* Botón blanco */}
  <button
    className="relative z-30 inline-flex items-center justify-center rounded-[12px] font-bold border-2 px-4 sm:px-6 xl:px-8 py-3 sm:py-4 uppercase text-xs sm:text-sm xl:text-base shadow-xl transition-transform hover:scale-105 w-full sm:w-auto min-h-[48px]"
    style={{
      color: "#1f2937",
      background: "linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)",
      borderColor: "#e5e7eb",
      boxShadow: "0 8px 20px rgba(0,0,0,.25)",
    }}
  >
    MÁS INFORMACIÓN
  </button>
</div>





      </div>

        {/* Columna de imagen */}
        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end px-4 sm:px-0 lg:translate-x-8 xl:translate-x-12">
          {/* Imagen grande (personajes + panel en un solo PNG) */}
          <img
            src="/img/hero.png"
            alt="Instaladores Enerbook con panel solar"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg 2xl:max-w-xl h-auto object-contain"
            draggable="false"
          />
          {/* Glow/sombra debajo de los personajes */}
          
        </div>
      </div>

      {/* degradé sutil al pie, como sombra */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#0b1220]" />
    </section>
  );
}
