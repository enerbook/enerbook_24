import React, { useState } from 'react';
import { router } from 'expo-router';
import { FiGlobe, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

import { useAuth } from '../src/context/AuthContext';

const InstallerLogin = () => {
  const { installerLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menus = [
    { label: "Inicio", href: "/" },
    { label: "Cómo funciona", href: "/" },
    { label: "Conoce más", href: "/" },
    { label: "Registrarse", href: "/installer-signup" }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await installerLogin(email, password);

    if (error) {
      alert(`Error de inicio de sesión: ${error.message}`);
    }
    // La redirección es manejada automáticamente por el archivo _layout.jsx

    setIsLoading(false);
  };

  const handleRegister = () => {
    // Redirigir a la página de registro
    router.push('/installer-signup');
  };

  return (
    <div className="min-h-screen flex">
      {/* Navigation Bar - Floating transparent */}
      <header className="absolute inset-x-0 top-6 z-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop navbar */}
          <div className="hidden lg:flex h-16 items-center justify-between rounded-full
                          bg-white/80 backdrop-blur-md shadow-sm px-8">
            
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center">
              <img src="/img/Fulllogonegro.svg" alt="Enerbook" className="h-14 w-auto object-contain" />
            </button>

            {/* Center menu */}
            <nav className="flex items-center gap-8">
              {menus.map((m, idx) => (
                <button key={m.label} onClick={() => router.push(m.href)} 
                   className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  {m.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button className="px-6 py-2 text-white rounded-full text-sm font-medium 
                               hover:scale-105 transition-transform"
                      style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}>
                ¿Eres cliente?
              </button>
            </div>
          </div>

          {/* Mobile navbar */}
          <div className="lg:hidden flex items-center justify-between h-14 px-6 rounded-full
                          bg-white/80 backdrop-blur-md shadow-sm">
            <button onClick={() => router.push('/')} className="flex items-center">
              <img src="/img/Fulllogonegro.svg" alt="Enerbook" className="h-12 w-auto object-contain" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 
                             flex items-center justify-center transition-colors"
                    aria-label="Abrir menú">
              {mobileMenuOpen ? <FiX size={16} className="text-gray-700" /> : 
                               <FiMenu size={16} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4">
            <div className="max-w-7xl mx-auto px-6">
              <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-lg p-4">
                {menus.map((m) => (
                  <button key={m.label} onClick={() => router.push(m.href)} 
                     className="block py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors text-left w-full">
                    {m.label}
                  </button>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <button className="w-full px-4 py-2 text-white rounded-full text-sm font-medium 
                                   hover:scale-105 transition-transform"
                          style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}>
                    ¿Eres cliente?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex w-full">
        {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola de nuevo!</h1>
              <p className="text-gray-500">
                Inicia sesión para cotizar proyectos o<br />
                continuar con tus solicitudes activas.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Remember me toggle */}
            <div className="flex items-center">
              <div 
                className="relative cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${
                  rememberMe ? 'bg-orange-400' : 'bg-gray-300'
                }`}></div>
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-all duration-200 ${
                  rememberMe ? 'right-1' : 'left-1'
                }`}></div>
              </div>
              <span className="ml-3 text-sm text-gray-900">Recuérdame</span>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Unirme'}
            </button>

            {/* Register link */}
            <div className="text-center">
              <span className="text-gray-500 text-sm">¿No tienes cuenta? </span>
              <button
                type="button"
                onClick={handleRegister}
                className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>

        {/* Right Side - Brand */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="text-center">
            <img src="/img/FulllogoBlanco.svg" alt="Enerbook" className="h-96 w-auto mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallerLogin;