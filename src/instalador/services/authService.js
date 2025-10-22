import { supabase } from '../../lib/supabaseClient';

/**
 * Instalador Authentication Service
 * Handles authentication for instalador role
 */

export const authService = {
  // Sign up new installer
  signUp: async (email, password, userType = 'instalador', metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          company_name: metadata.companyName || '',
          full_name: metadata.fullName || '',
          phone: metadata.phone || ''
        }
      }
    });
    if (error) throw error;
    return data;
  },

  // Sign in installer
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign out installer
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
};
