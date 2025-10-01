import { supabase } from '../../../lib/supabaseClient';

/**
 * Cliente Project Service
 * Handles project-related operations for cliente role
 */

export const projectService = {
  // Get all projects for a client
  getClientProjects: async (clientId) => {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
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

  // Delete project
  deleteProject: async (projectId) => {
    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }
};
