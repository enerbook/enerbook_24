import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import ClienteAppLayout from '../src/cliente/components/layout/ClienteAppLayout';
import { ClienteAuthProvider } from '../src/cliente/context/ClienteAuthContext';
import { ClienteDashboardDataProvider } from '../src/cliente/context/ClienteDashboardDataContext';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

// Import tab components for authenticated clients
import DashboardTab from '../src/cliente/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/cliente/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/cliente/components/dashboard/tabs/IrradiacionTab';
import DetallesTab from '../src/cliente/components/dashboard/tabs/DetallesTab';
import ProyectosTab from '../src/cliente/components/dashboard/tabs/ProyectosTab';
import PerfilTab from '../src/cliente/components/dashboard/tabs/PerfilTab';

export default function ClientesDashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userType, loading } = useAuth();
  const router = useRouter();

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
          <ClienteAppLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            {renderContent()}
          </ClienteAppLayout>
        </ClienteDashboardDataProvider>
      </ClienteAuthProvider>
    </View>
  );
}