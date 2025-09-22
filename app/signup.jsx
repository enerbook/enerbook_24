import React, { useState } from "react";
import { router } from 'expo-router';
import LoginNavbar from "../src/components/auth/LoginNavbar";
import { useAuth } from "../src/context/AuthContext";

export default function SignUp({ onNavigate }) {
  const { clientSignup } = useAuth();
  const [remember, setRemember] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
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

    const result = await clientSignup(
      formData.email,
      formData.password,
      {
        name: formData.name,
        phone: formData.phone
      }
    );

    if (result.error) {
      setError(result.error.message);
    } else if (result.needsEmailConfirmation) {
      // Mostrar mensaje de éxito y confirmación de email necesaria
      setError('');
      alert('¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.');
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      // Si no necesita confirmación, la redirección la manejará _layout.jsx
      setError('');
    }

    setIsLoading(false);
  };

  return (
    <>
      <LoginNavbar onNavigate={onNavigate} />
      <div className="min-h-screen bg-white flex overflow-hidden">
        {/* Lado izquierdo: formulario */}
        <section className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-16 bg-white overflow-y-auto">
          <div className="w-full max-w-sm py-8">
            {/* Encabezado */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido a Enerbook!
              </h2>
              <p className="text-gray-400">Crea tu cuenta para empezar</p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
                />
              </div>

              {/* Celular */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
                />
              </div>

              {/* Recordarme */}
              <div className="flex items-center">
                <div
                  onClick={() => setRemember((v) => !v)}
                  className="w-10 h-6 rounded-full shadow-inner transition-colors duration-200 ease-in-out cursor-pointer"
                  style={remember ? {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : {backgroundColor: '#e5e7eb'}}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      remember ? "translate-x-5" : "translate-x-1"
                    }`}
                    style={{marginTop: '2px'}}
                  />
                </div>
                <label
                  onClick={() => setRemember((v) => !v)}
                  className="ml-3 text-sm text-gray-700 cursor-pointer"
                >
                  Recordarme
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)",
                }}
              >
                {isLoading ? 'Registrando...' : 'Unirme'}
              </button>

              {/* Login */}
              <p className="text-center text-sm text-gray-400">
                ¿Ya tienes cuenta?{" "}
                <a
                  href="#"
                  className="font-medium"
                  style={{ color: "#F59E0B" }}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/login');
                  }}
                >
                  Inicia Sesión
                </a>
              </p>
            </form>
          </div>
        </section>

        {/* Lado derecho: contenedor oscuro */}
        <aside className="hidden lg:flex w-1/2 items-start justify-center">
          <div className="w-full h-[75%] bg-[#090e1a] rounded-l-3xl flex items-center justify-center">
            <img
              src="/img/FulllogoColor.svg"
              alt="enerbook"
              className="h-56 w-auto"
              draggable="false"
            />
          </div>
        </aside>
      </div>
    </>
  );
}
