import { supabase } from '../../../lib/supabaseClient';

/**
 * User Service
 * Handles user role detection and management across all user types
 */

export const userService = {
  // Get user role (admin, instalador, cliente, or null)
  getUserRole: async (userId) => {
    if (!userId) return null;

    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('administradores')
      .select('id, activo')
      .eq('usuario_id', userId)
      .eq('activo', true);

    if (adminData && adminData.length > 0) {
      return 'admin';
    }

    // Check if user is an installer
    const { data: proveedorData } = await supabase
      .from('proveedores')
      .select('id')
      .eq('auth_user_id', userId);

    if (proveedorData && proveedorData.length > 0) {
      return 'instalador';
    }

    // Check if user is a client
    const { data: clienteData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', userId);

    if (clienteData && clienteData.length > 0) {
      return 'cliente';
    }

    return null;
  },

  // Verify installer is active
  verifyInstallerActive: async (userId) => {
    const { data, error } = await supabase
      .from('proveedores')
      .select('activo')
      .eq('auth_user_id', userId);

    if (error || !data || data.length === 0) {
      return { isActive: false, error: 'No se encontró un perfil de proveedor asociado.' };
    }

    if (data[0]?.activo !== true) {
      return { isActive: false, error: 'Tu cuenta de proveedor no está activa.' };
    }

    return { isActive: true, error: null };
  },

  // Verify client exists
  verifyClientExists: async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', userId);

    if (error || !data || data.length === 0) {
      return { exists: false, error: 'No se encontró un perfil de cliente asociado.' };
    }

    return { exists: true, error: null };
  }
};