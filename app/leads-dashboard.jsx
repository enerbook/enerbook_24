import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import LeadAppLayout from '../src/features/lead/components/layout/LeadAppLayout';
import { useAuth } from '../src/context/AuthContext';
import { DashboardDataProvider } from '../src/context/DashboardDataContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Import tab components for leads
import DashboardTab from '../src/features/lead/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/features/lead/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/features/lead/components/dashboard/tabs/IrradiacionTab';
import DetallesTab from '../src/features/lead/components/dashboard/tabs/DetallesTab';

export default function LeadsDashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userType, loading, setLeadMode, tempLeadId } = useAuth();
  const router = useRouter();
  const { temp_lead_id } = useLocalSearchParams();

  // Detectar temp_lead_id en la URL
  useEffect(() => {
    if (temp_lead_id && !user && userType !== 'lead' && temp_lead_id !== tempLeadId) {
      console.log('Leads Dashboard: temp_lead_id detected, setting lead mode:', temp_lead_id);
      setLeadMode(temp_lead_id);
    }
  }, [temp_lead_id, user, userType, tempLeadId, setLeadMode]);

  // Redirigir si es un usuario autenticado
  useEffect(() => {
    if (!loading && user && userType !== 'lead') {
      console.log('Authenticated user detected, redirecting to clientes-dashboard');
      router.replace('/clientes-dashboard');
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
      case 'detalles':
        return <DetallesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DashboardDataProvider>
        <LeadAppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {renderContent()}
        </LeadAppLayout>
      </DashboardDataProvider>
    </View>
  );
}