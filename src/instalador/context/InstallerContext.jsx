import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { installerService } from '../services/installerService';
import { quotationService } from '../services/quotationService';
import { contractService } from '../services/contractService';
import { supabase } from '../../lib/supabaseClient';

/**
 * InstallerContext
 * Contexto global para manejar estado del instalador
 * - Cachea datos del proveedor
 * - Mantiene estado global de proyectos/cotizaciones/contratos
 * - Reduce llamadas redundantes a la base de datos
 * - Proporciona suscripciones realtime
 */

const InstallerContext = createContext(null);

export const useInstaller = () => {
  const context = useContext(InstallerContext);
  if (!context) {
    throw new Error('useInstaller debe usarse dentro de InstallerProvider');
  }
  return context;
};

export const InstallerProvider = ({ children }) => {
  // Estado del instalador/proveedor
  const [installer, setInstaller] = useState(null);
  const [installerLoading, setInstallerLoading] = useState(true);
  const [installerError, setInstallerError] = useState(null);

  // Estado de proyectos disponibles para cotizar
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Estado de mis proyectos (con contratos)
  const [myProjects, setMyProjects] = useState([]);
  const [myProjectsLoading, setMyProjectsLoading] = useState(false);
  const [myProjectsError, setMyProjectsError] = useState(null);

  // Estado de cotizaciones
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState(null);

  // Estado de contratos
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState(null);

  // Estado de reseñas
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Estado de alertas
  const [alerts, setAlerts] = useState([]);
  const [newAlertCount, setNewAlertCount] = useState(0);

  /**
   * Cargar datos del instalador (proveedor)
   * Se ejecuta una sola vez al montar el contexto
   */
  const loadInstaller = useCallback(async () => {
    try {
      setInstallerLoading(true);
      setInstallerError(null);

      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const proveedor = await installerService.getInstallerByUserId(user.id);
      if (!proveedor) {
        throw new Error('No se encontró perfil de instalador');
      }

      setInstaller(proveedor);
      return proveedor;
    } catch (error) {
      console.error('Error loading installer:', error);
      setInstallerError(error.message);
      return null;
    } finally {
      setInstallerLoading(false);
    }
  }, []);

  /**
   * Cargar proyectos disponibles para cotizar
   */
  const loadAvailableProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);

      const { data: proyectos, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          usuarios:usuarios_id (nombre, correo_electronico),
          cotizaciones_inicial:cotizaciones_inicial_id (
            recibo_cfe,
            consumo_kwh_historico,
            resumen_energetico,
            sizing_results,
            irradiacion_cache:irradiacion_cache_id (
              irradiacion_promedio_anual,
              region_nombre
            )
          )
        `)
        .eq('estado', 'abierto')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar datos de cotizaciones_inicial para consistencia
      const proyectosTransformados = (proyectos || []).map(proyecto => {
        if (!proyecto.cotizaciones_inicial) return proyecto;

        const cotizacion = proyecto.cotizaciones_inicial;

        // Transformar consumo_kwh_historico: {kwh, periodo} → {value, kwh, periodo, label, fullLabel}
        if (cotizacion.consumo_kwh_historico && Array.isArray(cotizacion.consumo_kwh_historico)) {
          const mesesMap = {
            'ENE': 'Enero', 'FEB': 'Febrero', 'MAR': 'Marzo', 'ABR': 'Abril',
            'MAY': 'Mayo', 'JUN': 'Junio', 'JUL': 'Julio', 'AGO': 'Agosto',
            'SEP': 'Septiembre', 'OCT': 'Octubre', 'NOV': 'Noviembre', 'DIC': 'Diciembre'
          };

          cotizacion.consumo_kwh_historico = cotizacion.consumo_kwh_historico.map(item => {
            const mesAbrev = item.periodo ? item.periodo.substring(0, 3).toUpperCase() : '';
            const mesCompleto = mesesMap[mesAbrev] || item.periodo || '';

            return {
              value: item.kwh || 0,
              kwh: item.kwh || 0,
              periodo: item.periodo,
              label: mesAbrev.charAt(0) + mesAbrev.substring(1).toLowerCase(),
              fullLabel: mesCompleto,
              consumo: item.kwh || 0
            };
          });
        }

        // Normalizar sizing_results: aplana results al nivel superior
        if (cotizacion.sizing_results?.results) {
          const sizing = cotizacion.sizing_results;
          cotizacion.sizing_results = {
            ...sizing,
            kWp_needed: sizing.results.kWp_needed,
            n_panels: sizing.results.n_panels,
            yearly_prod: sizing.results.yearly_prod,
            panel_wp: sizing.results.panel_wp,
            irr_avg_day: sizing.inputs?.irr_avg_day
          };
        }

        return proyecto;
      });

      setAvailableProjects(proyectosTransformados);
      return proyectosTransformados;
    } catch (error) {
      console.error('Error loading available projects:', error);
      setProjectsError(error.message);
      return [];
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  /**
   * Cargar cotizaciones del instalador
   * Por defecto solo carga cotizaciones pendientes (en revisión por el cliente)
   * Las cotizaciones aceptadas se muestran en "Proyectos" como contratos
   */
  const loadQuotations = useCallback(async (estado = 'pendiente') => {
    if (!installer?.id) return [];

    try {
      setQuotationsLoading(true);
      setQuotationsError(null);

      const cotizaciones = await quotationService.getInstallerQuotations(installer.id, estado);
      setQuotations(cotizaciones || []);
      return cotizaciones;
    } catch (error) {
      console.error('Error loading quotations:', error);
      setQuotationsError(error.message);
      return [];
    } finally {
      setQuotationsLoading(false);
    }
  }, [installer?.id]);

  /**
   * Cargar contratos del instalador
   */
  const loadContracts = useCallback(async () => {
    if (!installer?.id) return [];

    try {
      setContractsLoading(true);
      setContractsError(null);

      const contratos = await contractService.getInstallerContracts(installer.id);
      setContracts(contratos || []);
      return contratos;
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContractsError(error.message);
      return [];
    } finally {
      setContractsLoading(false);
    }
  }, [installer?.id]);

  /**
   * Cargar reseñas del instalador
   */
  const loadReviews = useCallback(async () => {
    if (!installer?.id) return [];

    try {
      setReviewsLoading(true);

      const resenas = await installerService.getInstallerReviews(installer.id);
      setReviews(resenas || []);
      return resenas;
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    } finally {
      setReviewsLoading(false);
    }
  }, [installer?.id]);

  /**
   * Cargar mis proyectos (proyectos con contratos activos)
   * Incluye información completa de cotizaciones para mostrar en cards
   */
  const loadMyProjects = useCallback(async () => {
    if (!installer?.id) return [];

    try {
      setMyProjectsLoading(true);
      setMyProjectsError(null);

      // Usar contractService para obtener contratos con toda la información
      const contratos = await contractService.getInstallerContracts(installer.id);

      // Transformar datos para formato consistente
      const proyectosConContratos = contratos?.map(contrato => ({
        contrato: {
          id: contrato.id,
          numero_contrato: contrato.numero_contrato,
          precio_total_sistema: contrato.precio_total_sistema,
          tipo_pago_seleccionado: contrato.tipo_pago_seleccionado,
          estado: contrato.estado,
          fecha_firma: contrato.fecha_firma,
          fecha_inicio_instalacion: contrato.fecha_inicio_instalacion,
          fecha_completado: contrato.fecha_completado,
          estado_pago: contrato.estado_pago,
          created_at: contrato.created_at,
        },
        proyecto: contrato.cotizaciones_final?.proyectos || null,
        cotizacion: contrato.cotizaciones_final || null,
        cliente: contrato.usuarios || null,
        resenas: contrato.resenas || [],
      })) || [];

      setMyProjects(proyectosConContratos);
      return proyectosConContratos;
    } catch (error) {
      console.error('Error loading my projects:', error);
      setMyProjectsError(error.message);
      return [];
    } finally {
      setMyProjectsLoading(false);
    }
  }, [installer?.id]);

  /**
   * Enviar cotización
   */
  const submitQuotation = useCallback(async (projectId, quotationFormData) => {
    try {
      const newQuotation = await quotationService.submitQuotation(projectId, quotationFormData);

      // Actualizar estado local
      setQuotations(prev => [newQuotation, ...prev]);

      return { success: true, data: newQuotation };
    } catch (error) {
      console.error('Error submitting quotation:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Actualizar estado de contrato
   */
  const updateContractStatus = useCallback(async (contractId, status) => {
    try {
      const updatedContract = await contractService.updateContractStatus(contractId, status);

      // Actualizar estado local
      setContracts(prev =>
        prev.map(c => c.id === contractId ? updatedContract : c)
      );

      return { success: true, data: updatedContract };
    } catch (error) {
      console.error('Error updating contract status:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadAvailableProjects(),
      loadMyProjects(),
      loadQuotations(),
      loadContracts(),
      loadReviews()
    ]);
  }, [loadAvailableProjects, loadMyProjects, loadQuotations, loadContracts, loadReviews]);

  /**
   * Limpiar contador de alertas nuevas
   */
  const clearNewAlertCount = useCallback(() => {
    setNewAlertCount(0);
  }, []);

  // Efecto inicial: cargar datos del instalador
  useEffect(() => {
    loadInstaller();
  }, [loadInstaller]);

  // Efecto: cuando se carga el instalador, cargar sus datos EN PARALELO
  useEffect(() => {
    if (installer?.id) {
      // Cargar datos críticos primero en paralelo (ahora incluye myProjects optimizado)
      Promise.all([
        loadAvailableProjects(),
        loadMyProjects(),
        loadQuotations(),
      ]);

      // Cargar datos secundarios después (no bloquean la UI)
      setTimeout(() => {
        Promise.all([
          loadContracts(),
          loadReviews()
        ]);
      }, 100);
    }
  }, [installer?.id, loadAvailableProjects, loadMyProjects, loadQuotations, loadContracts, loadReviews]);

  // Suscripción realtime a proyectos disponibles
  useEffect(() => {
    const channel = supabase
      .channel('installer_available_projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proyectos',
          filter: 'estado=eq.abierto'
        },
        (payload) => {
          console.log('Project update:', payload);

          if (payload.eventType === 'INSERT') {
            loadAvailableProjects(); // Recargar para obtener relaciones
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.estado !== 'abierto') {
              // Proyecto cerrado, remover de la lista
              setAvailableProjects(prev => prev.filter(p => p.id !== payload.new.id));
            } else {
              loadAvailableProjects(); // Recargar
            }
          } else if (payload.eventType === 'DELETE') {
            setAvailableProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAvailableProjects]);

  // Suscripción realtime a cotizaciones del instalador
  useEffect(() => {
    if (!installer?.id) return;

    const channel = supabase
      .channel('installer_quotations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cotizaciones_final',
          filter: `proveedores_id=eq.${installer.id}`
        },
        (payload) => {
          console.log('Quotation update:', payload);
          loadQuotations(); // Recargar para obtener relaciones completas
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [installer?.id, loadQuotations]);

  // Suscripción realtime a contratos del instalador
  useEffect(() => {
    if (!installer?.id) return;

    const channel = supabase
      .channel('installer_contracts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contratos',
          filter: `proveedores_id=eq.${installer.id}`
        },
        (payload) => {
          console.log('Contract update:', payload);
          loadContracts(); // Recargar para obtener relaciones completas
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [installer?.id, loadContracts]);

  const value = {
    // Datos del instalador
    installer,
    installerLoading,
    installerError,

    // Proyectos disponibles para cotizar
    availableProjects,
    projectsLoading,
    projectsError,

    // Mis proyectos (con contratos)
    myProjects,
    myProjectsLoading,
    myProjectsError,

    // Cotizaciones
    quotations,
    quotationsLoading,
    quotationsError,

    // Contratos
    contracts,
    contractsLoading,
    contractsError,

    // Reseñas
    reviews,
    reviewsLoading,

    // Alertas
    alerts,
    newAlertCount,
    clearNewAlertCount,

    // Acciones
    loadInstaller,
    loadAvailableProjects,
    loadMyProjects,
    loadQuotations,
    loadContracts,
    loadReviews,
    submitQuotation,
    updateContractStatus,
    refreshAll
  };

  return (
    <InstallerContext.Provider value={value}>
      {children}
    </InstallerContext.Provider>
  );
};

export default InstallerContext;
