import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook de tiempo real para clientes
 * Suscripciones: proyectos propios, cotizaciones recibidas, mensajes
 */
export const useClientProjects = () => {
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
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading client projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadProjects();

    // Suscripción a cambios en proyectos del cliente
    const channel = supabase
      .channel('client_projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proyectos',
          filter: `cliente_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Client project update:', payload);

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
 * Hook para cotizaciones recibidas por el cliente
 */
export const useClientQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuoteCount, setNewQuoteCount] = useState(0);

  const loadQuotes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('cotizaciones')
        .select('*, instalador:instaladores(*)')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setQuotes(data || []);
    } catch (err) {
      console.error('Error loading client quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadQuotes();

    // Suscripción a nuevas cotizaciones
    const channel = supabase
      .channel('client_quotes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cotizaciones',
          filter: `cliente_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New quote received:', payload);
          setQuotes(prev => [payload.new, ...prev]);
          setNewQuoteCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadQuotes]);

  const clearNewQuoteCount = useCallback(() => {
    setNewQuoteCount(0);
  }, []);

  return { quotes, loading, newQuoteCount, clearNewQuoteCount, refresh: loadQuotes };
};

export default useClientProjects;
