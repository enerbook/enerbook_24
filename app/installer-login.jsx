import React, { useState } from 'react';
import { router } from 'expo-router';
import InstallerNavbar from '../src/features/instalador/components/auth/InstallerNavbar';
import { useAuth } from '../src/context/AuthContext';

const InstallerLogin = () => {
  const { installerLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await installerLogin(email, password);

    if (error) {
      setError(error.message);
    }
    // La redirección es manejada automáticamente por el archivo _layout.jsx

    setIsLoading(false);
  };

  return (
    <>
      <InstallerNavbar currentPage="login" />
      <div className="min-h-screen bg-white flex">
        {/* Lado izquierdo: formulario */}
        <section className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-16 bg-white">
          <div className="w-full max-w-sm">
            {/* Encabezado */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido Instalador!
              </h2>
              <p className="text-gray-400">
                Inicia sesión para cotizar proyectos y<br />
                continuar con tus solicitudes activas.
              </p>
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
              onSubmit={handleLogin}
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="Tu correo empresarial"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Recordarme */}
              <div className="flex items-center">
                <div
                  onClick={() => setRememberMe((v) => !v)}
                  className="w-10 h-6 rounded-full shadow-inner transition-colors duration-200 ease-in-out cursor-pointer"
                  style={rememberMe ? {background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'} : {backgroundColor: '#e5e7eb'}}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      rememberMe ? "translate-x-5" : "translate-x-1"
                    }`}
                    style={{marginTop: '2px'}}
                  />
                </div>
                <label
                  onClick={() => setRememberMe((v) => !v)}
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
                    router.push('/installer-signup');
                  }}
                >
                  Regístrate
                </a>
              </p>
            </form>
          </div>
        </section>

        {/* Lado derecho: contenedor negro */}
        <aside className="hidden lg:flex w-1/2 items-start justify-center">
          <div className="w-full h-[75%] bg-black rounded-l-3xl flex items-center justify-center">
            <img
              src="/img/FulllogoBlanco.svg"
              alt="enerbook"
              className="h-56 w-auto"
              draggable="false"
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default InstallerLogin;