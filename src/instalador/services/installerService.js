import { supabase } from '../../lib/supabaseClient';

/**
 * Installer Service
 * Handles all installer-related API calls (proveedores table)
 * Security: Uses explicit column selection instead of SELECT *
 */

// Define columnas permitidas para proveedores (públicas)
const PROVEEDOR_PUBLIC_COLUMNS = `
  id,
  created_at,
  updated_at,
  nombre,
  nombre_empresa,
  nombre_contacto,
  email,
  telefono,
  direccion,
  activo,
  acepta_financiamiento_externo,
  comision_financiamiento_pct
`;

// Define columnas privadas adicionales (solo para el mismo proveedor)
const PROVEEDOR_PRIVATE_COLUMNS = `
  ${PROVEEDOR_PUBLIC_COLUMNS},
  auth_user_id,
  stripe_account_id,
  stripe_account_type,
  stripe_onboarding_completed,
  stripe_charges_enabled,
  stripe_payouts_enabled,
  stripe_onboarding_url,
  fecha_stripe_verificacion
`;

// Define columnas para reseñas
const RESENA_COLUMNS = `
  id,
  created_at,
  updated_at,
  contratos_id,
  puntuacion,
  comentario,
  usuarios_id,
  puntuacion_calidad,
  puntuacion_tiempo,
  puntuacion_comunicacion,
  recomendaria,
  fotos_instalacion
`;

export const installerService = {
  // Get all installers/providers
  getAllInstallers: async () => {
    const { data, error } = await supabase
      .from('proveedores')
      .select(PROVEEDOR_PUBLIC_COLUMNS)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get installer by ID (public info only)
  getInstallerById: async (installerId) => {
    const { data, error } = await supabase
      .from('proveedores')
      .select(PROVEEDOR_PUBLIC_COLUMNS)
      .eq('id', installerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get installer by auth user ID (includes private info)
  getInstallerByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('proveedores')
      .select(PROVEEDOR_PRIVATE_COLUMNS)
      .eq('auth_user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update installer profile
  updateInstaller: async (installerId, updates) => {
    // Security: No permitir actualizar campos sensibles directamente
    const {
      auth_user_id: _,
      stripe_account_id: __,
      stripe_requirements: ___,
      ...safeUpdates
    } = updates;

    const { data, error } = await supabase
      .from('proveedores')
      .update(safeUpdates)
      .eq('id', installerId)
      .select(PROVEEDOR_PRIVATE_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  // Get installer reviews with full contract details
  getInstallerReviews: async (installerId) => {
    // Get contracts for this provider first
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select(`
        id,
        numero_contrato,
        precio_total_sistema,
        fecha_completado,
        usuarios:usuarios_id (
          nombre
        ),
        cotizaciones_final:cotizaciones_final_id (
          proyectos:proyectos_id (
            titulo,
            descripcion
          )
        )
      `)
      .eq('proveedores_id', installerId);

    if (contratosError) throw contratosError;

    if (!contratos || contratos.length === 0) {
      return [];
    }

    // Get reviews for these contracts
    const contratoIds = contratos.map(c => c.id);
    const { data: resenas, error } = await supabase
      .from('resenas')
      .select(RESENA_COLUMNS)
      .in('contratos_id', contratoIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Combine contract and review data
    return resenas?.map(resena => {
      const contrato = contratos.find(c => c.id === resena.contratos_id);
      return {
        ...resena,
        contrato
      };
    }) || [];
  }
};