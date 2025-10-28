import { supabase } from '../../lib/supabaseClient';
import {
  sanitizeForLogging,
  sanitizeString,
  isValidEmail,
  isValidMexicanPhone
} from '../../utils/security';

/**
 * Client Service
 * Handles all client-related API calls (usuarios table)
 * Security: Uses explicit column selection instead of SELECT *
 */

// Define columnas permitidas para usuarios
const USUARIO_COLUMNS = `
  id,
  created_at,
  updated_at,
  nombre,
  correo_electronico,
  telefono,
  fecha_nacimiento,
  rfc,
  genero
`;

// Define columnas permitidas para cotizaciones_inicial
const COTIZACION_INICIAL_COLUMNS = `
  id,
  created_at,
  updated_at,
  usuarios_id,
  recibo_cfe,
  consumo_kwh_historico,
  resumen_energetico,
  sizing_results,
  irradiacion_cache_id
`;

export const clientService = {
  // Get client by user ID
  getClientByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select(USUARIO_COLUMNS)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get client with initial analysis data
  // Note: cotizaciones_inicial contains the CFE receipt analysis (consumo_kwh_historico, sizing_results, etc.)
  // This is different from 'proyectos' table which is for managing quote requests to installers
  getClientWithQuote: async (userId) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 clientService.getClientWithQuote - userId:', userId);
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select(USUARIO_COLUMNS)
      .eq('id', userId)
      .single();

    if (userError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error fetching user data:', sanitizeForLogging(userError));
      }
      throw userError;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ User data fetched:', { userId: userData?.id, nombre: userData?.nombre });
    }

    // Get initial quote/analysis with irradiation data
    const { data: cotizacionData, error: cotizacionError } = await supabase
      .from('cotizaciones_inicial')
      .select(`
        ${COTIZACION_INICIAL_COLUMNS},
        irradiacion_cache:irradiacion_cache_id (
          irradiacion_promedio_anual,
          irradiacion_promedio_min,
          irradiacion_promedio_max,
          datos_nasa_mensuales
        )
      `)
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cotizacionError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ No cotizacion_inicial found:', cotizacionError.message, cotizacionError.code);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Cotizacion inicial found:', {
          id: cotizacionData?.id,
          hasConsumo: !!cotizacionData?.consumo_kwh_historico,
          hasSizing: !!cotizacionData?.sizing_results,
          hasRecibo: !!cotizacionData?.recibo_cfe
        });
      }
    }

    // Return user data even if no quote exists
    const result = {
      user: userData,
      cotizacion: cotizacionError ? null : cotizacionData
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('📤 clientService returning:', {
        hasUser: !!result.user,
        hasCotizacion: !!result.cotizacion
      });
    }

    return result;
  },

  // Create or update client profile
  upsertClient: async (userId, clientData) => {
    // Security: Validar y sanitizar inputs
    const sanitizedData = {};

    if (clientData.nombre) {
      sanitizedData.nombre = sanitizeString(clientData.nombre).substring(0, 255);
    }

    if (clientData.correo_electronico) {
      if (!isValidEmail(clientData.correo_electronico)) {
        throw new Error('Correo electrónico inválido');
      }
      sanitizedData.correo_electronico = clientData.correo_electronico.toLowerCase().trim();
    }

    if (clientData.telefono) {
      if (!isValidMexicanPhone(clientData.telefono)) {
        throw new Error('Teléfono inválido. Debe ser un número mexicano de 10 dígitos');
      }
      sanitizedData.telefono = clientData.telefono.replace(/[\s\-()]/g, '');
    }

    if (clientData.rfc) {
      sanitizedData.rfc = sanitizeString(clientData.rfc).toUpperCase().substring(0, 13);
    }

    if (clientData.genero) {
      const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
      if (generosValidos.includes(clientData.genero)) {
        sanitizedData.genero = clientData.genero;
      }
    }

    if (clientData.fecha_nacimiento) {
      const fecha = new Date(clientData.fecha_nacimiento);
      if (isNaN(fecha.getTime()) || fecha > new Date()) {
        throw new Error('Fecha de nacimiento inválida');
      }
      sanitizedData.fecha_nacimiento = clientData.fecha_nacimiento;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .upsert({
        id: userId,
        ...sanitizedData
      }, {
        onConflict: 'id'
      })
      .select(USUARIO_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  // Update client profile
  updateClient: async (userId, updates) => {
    // Security: Validar y sanitizar inputs (reutilizar lógica de upsertClient)
    const sanitizedData = {};

    if (updates.nombre !== undefined) {
      sanitizedData.nombre = sanitizeString(updates.nombre).substring(0, 255);
    }

    if (updates.correo_electronico !== undefined) {
      if (!isValidEmail(updates.correo_electronico)) {
        throw new Error('Correo electrónico inválido');
      }
      sanitizedData.correo_electronico = updates.correo_electronico.toLowerCase().trim();
    }

    if (updates.telefono !== undefined) {
      if (updates.telefono && !isValidMexicanPhone(updates.telefono)) {
        throw new Error('Teléfono inválido. Debe ser un número mexicano de 10 dígitos');
      }
      sanitizedData.telefono = updates.telefono ? updates.telefono.replace(/[\s\-()]/g, '') : null;
    }

    if (updates.rfc !== undefined) {
      sanitizedData.rfc = updates.rfc ? sanitizeString(updates.rfc).toUpperCase().substring(0, 13) : null;
    }

    if (updates.genero !== undefined) {
      const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
      if (updates.genero && !generosValidos.includes(updates.genero)) {
        throw new Error('Género inválido');
      }
      sanitizedData.genero = updates.genero;
    }

    if (updates.fecha_nacimiento !== undefined) {
      if (updates.fecha_nacimiento) {
        const fecha = new Date(updates.fecha_nacimiento);
        if (isNaN(fecha.getTime()) || fecha > new Date()) {
          throw new Error('Fecha de nacimiento inválida');
        }
      }
      sanitizedData.fecha_nacimiento = updates.fecha_nacimiento;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(sanitizedData)
      .eq('id', userId)
      .select(USUARIO_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  // Get initial quote by user ID
  getInitialQuote: async (userId) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .select(COTIZACION_INICIAL_COLUMNS)
      .eq('usuarios_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  // Create initial quote
  createInitialQuote: async (quoteData) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .insert([quoteData])
      .select(COTIZACION_INICIAL_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  // Update initial quote
  updateInitialQuote: async (quoteId, updates) => {
    const { data, error } = await supabase
      .from('cotizaciones_inicial')
      .update(updates)
      .eq('id', quoteId)
      .select(COTIZACION_INICIAL_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  // Migrate lead data to client and create initial project
  migrateLeadToClient: async (userId, leadData) => {
    // Step 1: Insert cotizacion_inicial with lead data
    const { data: cotizacionData, error: cotizacionError } = await supabase
      .from('cotizaciones_inicial')
      .insert({
        usuarios_id: userId,
        recibo_cfe: leadData.recibo_cfe,
        consumo_kwh_historico: leadData.consumo_kwh_historico,
        resumen_energetico: leadData.resumen_energetico,
        sizing_results: leadData.sizing_results,
        irradiacion_cache_id: leadData.irradiacion_cache_id
      })
      .select(COTIZACION_INICIAL_COLUMNS)
      .single();

    if (cotizacionError) throw cotizacionError;

    // Step 2: Create initial project automatically
    // Use AI-generated titles if available, otherwise fallback to generated ones
    const sizingResults = leadData.sizing_results || {};
    const capacidadSistema = sizingResults.capacidad_sistema_kw || 0;
    const ahorro = sizingResults.ahorro_promedio_mensual || 0;

    const projectTitle = leadData.project_title ||
      `Sistema Solar ${capacidadSistema > 0 ? `${capacidadSistema.toFixed(1)} kW` : 'Residencial'}`;

    const projectDescription = leadData.project_description ||
      `Proyecto generado automáticamente desde tu análisis de recibo CFE. ${
        ahorro > 0 ? `Ahorro estimado: $${ahorro.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MXN/mes.` : ''
      } Sistema dimensionado para tu consumo energético.`.trim();

    // Calculate deadline: 30 days from now
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);

    const { data: proyectoData, error: proyectoError } = await supabase
      .from('proyectos')
      .insert({
        usuarios_id: userId,
        cotizaciones_inicial_id: cotizacionData.id,
        titulo: projectTitle,
        descripcion: projectDescription,
        estado: 'cerrado',
        fecha_limite: fechaLimite.toISOString()
      })
      .select('id, titulo, descripcion, estado, fecha_limite, created_at')
      .single();

    if (proyectoError) {
      console.error('Error creating initial project:', proyectoError);
      // Don't throw - cotizacion was created successfully
      // Return cotizacion without proyecto
      return { cotizacion: cotizacionData, proyecto: null };
    }

    // Return both cotizacion and proyecto
    return {
      cotizacion: cotizacionData,
      proyecto: proyectoData
    };
  }
};