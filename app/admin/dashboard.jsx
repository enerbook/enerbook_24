import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';
import AppLayout from '../../src/components/common/AppLayout';
import ResumenTab from '../../src/components/admin/tabs/ResumenTab';
import FinanzasTab from '../../src/components/admin/tabs/FinanzasTabSimple';
import ProveedoresTab from '../../src/components/admin/tabs/ProveedoresTab';
import ProyectosTab from '../../src/components/admin/tabs/ProyectosTabSimple';
import AlertasTab from '../../src/components/admin/tabs/AlertasTab';

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

  const handleLogout = async () => {
    console.log('Admin dashboard logout button clicked');
    try {
      await logout(router);
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  // Configurar pestañas para AppLayout
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
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/img/FulllogoColor.svg"
                alt="Enerbook"
                className="h-20 w-auto mr-6"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
                <p className="text-sm text-gray-600 mt-1">Panel de Control y Métricas del Sistema</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-2 py-1.5 text-left rounded-md transition-colors text-gray-400 hover:bg-white hover:text-gray-700"
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center mr-2 bg-transparent">
                <FiLogOut
                  className="w-2.5 h-2.5"
                  style={{ color: '#F59E0B' }}
                />
              </div>
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100">
            <div className="px-6">
              <div className="flex overflow-x-auto">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <i className={`ion-${tab.icon} mr-2 text-base`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 px-6 py-6 bg-gray-50 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;