import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseClient';
import MetricCard from '../common/MetricCard';

const ProyectosTab = () => {
  const [loading, setLoading] = useState(true);
  const [proyectosData, setProyectosData] = useState({
    resumen: {},
    porEstado: []
  });

  useEffect(() => {
    loadProyectosData();
  }, []);

  const loadProyectosData = async () => {
    setLoading(true);
    try {
      const [proyectos, contratos] = await Promise.all([
        supabase.from('proyectos').select('*'),
        supabase.from('contratos').select('id, precio_total_sistema')
      ]);

      const resumen = calculateResumen(proyectos.data, contratos.data);
      const porEstado = calculatePorEstado(proyectos.data);

      setProyectosData({
        resumen,
        porEstado
      });
    } catch (error) {
      console.error('Error loading proyectos data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateResumen = (proyectos, contratos) => {
    const total = proyectos?.length || 0;
    const enProgreso = proyectos?.filter(p => p.estado === 'en_progreso').length || 0;
    const completados = proyectos?.filter(p => p.estado === 'completado').length || 0;
    const cancelados = proyectos?.filter(p => p.estado === 'cancelado').length || 0;

    const valorTotal = contratos?.reduce((sum, c) =>
      sum + (parseFloat(c.precio_total_sistema) || 0), 0
    ) || 0;

    const tasaCompletacion = total > 0 ? (completados / total) * 100 : 0;
    const tasaCancelacion = total > 0 ? (cancelados / total) * 100 : 0;

    return {
      total,
      enProgreso,
      completados,
      cancelados,
      valorTotal,
      tasaCompletacion,
      tasaCancelacion
    };
  };

  const calculatePorEstado = (proyectos) => {
    const estados = {
      'Cotización': 0,
      'En Progreso': 0,
      'Completado': 0,
      'Cancelado': 0,
      'En Espera': 0
    };

    proyectos?.forEach(p => {
      switch (p.estado) {
        case 'cotizacion':
          estados['Cotización']++;
          break;
        case 'en_progreso':
          estados['En Progreso']++;
          break;
        case 'completado':
          estados['Completado']++;
          break;
        case 'cancelado':
          estados['Cancelado']++;
          break;
        case 'en_espera':
          estados['En Espera']++;
          break;
      }
    });

    return [
      { name: 'Cotización', value: estados['Cotización'], color: '#090e1a' },
      { name: 'En Progreso', value: estados['En Progreso'], color: '#f59e0b' },
      { name: 'Completado', value: estados['Completado'], color: '#f59e0b' },
      { name: 'Cancelado', value: estados['Cancelado'], color: '#090e1a' },
      { name: 'En Espera', value: estados['En Espera'], color: '#090e1a' }
    ].filter(e => e.value > 0);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" size="large" color="#f59e0b" />
        <p className="text-sm text-gray-600 mt-4">Cargando Proyectos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-6">
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-900">
            Análisis de Proyectos
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Proyectos"
            value={proyectosData.resumen.total}
            subtitle={`${proyectosData.resumen.enProgreso} en progreso`}
          />
          <MetricCard
            title="Tasa Completación"
            value={`${proyectosData.resumen.tasaCompletacion.toFixed(1)}%`}
            subtitle={`${proyectosData.resumen.completados} completados`}
          />
          <MetricCard
            title="Valor Total"
            value={formatCurrency(proyectosData.resumen.valorTotal)}
            subtitle="En contratos"
          />
          <MetricCard
            title="Tasa Cancelación"
            value={`${proyectosData.resumen.tasaCancelacion.toFixed(1)}%`}
            subtitle={`${proyectosData.resumen.cancelados} cancelados`}
          />
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-100 mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Proyectos
          </p>
          <div className="space-y-3">
            {proyectosData.porEstado.map((item, index) => {
              const total = proyectosData.porEstado.reduce((sum, p) => sum + p.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
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
                      ({percentage}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Análisis de Proyectos
              </p>
              <p className="text-sm text-gray-700 mt-1">
                El sistema cuenta con {proyectosData.resumen.total} proyectos totales,
                de los cuales {proyectosData.resumen.completados} han sido completados exitosamente
                y {proyectosData.resumen.enProgreso} están actualmente en progreso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProyectosTab;