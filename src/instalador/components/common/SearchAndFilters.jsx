import React from 'react';
import { GRADIENTS } from '../../../shared/config/gradients';

const SearchAndFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  statusOptions = [],
  sortOptions = [],
  showStatusFilter = true,
  showSortFilter = true,
}) => {
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchText') return value !== '';
    if (key === 'status') return value !== 'all';
    if (key === 'sortBy') return value !== 'date';
    if (key === 'sortOrder') return value !== 'desc';
    return false;
  }).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.searchText}
          onChange={(e) => onFiltersChange({ searchText: e.target.value })}
          className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {filters.searchText && (
          <button
            onClick={() => onFiltersChange({ searchText: '' })}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros y Ordenamiento */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Filtro de Estado */}
        {showStatusFilter && statusOptions.length > 0 && (
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Filtro de Ordenamiento */}
        {showSortFilter && sortOptions.length > 0 && (
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onFiltersChange({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title={filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Contador de filtros activos y botón limpiar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ background: GRADIENTS.primary }}>
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
            </span>
            <button
              onClick={onClearFilters}
              className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;
