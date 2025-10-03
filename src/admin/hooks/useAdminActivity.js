import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import logger from '../utils/logger';

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
          .select('id, nombre_proyecto, created_at, cliente:clientes(nombre)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('usuarios')
          .select('id, nombre, tipo_usuario, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('pagos_milestones')
          .select('id, monto, created_at, proyecto:proyectos(nombre_proyecto)')
          .eq('estado', 'completado')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Combinar y ordenar todas las actividades
      const combined = [
        ...(newProjects?.map(p => ({
          type: 'project',
          id: p.id,
          message: `Nuevo proyecto: ${p.nombre_proyecto}`,
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
      logger.error('Error loading admin activity:', error);
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

export default useAdminActivity;
