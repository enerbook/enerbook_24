import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import AppLayout from '../src/features/shared/components/layout/AppLayout';
import { useAuth } from '../src/context/AuthContext';
import { DashboardDataProvider } from '../src/context/DashboardDataContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Import tab components
import DashboardTab from '../src/features/lead/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/features/lead/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/features/lead/components/dashboard/tabs/IrradiacionTab';
import ProyectosTab from '../src/features/cliente/components/dashboard/ProyectosTab';
import DetallesTab from '../src/features/lead/components/dashboard/tabs/DetallesTab';
import PerfilTab from '../src/features/cliente/components/dashboard/PerfilTab';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userType, loading, setLeadMode, tempLeadId } = useAuth();
  const router = useRouter();
  const { temp_lead_id } = useLocalSearchParams();

  // Detectar temp_lead_id en la URL
  useEffect(() => {
    // Solo establecer modo lead si:
    // 1. Hay temp_lead_id en la URL
    // 2. No hay usuario autenticado
    // 3. No estamos ya en modo lead
    // 4. El temp_lead_id es diferente al actual
    if (temp_lead_id && !user && userType !== 'lead' && temp_lead_id !== tempLeadId) {
      console.log('Dashboard: temp_lead_id detected, setting lead mode:', temp_lead_id);
      setLeadMode(temp_lead_id);
    }
  }, [temp_lead_id, user, userType, tempLeadId, setLeadMode]);

  // Mostrar loading mientras se resuelve el estado
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-gray-600">Cargando...</div>
      </View>
    );
  }

  // Si no hay usuario ni es modo lead, redirect
  if (!user && userType !== 'lead') {
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
        // Solo mostrar proyectos si es usuario autenticado, no para leads
        return userType === 'lead' ? <DashboardTab /> : <ProyectosTab />;
      case 'detalles':
        return <DetallesTab />;
      case 'perfil':
        // Solo mostrar perfil si es usuario autenticado, no para leads
        return userType === 'lead' ? <DashboardTab /> : <PerfilTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DashboardDataProvider>
        <AppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {renderContent()}
        </AppLayout>
      </DashboardDataProvider>
    </View>
  );
}
