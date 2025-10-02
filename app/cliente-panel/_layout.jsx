import React from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import ClienteAppLayout from '../../src/cliente/components/layout/ClienteAppLayout';
import { ClienteAuthProvider } from '../../src/cliente/context/ClienteAuthContext';
import { ClienteDashboardDataProvider } from '../../src/cliente/context/ClienteDashboardDataContext';
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-gray-600">Cargando...</div>
      </View>
    );
  }

  // Si no hay usuario autenticado, mostrar vista vacía (el useEffect redirigirá)
  if (!user || userType === 'lead') {
    return <View />;
  }

  // Obtener el tab activo desde la URL
  const currentSegment = segments[segments.length - 1] || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <ClienteAuthProvider>
        <ClienteDashboardDataProvider>
          <ClienteAppLayout activeTab={currentSegment}>
            <Slot />
          </ClienteAppLayout>
        </ClienteDashboardDataProvider>
      </ClienteAuthProvider>
    </View>
  );
}
