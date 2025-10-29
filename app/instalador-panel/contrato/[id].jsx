import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ContratoAppLayout from '../../../src/instalador/components/layout/ContratoAppLayout';
import ResumenTab from '../../../src/instalador/components/contrato-tabs/ResumenTab';
import DocumentosTab from '../../../src/instalador/components/contrato-tabs/DocumentosTab';
import PagosTab from '../../../src/instalador/components/contrato-tabs/PagosTab';
import ComunicacionTab from '../../../src/instalador/components/contrato-tabs/ComunicacionTab';
import EstadoTab from '../../../src/instalador/components/contrato-tabs/EstadoTab';
import { supabase } from '../../../src/lib/supabaseClient';
import { useInstaller } from '../../../src/instalador/context/InstallerContext';

export default function ContratoDetailPage() {
  const { id } = useLocalSearchParams();
  const { installer } = useInstaller();
  const [activeTab, setActiveTab] = useState('resumen');
  const [contrato, setContrato] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [installerData, setInstallerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && installer?.id) {
      loadContratoData();
    }
  }, [id, installer?.id]);

  const loadContratoData = async () => {
    setLoading(true);
    try {
      // Obtener el contrato con su proyecto directamente vinculado
      const { data: contratoData, error } = await supabase
        .from('contratos')
        .select(`
          *,
          cotizacion:cotizaciones_final_id (*),
          proyecto:proyectos_id (
            id,
            titulo,
            descripcion,
            estado,
            fecha_limite,
            created_at,
            updated_at
          ),
          cliente:usuarios_id (
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

      console.log('🔍 DEBUG - Datos del contrato completo:', {
        contratoId: contratoData.id,
        proyectos_id: contratoData.proyectos_id,
        cotizacion_proyectos_id: contratoData.cotizacion?.proyectos_id,
        hasProyecto: !!contratoData.proyecto,
        proyectoData: contratoData.proyecto,
        contratoKeys: Object.keys(contratoData)
      });

      // Si el contrato no tiene proyectos_id, intentar obtenerlo de la cotización
      let proyectoFinal = contratoData.proyecto;

      if (!proyectoFinal && contratoData.proyectos_id) {
        console.log('⚠️ Proyecto null pero contrato tiene proyectos_id, buscando con maybeSingle:', contratoData.proyectos_id);

        const { data: proyectoFromId, error: proyectoError } = await supabase
          .from('proyectos')
          .select('*')
          .eq('id', contratoData.proyectos_id)
          .maybeSingle();

        if (proyectoFromId) {
          console.log('✅ Proyecto encontrado desde contrato.proyectos_id:', proyectoFromId.titulo);
          proyectoFinal = proyectoFromId;
        } else {
          console.log('❌ Proyecto no existe en BD con ID:', contratoData.proyectos_id, 'Error:', proyectoError);

          // Verificar si existe en la cotización
          if (contratoData.cotizacion?.proyectos_id) {
            console.log('🔄 Intentando desde cotización:', contratoData.cotizacion.proyectos_id);
            const { data: proyectoFromCotizacion, error: cotError } = await supabase
              .from('proyectos')
              .select('*')
              .eq('id', contratoData.cotizacion.proyectos_id)
              .maybeSingle();

            if (proyectoFromCotizacion) {
              console.log('✅ Proyecto encontrado desde cotización:', proyectoFromCotizacion.titulo);
              proyectoFinal = proyectoFromCotizacion;
            } else {
              console.log('❌ Proyecto tampoco existe con ID de cotización:', cotError);
            }
          }
        }
      }

      setContrato(contratoData);
      setProyecto(proyectoFinal || null);
      setCotizacion(contratoData.cotizacion || null);
      setCliente(contratoData.cliente || null);

      // Cargar datos del instalador (proveedor)
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', installer.id)
        .single();

      if (!proveedorError && proveedorData) {
        setInstallerData(proveedorData);
      }

      console.log('✅ Contract data loaded:', {
        contrato: contratoData.numero_contrato,
        proyecto: contratoData.proyecto?.titulo,
        proyectoId: contratoData.proyectos_id,
        cliente: contratoData.cliente?.nombre,
        instalador: proveedorData?.nombre_empresa
      });

      console.log('🔍 Full contract data structure:', {
        hasCliente: !!contratoData.cliente,
        hasCotizacion: !!contratoData.cotizacion,
        hasProyecto: !!contratoData.proyecto,
        clienteKeys: contratoData.cliente ? Object.keys(contratoData.cliente) : null,
        cotizacionKeys: contratoData.cotizacion ? Object.keys(contratoData.cotizacion) : null,
        proyectoKeys: contratoData.proyecto ? Object.keys(contratoData.proyecto) : null
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
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
            instalador={installerData}
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
