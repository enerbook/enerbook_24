import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import logger from '../utils/logger';

/**
 * Hook de tiempo real para métricas agregadas del administrador
 * Escucha cambios en tablas clave y actualiza métricas automáticamente
 */
export const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);

      const [
        { count: userCount },
        { count: projectCount },
        { data: comisiones }
      ] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('proyectos').select('*', { count: 'exact', head: true }),
        supabase.from('comisiones_enerbook').select('monto_comision')
      ]);

      const totalComisiones = comisiones?.reduce((sum, c) =>
        sum + (parseFloat(c.monto_comision) || 0), 0
      ) || 0;

      setMetrics({
        totalUsers: userCount || 0,
        totalProjects: projectCount || 0,
        totalRevenue: totalComisiones,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error loading real-time metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();

    // Subscribe to changes in key tables
    const userChannel = supabase
      .channel('admin_users_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, loadMetrics)
      .subscribe();

    const projectChannel = supabase
      .channel('admin_projects_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, loadMetrics)
      .subscribe();

    const commissionChannel = supabase
      .channel('admin_commissions_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comisiones_enerbook' }, loadMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(commissionChannel);
    };
  }, [loadMetrics]);

  return { metrics, loading, refresh: loadMetrics };
};

export default useRealtimeMetrics;
