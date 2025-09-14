import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import AppLayout from '../src/components/common/AppLayout';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

// Import tab components
import DashboardTab from '../src/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/components/dashboard/tabs/IrradiacionTab';
import ProyectosTab from '../src/components/dashboard/tabs/ProyectosTab';
import DetallesTab from '../src/components/dashboard/tabs/DetallesTab';
import PerfilTab from '../src/components/dashboard/tabs/PerfilTab';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  // Render loading or a placeholder if user is not yet available
  if (!user) {
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
      case 'proyectos':
        return <ProyectosTab />;
      case 'detalles':
        return <DetallesTab />;
      case 'perfil':
        return <PerfilTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppLayout 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </AppLayout>
    </View>
  );
}
