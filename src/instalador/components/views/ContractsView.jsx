import React, { useState, useMemo } from 'react';
import ContractCard from '../cards/ContractCard';
import ContractDetailsModal from '../modals/ContractDetailsModal';
import UpdateStatusModal from '../modals/UpdateStatusModal';
import { useInstaller } from '../../context/InstallerContext';
import { formatContractData } from '../../utils/dataFormatters';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchAndFilters from '../common/SearchAndFilters';
import usePersistedFilters from '../../hooks/usePersistedFilters';

const ContractsView = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Usar filtros persistidos
  const { filters, updateFilters, clearFilters } = usePersistedFilters('contracts');

  // Usar context en lugar de estado local
  const {
    contracts: rawContracts,
    contractsLoading,
    contractsError,
    updateContractStatus
  } = useInstaller();

  // Formatear contratos usando utilidad compartida
  const contracts = useMemo(() => {
    return rawContracts?.map(formatContractData) || [];
  }, [rawContracts]);

  // Aplicar filtros y búsqueda
  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // Búsqueda por texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(c =>
        c.projectName?.toLowerCase().includes(searchLower) ||
        c.contractNumber?.toLowerCase().includes(searchLower) ||
        c.clientName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        comparison = new Date(b.signedDate) - new Date(a.signedDate);
      } else if (filters.sortBy === 'amount') {
        const amountA = parseFloat(a.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        const amountB = parseFloat(b.totalAmount.replace(/[^0-9.-]+/g, '')) || 0;
        comparison = amountB - amountA;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [contracts, filters]);

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (contract) => {
    setSelectedContract(contract);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (selectedStatuses) => {
    if (!selectedContract?.id) return;

    // Actualizar el estado del contrato usando el context
    const result = await updateContractStatus(selectedContract.id, selectedStatuses.contractStatus);

    if (result.success) {
      console.log('Estado del contrato actualizado exitosamente');
      setShowStatusModal(false);
    } else {
      console.error('Error al actualizar estado:', result.error);
      alert(`Error al actualizar estado: ${result.error}`);
    }
  };

  const handleViewReview = (contract) => {
    // Aquí iría la lógica para ver la reseña
    console.log('Ver reseña del contrato:', contract.id);
  };

  const statusOptions = [
    { value: 'active', label: 'Activos' },
    { value: 'completed', label: 'Completados' },
    { value: 'in_progress', label: 'En progreso' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Fecha' },
    { value: 'amount', label: 'Monto' },
  ];

  return (
    <div className="w-full mx-auto">
      {!contractsLoading && !contractsError && contracts.length > 0 && (
        <SearchAndFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          statusOptions={statusOptions}
          sortOptions={sortOptions}
        />
      )}

      {contractsLoading ? (
        <SkeletonGrid type="contract" count={6} columns={3} />
      ) : contractsError ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar contratos</h3>
          <p className="text-sm text-gray-600">{contractsError}</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos</h3>
          <p className="text-sm text-gray-600">Aún no tienes contratos firmados con clientes.</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-sm text-gray-600">No hay contratos que coincidan con los filtros aplicados.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              onViewReview={handleViewReview}
            />
          ))}
        </div>
      )}

      {showDetailsModal && selectedContract && (
        <ContractDetailsModal 
          contract={selectedContract} 
          setShowDetailsModal={setShowDetailsModal} 
        />
      )}

      {showStatusModal && selectedContract && (
        <UpdateStatusModal 
          contract={selectedContract} 
          setShowStatusModal={setShowStatusModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ContractsView;