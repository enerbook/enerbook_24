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
  const [clientData, setClientData] = useState(null);

  const fetchUserRole = async (userId) => {
    console.log('fetchUserRole called with userId:', userId);
    if (!userId) {
      console.log('fetchUserRole: no userId provided');
      return null;
    }

    try {
      // Check if user is an admin first
      console.log('Checking administradores table...');
      const { data: adminData, error: adminError } = await supabase
        .from('administradores')
        .select('id, activo')
        .eq('usuario_id', userId)
        .eq('activo', true);

      console.log('Admin check result:', { adminData, adminError });
      if (adminData && adminData.length > 0) {
        console.log('User is admin');
        return 'admin';
      }

      // Check if user is an installer
      console.log('Checking proveedores table...');
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('proveedores')
        .select('id')
        .eq('auth_user_id', userId);

      console.log('Proveedor check result:', { proveedorData, proveedorError });
      if (proveedorData && proveedorData.length > 0) {
        console.log('User is instalador');
        return 'instalador';
      }

      // Check if user is a client
      console.log('Checking usuarios table...');
      const { data: clienteData, error: clienteError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId);

      console.log('Cliente check result:', { clienteData, clienteError });
      if (clienteData && clienteData.length > 0) {
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


  const fetchClientData = useCallback(async (userId) => {
    console.log('fetchClientData called with userId:', userId);
    if (!userId) return null;

    try {
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      // Obtener cotización inicial del usuario
      const { data: cotizacionData, error: cotizacionError } = await supabase
        .from('cotizaciones_inicial')
        .select('*')
        .eq('usuarios_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cotizacionError) {
        console.log('No initial quote found for user:', userId);
        return {
          user: userData,
          cotizacion: null
        };
      }

      console.log('Client data fetched successfully:', { userData, cotizacionData });
      return {
        user: userData,
        cotizacion: cotizacionData
      };
    } catch (error) {
      console.error('Error in fetchClientData:', error);
      return null;
    }
  }, []);

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

        // Si es cliente, cargar sus datos
        if (role === 'cliente') {
          const data = await fetchClientData(user.id);
          setClientData(data);
        }
      } else {
        console.log('No user, setting userType to null');
        setUserType(null);
        setClientData(null);
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

          // Si es cliente, cargar sus datos
          if (role === 'cliente') {
            const data = await fetchClientData(user.id);
            setClientData(data);
          }
        } else {
          console.log('Auth listener - No user, setting userType to null');
          setUserType(null);
          setClientData(null);
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
        .eq('auth_user_id', data.user.id);

      if (proveedorError || !proveedorData || proveedorData.length === 0) {
        await supabase.auth.signOut();
        return { error: { message: "No se encontró un perfil de proveedor asociado." } };
      }

      if (proveedorData[0]?.activo !== true) {
        await supabase.auth.signOut();
        return { error: { message: "Tu cuenta de proveedor no está activa." } };
      }
      // No establecer userType aquí, lo hará el useEffect automáticamente
    }
    
    return { data, error };
  };

  const clientSignup = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'cliente',
          nombre: metadata.name || '',
          telefono: metadata.phone || ''
        }
      }
    });

    if (error) return { error };

    // Si el signup fue exitoso pero necesita confirmación de email
    if (data.user && !data.session) {
      // El usuario fue creado pero necesita confirmar su email
      return {
        data,
        error: null,
        needsEmailConfirmation: true,
        message: "Registro exitoso. Por favor revisa tu correo electrónico para confirmar tu cuenta."
      };
    }

    // Si el usuario fue creado, crear el registro en la tabla usuarios
    if (data.user) {
      console.log('Creating user profile in usuarios table for:', data.user.id);
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .upsert({
          id: data.user.id,
          nombre: metadata.name || '',
          correo_electronico: email,
          telefono: metadata.phone || ''
        }, {
          onConflict: 'id'
        });

      if (usuarioError) {
        console.error('Error creando perfil de usuario:', usuarioError);
        return { error: usuarioError };
      } else {
        console.log('User profile created successfully in usuarios table');
      }
    }

    return { data, error };
  };

  const migrateLeadToClient = useCallback(async (email, password, metadata = {}) => {
    console.log('Starting lead to client migration for tempLeadId:', tempLeadId);

    if (!tempLeadId || !leadData) {
      throw new Error('No hay datos de lead para migrar');
    }

    try {
      setLoading(true);

      // 1. Crear usuario cliente
      const signupResult = await clientSignup(email, password, {
        name: metadata.name || leadData.recibo_cfe?.nombre || '',
        phone: metadata.phone || ''
      });

      if (signupResult.error) {
        throw signupResult.error;
      }

      // Si necesita confirmación de email, retornar sin migrar datos
      if (signupResult.needsEmailConfirmation) {
        return signupResult;
      }

      // 2. Migrar datos de cotizaciones_leads_temp a cotizaciones_inicial
      const { data: insertResult, error: insertError } = await supabase
        .from('cotizaciones_inicial')
        .insert({
          usuarios_id: signupResult.data.user.id,
          recibo_cfe: leadData.recibo_cfe,
          consumo_kwh_historico: leadData.consumo_kwh_historico,
          resumen_energetico: leadData.resumen_energetico,
          sizing_results: leadData.sizing_results,
          irradiacion_cache_id: leadData.irradiacion_cache_id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error migrating lead data:', insertError);
        throw new Error('Error al migrar datos del lead');
      }

      console.log('Lead data migrated successfully:', insertResult);

      // 3. Limpiar estado de lead y establecer como cliente
      setLeadData(null);
      setTempLeadId(null);

      // Cargar datos del cliente recién creado
      const clientDataResult = await fetchClientData(signupResult.data.user.id);
      setClientData(clientDataResult);
      setUserType('cliente');

      console.log('Migration completed successfully');
      return { ...signupResult, migrated: true };

    } catch (error) {
      console.error('Error in migrateLeadToClient:', error);
      setLoading(false);
      throw error;
    }
  }, [tempLeadId, leadData, clientSignup]);

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
        .eq('id', data.user.id);

      if (clienteError || !clienteData || clienteData.length === 0) {
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
    console.log('Current user email:', user?.email);
    
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
          router.push('/installer-login');
        } else {
          console.log('Redirecting to client login');
          router.push('/login');
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