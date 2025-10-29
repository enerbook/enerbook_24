import React, { useMemo } from 'react';
import { useInstaller } from '../../context/InstallerContext';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchAndFilters from '../common/SearchAndFilters';
import usePersistedFilters from '../../hooks/usePersistedFilters';
import { useRouter } from 'expo-router';

const ProjectsTab = () => {
  const router = useRouter();

  // Usar filtros persistidos
  const { filters, updateFilters, clearFilters } = usePersistedFilters('myProjects');

  // Obtener proyectos con contratos del context
  const { myProjects, myProjectsLoading, myProjectsError } = useInstaller();

  // Aplicar filtros y búsqueda
  const filteredProjects = useMemo(() => {
    let result = [...myProjects];

    // Búsqueda por texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(p =>
        p.proyecto?.titulo?.toLowerCase().includes(searchLower) ||
        p.contrato?.numero_contrato?.toLowerCase().includes(searchLower) ||
        p.cliente?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      result = result.filter(p => p.contrato?.estado === filters.status);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        comparison = new Date(b.contrato?.created_at) - new Date(a.contrato?.created_at);
      } else if (filters.sortBy === 'amount') {
        const amountA = parseFloat(a.contrato?.precio_total_sistema) || 0;
        const amountB = parseFloat(b.contrato?.precio_total_sistema) || 0;
        comparison = amountB - amountA;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [myProjects, filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadgeColor = (estado) => {
    // Todos los estados usan el degradado naranja Enerbook con letras blancas
    return 'bg-gradient-to-br from-brand to-brandLight text-white';
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getEstadoPagoColor = (estadoPago) => {
    switch (estadoPago) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-orange-100 text-orange-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'activo', label: 'Activos' },
    { value: 'completado', label: 'Completados' },
    { value: 'cancelado', label: 'Cancelados' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha' },
    { value: 'amount', label: 'Monto' },
  ];

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Proyectos</h2>
        <p className="text-sm text-gray-600">
          Proyectos donde fuiste seleccionado por el cliente
        </p>
      </div>

      {!myProjectsLoading && !myProjectsError && myProjects.length > 0 && (
        <SearchAndFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
        />
      )}

      {myProjectsLoading ? (
        <SkeletonGrid type="project" count={6} columns={3} />
      ) : myProjectsError ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar proyectos</h3>
          <p className="text-sm text-gray-600">{myProjectsError}</p>
        </div>
      ) : myProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos asignados</h3>
          <p className="text-sm text-gray-600">
            Aún no tienes proyectos donde hayas sido seleccionado por un cliente.
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-sm text-gray-600">No hay proyectos que coincidan con los filtros aplicados.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((item) => {
            const { contrato, proyecto, cotizacion, cliente } = item;

            // Calcular datos de la cotización
            const paneles = cotizacion?.paneles;
            const precioFinal = cotizacion?.precio_final;
            const sizingResults = proyecto?.cotizaciones_inicial?.sizing_results;

            // Capacidad del sistema
            let systemCapacity = 'No especificada';
            if (precioFinal?.capacidad_sistema_kwp) {
              systemCapacity = `${precioFinal.capacidad_sistema_kwp.toFixed(2)} kWp`;
            } else if (paneles?.cantidad && paneles?.potencia_wp) {
              const capacityKw = (paneles.cantidad * paneles.potencia_wp) / 1000;
              systemCapacity = `${capacityKw.toFixed(2)} kWp`;
            } else if (sizingResults?.sistema?.capacidad_sistema_kw) {
              systemCapacity = `${sizingResults.sistema.capacidad_sistema_kw} kWp`;
            }

            // Producción estimada
            let production = 'No calculada';
            if (precioFinal?.produccion_anual_kwh) {
              production = `${precioFinal.produccion_anual_kwh.toLocaleString()} kWh/año`;
            } else if (sizingResults?.sistema?.produccion_anual_kwh) {
              production = `${sizingResults.sistema.produccion_anual_kwh.toLocaleString()} kWh/año`;
            }

            return (
              <div
                key={contrato.id}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                style={{backgroundColor: '#fcfcfc'}}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {proyecto?.titulo || `Contrato ${contrato.numero_contrato}`}
                      </h3>
                      <span
                        className={`inline-block self-start xs:self-auto px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getEstadoBadgeColor(contrato.estado)}`}
                      >
                        {capitalizeFirstLetter(contrato.estado)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Cliente: {contrato?.estado_pago === 'succeeded' ? (cliente?.nombre || 'N/A') : 'Se mostrará cuando el cliente realice el pago'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Monto Total</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {formatCurrency(contrato.precio_total_sistema)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100 mb-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Fecha de Firma</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {formatDate(contrato.fecha_firma)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Capacidad del Sistema</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{systemCapacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Paneles</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {paneles?.cantidad || 'N/A'} unidades
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Producción Estimada</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{production}</p>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => router.push(`/instalador-panel/contrato/${contrato.id}`)}
                  className="w-full py-2.5 px-4 text-white rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                  style={{backgroundColor: '#090e1a'}}
                >
                  Ver Detalles del Contrato
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
