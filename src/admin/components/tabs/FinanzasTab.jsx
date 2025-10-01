import React, { useState, useEffect } from 'react';
// React Native components converted to web-compatible HTML
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseClient';
import MetricCard from '../common/MetricCard';
// Using custom SVG charts instead of Recharts for React Native compatibility

const FinanzasTab = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [financeData, setFinanceData] = useState({
    resumen: {},
    comisionesData: [],
    tiposPagoData: [],
    milestonesData: [],
    transaccionesFinanciamiento: [],
    serviceFees: [],
    tendenciasIngresos: []
  });

  useEffect(() => {
    loadFinanceData();
  }, [selectedPeriod]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [
        comisiones,
        contratos,
        milestones,
        transacciones,
        webhooks,
        disputes
      ] = await Promise.all([
        supabase.from('comisiones_enerbook').select('*'),
        supabase.from('contratos').select('*'),
        supabase.from('pagos_milestones').select('*'),
        supabase.from('transacciones_financiamiento').select('*'),
        supabase.from('stripe_webhooks_log').select('*'),
        supabase.from('stripe_disputes').select('*')
      ]);

      const resumen = {
        totalComisiones: comisiones.data?.reduce((sum, c) =>
          sum + (parseFloat(c.monto_comision) || 0), 0
        ) || 0,
        comisionesPendientes: comisiones.data?.filter(c =>
          c.estado === 'pendiente'
        ).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0,
        comisionesPagadas: comisiones.data?.filter(c =>
          c.estado === 'cobrado'
        ).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0,
        valorTotalContratos: contratos.data?.reduce((sum, c) =>
          sum + (parseFloat(c.precio_total_sistema) || 0), 0
        ) || 0,
        serviceFees: calculateServiceFees(comisiones.data),
        disputasActivas: disputes.data?.filter(d =>
          d.status === 'warning_needs_response' || d.status === 'needs_response'
        ).length || 0
      };

      const comisionesData = processComisionesData(comisiones.data);
      const tiposPagoData = processTiposPagoData(contratos.data);
      const milestonesData = processMilestonesData(milestones.data);
      const transaccionesFinanciamiento = processTransaccionesData(transacciones.data);
      const tendenciasIngresos = generateTendenciasIngresos(comisiones.data, contratos.data);

      setFinanceData({
        resumen,
        comisionesData,
        tiposPagoData,
        milestonesData,
        transaccionesFinanciamiento,
        tendenciasIngresos
      });
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateServiceFees = (comisiones) => {
    if (!comisiones) return 0;
    return comisiones.reduce((sum, c) => {
      const serviceFee = (parseFloat(c.monto_comision) || 0) * 0.029 + 3;
      return sum + serviceFee;
    }, 0);
  };

  const processComisionesData = (comisiones) => {
    if (!comisiones) return [];
    const tiposComision = {};
    comisiones.forEach(c => {
      const tipo = c.tipo_comision || 'standard';
      if (!tiposComision[tipo]) {
        tiposComision[tipo] = { tipo, total: 0, cantidad: 0 };
      }
      tiposComision[tipo].total += parseFloat(c.monto_comision) || 0;
      tiposComision[tipo].cantidad += 1;
    });
    return Object.values(tiposComision);
  };

  const processTiposPagoData = (contratos) => {
    if (!contratos) return [];
    const tipos = {
      contado: { name: 'Contado', value: 0, color: '#10B981' },
      financiamiento: { name: 'Financiamiento', value: 0, color: '#3B82F6' },
      tarjeta: { name: 'Tarjeta', value: 0, color: '#F59E0B' },
      transferencia: { name: 'Transferencia', value: 0, color: '#8B5CF6' }
    };

    contratos.forEach(c => {
      const tipo = c.tipo_pago_seleccionado || 'contado';
      if (tipos[tipo]) {
        tipos[tipo].value += 1;
      }
    });

    return Object.values(tipos).filter(t => t.value > 0);
  };

  const processMilestonesData = (milestones) => {
    if (!milestones) return [];
    const estados = {
      pendiente: 0,
      pagado: 0,
      vencido: 0
    };

    const now = new Date();
    milestones.forEach(m => {
      if (m.estado === 'pagado') {
        estados.pagado += 1;
      } else if (m.estado === 'pendiente' && new Date(m.fecha_objetivo) < now) {
        estados.vencido += 1;
      } else {
        estados.pendiente += 1;
      }
    });

    return [
      { name: 'Pendientes', value: estados.pendiente, color: '#F59E0B' },
      { name: 'Pagados', value: estados.pagado, color: '#10B981' },
      { name: 'Vencidos', value: estados.vencido, color: '#EF4444' }
    ];
  };

  const processTransaccionesData = (transacciones) => {
    if (!transacciones) return [];
    const estados = {};
    transacciones.forEach(t => {
      const estado = t.estado || 'pendiente';
      if (!estados[estado]) {
        estados[estado] = 0;
      }
      estados[estado] += 1;
    });
    return Object.entries(estados).map(([estado, count]) => ({
      estado: estado.charAt(0).toUpperCase() + estado.slice(1),
      cantidad: count
    }));
  };

  const generateTendenciasIngresos = (comisiones, contratos) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();

    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthDate = new Date();
      monthDate.setMonth(index);
      const monthStart = new Date(monthDate.getFullYear(), index, 1);
      const monthEnd = new Date(monthDate.getFullYear(), index + 1, 0);

      const monthComisiones = comisiones?.filter(c => {
        const date = new Date(c.created_at);
        return date >= monthStart && date <= monthEnd;
      }).reduce((sum, c) => sum + (parseFloat(c.monto_comision) || 0), 0) || 0;

      const monthContratos = contratos?.filter(c => {
        const date = new Date(c.created_at);
        return date >= monthStart && date <= monthEnd;
      }).reduce((sum, c) => sum + (parseFloat(c.precio_total_sistema) || 0), 0) || 0;

      return {
        mes: month,
        comisiones: monthComisiones,
        contratos: monthContratos,
        serviceFees: monthComisiones * 0.029 + (monthComisiones > 0 ? 3 : 0)
      };
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const periods = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'trimestre', label: 'Trimestre' },
    { id: 'año', label: 'Año' }
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="text-sm text-gray-600 mt-4">Cargando Datos Financieros...</Text>
      </View>
    );
  }

  return (
    <div>
      <View className="pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-semibold text-gray-900">
            Análisis Financiero
          </Text>
          <View className="flex-row">
            {periods.map(period => (
              <Pressable
                key={period.id}
                onPress={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  selectedPeriod === period.id
                    ? 'bg-amber-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedPeriod === period.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Comisiones Totales"
            value={formatCurrency(financeData.resumen.totalComisiones)}
            subtitle="Acumulado histórico"
          />
          <MetricCard
            title="Pendiente de Cobro"
            value={formatCurrency(financeData.resumen.comisionesPendientes)}
            subtitle="Por cobrar"
          />
          <MetricCard
            title="Service Fees"
            value={formatCurrency(financeData.resumen.serviceFees)}
            subtitle="Stripe fees"
          />
          <MetricCard
            title="Disputas Activas"
            value={financeData.resumen.disputasActivas}
            subtitle="Requieren atención"
          />
        </View>

        <View className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <View className="bg-white rounded-lg p-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Tendencias de Ingresos
            </Text>
            <View style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeData.tendenciasIngresos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="comisiones"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#FED7AA"
                    name="Comisiones"
                  />
                  <Area
                    type="monotone"
                    dataKey="serviceFees"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#FCA5A5"
                    name="Service Fees"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </View>
          </View>

          <View className="bg-white rounded-lg p-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Tipos de Pago
            </Text>
            <View style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financeData.tiposPagoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financeData.tiposPagoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-6 border border-gray-100 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Comisiones por Tipo
          </Text>
          <View style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData.comisionesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="tipo" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </View>
        </View>

        <View className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <View className="bg-white rounded-lg p-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Estado Milestones
            </Text>
            <View className="space-y-4">
              {financeData.milestonesData.map((item) => (
                <View key={item.name} className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-gray-700 ml-3">{item.name}</Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-900">{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-lg p-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Transacciones Financiamiento
            </Text>
            <View className="space-y-4">
              {financeData.transaccionesFinanciamiento.map((item) => (
                <View key={item.estado} className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700">{item.estado}</Text>
                  <Text className="text-sm font-bold text-gray-900">{item.cantidad}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-amber-900">
                Resumen Financiero
              </Text>
              <Text className="text-sm text-amber-700 mt-1">
                El sistema ha generado {formatCurrency(financeData.resumen.totalComisiones)} en comisiones,
                con {formatCurrency(financeData.resumen.comisionesPendientes)} pendientes de cobro.
                Los service fees de Stripe suman {formatCurrency(financeData.resumen.serviceFees)}.
                {financeData.resumen.disputasActivas > 0 &&
                  ` Hay ${financeData.resumen.disputasActivas} disputas que requieren atención inmediata.`
                }
              </Text>
            </View>
          </View>
        </View>
      </View>
    </div>
  );
};

export default FinanzasTab;