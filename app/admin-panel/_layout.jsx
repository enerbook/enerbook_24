import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';
import AdminAppLayout from '../../src/admin/components/layout/AdminAppLayout';

export default function AdminPanelLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
      router.replace('/');
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
        // Redirigir a home si no es admin
        router.replace('/');
        return;
      }

      console.log('Admin access granted:', adminData);
      setIsAdmin(true);
      await loadInitialMetrics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
      setLoading(false);
      router.replace('/');
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

  // Configurar pestañas para AdminHeader
  const adminTabs = [
    { id: 'resumen', label: 'Resumen General', icon: 'analytics-outline' },
    { id: 'finanzas', label: 'Finanzas', icon: 'cash-outline' },
    { id: 'proveedores', label: 'Proveedores', icon: 'business-outline' },
    { id: 'proyectos', label: 'Proyectos', icon: 'construct-outline' },
    { id: 'alertas', label: 'Alertas', icon: 'notifications-outline' }
  ];

  // Mostrar loading mientras se verifica acceso
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <div className="text-gray-600 mt-4">Verificando acceso...</div>
      </View>
    );
  }

  // Si no es admin, mostrar vista vacía (useEffect redirigirá)
  if (!user || !isAdmin) {
    return <View />;
  }

  // Obtener el tab activo desde la URL
  const currentSegment = segments[segments.length - 1] || 'resumen';

  return (
    <View style={{ flex: 1 }}>
      <AdminAppLayout
        adminTabs={adminTabs}
        activeTab={currentSegment}
        metrics={metrics}
      >
        <Slot context={{ metrics }} />
      </AdminAppLayout>
    </View>
  );
}
