import React, { useState } from "react";
import { router } from "expo-router";
import LoginNavbar from "../src/components/auth/LoginNavbar";
import { useAuth } from "../src/context/AuthContext"; // Importado

export default function Login({ onNavigate }) {
  const { clientLogin } = useAuth(); // Obtenemos la función de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para el error

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpiar error previo
    
    const { error } = await clientLogin(email, password);

    if (error) {
      setError(error.message); // Establecer mensaje de error
    }
    // La redirección la maneja _layout.jsx automáticamente
    
    setIsLoading(false);
  };

  return (
    <>
      <LoginNavbar onNavigate={onNavigate} />
      <div className="min-h-screen bg-white flex">
      {/* Lado izquierdo: formulario */}
      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-16 bg-white">
        <div className="w-full max-w-sm">
          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola de nuevo!
            </h2>
            <p className="text-gray-400">Inicia sesión para continuar</p>
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
            onSubmit={handleLogin} // Usamos handleLogin
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
                value={email} // Conectado al estado
                onChange={(e) => setEmail(e.target.value)} // Conectado al estado
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                required
                value={password} // Conectado al estado
                onChange={(e) => setPassword(e.target.value)} // Conectado al estado
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
              disabled={isLoading} // Deshabilitado mientras carga
              className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)",
              }}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>

            {/* Registro */}
            <p className="text-center text-sm text-gray-400">
              ¿No tienes cuenta?{" "}
              <a 
                href="#" 
                className="font-medium" 
                style={{ color: "#F59E0B" }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/signup');
                }}
              >
                Regístrate
              </a>
            </p>
          </form>
        </div>
      </section>
{/* Lado derecho: contenedor oscuro desde arriba hasta más abajo */}
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