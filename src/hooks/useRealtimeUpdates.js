import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook genérico de tiempo real para cualquier tabla
 * Utilidad compartida entre todos los roles
 *
 * NOTA: Para funcionalidad específica por rol, usar:
 * - src/cliente/hooks/useClientRealtime.js
 * - src/instalador/hooks/useInstallerRealtime.js
 * - src/admin/hooks/useAdminRealtime.js
 *
 * @param {string} table - Nombre de la tabla de Supabase
 * @param {object} filter - Filtros a aplicar (ej: { user_id: '123' })
 * @returns {object} { data, loading, error, refresh }
 */
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

export default useRealtimeUpdates;