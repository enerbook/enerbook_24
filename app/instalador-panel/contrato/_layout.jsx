import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { InstallerProvider } from '../../../src/instalador/context/InstallerContext';

export default function ContratoLayout() {
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: solo instaladores autenticados pueden acceder
  useEffect(() => {
    if (!loading && (!user || userType !== 'instalador')) {
      console.log('Unauthorized access to contrato, redirecting to installer login');
      router.replace('/installer-login');
    }
  }, [user, userType, loading, router]);

  // Mostrar loading mientras se resuelve el estado
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado como instalador, mostrar vista vacía (el useEffect redirigirá)
  if (!user || userType !== 'instalador') {
    return null;
  }

  // Layout especial para contratos - NO heredar el InstallerAppLayout del padre
  // Esto previene el doble sidebar
  return (
    <InstallerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
      </Stack>
    </InstallerProvider>
  );
}
