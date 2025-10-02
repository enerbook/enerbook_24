import { useState, useEffect } from 'react';
import { getLandingStats, errorStats } from '../services/statsService';

/**
 * Hook personalizado para obtener estadísticas del landing
 * - Obtiene datos REALES desde Supabase
 * - NO usa valores hardcoded (todo es automático)
 * - Actualiza cada 5 minutos automáticamente
 * - Muestra error si falla la conexión
 *
 * @returns {Object} { stats, isLoading, error, refetch }
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getLandingStats();

      if (data) {
        setStats({
          proyectos_realizados: data.proyectos_realizados ?? 0,
          reduccion_promedio_recibos: parseFloat(data.reduccion_promedio_recibos) ?? 0,
          energia_producida_anual: parseFloat(data.energia_producida_anual) ?? 0,
          estados_cobertura: data.estados_cobertura ?? 0,
        });
      } else {
        // Si no hay datos, mostrar error
        console.error('No se pudieron cargar las estadísticas desde Supabase');
        setError('No se pudieron cargar las estadísticas. Verifica la conexión a Supabase.');
        setStats(errorStats);
      }
    } catch (err) {
      console.error('Error in useStats:', err);
      setError(err.message || 'Error al conectar con la base de datos');
      setStats(errorStats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar estadísticas al montar el componente
    fetchStats();

    // Actualizar cada 5 minutos (300000 ms)
    const interval = setInterval(() => {
      fetchStats();
    }, 300000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
