import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseClient';
// Using simple visualization instead of Recharts for React Native compatibility

const ProveedoresTab = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [proveedores, setProveedores] = useState([]);
  const [proveedoresStats, setProveedoresStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    stripeCompleto: 0,
    stripePendiente: 0,
    conFinanciamiento: 0,
    tiposCuenta: []
  });

  useEffect(() => {
    loadProveedoresData();
  }, []);

  const loadProveedoresData = async () => {
    setLoading(true);
    try {
      const { data: proveedoresData, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stats = {
        total: proveedoresData?.length || 0,
        activos: proveedoresData?.filter(p => p.activo).length || 0,
        inactivos: proveedoresData?.filter(p => !p.activo).length || 0,
        stripeCompleto: proveedoresData?.filter(p => p.stripe_onboarding_completed).length || 0,
        stripePendiente: proveedoresData?.filter(p => !p.stripe_onboarding_completed).length || 0,
        conFinanciamiento: proveedoresData?.filter(p => p.acepta_financiamiento_externo).length || 0,
        tiposCuenta: processTiposCuenta(proveedoresData)
      };

      setProveedores(proveedoresData || []);
      setProveedoresStats(stats);

      await loadProveedoresProyectos(proveedoresData);
    } catch (error) {
      console.error('Error loading proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProveedoresProyectos = async (proveedores) => {
    if (!proveedores || proveedores.length === 0) return;

    try {
      const proveedorIds = proveedores.map(p => p.id);
      // Get contracts first, then join with projects
      const { data: contratos } = await supabase
        .from('contratos')
        .select('proveedores_id, estado')
        .in('proveedores_id', proveedorIds);

      const proyectosMap = {};
      contratos?.forEach(contrato => {
        if (!proyectosMap[contrato.proveedores_id]) {
          proyectosMap[contrato.proveedores_id] = {
            total: 0,
            completados: 0,
            enProgreso: 0
          };
        }
        proyectosMap[contrato.proveedores_id].total++;
        if (contrato.estado === 'completado') {
          proyectosMap[contrato.proveedores_id].completados++;
        } else if (contrato.estado === 'activo') {
          proyectosMap[contrato.proveedores_id].enProgreso++;
        }
      });

      const proveedoresConProyectos = proveedores.map(p => ({
        ...p,
        proyectos: proyectosMap[p.id] || { total: 0, completados: 0, enProgreso: 0 }
      }));

      setProveedores(proveedoresConProyectos);
    } catch (error) {
      console.error('Error loading proyectos:', error);
    }
  };

  const processTiposCuenta = (proveedores) => {
    const tipos = {
      express: 0,
      standard: 0,
      custom: 0,
      pendiente: 0
    };

    proveedores?.forEach(p => {
      if (!p.stripe_account_type) {
        tipos.pendiente++;
      } else {
        tipos[p.stripe_account_type] = (tipos[p.stripe_account_type] || 0) + 1;
      }
    });

    return [
      { name: 'Express', value: tipos.express, color: '#10B981' },
      { name: 'Standard', value: tipos.standard, color: '#3B82F6' },
      { name: 'Custom', value: tipos.custom, color: '#8B5CF6' },
      { name: 'Pendiente', value: tipos.pendiente, color: '#EF4444' }
    ].filter(t => t.value > 0);
  };

  const getFilteredProveedores = () => {
    let filtered = [...proveedores];

    if (filterStatus !== 'todos') {
      if (filterStatus === 'activos') {
        filtered = filtered.filter(p => p.activo);
      } else if (filterStatus === 'inactivos') {
        filtered = filtered.filter(p => !p.activo);
      } else if (filterStatus === 'stripe-completo') {
        filtered = filtered.filter(p => p.stripe_onboarding_completed);
      } else if (filterStatus === 'stripe-pendiente') {
        filtered = filtered.filter(p => !p.stripe_onboarding_completed);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.nombre_empresa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nombre_contacto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (proveedor) => {
    if (!proveedor.activo) {
      return { text: 'Inactivo', color: 'bg-gray-100 text-gray-700' };
    }
    if (!proveedor.stripe_onboarding_completed) {
      return { text: 'Stripe Pendiente', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { text: 'Activo', color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-sm text-gray-600 mt-4">Cargando Proveedores...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{proveedoresStats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold text-green-600">{proveedoresStats.activos}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Inactivos</p>
            <p className="text-2xl font-bold text-gray-400">{proveedoresStats.inactivos}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Stripe OK</p>
            <p className="text-2xl font-bold text-blue-600">{proveedoresStats.stripeCompleto}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Stripe Pendiente</p>
            <p className="text-2xl font-bold text-yellow-600">{proveedoresStats.stripePendiente}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-600">Con Financiamiento</p>
            <p className="text-2xl font-bold text-purple-600">{proveedoresStats.conFinanciamiento}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Tipos de Cuenta Stripe
            </p>
            <div className="space-y-3">
              {proveedoresStats.tiposCuenta.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm text-gray-700 ml-3">{item.name}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-lg font-bold text-gray-900 mr-2">
                      {item.value}
                    </p>
                    <p className="text-sm text-gray-500">
                      ({((item.value / proveedoresStats.total) * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Onboarding
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <p className="text-sm text-gray-700 ml-3">Onboarding Completo</p>
                </div>
                <div className="flex items-center">
                  <p className="text-lg font-bold text-gray-900 mr-2">
                    {proveedoresStats.stripeCompleto}
                  </p>
                  <p className="text-sm text-gray-500">
                    ({((proveedoresStats.stripeCompleto / proveedoresStats.total) * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <p className="text-sm text-gray-700 ml-3">Onboarding Pendiente</p>
                </div>
                <div className="flex items-center">
                  <p className="text-lg font-bold text-gray-900 mr-2">
                    {proveedoresStats.stripePendiente}
                  </p>
                  <p className="text-sm text-gray-500">
                    ({((proveedoresStats.stripePendiente / proveedoresStats.total) * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <p className="text-sm text-gray-700 ml-3">Acepta Financiamiento</p>
                </div>
                <div className="flex items-center">
                  <p className="text-lg font-bold text-gray-900 mr-2">
                    {proveedoresStats.conFinanciamiento}
                  </p>
                  <p className="text-sm text-gray-500">
                    ({((proveedoresStats.conFinanciamiento / proveedoresStats.total) * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold text-gray-900">
                Lista de Proveedores
              </p>
              <div className="flex">
                <button
                  onClick={() => setFilterStatus('todos')}
                  className={`px-3 py-1 rounded-lg mr-2 ${
                    filterStatus === 'todos' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <p className={`text-sm ${
                    filterStatus === 'todos' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Todos
                  </p>
                </button>
                <button
                  onClick={() => setFilterStatus('activos')}
                  className={`px-3 py-1 rounded-lg mr-2 ${
                    filterStatus === 'activos' ? 'bg-green-600' : 'bg-gray-100'
                  }`}
                >
                  <p className={`text-sm ${
                    filterStatus === 'activos' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Activos
                  </p>
                </button>
                <button
                  onClick={() => setFilterStatus('stripe-pendiente')}
                  className={`px-3 py-1 rounded-lg ${
                    filterStatus === 'stripe-pendiente' ? 'bg-yellow-600' : 'bg-gray-100'
                  }`}
                >
                  <p className={`text-sm ${
                    filterStatus === 'stripe-pendiente' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Stripe Pendiente
                  </p>
                </button>
              </div>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <Ionicons name="search" size={20} color="#6B7280" />
              <input
                className="flex-1 ml-2 text-sm bg-transparent border-none outline-none"
                placeholder="Buscar proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96">
            {getFilteredProveedores().map((proveedor) => {
              const status = getStatusBadge(proveedor);
              return (
                <div
                  key={proveedor.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {proveedor.nombre_empresa || 'Sin nombre'}
                        </p>
                        <div className={`ml-2 px-2 py-1 rounded-full ${status.color}`}>
                          <p className="text-xs">{status.text}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {proveedor.nombre_contacto} • {proveedor.email}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center mr-4">
                          <Ionicons name="construct" size={14} color="#6B7280" />
                          <p className="text-sm text-gray-600 ml-1">
                            {proveedor.proyectos?.total || 0} proyectos
                          </p>
                        </div>
                        {proveedor.stripe_account_type && (
                          <div className="flex items-center mr-4">
                            <Ionicons name="card" size={14} color="#6B7280" />
                            <p className="text-sm text-gray-600 ml-1">
                              {proveedor.stripe_account_type}
                            </p>
                          </div>
                        )}
                        {proveedor.acepta_financiamiento_externo && (
                          <div className="flex items-center">
                            <Ionicons name="cash" size={14} color="#8B5CF6" />
                            <p className="text-sm text-purple-600 ml-1">
                              Financiamiento
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(proveedor.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {proveedoresStats.stripePendiente > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mt-6">
            <div className="flex items-start">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Atención Requerida
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Hay {proveedoresStats.stripePendiente} proveedores con onboarding de Stripe pendiente.
                  Es importante completar este proceso para que puedan recibir pagos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProveedoresTab;