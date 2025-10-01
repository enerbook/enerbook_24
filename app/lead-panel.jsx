import React, { useState, useEffect } from 'react';
import { View } from "react-native";
import LeadAppLayout from '../src/lead/components/layout/LeadAppLayout';
import { useAuth } from '../src/context/AuthContext';
import { LeadDashboardDataProvider } from '../src/lead/context/LeadDashboardDataContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Import tab components for leads
import DashboardTab from '../src/lead/components/dashboard/tabs/DashboardTab';
import ConsumoTab from '../src/lead/components/dashboard/tabs/ConsumoTab';
import IrradiacionTab from '../src/lead/components/dashboard/tabs/IrradiacionTab';
import DetallesTab from '../src/lead/components/dashboard/tabs/DetallesTab';

export default function LeadsDashboardScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const { user, userType, loading, setLeadMode, tempLeadId } = useAuth();
  const router = useRouter();
  const { temp_lead_id } = useLocalSearchParams();

  // Detectar temp_lead_id en la URL
  useEffect(() => {
    const loadLeadData = async () => {
      if (temp_lead_id && !user && userType !== 'lead' && temp_lead_id !== tempLeadId) {
        console.log('Leads Dashboard: temp_lead_id detected, setting lead mode:', temp_lead_id);

        const result = await setLeadMode(temp_lead_id);

        if (!result.success) {
          console.error('Error loading lead data:', result.error);
          setError(result.error);
          // Redirigir a la landing después de 3 segundos
          setTimeout(() => router.replace('/'), 3000);
        }
      }
    };

    loadLeadData();
  }, [temp_lead_id, user, userType, tempLeadId, setLeadMode, router]);

  // Redirigir si es un usuario autenticado
  useEffect(() => {
    if (!loading && user && userType !== 'lead') {
      console.log('Authenticated user detected, redirecting to cliente panel');
      router.replace('/cliente-panel');
    }
  }, [user, userType, loading, router]);

  // Mostrar error si hubo problema cargando datos
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <div className="max-w-md text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">
            ⚠️ Error al Cargar Datos
          </div>
          <div className="text-gray-700 mb-4">
            {error}
          </div>
          <div className="text-gray-500 text-sm">
            Serás redirigido a la página principal en unos segundos...
          </div>
        </div>
      </View>
    );
  }

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
      <LeadDashboardDataProvider>
        <LeadAppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {renderContent()}
        </LeadAppLayout>
      </LeadDashboardDataProvider>
    </View>
  );
}