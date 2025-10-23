import React, { useMemo } from 'react';
import { useInstaller } from '../../context/InstallerContext';
import { formatProjectData } from '../../utils/dataFormatters';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchAndFilters from '../common/SearchAndFilters';
import usePersistedFilters from '../../hooks/usePersistedFilters';

const CotizacionesTab = ({ setSelectedProject, setShowProjectModal, setShowQuoteModal }) => {
  // Usar filtros persistidos
  const { filters, updateFilters, clearFilters } = usePersistedFilters('cotizaciones');

  // Usar context para proyectos disponibles
  const { availableProjects: rawProjects, projectsLoading, projectsError } = useInstaller();

  // Formatear proyectos usando utilidad compartida
  const projects = useMemo(() => {
    // Debug: verificar datos antes del formateo
    if (rawProjects && rawProjects.length > 0) {
      console.log('🔍 CotizacionesTab - Raw project sample:', {
        proyecto_id: rawProjects[0]?.id,
        tiene_cotizacion: !!rawProjects[0]?.cotizaciones_inicial,
        consumo_type: typeof rawProjects[0]?.cotizaciones_inicial?.consumo_kwh_historico,
        consumo_is_array: Array.isArray(rawProjects[0]?.cotizaciones_inicial?.consumo_kwh_historico),
        consumo_first_item: rawProjects[0]?.cotizaciones_inicial?.consumo_kwh_historico?.[0],
        sizing_keys: rawProjects[0]?.cotizaciones_inicial?.sizing_results
          ? Object.keys(rawProjects[0].cotizaciones_inicial.sizing_results)
          : []
      });
    }

    const formatted = rawProjects?.map(formatProjectData) || [];

    // Debug: verificar datos después del formateo
    if (formatted.length > 0) {
      console.log('📊 CotizacionesTab - Formatted project sample:', {
        name: formatted[0].name,
        power: formatted[0].power,
        consumption: formatted[0].consumption,
        tariff: formatted[0].tariff,
        location: formatted[0].location,
        production: formatted[0].production
      });
    }

    return formatted;
  }, [rawProjects]);

  // Aplicar filtros y búsqueda
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Búsqueda por texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.clientName?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower) ||
        p.tariff?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        comparison = new Date(b.deadline) - new Date(a.deadline);
      } else if (filters.sortBy === 'power') {
        const powerA = parseFloat(a.power.replace(/[^0-9.-]+/g, '')) || 0;
        const powerB = parseFloat(b.power.replace(/[^0-9.-]+/g, '')) || 0;
        comparison = powerB - powerA;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [projects, filters]);

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyectos Disponibles para Cotizar</h2>
        <p className="text-sm text-gray-600">
          Explora proyectos publicados por clientes y envía tu cotización
        </p>
      </div>

      {!projectsLoading && !projectsError && projects.length > 0 && (
        <SearchAndFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          statusOptions={[]}
          sortOptions={[
            { value: 'date', label: 'Fecha límite' },
            { value: 'power', label: 'Potencia' },
          ]}
          showStatusFilter={false}
        />
      )}

      {projectsLoading ? (
        <SkeletonGrid type="project" count={6} columns={3} />
      ) : projectsError ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar proyectos</h3>
          <p className="text-sm text-gray-600">{projectsError}</p>
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
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-sm text-gray-600">No hay proyectos que coincidan con la búsqueda.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project) => (
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
  );
};

export default CotizacionesTab;
