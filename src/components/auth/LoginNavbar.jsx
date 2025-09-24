import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { router } from "expo-router";

export default function LoginNavbar({ onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-3 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop navbar */}
        <div className="relative hidden md:flex h-14 items-center justify-between rounded-2xl
                        bg-white border border-gray-200/40 shadow-sm text-gray-900 px-6 overflow-hidden">
          {/* Overlay gris en el borde derecho (difuminado) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-48
                          bg-gradient-to-r from-transparent via-slate-200/55 to-slate-400/70" />

          {/* Logo (más grande) */}
          <div
            className="relative z-10 flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img
              src="/img/Fulllogonegro.svg"
              alt="Enerbook"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Menu */}
          <nav className="relative z-10 flex items-center gap-8">
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
              }}
            >
              Inicio
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              Cómo funciona
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
              Conoce más
            </a>
          </nav>

          {/* CTA Button */}
          <button 
            className="relative z-10 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            onClick={() => router.push('/installer-login')}
          >
            ¿Eres instalador?
          </button>
        </div>

        {/* Mobile navbar */}
        <div className="md:hidden flex items-center justify-between h-12 px-4 rounded-2xl
                        bg-white/75 backdrop-blur-md border border-gray-200/20 shadow-xs">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img
              src="/img/Fulllogonegro.svg"
              alt="Enerbook"
              className="h-12 w-auto object-contain"
            />
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 
                       flex items-center justify-center transition-colors"
            aria-label="Abrir menú"
          >
            {open ? <FiX size={18} className="text-gray-700" /> : <FiMenu size={18} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden mt-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-gray-200/20 shadow-xs p-4">
              <nav className="space-y-3">
                <a
                  href="#"
                  className="block py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/');
                  }}
                >
                  Inicio
                </a>
                <a href="#" className="block py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Cómo funciona
                </a>
                <a href="#" className="block py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Conoce más
                </a>
              </nav>

              <div className="pt-3 mt-3 border-t border-gray-200/30">
                <button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
                  onClick={() => router.push('/installer-login')}
                >
                  ¿Eres instalador?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
