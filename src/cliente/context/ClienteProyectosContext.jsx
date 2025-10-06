import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { quotationService } from '../services/quotationService';

const ClienteProyectosContext = createContext();

export const ClienteProyectosProvider = ({ children }) => {
  const [proyectos, setProyectos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError] = useState(null);

  // Caché duration: 30 seconds
  const CACHE_DURATION = 30000;

  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  }, [lastFetch]);

  // Load projects and quotations with parallel requests
  const loadProyectos = useCallback(async (forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (isCacheValid && !forceRefresh && proyectos.length > 0) {
      console.log('📦 Using cached projects data');
      return { proyectos, cotizaciones };
    }

    setLoading(true);
    setError(null);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Load projects
      const proyectosData = await projectService.getClientProjects(user.id);
      setProyectos(proyectosData || []);

      // Load quotations in parallel for all projects
      if (proyectosData && proyectosData.length > 0) {
        const quotationsPromises = proyectosData.map(proyecto =>
          quotationService.getProjectQuotations(proyecto.id)
            .catch(error => {
              console.error(`Error loading quotations for project ${proyecto.id}:`, error);
              return []; // Return empty array on error to not break Promise.all
            })
        );

        const allQuotationsArrays = await Promise.all(quotationsPromises);
        const allQuotations = allQuotationsArrays.flat();
        setCotizaciones(allQuotations);

        setLastFetch(Date.now());
        console.log('✅ Projects loaded successfully:', {
          projects: proyectosData.length,
          quotations: allQuotations.length
        });

        return { proyectos: proyectosData, cotizaciones: allQuotations };
      }

      setLastFetch(Date.now());
      return { proyectos: proyectosData || [], cotizaciones: [] };

    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error.message);
      setProyectos([]);
      setCotizaciones([]);
      return { proyectos: [], cotizaciones: [] };
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, proyectos, cotizaciones]);

  // Invalidate cache and reload
  const refreshProyectos = useCallback(() => {
    return loadProyectos(true);
  }, [loadProyectos]);

  // Clear cache
  const clearCache = useCallback(() => {
    setProyectos([]);
    setCotizaciones([]);
    setLastFetch(null);
    setError(null);
  }, []);

  // Get quotations for specific project (from cache)
  const getProjectQuotations = useCallback((projectId) => {
    return cotizaciones.filter(c => c.proyectos_id === projectId);
  }, [cotizaciones]);

  const value = useMemo(() => ({
    proyectos,
    cotizaciones,
    loading,
    error,
    isCacheValid,
    loadProyectos,
    refreshProyectos,
    clearCache,
    getProjectQuotations
  }), [
    proyectos,
    cotizaciones,
    loading,
    error,
    isCacheValid,
    loadProyectos,
    refreshProyectos,
    clearCache,
    getProjectQuotations
  ]);

  return (
    <ClienteProyectosContext.Provider value={value}>
      {children}
    </ClienteProyectosContext.Provider>
  );
};

export const useClienteProyectos = () => {
  const context = useContext(ClienteProyectosContext);
  if (!context) {
    throw new Error('useClienteProyectos must be used within a ClienteProyectosProvider');
  }
  return context;
};

export default ClienteProyectosContext;
