import React, { useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiGlobe, FiUser } from "react-icons/fi";
import { useRouter } from 'expo-router';

const menus = [
  { label: "Instaladores", items: ["Power Team", "Requisitos", "Registro"] },
  { label: "Cómo funciona", items: ["Sube tu recibo", "Compara propuestas", "Contrata online"] },
  { label: "Beneficios", items: ["Ahorro", "Garantías", "Soporte"] },
  { label: "Casos de éxito", items: ["Hogar", "Comercial", "Industrial"] },
];

export default function Navbar({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleMenuClick = (menuLabel, item) => {
    if (menuLabel === 'Instaladores' && item === 'Registro') {
      router.push('/installer-signup');
    }
    // Agrega aquí más lógica de navegación si es necesario
  };

  return (
    <header className="fixed inset-x-0 top-3 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop navbar pill - estilo como la imagen */}
        <div className="hidden lg:flex h-12 items-center justify-between rounded-2xl
                        bg-white/95 text-gray-900 backdrop-blur-md shadow-lg border border-gray-200/50 px-6">
          
          {/* Logo con círculo blanco */}
          <a href="#hero" className="flex items-center">
              <img src="/img/logo-white.svg" alt="Enerbook" className="h-12 w-12" />
          </a>

          {/* Center menu */}
          <nav className="flex items-center gap-1">
            {menus.map((m, idx) => (
              <div key={m.label} className="relative group flex items-center">
                <button className="px-4 py-2.5 inline-flex items-center gap-1.5 text-sm font-medium 
                                 text-gray-700 hover:text-gray-900 transition-colors">
                  {m.label} 
                  <FiChevronDown className="w-4 h-4 opacity-60" />
                </button>
                
                {/* Separador vertical sutil */}
                {idx < menus.length - 1 && (
                  <span className="mx-2 h-4 w-px bg-gray-300/60" />
                )}

                {/* Dropdown */}
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 
                               transition-all duration-200 absolute left-1/2 -translate-x-1/2 
                               top-full mt-3 w-56 rounded-xl bg-white shadow-xl border border-gray-200/50 
                               backdrop-blur-md p-2 z-50">
                  {m.items.map((item) => (
                    <a key={item} 
                       href="#"
                       onClick={(e) => {
                         e.preventDefault();
                         handleMenuClick(m.label, item);
                       }}
                       className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm 
                                font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 
                             flex items-center justify-center transition-colors" 
                    aria-label="Idioma">
              <FiGlobe className="w-4 h-4 text-gray-700" />
            </button>
            <button className="h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 
                             flex items-center justify-center transition-colors" 
                    aria-label="Cuenta"
                    onClick={() => router.push('/login')}>
              <FiUser className="w-4 h-4 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Mobile navbar */}
        <div className="lg:hidden flex items-center justify-between h-12 px-3 sm:h-14 sm:px-4 rounded-full
                        bg-white/95 shadow-lg border border-gray-200/50 backdrop-blur-md">
          <a href="#hero" className="flex items-center">
              <img src="/img/logo-white.svg" alt="Enerbook" className="h-8 w-8 sm:h-10 sm:w-10" />
          </a>
          <button onClick={() => setOpen(v => !v)} 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 hover:bg-gray-200 
                           flex items-center justify-center transition-colors"
                  aria-label="Abrir menú">
            {open ? <FiX size={18} className="text-gray-700 sm:hidden" /> : 
                   <FiMenu size={18} className="text-gray-700 sm:hidden" />}
            {open ? <FiX size={20} className="text-gray-700 hidden sm:block" /> : 
                   <FiMenu size={20} className="text-gray-700 hidden sm:block" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden mt-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/50 p-4">
              {menus.map((m) => (
                <details key={m.label} className="group">
                  <summary className="cursor-pointer py-3 list-none flex items-center justify-between
                                     font-medium text-gray-900 hover:text-gray-700">
                    {m.label} 
                    <FiChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pl-4 pt-2 pb-3 space-y-1">
                    {m.items.map((item) => (
                      <a key={item} 
                         href="#" 
                         onClick={(e) => {
                           e.preventDefault();
                           handleMenuClick(m.label, item);
                         }}
                         className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                        {item}
                      </a>
                    ))}
                  </div>
                </details>
              ))}
              
              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-200">
                <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-100 hover:bg-gray-200 
                                 flex items-center justify-center transition-colors" 
                        aria-label="Idioma">
                  <FiGlobe className="w-4 h-4 text-gray-700" />
                </button>
                <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-200 hover:bg-gray-300 
                                 flex items-center justify-center transition-colors" 
                        aria-label="Cuenta"
                        onClick={() => router.push('/login')}>
                  <FiUser className="w-4 h-4 text-gray-800" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}