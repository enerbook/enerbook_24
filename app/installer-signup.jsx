import React, { useState } from 'react';
import { router } from 'expo-router';
import AuthNavbar from '../src/shared/components/auth/AuthNavbar';
import { useAuth } from '../src/context/AuthContext';
import { GRADIENTS } from '../src/shared/config/gradients';

const InstallerSignup = () => {
  const { installerSignup } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');

    try {
      const result = await installerSignup(
        formData.email,
        formData.password,
        {
          companyName: formData.companyName,
          fullName: formData.fullName,
          phone: formData.phone
        }
      );

      if (result.error) {
        setError(result.error.message || 'Error durante el registro');
      } else if (result.needsEmailConfirmation) {
        alert('¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta. Tu cuenta será activada por un administrador.');
        setTimeout(() => {
          router.push('/installer-login');
        }, 2000);
      } else {
        // Registro exitoso sin necesidad de confirmación
        alert('¡Registro exitoso! Tu cuenta será activada por un administrador.');
        setTimeout(() => {
          router.push('/installer-login');
        }, 1000);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error durante el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/installer-login');
  };

  return (
    <>
      <AuthNavbar currentPage="signup" userType="instalador" />
      <div className="min-h-screen bg-black overflow-y-auto">

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-28 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">¡Únete al PowerTeam!</h1>
            <p className="text-white/80 text-sm">
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

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 border border-red-200 text-red-800 rounded-lg bg-red-50">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className="w-10 h-6 rounded-full shadow-inner transition-colors duration-200 ease-in-out cursor-pointer"
                  style={rememberMe ? {background: GRADIENTS.primary} : {backgroundColor: '#e5e7eb'}}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      rememberMe ? "translate-x-5" : "translate-x-1"
                    }`}
                    style={{marginTop: '2px'}}
                  />
                </div>
                <label
                  onClick={() => setRememberMe(!rememberMe)}
                  className="ml-3 text-sm text-gray-700 cursor-pointer"
                >
                  Recuérdame
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm disabled:opacity-50"
                style={{
                  background: GRADIENTS.primary,
                }}
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
    </>
  );
};

export default InstallerSignup;