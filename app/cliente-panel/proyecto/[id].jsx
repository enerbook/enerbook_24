import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ProyectoAppLayout from '../../../src/cliente/components/layout/ProyectoAppLayout';
import ResumenTab from '../../../src/cliente/components/dashboard/proyecto-tabs/ResumenTab';
import CotizacionesTab from '../../../src/cliente/components/dashboard/proyecto-tabs/CotizacionesTab';
import FacturacionTab from '../../../src/cliente/components/dashboard/proyecto-tabs/FacturacionTab';
import StatusTrackingTab from '../../../src/cliente/components/dashboard/proyecto-tabs/StatusTrackingTab';
import PagosTab from '../../../src/cliente/components/dashboard/proyecto-tabs/PagosTab';
import { projectService } from '../../../src/cliente/services/projectService';

export default function ProyectoDetailPage() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('resumen');
  const [proyecto, setProyecto] = useState(null);
  const [cotizacionInicial, setCotizacionInicial] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProyectoData();
    }
  }, [id]);

  const loadProyectoData = async () => {
    setLoading(true);
    try {
      const { proyecto: proyectoData, cotizacionInicial: cotizacionInicialData, cotizaciones: cotizacionesData } =
        await projectService.getProjectWithDetails(id);

      setProyecto(proyectoData);
      setCotizacionInicial(cotizacionInicialData);
      setCotizaciones(cotizacionesData);

      console.log('✅ Project data loaded:', {
        proyecto: proyectoData.titulo,
        cotizaciones: cotizacionesData.length
      });
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Cargando proyecto...</p>
          </div>
        </div>
      );
    }

    if (!proyecto) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">Proyecto no encontrado</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'resumen':
        return (
          <ResumenTab
            proyecto={proyecto}
            cotizacionInicial={cotizacionInicial}
            cotizaciones={cotizaciones}
            onReload={loadProyectoData}
          />
        );
      case 'cotizaciones':
        return (
          <CotizacionesTab
            proyecto={proyecto}
            cotizaciones={cotizaciones}
            onReload={loadProyectoData}
          />
        );
      case 'pagos':
        return (
          <PagosTab
            proyecto={proyecto}
            onReload={loadProyectoData}
          />
        );
      case 'facturacion':
        return (
          <FacturacionTab
            proyecto={proyecto}
            cotizaciones={cotizaciones}
          />
        );
      case 'status':
        return (
          <StatusTrackingTab
            proyecto={proyecto}
            cotizaciones={cotizaciones}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ProyectoAppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        proyecto={proyecto}
      >
        {renderActiveTab()}
      </ProyectoAppLayout>
    </View>
  );
}
