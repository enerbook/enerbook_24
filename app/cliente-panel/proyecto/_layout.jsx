import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { ClienteAuthProvider } from '../../../src/cliente/context/ClienteAuthContext';
import { ClienteDashboardDataProvider } from '../../../src/cliente/context/ClienteDashboardDataContext';
import { ClienteProyectosProvider } from '../../../src/cliente/context/ClienteProyectosContext';
import { useAuth } from '../../../src/context/AuthContext';

export default function ProyectoLayout() {
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: solo clientes autenticados pueden acceder
  useEffect(() => {
    if (!loading && (!user || userType !== 'cliente')) {
      console.log('Unauthorized access to proyecto, redirecting to login');
      router.replace('/login');
    }
  }, [user, userType, loading, router]);

  // Mostrar loading mientras se resuelve el estado
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Verificando sesión...</p>
          </div>
        </div>
      </View>
    );
  }

  // Si no hay usuario autenticado como cliente, mostrar vista vacía (el useEffect redirigirá)
  if (!user || userType !== 'cliente') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">Redirigiendo...</p>
          </div>
        </div>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ClienteAuthProvider>
        <ClienteDashboardDataProvider>
          <ClienteProyectosProvider>
            <Slot />
          </ClienteProyectosProvider>
        </ClienteDashboardDataProvider>
      </ClienteAuthProvider>
    </View>
  );
}
