import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import QuotationsView from '../views/QuotationsView';
import ContractsView from '../views/ContractsView';
import ReviewsView from '../views/ReviewsView';

const ProjectsTab = ({ setSelectedProject, setShowProjectModal, setShowQuoteModal }) => {
  const [activeSubTab, setActiveSubTab] = useState('disponibles');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableProjects();
  }, []);

  const loadAvailableProjects = async () => {
    setLoading(true);
    try {
      const { data: proyectos, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          usuarios:usuarios_id (nombre, correo_electronico),
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
        `)
        .eq('estado', 'abierto')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      const formattedProjects = proyectos?.map(proyecto => {
        const cotizacion = proyecto.cotizaciones_inicial;
        const sizingResults = cotizacion?.sizing_results;
        const reciboData = cotizacion?.recibo_cfe;
        const consumoHistorico = cotizacion?.consumo_kwh_historico;
        const resumenEnergetico = cotizacion?.resumen_energetico;
        const irradiacionData = cotizacion?.irradiacion_cache;


        // Calcular datos de consumo
        let consumoAnual = 'No disponible';
        if (consumoHistorico && Array.isArray(consumoHistorico) && consumoHistorico.length > 0) {
          const totalConsumo = consumoHistorico.reduce((sum, item) => sum + (item.consumo || item.kwh || 0), 0);
          consumoAnual = `${totalConsumo.toLocaleString()} kWh`;
        } else if (resumenEnergetico?.consumo_promedio) {
          consumoAnual = `${(resumenEnergetico.consumo_promedio * 12).toLocaleString()} kWh`;
        }

        // Datos de potencia y dimensionamiento
        let powerInfo = 'Información no disponible';
        if (sizingResults?.kWp_needed) {
          const paneles = sizingResults.n_panels || Math.ceil((sizingResults.kWp_needed * 1000) / (sizingResults.panel_wp || 550));
          powerInfo = `${sizingResults.kWp_needed} kW (${paneles} paneles)`;
        }

        return {
          id: proyecto.id,
          name: proyecto.titulo || `Proyecto ${proyecto.id.slice(0, 8)}`,
          power: powerInfo,
          consumption: consumoAnual,
          tariff: reciboData?.tarifa || 'No especificada',
          location: reciboData?.codigo_postal || 'No especificado',
          irradiation: irradiacionData?.irradiacion_promedio_anual ?
            `${irradiacionData.irradiacion_promedio_anual.toFixed(1)} kWh/m²/día` :
            '5.2 kWh/m²/día',
          deadline: proyecto.fecha_limite ?
            new Date(proyecto.fecha_limite).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) :
            'Sin fecha límite',
          capacity: sizingResults?.kWp_needed ? `${sizingResults.kWp_needed} kWp` : 'N/A',
          production: sizingResults?.yearly_prod ?
            `${sizingResults.yearly_prod.toLocaleString()} kWh/año` :
            'No calculada',
          description: proyecto.descripcion || 'Sin descripción',
          clientName: proyecto.usuarios?.nombre || reciboData?.nombre || 'Cliente no especificado',
          clientEmail: proyecto.usuarios?.correo_electronico,
          region: irradiacionData?.region_nombre || 'México',
          rawData: proyecto
        };
      }) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('disponibles')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'disponibles'
              ? 'text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          style={activeSubTab === 'disponibles' ? {background: '#090e1a'} : {}}
        >
          Proyectos Disponibles
        </button>
        <button
          onClick={() => setActiveSubTab('cotizaciones')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'cotizaciones'
              ? 'text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          style={activeSubTab === 'cotizaciones' ? {background: '#090e1a'} : {}}
        >
          Mis cotizaciones
        </button>
        <button
          onClick={() => setActiveSubTab('contratos')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'contratos'
              ? 'text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          style={activeSubTab === 'contratos' ? {background: '#090e1a'} : {}}
        >
          Contratos
        </button>
        <button
          onClick={() => setActiveSubTab('resenas')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSubTab === 'resenas'
              ? 'text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          style={activeSubTab === 'resenas' ? {background: '#090e1a'} : {}}
        >
          Mis Reseñas
        </button>
      </div>

      {/* Content based on active subtab */}
      {activeSubTab === 'disponibles' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              <p className="text-sm text-gray-600 ml-4">Cargando proyectos disponibles...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos disponibles</h3>
              <p className="text-sm text-gray-600">No se encontraron proyectos abiertos para cotizar en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {projects.map((project) => (
                <div key={project.id} className="p-8 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Cliente: {project.clientName}</p>
                  <p className="text-sm text-gray-600 mb-4">Potencia y Dimensionamiento sugerido</p>
                  <p className="text-sm text-gray-800 mb-6">{project.power}</p>

              {/* Project Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Consumo Anual Histórico</span>
                  <span className="text-sm text-gray-900">{project.consumption}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Tipo de Tarifa</span>
                  <span className="text-sm text-gray-900">{project.tariff}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Ubicación General</span>
                  <span className="text-sm text-gray-900">{project.location}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Irradiación Promedio</span>
                  <span className="text-sm text-gray-900">{project.irradiation}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Fecha Límite para Cotizar</span>
                  <span className="text-sm text-gray-900">{project.deadline}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Producción Estimada</span>
                  <span className="text-sm text-gray-900">{project.production}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Región</span>
                  <span className="text-sm text-gray-900">{project.region}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectModal(true);
                  }}
                  className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
                  style={{backgroundColor: '#090e1a'}}
                >
                  Ver Detalles
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowQuoteModal(true);
                  }}
                  className="flex-1 py-3 px-4 text-white rounded-2xl text-sm font-medium transition-colors"
                  style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
                >
                  Enviar Cotización
                </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {activeSubTab === 'cotizaciones' && (
        <QuotationsView />
      )}

      {activeSubTab === 'contratos' && (
        <ContractsView />
      )}

      {activeSubTab === 'resenas' && (
        <ReviewsView />
      )}
    </div>
  );
};

export default ProjectsTab;
