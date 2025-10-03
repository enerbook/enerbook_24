import React, { useState, useMemo } from 'react';
import QuotationCard from '../cards/QuotationCard';
import QuotationDetailsModal from '../modals/QuotationDetailsModal';
import { useInstaller } from '../../context/InstallerContext';
import { formatQuotationData } from '../../utils/dataFormatters';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchAndFilters from '../common/SearchAndFilters';
import usePersistedFilters from '../../hooks/usePersistedFilters';

const QuotationsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Usar filtros persistidos
  const { filters, updateFilters, clearFilters } = usePersistedFilters('quotations');

  // Usar context en lugar de estado local
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
        q.quotationNumber?.toLowerCase().includes(searchLower) ||
        q.clientName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      result = result.filter(q => q.status === filters.status);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        comparison = new Date(b.submittedDate) - new Date(a.submittedDate);
      } else if (filters.sortBy === 'amount') {
        const amountA = parseFloat(a.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        const amountB = parseFloat(b.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        comparison = amountB - amountA;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [quotations, filters]);

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const handleCancel = (quotation) => {
    // Aquí iría la lógica para cancelar la cotización
    console.log('Cancelar cotización:', quotation.id);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendientes' },
    { value: 'accepted', label: 'Aceptadas' },
    { value: 'rejected', label: 'Rechazadas' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha' },
    { value: 'amount', label: 'Monto' },
  ];

  return (
    <div className="w-full mx-auto">
      {!quotationsLoading && !quotationsError && quotations.length > 0 && (
        <SearchAndFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
        />
      )}

      {quotationsLoading ? (
        <SkeletonGrid type="quotation" count={6} columns={3} />
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
          <p className="text-sm text-gray-600">Aún no has enviado cotizaciones a ningún proyecto.</p>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-sm text-gray-600">No hay cotizaciones que coincidan con los filtros aplicados.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onViewDetails={handleViewDetails}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {showDetailsModal && selectedQuotation && (
        <QuotationDetailsModal 
          quotation={selectedQuotation} 
          setShowDetailsModal={setShowDetailsModal} 
        />
      )}
    </div>
  );
};

export default QuotationsView;