import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { InstallerProvider } from '../../src/instalador/context/InstallerContext';
import { useAuth } from '../../src/context/AuthContext';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-gray-600">Cargando...</div>
      </View>
    );
  }

  // Si no hay usuario autenticado como instalador, mostrar vista vacía (el useEffect redirigirá)
  if (!user || userType !== 'instalador') {
    return <View />;
  }

  return (
    <View style={{ flex: 1 }}>
      <InstallerProvider>
        <Slot />
      </InstallerProvider>
    </View>
  );
}
