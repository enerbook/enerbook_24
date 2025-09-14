import React, { useState } from 'react';
import { router } from 'expo-router';
import { FiGlobe, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

const InstallerSignup = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menus = [
    { label: "Inicio", href: "/" },
    { label: "Cómo funciona", href: "/" },
    { label: "Conoce más", href: "/" },
    { label: "Sign In", href: "/installer-login" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implementar lógica de registro con Supabase
      // const { data, error } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       company_name: formData.companyName,
      //       full_name: formData.fullName,
      //       phone: formData.phone,
      //       user_type: 'installer'
      //     }
      //   }
      // });
      // 
      // if (error) throw error;
      // 
      // // Redirigir al dashboard después del registro exitoso
      // router.push('/installer-dashboard');
      
      // Simulación temporal
      setTimeout(() => {
        router.push('/installer-dashboard');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error en registro:', error);
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/installer-login');
  };

  return (
    <div className="min-h-screen bg-black overflow-y-auto">
      {/* Navigation Bar - Floating transparent */}
      <header className="absolute inset-x-0 top-6 z-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop navbar */}
          <div className="hidden lg:flex h-16 items-center justify-between rounded-full
                          bg-white/20 backdrop-blur-md shadow-sm px-8">
            
            {/* Logo */}
            <a href="/" className="flex items-center">
              <img src="/img/FulllogoBlanco.svg" alt="Enerbook" className="h-14 w-auto object-contain" />
            </a>

            {/* Center menu */}
            <nav className="flex items-center gap-8">
              {menus.map((m, idx) => (
                <a key={m.label} href={m.href} 
                   className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  {m.label}
                </a>
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
                          bg-white/20 backdrop-blur-md shadow-sm">
            <a href="/" className="flex items-center">
              <img src="/img/FulllogoBlanco.svg" alt="Enerbook" className="h-12 w-auto object-contain" />
            </a>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 
                             flex items-center justify-center transition-colors"
                    aria-label="Abrir menú">
              {mobileMenuOpen ? <FiX size={16} className="text-white" /> : 
                               <FiMenu size={16} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4">
            <div className="max-w-7xl mx-auto px-6">
              <div className="rounded-2xl bg-white/20 backdrop-blur-md shadow-lg p-4">
                {menus.map((m) => (
                  <a key={m.label} href={m.href} 
                     className="block py-3 text-sm font-medium text-white/80 hover:text-white transition-colors">
                    {m.label}
                  </a>
                ))}
                <div className="pt-3 mt-3 border-t border-white/20">
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
      <div className="min-h-screen flex items-center justify-center px-4 py-28 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">¡Únete al PowerTeam!</h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Conéctate con usuarios que ya buscan soluciones<br />
              solares y recibe cotizaciones automáticas<br />
              adaptadas a tu perfil.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {/* Logo inside form */}
            <div className="flex justify-center mb-6">
              <img src="/img/icon_negro.svg" alt="Enerbook" className="h-20 w-auto" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Tu correo"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Celular
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Tu número celular"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Tu contraseña"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50"
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
                <span className="ml-3 text-sm text-gray-700">Recuérdame</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registrando...' : 'Unirme'}
              </button>

              {/* Login link */}
              <div className="text-center">
                <span className="text-gray-500 text-sm">¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  onClick={handleLoginRedirect}
                  className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                >
                  Inicia Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallerSignup;