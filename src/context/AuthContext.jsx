import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService, leadService, clientService, userService } from '../services';

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
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const fetchLeadData = useCallback(async (requestedLeadId) => {
    if (!requestedLeadId) return null;

    // Si ya tenemos datos para este lead, no hacer otra petición
    if (leadData && leadData.temp_lead_id === requestedLeadId) {
      return leadData;
    }

    try {
      const data = await leadService.getLeadData(requestedLeadId);
      return data;
    } catch (error) {
      console.error('Error in fetchLeadData:', error);

      // Datos de fallback para testing
      return {
        temp_lead_id: requestedLeadId,
        recibo_cfe: {
          no_servicio: "1234567890123",
          nombre: "Juan Pérez García",
          direccion: "CALLE INSURGENTES 456, COL. ROMA NORTE, CDMX, C.P. 06700",
          direccion_formatted: "Calle Insurgentes 456, Col. Roma Norte, CP 06700 Ciudad de México, Ciudad de México, México",
          kwh_total: "385",
          total_pagar_mxn: "1245.80"
        },
        consumo_kwh_historico: [
          { periodo: "Ene25", kwh: 385 },
          { periodo: "Dic24", kwh: 420 },
          { periodo: "Nov24", kwh: 358 },
          { periodo: "Oct24", kwh: 394 },
          { periodo: "Sep24", kwh: 405 }
        ],
        resumen_energetico: {
          consumo_max: 420
        },
        sizing_results: {
          inputs: {
            irr_avg_day: 5.89,
            irr_min: 4.2,
            irr_max: 7.1
          },
          results: {
            kWp_needed: 3.49,
            n_panels: 7,
            yearly_prod: 6000
          }
        }
      };
    }
  }, [leadData]);

  const setLeadMode = useCallback(async (newTempLeadId) => {
    if (userType === 'lead' && tempLeadId === newTempLeadId) {
      return;
    }

    setTempLeadId(newTempLeadId);
    setUserType('lead');

    const data = await fetchLeadData(newTempLeadId);
    setLeadData(data);
    setLoading(false);
  }, [userType, tempLeadId, fetchLeadData]);


  const fetchClientData = useCallback(async (userId) => {
    if (!userId) return null;

    try {
      const data = await clientService.getClientWithQuote(userId);
      return data;
    } catch (error) {
      console.error('Error in fetchClientData:', error);
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
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in clientSignup:', error);
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

      await clientService.migrateLeadToClient(
        signupResult.data.user.id,
        leadData
      );

      setLeadData(null);
      setTempLeadId(null);

      const clientDataResult = await fetchClientData(signupResult.data.user.id);
      setClientData(clientDataResult);
      setUserType('cliente');

      return { ...signupResult, migrated: true };

    } catch (error) {
      console.error('Error in migrateLeadToClient:', error);
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
      console.error('Error during logout:', error);
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