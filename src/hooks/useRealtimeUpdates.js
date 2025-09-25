import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeUpdates = (table, filter = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select('*');

      // Apply filters if provided
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data: initialData, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(initialData || []);
    } catch (err) {
      console.error(`Error loading ${table} data:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, filter]);

  useEffect(() => {
    loadInitialData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);

          if (payload.eventType === 'INSERT') {
            setData(prevData => [...prevData, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData =>
              prevData.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prevData =>
              prevData.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, loadInitialData]);

  return { data, loading, error, refresh: loadInitialData };
};

// Hook específico para alertas en tiempo real
export const useRealtimeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlertCount, setNewAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        // Check milestones
        const { data: milestones } = await supabase
          .from('pagos_milestones')
          .select('*')
          .eq('estado', 'pendiente')
          .lt('fecha_objetivo', new Date().toISOString());

        // Check webhooks
        const { data: webhooks } = await supabase
          .from('stripe_webhooks_log')
          .select('*')
          .eq('processed', false)
          .order('created_at', { ascending: false })
          .limit(5);

        // Check disputes
        const { data: disputes } = await supabase
          .from('stripe_disputes')
          .select('*')
          .or('status.eq.warning_needs_response,status.eq.needs_response');

        const allAlerts = [];

        milestones?.forEach(m => {
          allAlerts.push({
            id: `milestone-${m.id}`,
            type: 'milestone',
            severity: 'high',
            message: `Milestone vencido: ${m.descripcion}`,
            timestamp: m.fecha_objetivo
          });
        });

        webhooks?.forEach(w => {
          allAlerts.push({
            id: `webhook-${w.id}`,
            type: 'webhook',
            severity: 'medium',
            message: `Webhook sin procesar: ${w.event_type}`,
            timestamp: w.created_at
          });
        });

        disputes?.forEach(d => {
          allAlerts.push({
            id: `dispute-${d.id}`,
            type: 'dispute',
            severity: 'critical',
            message: `Disputa activa requiere respuesta`,
            timestamp: d.created
          });
        });

        const previousCount = alerts.length;
        setAlerts(allAlerts);

        if (allAlerts.length > previousCount) {
          setNewAlertCount(allAlerts.length - previousCount);
        }
      } catch (error) {
        console.error('Error checking alerts:', error);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [alerts.length]);

  const clearNewAlertCount = useCallback(() => {
    setNewAlertCount(0);
  }, []);

  return { alerts, newAlertCount, clearNewAlertCount };
};

// Hook para métricas agregadas en tiempo real
export const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
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
        console.error('Error loading real-time metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Subscribe to changes in key tables
    const userChannel = supabase
      .channel('users_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, loadMetrics)
      .subscribe();

    const projectChannel = supabase
      .channel('projects_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, loadMetrics)
      .subscribe();

    const commissionChannel = supabase
      .channel('commissions_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comisiones_enerbook' }, loadMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(commissionChannel);
    };
  }, []);

  return { metrics, loading };
};

export default useRealtimeUpdates;