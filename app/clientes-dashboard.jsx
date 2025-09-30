import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import AppLayout from '../src/features/shared/components/layout/AppLayout';
import { ClienteAuthProvider } from '../src/features/cliente/context/ClienteAuthContext';
import { ClienteDashboardDataProvider } from '../src/features/cliente/context/ClienteDashboardDataContext';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

// Import tab components for authenticated clients
import DashboardTab from '../src/features/cliente/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/features/cliente/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/features/cliente/components/dashboard/tabs/IrradiacionTab';
import DetallesTab from '../src/features/cliente/components/dashboard/tabs/DetallesTab';
import ProyectosTab from '../src/features/cliente/components/dashboard/tabs/ProyectosTab';
import PerfilTab from '../src/features/cliente/components/dashboard/tabs/PerfilTab';

export default function ClientesDashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  // Redirigir si es un lead (usuario no autenticado)
  useEffect(() => {
    if (!loading && (!user || userType === 'lead')) {
      console.log('Lead or unauthenticated user detected, redirecting to leads-dashboard');
      router.replace('/leads-dashboard');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'consumo':
        return <ConsumoTab />;
      case 'irradiacion':
        return <IrradiacionTab />;
      case 'detalles':
        return <DetallesTab />;
      case 'proyectos':
        return <ProyectosTab />;
      case 'perfil':
        return <PerfilTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ClienteAuthProvider>
        <ClienteDashboardDataProvider>
          <AppLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            {renderContent()}
          </AppLayout>
        </ClienteDashboardDataProvider>
      </ClienteAuthProvider>
    </View>
  );
}