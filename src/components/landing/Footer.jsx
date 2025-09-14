import React from "react";
import { FiFacebook, FiYoutube, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="relative bg-[#0b1220] text-white overflow-hidden min-h-[40vh] flex items-center">
      {/* Halo circular inferior (semi visible) */}

<div
  className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2
             w-[24rem] md:w-[32rem] aspect-square rounded-full"
  style={{
    background: "rgba(84, 80, 194, 0.15)"
  }}
/>




      {/* Contenido */}
<div className="
  relative z-10 max-w-7xl mx-auto
  px-4 sm:px-6 lg:px-8
  pt-8 sm:pt-10 md:pt-12 lg:pt-14
  pb-20 sm:pb-24 md:pb-28
">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10 items-start">
          {/* Logo */}
          <div className="sm:col-span-2 md:col-span-1 text-center md:text-left mb-6 sm:mb-0">
            <img
              src="/img/Iconcolor.svg"
              alt="enerbook"
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto mx-auto md:mx-0"
            />
          </div>

          {/* Sobre enerbook */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sobre enerbook</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white text-sm transition-colors">¿Quiénes somos?</a></li>
              <li><a href="#how" className="text-gray-400 hover:text-white text-sm transition-colors">Cómo funciona</a></li>
              <li><a href="#reviews" className="text-gray-400 hover:text-white text-sm transition-colors">Reviews</a></li>
              <li><a href="#installers" className="text-gray-400 hover:text-white text-sm transition-colors">Únete como proveedor</a></li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Servicios</h4>
            <ul className="space-y-2">
              <li><a href="#cta" className="text-gray-400 hover:text-white text-sm transition-colors">Cotiza tu proyecto</a></li>
              <li><a href="#how" className="text-gray-400 hover:text-white text-sm transition-colors">Subir recibo</a></li>
              <li><a href="#experts" className="text-gray-400 hover:text-white text-sm transition-colors">Instalación profesional</a></li>
            </ul>
          </div>

          {/* Contáctanos */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contáctanos</h4>
            <a
              href="mailto:redes@enerbook.mx"
              className="text-gray-400 hover:text-white text-sm transition-colors break-all sm:break-normal"
            >
              redes@enerbook.mx
            </a>
          </div>

          {/* Social */}
<div className="text-center sm:text-left">
  <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Social</h4>
  <div className="flex items-center justify-center sm:justify-start gap-4">
    <a href="#" aria-label="Facebook" className="text-white hover:opacity-90 transition-opacity">
      <span className="font-bold text-lg sm:text-xl">f</span>
    </a>
    <a href="#" aria-label="Instagram" className="text-white hover:opacity-90 transition-opacity">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="white">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4" fill="#0b1220"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#0b1220"/>
      </svg>
    </a>
    <a href="#" aria-label="LinkedIn" className="text-white hover:opacity-90 transition-opacity">
      <span className="font-bold text-lg sm:text-xl">in</span>
    </a>
  </div>
</div>

        </div>

        {/* Separador + copyright */}
  <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-white/20 text-center">
    <p className="text-gray-500 text-xs sm:text-sm">
      © 2025 enerbook.mx | All Rights Reserved
    </p>
  </div>
</div>
    </footer>
  );
};

export default Footer;
