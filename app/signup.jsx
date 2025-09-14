import React, { useState } from "react";
import { router } from 'expo-router';

export default function SignUp({ onNavigate }) {
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banda oscura con navbar y encabezado */}
      <section className="mx-4 mt-4 rounded-3xl bg-[#0B1020] text-white shadow-lg ring-1 ring-white/10">
        {/* Navbar */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center"
            >
    <img
  src="/img/FulllogoBlanco.svg"
  alt="Enerbook"
  className="h-24 w-auto md:h-28"
/>




             
            </button>

        <div className="flex flex-1 justify-center">
  <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
    <a 
      href="#"
      onClick={(e) => {
        e.preventDefault();
        router.push('/');
      }}
    >
      Inicio
    </a>
    <a href="#">Cómo funciona</a>
    <a href="#">Conoce más</a>
    <a 
      href="#"
      onClick={(e) => {
        e.preventDefault();
        router.push('/login');
      }}
    >
      Sign In
    </a>
  </nav>
</div>


            {/* CTA pill derecha */}
            <a
              href="#"
              className="ml-auto inline-flex items-center rounded-full bg-white/95 px-5 py-2 text-[13px] font-semibold text-slate-900 shadow hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                router.push('/installer-login');
              }}
            >
              ¿Eres instalador?
            </a>
          </div>
        </div>

        {/* Encabezado centrado dentro de la banda */}
        <div className="max-w-xl mx-auto px-6 pb-56 md:pb-50   text-center">

          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            ¡Bienvenido a Enerbook!
          </h1>
          <p className="text-white/80 text-sm">
            Tu cuenta para cotizar energía solar 100% en línea.
          </p>
          <p className="text-white/80 text-sm">
            Crea una cuenta para empezar a ahorrar energía desde hoy.
          </p>
        </div>
      </section>

      {/* Tarjeta del formulario superpuesta */}
      <div className="relative -mt-44 px-4 pb-16">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
            {/* Logo dentro de la tarjeta */}
            <div className="mb-6 flex justify-center">
              <img src="/img/Iconcolor.svg" alt="Enerbook" className="h-24 w-24" />
            </div>

            <form className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none ring-orange-500/0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="Tu correo"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none ring-orange-500/0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Celular */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Número Celular
                </label>
                <input
                  type="tel"
                  placeholder="Tu número celular"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none ring-orange-500/0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none ring-orange-500/0 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Recordarme */}
              <div className="flex items-center py-1.5">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  className={`h-6 w-10 cursor-pointer rounded-full transition-colors ${
                    remember ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 translate-y-1 rounded-full bg-white shadow transition-transform ${
                      remember ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <label
                  onClick={() => setRemember((v) => !v)}
                  className="ml-3 cursor-pointer text-sm text-gray-700"
                >
                  Recuérdame
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="w-full rounded-lg py-3 text-sm font-semibold text-white shadow"
                style={{
                  background:
                    "linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)",
                }}
              >
                Unirme
              </button>

              {/* Sign in */}
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
        </div>
      </div>
    </div>
  );
}
