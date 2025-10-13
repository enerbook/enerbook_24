import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import logger, { createServiceLogger } from '../utils/logger';

// Security: Direct imports from each feature (Principle of Least Privilege)
// Each role's services are isolated and explicitly imported
import { authService as clienteAuthService } from '../cliente/services/authService';
import { clientService } from '../cliente/services/clientService';
import { leadService } from '../lead/services/leadService';

// Create service-specific logger
const authLogger = createServiceLogger('AuthContext');

// Unified auth service wrapper for common operations
// Note: Cliente and Instalador auth services are functionally identical (both use Supabase)
// but kept separate in their features for maintainability and potential future divergence
const authService = {
  signIn: clienteAuthService.signIn,
  signUp: clienteAuthService.signUp,
  signOut: clienteAuthService.signOut,
  getSession: clienteAuthService.getSession,
  getCurrentUser: clienteAuthService.getCurrentUser
};

// User service operations (role detection and verification)
// Implemented directly here to avoid circular dependencies
const userService = {
  getUserRole: async (userId) => {
    if (!userId) return null;

    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('administradores')
      .select('id, activo')
      .eq('usuario_id', userId);

    // Verificar si el admin está activo (filtro en frontend en lugar de query)
    if (adminData && adminData.length > 0 && adminData[0].activo === true) {
      return 'admin';
    }

    // Check if user is an installer
    const { data: proveedorData, error: proveedorError } = await supabase
      .from('proveedores')
      .select('id')
      .eq('auth_user_id', userId);

    if (proveedorData && proveedorData.length > 0) {
      return 'instalador';
    }

    // Check if user is a client
    const { data: clienteData, error: clienteError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', userId);

    if (clienteData && clienteData.length > 0) {
      return 'cliente';
    }

    return null;
  },

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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'cliente', 'instalador', o 'lead'
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState(null);
  const [tempLeadId, setTempLeadId] = useState(null);
  const [clientData, setClientData] = useState(null);

  const fetchUserRole = async (userId) => {
    if (!userId) return null;

    try {
      return await userService.getUserRole(userId);
    } catch (error) {
      authLogger.error('Error fetching user role', { userId, error: error.message });
      return null;
    }
  };

  const fetchLeadData = useCallback(async (requestedLeadId) => {
    if (!requestedLeadId) {
      throw new Error('ID de lead requerido');
    }

    // Si ya tenemos datos para este lead, no hacer otra petición
    if (leadData && leadData.temp_lead_id === requestedLeadId) {
      return leadData;
    }

    try {
      const data = await leadService.getLeadData(requestedLeadId);

      if (!data) {
        throw new Error('No se encontraron datos para este lead');
      }

      authLogger.debug('Lead data loaded successfully', { leadId: requestedLeadId });
      return data;
    } catch (error) {
      authLogger.error('Error loading lead data', {
        leadId: requestedLeadId,
        error: error.message
      });

      // Re-throw error para que sea manejado por el componente
      // No retornamos datos falsos que puedan confundir al usuario
      throw new Error(
        error.message || 'No se pudieron cargar los datos. Por favor intenta nuevamente.'
      );
    }
  }, [leadData]);

  const setLeadMode = useCallback(async (newTempLeadId) => {
    if (userType === 'lead' && tempLeadId === newTempLeadId) {
      return { success: true };
    }

    try {
      setLoading(true);
      setTempLeadId(newTempLeadId);
      setUserType('lead');

      const data = await fetchLeadData(newTempLeadId);
      setLeadData(data);
      setLoading(false);

      authLogger.success('Lead mode activated', { leadId: newTempLeadId });
      return { success: true, data };
    } catch (error) {
      authLogger.error('Error activating lead mode', {
        leadId: newTempLeadId,
        error: error.message
      });

      // Limpiar estado en caso de error
      setTempLeadId(null);
      setUserType(null);
      setLeadData(null);
      setLoading(false);

      return {
        success: false,
        error: error.message || 'No se pudo cargar el análisis de tu recibo'
      };
    }
  }, [userType, tempLeadId, fetchLeadData]);


  const fetchClientData = useCallback(async (userId) => {
    if (!userId) return null;

    try {
      const data = await clientService.getClientWithQuote(userId);
      authLogger.debug('Client data loaded', { userId });
      return data;
    } catch (error) {
      authLogger.error('Error fetching client data', { userId, error: error.message });
      return null;
    }
  }, []);

  const loadUserData = useCallback(async (user) => {
    if (!user) {
      setUserType(null);
      setClientData(null);
      return;
    }

    const role = await fetchUserRole(user.id);
    setUserType(role);

    if (role === 'cliente') {
      const data = await fetchClientData(user.id);
      setClientData(data);
    }
  }, [fetchClientData]);

  useEffect(() => {
    setLoading(true);

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      setToken(session?.access_token ?? null);
      await loadUserData(user);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);
        setToken(session?.access_token ?? null);
        await loadUserData(user);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  const installerLogin = async (email, password) => {
    try {
      const data = await authService.signIn(email, password);

      if (data.user) {
        const verification = await userService.verifyInstallerActive(data.user.id);

        if (!verification.isActive) {
          await authService.signOut();
          return { error: { message: verification.error } };
        }
        // No establecer userType aquí, lo hará el useEffect automáticamente
      }

      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const clientSignup = async (email, password, metadata = {}) => {
    try {
      const data = await authService.signUp(email, password, 'cliente');

      // Si el signup fue exitoso pero necesita confirmación de email
      if (data.user && !data.session) {
        authLogger.info('Client signup requires email confirmation', { userId: data.user.id });
        return {
          data,
          error: null,
          needsEmailConfirmation: true,
          message: "Registro exitoso. Por favor revisa tu correo electrónico para confirmar tu cuenta."
        };
      }

      if (data.user) {
        await clientService.upsertClient(data.user.id, {
          nombre: metadata.name || '',
          correo_electronico: email,
          telefono: metadata.phone || ''
        });
        authLogger.success('Client signup successful', { userId: data.user.id });
      }

      return { data, error: null };
    } catch (error) {
      authLogger.error('Error in client signup', { email, error: error.message });
      return { error };
    }
  };

  const migrateLeadToClient = useCallback(async (email, password, metadata = {}) => {
    if (!tempLeadId || !leadData) {
      throw new Error('No hay datos de lead para migrar');
    }

    try {
      setLoading(true);

      const signupResult = await clientSignup(email, password, {
        name: metadata.name || leadData.recibo_cfe?.nombre || '',
        phone: metadata.phone || ''
      });

      if (signupResult.error) {
        throw signupResult.error;
      }

      if (signupResult.needsEmailConfirmation) {
        return signupResult;
      }

      // Migrate lead data and create initial project
      const migrationResult = await clientService.migrateLeadToClient(
        signupResult.data.user.id,
        leadData
      );

      setLeadData(null);
      setTempLeadId(null);

      const clientDataResult = await fetchClientData(signupResult.data.user.id);
      setClientData(clientDataResult);
      setUserType('cliente');

      authLogger.success('Lead migrated to client successfully', {
        userId: signupResult.data.user.id,
        proyectoCreado: !!migrationResult.proyecto
      });

      return {
        ...signupResult,
        migrated: true,
        projectCreated: !!migrationResult.proyecto,
        projectId: migrationResult.proyecto?.id
      };

    } catch (error) {
      authLogger.error('Error migrating lead to client', { error: error.message });
      setLoading(false);
      throw error;
    }
  }, [tempLeadId, leadData, clientSignup, fetchClientData]);

  const clientLogin = async (email, password) => {
    try {
      const data = await authService.signIn(email, password);

      if (data.user) {
        const verification = await userService.verifyClientExists(data.user.id);

        if (!verification.exists) {
          await authService.signOut();
          return { error: { message: verification.error } };
        }
        // No establecer userType aquí, lo hará el useEffect automáticamente
      }

      return { data, error: null };
    } catch (error) {
      return { error };
    }
  };

  const logout = async (router) => {
    const currentType = userType;

    try {
      await authService.signOut();

      setUser(null);
      setToken(null);
      setUserType(null);

      if (router) {
        if (currentType === 'instalador') {
          router.push('/installer-login');
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      authLogger.error('Error during logout', { userType: currentType, error: error.message });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      userType,
      leadData,
      tempLeadId,
      clientData,
      setClientData,
      installerLogin,
      clientLogin,
      clientSignup,
      logout,
      loading,
      setLeadMode,
      migrateLeadToClient,
      fetchClientData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};