import { supabase } from '../../lib/supabaseClient';

/**
 * Cliente Project Service
 * Handles project-related operations for cliente role
 */

export const projectService = {
  // Get all projects for a client
  getClientProjects: async (clientId) => {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        cotizaciones_inicial (*)
      `)
      .eq('usuarios_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new project
  createProject: async (projectData) => {
    const { data, error } = await supabase
      .from('proyectos')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update project
  updateProject: async (projectId, updates) => {
    const { data, error } = await supabase
      .from('proyectos')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle project status (publish/pause)
  toggleProjectStatus: async (projectId, newStatus) => {
    const { data, error } = await supabase
      .from('proyectos')
      .update({ estado: newStatus })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Publish project (open for quotes)
  publishProject: async (projectId) => {
    return projectService.toggleProjectStatus(projectId, 'abierto');
  },

  // Pause project (close for new quotes)
  pauseProject: async (projectId) => {
    return projectService.toggleProjectStatus(projectId, 'cerrado');
  },

  // Get project with all related data in one query (optimized)
  getProjectWithDetails: async (projectId) => {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        cotizaciones_inicial (*),
        cotizaciones_final (
          *,
          proveedores (
            id,
            nombre_empresa,
            nombre_contacto,
            email,
            telefono
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;

    // Transform nested data for easier consumption
    return {
      proyecto: {
        id: data.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: data.estado,
        fecha_limite: data.fecha_limite,
        usuarios_id: data.usuarios_id,
        cotizaciones_inicial_id: data.cotizaciones_inicial_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      },
      cotizacionInicial: data.cotizaciones_inicial || null,
      cotizaciones: data.cotizaciones_final || []
    };
  }
};
