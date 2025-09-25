import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import ResumenTab from '../../src/components/admin/tabs/ResumenTab';
import FinanzasTab from '../../src/components/admin/tabs/FinanzasTabSimple';
import ProveedoresTab from '../../src/components/admin/tabs/ProveedoresTab';
import ProyectosTab from '../../src/components/admin/tabs/ProyectosTabSimple';
import AlertasTab from '../../src/components/admin/tabs/AlertasTab';

const AdminDashboard = () => {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAdminAccess();
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: adminData, error } = await supabase
        .from('administradores')
        .select('id, usuario_id, nivel_acceso, permisos, activo, created_at')
        .eq('usuario_id', user.id)
        .eq('activo', true)
        .single();

      if (error || !adminData) {
        console.log('Access denied: Not an admin');
        console.log('Error details:', error);
        console.log('AdminData:', adminData);
        console.log('User ID being checked:', user.id);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Admin access granted:', adminData);
      setIsAdmin(true);
      await loadInitialMetrics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialMetrics = async () => {
    try {
      const [
        usuariosResult,
        leadsResult,
        proyectosResult,
        contratosResult,
        comisionesResult
      ] = await Promise.all([
        supabase.from('usuarios').select('id', { count: 'exact' }),
        supabase.from('cotizaciones_leads_temp').select('id', { count: 'exact' }),
        supabase.from('proyectos').select('estado'),
        supabase.from('contratos').select('estado, precio_total_sistema'),
        supabase.from('comisiones_enerbook').select('monto_comision, estado_pago')
      ]);

      setMetrics({
        totalUsuarios: usuariosResult.count || 0,
        totalLeads: leadsResult.count || 0,
        proyectos: proyectosResult.data || [],
        contratos: contratosResult.data || [],
        comisiones: comisionesResult.data || []
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen General', icon: 'analytics-outline' },
    { id: 'finanzas', label: 'Finanzas', icon: 'cash-outline' },
    { id: 'proveedores', label: 'Proveedores', icon: 'business-outline' },
    { id: 'proyectos', label: 'Proyectos', icon: 'construct-outline' },
    { id: 'alertas', label: 'Alertas', icon: 'notifications-outline' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return <ResumenTab metrics={metrics} />;
      case 'finanzas':
        return <FinanzasTab />;
      case 'proveedores':
        return <ProveedoresTab />;
      case 'proyectos':
        return <ProyectosTab />;
      case 'alertas':
        return <AlertasTab />;
      default:
        return <ResumenTab metrics={metrics} />;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 16 }}>
            Verificando Acceso...
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Ionicons name="person" size={64} color="#6B7280" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 }}>
            No Autenticado
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
            Debes iniciar sesión para acceder al panel de administración
          </Text>
          <Pressable
            onPress={() => router.replace('/login')}
            style={{
              marginTop: 16,
              backgroundColor: '#F59E0B',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Iniciar Sesión</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 }}>
            Acceso Denegado
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
            No tienes permisos para acceder al panel de administración
          </Text>
          <Pressable
            onPress={() => router.replace('/dashboard')}
            style={{
              marginTop: 16,
              backgroundColor: '#3B82F6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Ir al Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
          Dashboard Administrador
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          Panel de Control y Métricas del Sistema
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 24 }}
          contentContainerStyle={{ paddingVertical: 12 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  marginRight: 32,
                  paddingVertical: 8,
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === tab.id ? '#F59E0B' : 'transparent'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={activeTab === tab.id ? '#F59E0B' : '#6B7280'}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 14,
                      fontWeight: '500',
                      color: activeTab === tab.id ? '#F59E0B' : '#6B7280'
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;