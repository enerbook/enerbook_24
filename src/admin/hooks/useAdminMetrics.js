import { useState, useEffect, useCallback } from 'react';
import { adminQueries } from '../services/queries';
import { useAuth } from '../../context/AuthContext';

export const useAdminMetrics = (metricType, refreshInterval = null) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      let result;
      switch (metricType) {
        case 'users':
          result = await adminQueries.getUserMetrics(user.id);
          break;
        case 'projects':
          result = await adminQueries.getProjectMetrics();
          break;
        case 'finance':
          result = await adminQueries.getFinanceMetrics();
          break;
        case 'providers':
          result = await adminQueries.getProviderMetrics();
          break;
        case 'regional':
          result = await adminQueries.getRegionalAnalysis();
          break;
        case 'alerts':
          result = await adminQueries.getSystemAlerts();
          break;
        case 'trends':
          result = await adminQueries.getTrends();
          break;
        default:
          throw new Error(`Unknown metric type: ${metricType}`);
      }

      setData(result);
    } catch (err) {
      console.error(`Error loading ${metricType} metrics:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [metricType]);

  useEffect(() => {
    loadMetrics();

    if (refreshInterval) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadMetrics, refreshInterval]);

  return { data, loading, error, refresh: loadMetrics };
};

export default useAdminMetrics;