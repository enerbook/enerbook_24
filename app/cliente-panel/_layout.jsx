import React from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import ClienteAppLayout from '../../src/cliente/components/layout/ClienteAppLayout';
import { ClienteAuthProvider } from '../../src/cliente/context/ClienteAuthContext';
import { ClienteDashboardDataProvider } from '../../src/cliente/context/ClienteDashboardDataContext';
import { ClienteProyectosProvider } from '../../src/cliente/context/ClienteProyectosContext';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';

export default function ClientePanelLayout() {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Redirigir si es un lead (usuario no autenticado)
  useEffect(() => {
    if (!loading && (!user || userType === 'lead')) {
      console.log('Lead or unauthenticated user detected, redirecting to lead panel');
      router.replace('/lead-panel');
    }
  }, [user, userType, loading, router]);

  // Mostrar loading mientras se resuelve el estado
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </View>
    );
  }

  // Si no hay usuario autenticado, mostrar vista vacía (el useEffect redirigirá)
  if (!user || userType === 'lead') {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-center">
          <p className="text-sm text-gray-600">Redirigiendo...</p>
        </div>
      </View>
    );
  }

  // Obtener el tab activo desde la URL
  const currentSegment = segments[segments.length - 1] || 'dashboard';

  // Detectar si estamos en una ruta de proyecto
  const isProyectoRoute = segments.includes('proyecto');

  return (
    <View style={{ flex: 1 }}>
      <ClienteAuthProvider>
        <ClienteDashboardDataProvider>
          <ClienteProyectosProvider>
            {isProyectoRoute ? (
              // Ruta de proyecto: solo mostrar el contenido sin sidebar externo
              <Slot />
            ) : (
              // Rutas normales: mostrar sidebar externo
              <ClienteAppLayout activeTab={currentSegment}>
                <Slot />
              </ClienteAppLayout>
            )}
          </ClienteProyectosProvider>
        </ClienteDashboardDataProvider>
      </ClienteAuthProvider>
    </View>
  );
}
