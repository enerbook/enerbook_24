import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import AppLayout from '../src/components/common/AppLayout';
import { useAuth } from '../src/context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Import tab components
import DashboardTab from '../src/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/components/dashboard/tabs/IrradiacionTab';
import ProyectosTab from '../src/components/dashboard/tabs/ProyectosTab';
import DetallesTab from '../src/components/dashboard/tabs/DetallesTab';
import PerfilTab from '../src/components/dashboard/tabs/PerfilTab';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userType, loading, setLeadMode } = useAuth();
  const router = useRouter();
  const { temp_lead_id } = useLocalSearchParams();

  // Detectar temp_lead_id en la URL
  useEffect(() => {
    if (temp_lead_id && !user) {
      console.log('Dashboard: temp_lead_id detected, setting lead mode:', temp_lead_id);
      setLeadMode(temp_lead_id);
    }
  }, [temp_lead_id, user, setLeadMode]);

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
      <AppLayout 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </AppLayout>
    </View>
  );
}
