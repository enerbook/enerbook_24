import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_KEYS = {
  QUOTATIONS: '@installer_filters_quotations',
  CONTRACTS: '@installer_filters_contracts',
  PROJECTS: '@installer_filters_projects',
};

export const usePersistedFilters = (filterType) => {
  const storageKey = FILTER_KEYS[filterType.toUpperCase()] || `@installer_filters_${filterType}`;

  const [filters, setFilters] = useState({
    searchText: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar filtros al montar
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(storageKey);
        if (savedFilters) {
          setFilters(JSON.parse(savedFilters));
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilters();
  }, [storageKey]);

  // Guardar filtros cuando cambien
  const updateFilters = async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  // Limpiar filtros
  const clearFilters = async () => {
    const defaultFilters = {
      searchText: '',
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    };

    setFilters(defaultFilters);

    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    isLoading,
  };
};

export default usePersistedFilters;
