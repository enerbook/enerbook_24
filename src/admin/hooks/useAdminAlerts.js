import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import logger from '../utils/logger';

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
        logger.error('Error checking admin alerts:', error);
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

export default useAdminAlerts;
