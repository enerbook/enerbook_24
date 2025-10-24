import React, { useMemo } from 'react';
import { useInstaller } from '../../context/InstallerContext';
import { formatQuotationData } from '../../utils/dataFormatters';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchAndFilters from '../common/SearchAndFilters';
import usePersistedFilters from '../../hooks/usePersistedFilters';

const MisCotizacionesTab = ({ setSelectedQuotation, setShowQuotationModal }) => {
  // Usar filtros persistidos
  const { filters, updateFilters, clearFilters } = usePersistedFilters('mis_cotizaciones');

  // Usar context para cotizaciones
  const { quotations: rawQuotations, quotationsLoading, quotationsError } = useInstaller();

  // Formatear cotizaciones usando utilidad compartida
  const quotations = useMemo(() => {
    return rawQuotations?.map(formatQuotationData) || [];
  }, [rawQuotations]);

  // Aplicar filtros y búsqueda
  const filteredQuotations = useMemo(() => {
    let result = [...quotations];

    // Búsqueda por texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(q =>
        q.projectName?.toLowerCase().includes(searchLower) ||
        q.clientName?.toLowerCase().includes(searchLower) ||
        q.clientEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      result = result.filter(q => q.rawStatus === filters.status);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        comparison = new Date(b.sentDate) - new Date(a.sentDate);
      } else if (filters.sortBy === 'amount') {
        const amountA = parseFloat(a.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        const amountB = parseFloat(b.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        comparison = amountB - amountA;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [quotations, filters]);


  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Cotizaciones Enviadas</h2>
        <p className="text-sm text-gray-600">
          Revisa el estado de las cotizaciones que has enviado
        </p>
      </div>

      {!quotationsLoading && !quotationsError && quotations.length > 0 && (
        <SearchAndFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          statusOptions={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'pendiente', label: 'En revisión' },
            { value: 'aceptada', label: 'Aceptada' },
            { value: 'rechazada', label: 'Rechazada' }
          ]}
          sortOptions={[
            { value: 'date', label: 'Fecha de envío' },
            { value: 'amount', label: 'Monto' }
          ]}
          showStatusFilter={true}
        />
      )}

      {quotationsLoading ? (
        <SkeletonGrid type="quotation" count={6} columns={1} />
      ) : quotationsError ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar cotizaciones</h3>
          <p className="text-sm text-gray-600">{quotationsError}</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No has enviado cotizaciones</h3>
          <p className="text-sm text-gray-600">Aún no has enviado ninguna cotización a proyectos.</p>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-sm text-gray-600">No hay cotizaciones que coincidan con la búsqueda.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map((quotation) => (
            <div
              key={quotation.id}
              className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
              style={{backgroundColor: '#fcfcfc'}}
              onClick={() => {
                setSelectedQuotation(quotation);
                setShowQuotationModal(true);
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{quotation.projectName}</h3>
                    <span
                      className="inline-block self-start xs:self-auto px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium text-white"
                      style={{background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'}}
                    >
                      {quotation.status}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Monto Total</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{quotation.totalAmount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Fecha de Envío</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{quotation.sentDate}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Capacidad del Sistema</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{quotation.details.capacity}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Paneles</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{quotation.details.panelCount} unidades</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Producción Estimada</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{quotation.details.production}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCotizacionesTab;
