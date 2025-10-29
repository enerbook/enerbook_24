import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import InstallerAppLayout from '../../src/instalador/components/layout/InstallerAppLayout';
import { InstallerProvider } from '../../src/instalador/context/InstallerContext';

const InstaladorPanelLayout = () => {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [activeTab, setActiveTab] = useState('proyectos');

  // Determinar tab activo basado en la ruta
  useEffect(() => {
    const currentRoute = segments[1]; // instalador-panel/[route]
    if (currentRoute && currentRoute !== 'instalador-panel') {
      setActiveTab(currentRoute);
    } else {
      setActiveTab('proyectos'); // Default tab
    }
  }, [segments]);

  // Detectar si estamos en una ruta de contrato (no debe usar InstallerAppLayout)
  const isContratoRoute = segments.includes('contrato');

  // Protección de ruta: verificar que sea instalador
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/installer-login');
      return;
    }

    if (userType && userType !== 'instalador') {
      console.log('User is not installer, redirecting...');
      if (userType === 'admin') {
        router.replace('/admin-panel');
      } else if (userType === 'cliente') {
        router.replace('/cliente-panel');
      } else if (userType === 'lead') {
        router.replace('/lead-panel');
      } else {
        router.replace('/installer-login');
      }
    }
  }, [user, userType, loading, router]);

  if (loading || !user || userType !== 'instalador') {
    return null;
  }

  // Si estamos en ruta de contrato, NO usar InstallerAppLayout
  // El layout de contrato manejará su propia UI con doble sidebar
  if (isContratoRoute) {
    return (
      <InstallerProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </InstallerProvider>
    );
  }

  // Para todas las demás rutas, usar el layout normal
  return (
    <InstallerProvider>
      <InstallerAppLayout activeTab={activeTab}>
        <Stack screenOptions={{ headerShown: false }} />
      </InstallerAppLayout>
    </InstallerProvider>
  );
};

export default InstaladorPanelLayout;
