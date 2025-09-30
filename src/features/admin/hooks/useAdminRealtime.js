import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

/**
 * Hook de tiempo real para administradores
 * Métricas globales, alertas críticas, webhooks
 */

/**
 * Hook para métricas agregadas en tiempo real
 */
export const useAdminMetrics = () => {
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
      console.error('Error loading real-time metrics:', error);
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

/**
 * Hook para alertas críticas del sistema (admin)
 */
export const useAdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlertCount, setNewAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        // Check milestones vencidos (todos los proyectos)
        const { data: milestones } = await supabase
          .from('pagos_milestones')
          .select('*, proyecto:proyectos(*)')
          .eq('estado', 'pendiente')
          .lt('fecha_objetivo', new Date().toISOString());

        // Check webhooks sin procesar
        const { data: webhooks } = await supabase
          .from('stripe_webhooks_log')
          .select('*')
          .eq('processed', false)
          .order('created_at', { ascending: false })
          .limit(5);

        // Check disputas activas
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
            projectName: m.proyecto?.nombre,
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
        console.error('Error checking admin alerts:', error);
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

/**
 * Hook para actividad reciente del sistema
 */
export const useAdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener actividad reciente de múltiples tablas
      const [
        { data: newProjects },
        { data: newUsers },
        { data: recentPayments }
      ] = await Promise.all([
        supabase
          .from('proyectos')
          .select('id, nombre, created_at, cliente:clientes(nombre)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('usuarios')
          .select('id, nombre, tipo_usuario, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('pagos_milestones')
          .select('id, monto, created_at, proyecto:proyectos(nombre)')
          .eq('estado', 'completado')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Combinar y ordenar todas las actividades
      const combined = [
        ...(newProjects?.map(p => ({
          type: 'project',
          id: p.id,
          message: `Nuevo proyecto: ${p.nombre}`,
          timestamp: p.created_at
        })) || []),
        ...(newUsers?.map(u => ({
          type: 'user',
          id: u.id,
          message: `Nuevo ${u.tipo_usuario}: ${u.nombre}`,
          timestamp: u.created_at
        })) || []),
        ...(recentPayments?.map(p => ({
          type: 'payment',
          id: p.id,
          message: `Pago completado: $${p.monto}`,
          timestamp: p.created_at
        })) || [])
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivities(combined);
    } catch (error) {
      console.error('Error loading admin activity:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();

    // Suscribirse a cambios en tablas clave
    const projectChannel = supabase
      .channel('admin_activity_projects')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proyectos' }, loadActivities)
      .subscribe();

    const userChannel = supabase
      .channel('admin_activity_users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'usuarios' }, loadActivities)
      .subscribe();

    const paymentChannel = supabase
      .channel('admin_activity_payments')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pagos_milestones' }, loadActivities)
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [loadActivities]);

  return { activities, loading, refresh: loadActivities };
};

export default useAdminMetrics;
