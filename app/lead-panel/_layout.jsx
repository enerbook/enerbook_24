import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import LeadAppLayout from '../../src/lead/components/layout/LeadAppLayout';
import { LeadDashboardDataProvider } from '../../src/lead/context/LeadDashboardDataContext';
import { useAuth } from '../../src/context/AuthContext';

export default function LeadPanelLayout() {
  const { user, userType, loading, setLeadMode, tempLeadId } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { temp_lead_id } = useLocalSearchParams();

  // Detectar temp_lead_id en la URL y cargar datos del lead
  useEffect(() => {
    const loadLeadData = async () => {
      if (temp_lead_id && !user && userType !== 'lead' && temp_lead_id !== tempLeadId) {
        console.log('Lead Panel Layout: temp_lead_id detected, setting lead mode:', temp_lead_id);

        const result = await setLeadMode(temp_lead_id);

        if (!result.success) {
          console.error('Error loading lead data:', result.error);
          // Redirigir a la landing después de 3 segundos
          setTimeout(() => router.replace('/'), 3000);
        }
      }
    };

    loadLeadData();
  }, [temp_lead_id, user, userType, tempLeadId, setLeadMode, router]);

  // Redirigir si es un usuario autenticado (cliente)
  useEffect(() => {
    if (!loading && user && userType !== 'lead') {
      console.log('Authenticated user detected, redirecting to cliente panel');
      router.replace('/cliente-panel');
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

  // Si no hay usuario ni es modo lead, mostrar vista vacía (useEffect redirigirá)
  if (!user && userType !== 'lead') {
    return <View />;
  }

  // Obtener el tab activo desde la URL
  const lastSegment = segments[segments.length - 1];
  const currentSegment = lastSegment === 'lead-panel' ? 'dashboard' : (lastSegment || 'dashboard');

  return (
    <View style={{ flex: 1 }}>
      <LeadDashboardDataProvider>
        <LeadAppLayout activeTab={currentSegment}>
          <Slot />
        </LeadAppLayout>
      </LeadDashboardDataProvider>
    </View>
  );
}
