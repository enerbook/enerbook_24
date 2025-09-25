import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import MetricCard from '../../dashboard/MetricCard';
import { supabase } from '../../../lib/supabaseClient';

const ResumenTab = ({ metrics }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    usuariosStats: { total: 0, nuevosUltimos30Dias: 0 },
    proyectosStats: { total: 0, enProgreso: 0 },
    contratosStats: { total: 0, valorTotal: 0 },
    comisionesStats: { total: 0, pendientes: 0 },
    milestonesStats: { vencidos: 0 },
    proveedoresStats: { activos: 0, conStripe: 0 },
    tendencias: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use metrics passed from parent if available
      if (metrics) {
        setDashboardData({
          usuariosStats: { total: metrics.totalUsuarios || 0, nuevosUltimos30Dias: 0 },
          proyectosStats: {
            total: metrics.proyectos?.length || 0,
            enProgreso: metrics.proyectos?.filter(p => p.estado === 'en_progreso').length || 0
          },
          contratosStats: {
            total: metrics.contratos?.length || 0,
            valorTotal: metrics.contratos?.reduce((sum, c) => sum + (parseFloat(c.precio_total_sistema) || 0), 0) || 0
          },
          comisionesStats: {
            total: metrics.comisiones?.reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0,
            pendientes: metrics.comisiones?.filter(c => c.estado === 'pendiente').length || 0
          },
          milestonesStats: { vencidos: 0 },
          proveedoresStats: { activos: 0, conStripe: 0 },
          tendencias: []
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex-1 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        <p className="text-sm text-gray-600 mt-4">Cargando Métricas...</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Usuarios"
          value={dashboardData.usuariosStats.total}
          subtitle={`+${dashboardData.usuariosStats.nuevosUltimos30Dias} últimos 30 días`}
        />
        <MetricCard
          title="Proyectos Activos"
          value={dashboardData.proyectosStats.enProgreso}
          subtitle={`De ${dashboardData.proyectosStats.total} totales`}
        />
        <MetricCard
          title="Valor Contratos"
          value={formatCurrency(dashboardData.contratosStats.valorTotal)}
          subtitle={`${dashboardData.contratosStats.total} contratos`}
        />
        <MetricCard
          title="Comisiones"
          value={formatCurrency(dashboardData.comisionesStats.total)}
          subtitle={`${dashboardData.comisionesStats.pendientes} pendientes`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trends Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias Mensuales
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de tendencias en desarrollo</p>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Proyectos
          </p>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de distribución en desarrollo</p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Proveedores Activos</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.proveedoresStats.activos}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardData.proveedoresStats.conStripe} con Stripe
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
              <Ionicons name="warning" size={24} color="#F59E0B" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Milestones Vencidos</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.milestonesStats.vencidos}
              </p>
              <p className="text-sm text-gray-500">Requieren atención</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <Ionicons name="trending-up" size={24} color="#f59e0b" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Contratos Financiados</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.contratosStats.total}
              </p>
              <p className="text-sm text-gray-500">
                {formatCurrency(dashboardData.contratosStats.valorTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Alert */}
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-start">
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Resumen del Sistema
            </p>
            <p className="text-sm text-gray-700 mt-1">
              El sistema cuenta con {dashboardData.usuariosStats.total} usuarios registrados,
              {' '}{dashboardData.proyectosStats.total} proyectos totales y
              {' '}{formatCurrency(dashboardData.comisionesStats.total)} en comisiones generadas.
              Hay {dashboardData.milestonesStats.vencidos} milestones que requieren atención inmediata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenTab;