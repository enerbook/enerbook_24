import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../services/clientService';

const ClienteAuthContext = createContext();

export const ClienteAuthProvider = ({ children }) => {
  const {
    user,
    token,
    userType,
    clientData,
    setClientData,
    loading,
    clientLogin,
    clientSignup,
    logout,
    migrateLeadToClient,
    fetchClientData
  } = useAuth();

  const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);

  // Verificar que el usuario es un cliente autenticado
  useEffect(() => {
    setIsClientAuthenticated(userType === 'cliente' && !!user);
  }, [userType, user]);

  // Función para actualizar el perfil del cliente
  const updateClientProfile = async (updates) => {
    if (!user?.id) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const updatedData = await clientService.updateClient(user.id, updates);

      // Recargar datos del cliente
      const refreshedData = await fetchClientData(user.id);
      setClientData(refreshedData);

      return updatedData;
    } catch (error) {
      console.error('Error updating client profile:', error);
      throw error;
    }
  };

  // Función para obtener cotización inicial del cliente
  const getClientQuote = async () => {
    if (!user?.id) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      return await clientService.getInitialQuote(user.id);
    } catch (error) {
      console.error('Error getting client quote:', error);
      throw error;
    }
  };

  // Función para refrescar datos del cliente
  const refreshClientData = async () => {
    if (!user?.id) {
      return null;
    }

    try {
      const data = await fetchClientData(user.id);
      setClientData(data);
      return data;
    } catch (error) {
      console.error('Error refreshing client data:', error);
      return null;
    }
  };

  const value = {
    // Datos del usuario
    user,
    token,
    userType,
    clientData,
    isClientAuthenticated,
    loading,

    // Métodos de autenticación
    clientLogin,
    clientSignup,
    logout,
    migrateLeadToClient,

    // Métodos específicos del cliente
    updateClientProfile,
    getClientQuote,
    refreshClientData,
    setClientData,
    fetchClientData
  };

  return (
    <ClienteAuthContext.Provider value={value}>
      {children}
    </ClienteAuthContext.Provider>
  );
};

export const useClienteAuth = () => {
  const context = useContext(ClienteAuthContext);
  if (!context) {
    throw new Error('useClienteAuth must be used within a ClienteAuthProvider');
  }
  return context;
};

export default ClienteAuthContext;