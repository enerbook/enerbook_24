import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabaseClient';
import MetricCard from '../../../shared/components/dashboard/MetricCard';

const FinanzasTab = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [financeData, setFinanceData] = useState({
    resumen: {},
    comisionesData: [],
    tiposPagoData: [],
    milestonesData: []
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
        disputes
      ] = await Promise.all([
        supabase.from('comisiones_enerbook').select('*'),
        supabase.from('contratos').select('*'),
        supabase.from('pagos_milestones').select('*'),
        supabase.from('transacciones_financiamiento').select('*'),
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
        ).length || 0,
        milestonesVencidos: milestones.data?.filter(m =>
          m.estado === 'pendiente' && new Date(m.fecha_objetivo) < new Date()
        ).length || 0
      };

      const tiposPagoData = processTiposPagoData(contratos.data);
      const comisionesData = processComisionesData(comisiones.data);
      const milestonesData = processMilestonesData(milestones.data);

      setFinanceData({
        resumen,
        comisionesData,
        tiposPagoData,
        milestonesData
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
      contado: { name: 'Contado', value: 0, color: '#f59e0b' },
      financiamiento: { name: 'Financiamiento', value: 0, color: '#090e1a' },
      tarjeta: { name: 'Tarjeta', value: 0, color: '#f59e0b' },
      transferencia: { name: 'Transferencia', value: 0, color: '#090e1a' }
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
      { name: 'Pendientes', value: estados.pendiente, color: '#f59e0b' },
      { name: 'Pagados', value: estados.pagado, color: '#f59e0b' },
      { name: 'Vencidos', value: estados.vencido, color: '#090e1a' }
    ];
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
      <div className="flex-1 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        <p className="text-sm text-gray-600 mt-4">Cargando Datos Financieros...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-semibold text-gray-900">
            Análisis Financiero
          </p>
          <div className="flex">
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  selectedPeriod === period.id
                    ? 'bg-orange-500'
                    : 'bg-gray-100'
                }`}
              >
                <p className={`text-sm font-medium ${
                  selectedPeriod === period.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {period.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Tipos de Pago
            </p>
            <div className="space-y-3">
              {financeData.tiposPagoData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm text-gray-700 ml-3">{item.name}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Estado Milestones
            </p>
            <div className="space-y-3">
              {financeData.milestonesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm text-gray-700 ml-3">{item.name}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              Comisiones por Tipo
            </p>
            <div className="space-y-3">
              {financeData.comisionesData.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{item.tipo}</p>
                  <div className="items-end">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.total)}
                    </p>
                    <p className="text-xs text-gray-500">{item.cantidad} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-start">
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Resumen Financiero
              </p>
              <p className="text-sm text-gray-700 mt-1">
                El sistema ha generado {formatCurrency(financeData.resumen.totalComisiones)} en comisiones,
                con {formatCurrency(financeData.resumen.comisionesPendientes)} pendientes de cobro.
                Los service fees de Stripe suman {formatCurrency(financeData.resumen.serviceFees)}.
                {financeData.resumen.disputasActivas > 0 &&
                  ` Hay ${financeData.resumen.disputasActivas} disputas que requieren atención inmediata.`
                }
                {financeData.resumen.milestonesVencidos > 0 &&
                  ` ${financeData.resumen.milestonesVencidos} milestones están vencidos.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanzasTab;