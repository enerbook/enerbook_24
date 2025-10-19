import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ContratoAppLayout from '../../src/instalador/components/layout/ContratoAppLayout';
import ResumenTab from '../../src/instalador/components/contrato-tabs/ResumenTab';
import DocumentosTab from '../../src/instalador/components/contrato-tabs/DocumentosTab';
import PagosTab from '../../src/instalador/components/contrato-tabs/PagosTab';
import ComunicacionTab from '../../src/instalador/components/contrato-tabs/ComunicacionTab';
import EstadoTab from '../../src/instalador/components/contrato-tabs/EstadoTab';
import { supabase } from '../../src/lib/supabaseClient';
import { useInstaller } from '../../src/instalador/context/InstallerContext';

export default function ContratoDetailPage() {
  const { id } = useLocalSearchParams();
  const { installer } = useInstaller();
  const [activeTab, setActiveTab] = useState('resumen');
  const [contrato, setContrato] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && installer?.id) {
      loadContratoData();
    }
  }, [id, installer?.id]);

  const loadContratoData = async () => {
    setLoading(true);
    try {
      const { data: contratoData, error } = await supabase
        .from('contratos')
        .select(`
          *,
          proyectos:cotizaciones_final_id (
            proyectos_id,
            proyectos:proyectos_id (
              id,
              titulo,
              descripcion,
              estado,
              fecha_limite,
              created_at,
              updated_at,
              cotizaciones_inicial:cotizaciones_inicial_id (
                recibo_cfe,
                consumo_kwh_historico,
                resumen_energetico,
                sizing_results,
                irradiacion_cache:irradiacion_cache_id (
                  irradiacion_promedio_anual,
                  region_nombre
                )
              )
            )
          ),
          cotizaciones_final:cotizaciones_final_id (
            *
          ),
          usuarios:usuarios_id (
            id,
            nombre,
            correo_electronico,
            telefono
          )
        `)
        .eq('id', id)
        .eq('proveedores_id', installer.id)
        .single();

      if (error) throw error;

      if (!contratoData) {
        console.error('Contrato no encontrado o no pertenece a este instalador');
        return;
      }

      setContrato(contratoData);
      setProyecto(contratoData.proyectos?.proyectos || null);
      setCotizacion(contratoData.cotizaciones_final || null);
      setCliente(contratoData.usuarios || null);

      console.log('✅ Contract data loaded:', {
        contrato: contratoData.numero_contrato,
        proyecto: contratoData.proyectos?.proyectos?.titulo,
        cliente: contratoData.usuarios?.nombre
      });
    } catch (error) {
      console.error('Error loading contract data:', error);
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
            <p className="text-sm text-gray-600">Cargando contrato...</p>
          </div>
        </div>
      );
    }

    if (!contrato) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">Contrato no encontrado</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'resumen':
        return (
          <ResumenTab
            contrato={contrato}
            proyecto={proyecto}
            cotizacion={cotizacion}
            cliente={cliente}
            onReload={loadContratoData}
          />
        );
      case 'documentos':
        return (
          <DocumentosTab
            contrato={contrato}
            proyecto={proyecto}
            onReload={loadContratoData}
          />
        );
      case 'pagos':
        return (
          <PagosTab
            contrato={contrato}
            proyecto={proyecto}
            cliente={cliente}
          />
        );
      case 'comunicacion':
        return (
          <ComunicacionTab
            contrato={contrato}
            cliente={cliente}
          />
        );
      case 'estado':
        return (
          <EstadoTab
            contrato={contrato}
            proyecto={proyecto}
            onReload={loadContratoData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ContratoAppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        contrato={contrato}
        proyecto={proyecto}
      >
        {renderActiveTab()}
      </ContratoAppLayout>
    </View>
  );
}
