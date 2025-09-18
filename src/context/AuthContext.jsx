import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importa el cliente de Supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'cliente', 'instalador', o 'lead'
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState(null);
  const [tempLeadId, setTempLeadId] = useState(null);

  const fetchUserRole = async (userId) => {
    console.log('fetchUserRole called with userId:', userId);
    if (!userId) {
      console.log('fetchUserRole: no userId provided');
      return null;
    }

    try {
      // Check if user is an installer
      console.log('Checking proveedores table...');
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('proveedores')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      console.log('Proveedor check result:', { proveedorData, proveedorError });
      if (proveedorData) {
        console.log('User is instalador');
        return 'instalador';
      }

      // Check if user is a client
      console.log('Checking usuarios table...');
      const { data: clienteData, error: clienteError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId)
        .single();

      console.log('Cliente check result:', { clienteData, clienteError });
      if (clienteData) {
        console.log('User is cliente');
        return 'cliente';
      }

      console.log('No role found for user:', userId);
      return null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const fetchLeadData = useCallback(async (requestedLeadId) => {
    console.log('fetchLeadData called with tempLeadId:', requestedLeadId);
    if (!requestedLeadId) return null;

    // Si ya tenemos datos para este lead, no hacer otra petición
    if (leadData && leadData.temp_lead_id === requestedLeadId) {
      console.log('Lead data already exists for:', requestedLeadId);
      return leadData;
    }

    try {
      const { data, error } = await supabase
        .from('cotizaciones_leads_temp')
        .select('*')
        .eq('temp_lead_id', requestedLeadId)
        .single();

      if (error || !data) {
        console.log('Lead not found in DB, using fallback data for:', requestedLeadId);
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

      console.log('Lead data fetched from DB:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchLeadData:', error);
      return null;
    }
  }, [leadData]); // Include leadData to check for existing data

  const setLeadMode = useCallback(async (newTempLeadId) => {
    console.log('Setting lead mode with tempLeadId:', newTempLeadId);

    // Si ya estamos en modo lead con el mismo ID, no hacer nada
    if (userType === 'lead' && tempLeadId === newTempLeadId) {
      console.log('Already in lead mode with same ID:', newTempLeadId);
      return;
    }

    setTempLeadId(newTempLeadId);
    setUserType('lead');

    const data = await fetchLeadData(newTempLeadId);
    setLeadData(data);
    setLoading(false);
  }, [userType, tempLeadId, fetchLeadData]); // Include necessary dependencies

  useEffect(() => {
    setLoading(true);

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      setToken(session?.access_token ?? null);

      if (user) {
        console.log('Getting user role for:', user.email);
        const role = await fetchUserRole(user.id);
        console.log('Setting userType to:', role);
        setUserType(role);
      } else {
        console.log('No user, setting userType to null');
        setUserType(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);
        setToken(session?.access_token ?? null);
        
        if (user) {
          console.log('Auth listener - Getting user role for:', user.email);
          const role = await fetchUserRole(user.id);
          console.log('Auth listener - Setting userType to:', role);
          setUserType(role);
        } else {
          console.log('Auth listener - No user, setting userType to null');
          setUserType(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const installerLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('proveedores')
        .select('activo')
        .eq('auth_user_id', data.user.id)
        .single();

      if (proveedorError) {
        await supabase.auth.signOut();
        return { error: { message: "No se encontró un perfil de proveedor asociado." } };
      }

      if (proveedorData?.activo !== true) {
        await supabase.auth.signOut();
        return { error: { message: "Tu cuenta de proveedor no está activa." } };
      }
      // No establecer userType aquí, lo hará el useEffect automáticamente
    }
    
    return { data, error };
  };

  const clientLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      const { data: clienteData, error: clienteError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (clienteError || !clienteData) {
        await supabase.auth.signOut();
        return { error: { message: "No se encontró un perfil de cliente asociado." } };
      }
      // No establecer userType aquí, lo hará el useEffect automáticamente
    }

    return { data, error };
  };

  const logout = async (router) => {
    console.log('Logout function called with router:', router);
    const currentType = userType;
    console.log('Current user type:', currentType);
    
    try {
      await supabase.auth.signOut();
      console.log('Supabase signOut completed');
      
      setUser(null);
      setToken(null);
      setUserType(null);
      
      if (router) {
        console.log('Router available, redirecting...');
        if (currentType === 'instalador') {
          console.log('Redirecting to installer login');
          router.replace('/installer-login');
        } else {
          console.log('Redirecting to client login');
          router.replace('/login');
        }
      } else {
        console.log('No router provided to logout function');
      }
    } catch (error) {
      console.error('Error during logout process:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      userType,
      leadData,
      tempLeadId,
      installerLogin,
      clientLogin,
      logout,
      loading,
      setLeadMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};