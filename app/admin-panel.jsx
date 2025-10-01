import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabaseClient';
import AdminAppLayout from '../src/admin/components/layout/AdminAppLayout';
import ResumenTab from '../src/admin/components/tabs/ResumenTab';
import FinanzasTab from '../src/admin/components/tabs/FinanzasTabSimple';
import ProveedoresTab from '../src/admin/components/tabs/ProveedoresTab';
import ProyectosTab from '../src/admin/components/tabs/ProyectosTabSimple';
import AlertasTab from '../src/admin/components/tabs/AlertasTab';

const AdminDashboard = () => {
  const { user, userType, logout } = useAuth();
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

  // Configurar pestañas para AdminAppLayout
  const adminTabs = [
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <div className="text-gray-600 mt-4">Verificando acceso...</div>
      </View>
    );
  }

  if (!user) {
    return <View />;
  }

  if (!isAdmin) {
    return <View />;
  }

  return (
    <AdminAppLayout
      adminTabs={adminTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderTabContent()}
    </AdminAppLayout>
  );
};

export default AdminDashboard;