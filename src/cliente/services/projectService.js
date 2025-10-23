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

    // Debug: Log raw data from Supabase
    console.log('🔍 projectService - RAW from Supabase:', {
      has_cotizacion: !!data.cotizaciones_inicial,
      consumo_type: typeof data.cotizaciones_inicial?.consumo_kwh_historico,
      consumo_is_array: Array.isArray(data.cotizaciones_inicial?.consumo_kwh_historico),
      consumo_is_string: typeof data.cotizaciones_inicial?.consumo_kwh_historico === 'string',
      consumo_first_20_chars: typeof data.cotizaciones_inicial?.consumo_kwh_historico === 'string'
        ? data.cotizaciones_inicial.consumo_kwh_historico.substring(0, 20)
        : 'not a string',
      sizing_type: typeof data.cotizaciones_inicial?.sizing_results,
      sizing_is_object: typeof data.cotizaciones_inicial?.sizing_results === 'object',
      sizing_is_string: typeof data.cotizaciones_inicial?.sizing_results === 'string'
    });

    // Transform cotizacion_inicial data to match expected format
    let cotizacionInicial = data.cotizaciones_inicial;
    if (cotizacionInicial) {
      // Transform consumo_kwh_historico: convert {kwh, periodo} to {value, periodo, label, fullLabel}
      if (cotizacionInicial.consumo_kwh_historico && Array.isArray(cotizacionInicial.consumo_kwh_historico)) {
        const mesesMap = {
          'ENE': 'Enero', 'FEB': 'Febrero', 'MAR': 'Marzo', 'ABR': 'Abril',
          'MAY': 'Mayo', 'JUN': 'Junio', 'JUL': 'Julio', 'AGO': 'Agosto',
          'SEP': 'Septiembre', 'OCT': 'Octubre', 'NOV': 'Noviembre', 'DIC': 'Diciembre'
        };

        cotizacionInicial.consumo_kwh_historico = cotizacionInicial.consumo_kwh_historico.map(item => {
          // Extract month abbreviation from periodo (e.g., "MAR25" -> "MAR")
          const mesAbrev = item.periodo ? item.periodo.substring(0, 3).toUpperCase() : '';
          const mesCompleto = mesesMap[mesAbrev] || item.periodo || '';

          return {
            value: item.kwh || 0,
            kwh: item.kwh || 0, // Keep original for backward compatibility
            periodo: item.periodo,
            label: mesAbrev.charAt(0) + mesAbrev.substring(1).toLowerCase(), // "Mar"
            fullLabel: mesCompleto,
            consumo: item.kwh || 0 // Alias for compatibility
          };
        });
      }

      // Normalize sizing_results structure
      if (cotizacionInicial.sizing_results) {
        const sizing = cotizacionInicial.sizing_results;

        // If data is nested under 'results', flatten it to top level as well
        if (sizing.results) {
          cotizacionInicial.sizing_results = {
            ...sizing,
            // Add top-level access to common fields for easier access
            kWp_needed: sizing.results.kWp_needed,
            n_panels: sizing.results.n_panels,
            yearly_prod: sizing.results.yearly_prod,
            irr_avg_day: sizing.inputs?.irr_avg_day
          };
        }
      }
    }

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
      cotizacionInicial,
      cotizaciones: data.cotizaciones_final || []
    };
  }
};
