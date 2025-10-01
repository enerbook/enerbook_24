import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook de tiempo real para instaladores
 * Suscripciones: proyectos asignados, milestones, pagos
 */
export const useInstallerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('proyectos')
        .select('*, cliente:clientes(*)')
        .eq('instalador_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading installer projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadProjects();

    // Suscripción a cambios en proyectos del instalador
    const channel = supabase
      .channel('installer_projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proyectos',
          filter: `instalador_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Installer project update:', payload);

          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadProjects]);

  return { projects, loading, error, refresh: loadProjects };
};

/**
 * Hook para alertas de instalador (milestones vencidos)
 */
export const useInstallerAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [newAlertCount, setNewAlertCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const checkAlerts = async () => {
      try {
        // Obtener proyectos del instalador
        const { data: projects } = await supabase
          .from('proyectos')
          .select('id')
          .eq('instalador_id', user.id);

        if (!projects?.length) return;

        const projectIds = projects.map(p => p.id);

        // Check milestones vencidos
        const { data: milestones } = await supabase
          .from('pagos_milestones')
          .select('*, proyecto:proyectos(*)')
          .in('proyecto_id', projectIds)
          .eq('estado', 'pendiente')
          .lt('fecha_objetivo', new Date().toISOString());

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

        const previousCount = alerts.length;
        setAlerts(allAlerts);

        if (allAlerts.length > previousCount) {
          setNewAlertCount(allAlerts.length - previousCount);
        }
      } catch (error) {
        console.error('Error checking installer alerts:', error);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user?.id, alerts.length]);

  const clearNewAlertCount = useCallback(() => {
    setNewAlertCount(0);
  }, []);

  return { alerts, newAlertCount, clearNewAlertCount };
};

/**
 * Hook para pagos recibidos del instalador
 */
export const useInstallerPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pagos_milestones')
        .select('*, proyecto:proyectos(*)')
        .eq('proyecto.instalador_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPayments(data || []);
    } catch (err) {
      console.error('Error loading installer payments:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadPayments();

    // Suscripción a cambios en pagos
    const channel = supabase
      .channel('installer_payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagos_milestones'
        },
        (payload) => {
          console.log('Payment update:', payload);
          loadPayments(); // Reload to filter by instalador_id
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadPayments]);

  return { payments, loading, refresh: loadPayments };
};

export default useInstallerProjects;
