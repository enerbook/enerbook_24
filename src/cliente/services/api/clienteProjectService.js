import { supabase } from '../../../lib/supabaseClient';

/**
 * Cliente Project Service
 * Handles project data retrieval for authenticated clients
 */

export const clienteProjectService = {
  /**
   * Get the most recent project for a client with all related data
   * @param {string} clientId - The client's user ID
   * @returns {Promise<Object|null>} Project data with cotizacion or null if no projects
   */
  getMostRecentProject: async (clientId) => {
    try {
      // Get the most recent project
      const { data: proyecto, error: projectError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('usuarios_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') {
          // No projects found
          return null;
        }
        throw projectError;
      }

      if (!proyecto) return null;

      // Get cotizacion data for this project
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('proyectos_id', proyecto.id)
        .single();

      // Note: cotizacion might not exist yet for the project, that's ok
      if (cotizacionError && cotizacionError.code !== 'PGRST116') {
        console.warn('Error fetching cotizacion:', cotizacionError);
      }

      return {
        proyecto,
        cotizacion: cotizacion || null
      };
    } catch (error) {
      console.error('Error in getMostRecentProject:', error);
      throw error;
    }
  },

  /**
   * Get all projects for a client
   * @param {string} clientId - The client's user ID
   * @returns {Promise<Array>} Array of projects
   */
  getAllProjects: async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('usuarios_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      throw error;
    }
  },

  /**
   * Get a specific project by ID with all related data
   * @param {string} projectId - The project ID
   * @param {string} clientId - The client's user ID (for verification)
   * @returns {Promise<Object|null>} Project data with cotizacion or null
   */
  getProjectById: async (projectId, clientId) => {
    try {
      // Get the project and verify ownership
      const { data: proyecto, error: projectError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', projectId)
        .eq('usuarios_id', clientId)
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') {
          return null;
        }
        throw projectError;
      }

      if (!proyecto) return null;

      // Get cotizacion data for this project
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('proyectos_id', proyecto.id)
        .single();

      if (cotizacionError && cotizacionError.code !== 'PGRST116') {
        console.warn('Error fetching cotizacion:', cotizacionError);
      }

      return {
        proyecto,
        cotizacion: cotizacion || null
      };
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  },

  /**
   * Get project summary statistics for a client
   * @param {string} clientId - The client's user ID
   * @returns {Promise<Object>} Summary statistics
   */
  getProjectStats: async (clientId) => {
    try {
      const projects = await clienteProjectService.getAllProjects(clientId);

      return {
        totalProjects: projects.length,
        hasProjects: projects.length > 0,
        mostRecentDate: projects[0]?.created_at || null
      };
    } catch (error) {
      console.error('Error in getProjectStats:', error);
      throw error;
    }
  }
};

export default clienteProjectService;