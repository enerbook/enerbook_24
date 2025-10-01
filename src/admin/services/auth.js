import { supabase } from '../../lib/supabaseClient';

/**
 * Verifica si un usuario es administrador activo
 * @param {string} userId - ID del usuario a verificar
 * @returns {Promise<Object|null>} Datos del administrador o null si no es admin
 */
export const checkAdminAccess = async (userId) => {
  if (!userId) return null;

  try {
    const { data: adminData, error } = await supabase
      .from('administradores')
      .select(`
        id,
        usuario_id,
        nivel_acceso,
        permisos,
        activo,
        created_at,
        usuarios (
          id,
          nombre,
          correo_electronico
        )
      `)
      .eq('usuario_id', userId)
      .eq('activo', true)
      .single();

    if (error || !adminData) {
      console.log('Admin access check failed:', error?.message);
      return null;
    }

    return adminData;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return null;
  }
};

/**
 * Verifica si un usuario tiene un nivel de acceso específico
 * @param {string} userId - ID del usuario
 * @param {string} requiredLevel - Nivel requerido ('admin' o 'super_admin')
 * @returns {Promise<boolean>}
 */
export const hasAdminLevel = async (userId, requiredLevel = 'admin') => {
  const adminData = await checkAdminAccess(userId);

  if (!adminData) return false;

  // Si requiere admin, cualquier nivel es válido
  if (requiredLevel === 'admin') {
    return ['admin', 'super_admin'].includes(adminData.nivel_acceso);
  }

  // Si requiere super_admin, solo super_admin es válido
  if (requiredLevel === 'super_admin') {
    return adminData.nivel_acceso === 'super_admin';
  }

  return false;
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {string} userId - ID del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {Promise<boolean>}
 */
export const hasPermission = async (userId, permission) => {
  const adminData = await checkAdminAccess(userId);

  if (!adminData) return false;

  // Super admins tienen todos los permisos
  if (adminData.nivel_acceso === 'super_admin') {
    return true;
  }

  // Verificar permisos específicos en el campo JSONB
  const permisos = adminData.permisos || {};
  return permisos[permission] === true;
};

/**
 * Lista todos los administradores del sistema
 * @param {boolean} includeInactive - Incluir administradores inactivos
 * @returns {Promise<Array>}
 */
export const listAdministrators = async (includeInactive = false) => {
  try {
    let query = supabase
      .from('administradores')
      .select(`
        id,
        usuario_id,
        nivel_acceso,
        permisos,
        activo,
        created_at,
        updated_at,
        usuarios (
          id,
          nombre,
          correo_electronico,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing administrators:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error listing administrators:', error);
    return [];
  }
};

/**
 * Crea un nuevo administrador
 * @param {string} usuarioId - ID del usuario a convertir en admin
 * @param {string} nivelAcceso - Nivel de acceso ('admin' o 'super_admin')
 * @param {Object} permisos - Permisos específicos
 * @param {string} createdBy - ID del usuario que crea el admin
 * @returns {Promise<Object|null>}
 */
export const createAdministrator = async (usuarioId, nivelAcceso = 'admin', permisos = {}, createdBy) => {
  try {
    const { data, error } = await supabase
      .from('administradores')
      .insert([
        {
          usuario_id: usuarioId,
          nivel_acceso: nivelAcceso,
          permisos,
          created_by: createdBy,
          activo: true
        }
      ])
      .select(`
        id,
        usuario_id,
        nivel_acceso,
        permisos,
        activo,
        created_at,
        usuarios (
          id,
          nombre,
          correo_electronico
        )
      `)
      .single();

    if (error) {
      console.error('Error creating administrator:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating administrator:', error);
    return null;
  }
};

/**
 * Desactiva un administrador
 * @param {string} adminId - ID del administrador a desactivar
 * @param {string} updatedBy - ID del usuario que realiza la acción
 * @returns {Promise<boolean>}
 */
export const deactivateAdministrator = async (adminId, updatedBy) => {
  try {
    const { error } = await supabase
      .from('administradores')
      .update({
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) {
      console.error('Error deactivating administrator:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deactivating administrator:', error);
    return false;
  }
};

export default {
  checkAdminAccess,
  hasAdminLevel,
  hasPermission,
  listAdministrators,
  createAdministrator,
  deactivateAdministrator
};