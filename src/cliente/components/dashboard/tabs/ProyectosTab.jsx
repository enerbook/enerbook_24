import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useClienteAuth } from '../../../context/ClienteAuthContext';
import { useRouter } from 'expo-router';
import { useSolicitarCotizaciones } from '../../../hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../../modals/SolicitarCotizacionesModal';
import ReceiptUploadModal from '../../modals/ReceiptUploadModal';
import DetallesProyectoSolar from '../DetallesProyectoSolar';
import { authService } from '../../../services/authService';
import { projectService } from '../../../services/projectService';
import { quotationService } from '../../../services/quotationService';

const ProyectosTab = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();
  const [showNuevoProyectoModal, setShowNuevoProyectoModal] = useState(false);
  const [selectedProyectoId, setSelectedProyectoId] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const { userType } = useClienteAuth();
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }

      // Load user projects using projectService
      try {
        const proyectosData = await projectService.getClientProjects(user.id);
        setProyectos(proyectosData || []);

        // Load quotations for user projects
        if (proyectosData && proyectosData.length > 0) {
          const allQuotations = [];
          for (const proyecto of proyectosData) {
            try {
              const quotations = await quotationService.getProjectQuotations(proyecto.id);
              allQuotations.push(...quotations);
            } catch (error) {
              console.error(`Error loading quotations for project ${proyecto.id}:`, error);
            }
          }
          setCotizaciones(allQuotations);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProyectos([]);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessWithReload = (proyecto) => {
    handleSuccess(proyecto);
    loadUserData(); // Reload data to show new project
  };

  const handleSolicitarCotizaciones = () => {
    // Si es lead, redirigir a registro
    if (userType === 'lead') {
      router.push('/signup');
      return;
    }
    // Si es cliente autenticado, abrir modal
    openModal();
  };

  const handleToggleProjectStatus = async (proyectoId, currentStatus, e) => {
    e.stopPropagation(); // Prevent triggering the card click

    const isOpen = currentStatus === 'abierto';
    const action = isOpen ? 'pausar' : 'publicar';
    const newStatus = isOpen ? 'cerrado' : 'abierto';

    if (!confirm(`¿Estás seguro de que deseas ${action} este proyecto?`)) {
      return;
    }

    try {
      await projectService.toggleProjectStatus(proyectoId, newStatus);
      loadUserData(); // Reload projects after status change
    } catch (error) {
      console.error('Error toggling project status:', error);
      alert('Error al cambiar el estado del proyecto. Por favor intenta de nuevo.');
    }
  };

  const handleReceiptSubmit = async (files) => {
    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();

      // Obtener usuario actual
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Agregar user_id (el webhook lo busca en múltiples formatos)
      formData.append('user_id', user.id);

      // Agregar información del proyecto
      formData.append('project_title', 'Proyecto Solar');
      formData.append('project_description', 'Proyecto creado desde dashboard de cliente');

      // Agregar archivos con nombres específicos que espera el webhook
      if (files.length === 1) {
        // Si solo hay un archivo, enviarlo como data-frontal
        formData.append('data-frontal', files[0]);
      } else if (files.length >= 2) {
        // Si hay dos archivos, enviar como frontal y posterior
        formData.append('data-frontal', files[0]);
        formData.append('data-posterior', files[1]);
      }

      // Enviar al webhook de N8N
      const response = await fetch('https://services.enerbook.mx/webhook/ocr-nuevo-proyecto', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el recibo');
      }

      const result = await response.json();
      setOcrData(result);

      // Recargar proyectos después de un momento
      setTimeout(() => {
        setShowNuevoProyectoModal(false);
        setIsUploadingReceipt(false);
        setOcrData(null);
        loadUserData();
      }, 3000);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Error al procesar el recibo. Por favor intenta de nuevo.');
      setIsUploadingReceipt(false);
    }
  };

  // Si hay un proyecto seleccionado, mostrar la vista de detalles
  if (selectedProyectoId) {
    return (
      <DetallesProyectoSolar
        proyectoId={selectedProyectoId}
        onClose={() => {
          setSelectedProyectoId(null);
          loadUserData(); // Recargar datos al volver
        }}
      />
    );
  }

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        {/* Header with Nuevo Proyecto button */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">Mis Proyectos</h1>
          <button
            onClick={() => setShowNuevoProyectoModal(true)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            + Nuevo Proyecto
          </button>
        </div>

        {/* Mis Cotizaciones */}
        <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
          <h2 className="text-sm font-bold text-gray-900 mb-6">Mis Cotizaciones</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                <p className="text-sm text-gray-600 ml-4">Cargando cotizaciones...</p>
              </div>
            ) : proyectos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Tienes Solicitudes Activas</h3>
                <p className="text-sm text-gray-500 mb-6">Solicita cotizaciones de instaladores para tu sistema solar</p>
                <button
                  onClick={handleSolicitarCotizaciones}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
                >
                  Solicitar Cotizaciones
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {proyectos.map((proyecto) => {
                  const cotizacionesProyecto = cotizaciones.filter(c => c.proyectos_id === proyecto.id);
                  const fechaLimite = new Date(proyecto.fecha_limite).toLocaleDateString('es-MX');
                  const diasRestantes = Math.ceil((new Date(proyecto.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={proyecto.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div
                        onClick={() => setSelectedProyectoId(proyecto.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">{proyecto.titulo}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proyecto.estado === 'abierto'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {proyecto.estado === 'abierto' ? 'Abierto' : proyecto.estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{proyecto.descripcion}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Fecha límite: {fechaLimite}</span>
                          <span className={diasRestantes > 7 ? 'text-green-600' : diasRestantes > 0 ? 'text-orange-600' : 'text-red-600'}>
                            {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencido'}
                          </span>
                        </div>
                        {cotizacionesProyecto.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              {cotizacionesProyecto.length} cotización{cotizacionesProyecto.length !== 1 ? 'es' : ''} recibida{cotizacionesProyecto.length !== 1 ? 's' : ''}
                            </p>
                            <div className="space-y-2">
                              {cotizacionesProyecto.slice(0, 2).map((cotizacion) => (
                                <div key={cotizacion.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                  <span className="text-xs text-gray-700">{cotizacion.proveedores?.nombre_empresa}</span>
                                  <span className="text-xs font-semibold text-gray-900">
                                    ${cotizacion.precio_total?.toLocaleString()} MXN
                                  </span>
                                </div>
                              ))}
                              {cotizacionesProyecto.length > 2 && (
                                <p className="text-xs text-gray-500">y {cotizacionesProyecto.length - 2} más...</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={handleSolicitarCotizaciones}
                          className="flex-1 px-3 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
                        >
                          Solicitar Cotizaciones
                        </button>
                        <button
                          onClick={(e) => handleToggleProjectStatus(proyecto.id, proyecto.estado, e)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            proyecto.estado === 'abierto'
                              ? 'border border-orange-300 text-orange-600 hover:bg-orange-50'
                              : 'border border-green-300 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {proyecto.estado === 'abierto' ? 'Pausar' : 'Publicar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      <SolicitarCotizacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccessWithReload}
      />

      <ReceiptUploadModal
        isOpen={showNuevoProyectoModal}
        onClose={() => setShowNuevoProyectoModal(false)}
        onSubmit={handleReceiptSubmit}
        ocrData={ocrData}
        setOcrData={setOcrData}
        isLoading={isUploadingReceipt}
      />
    </main>
  );
};

export default ProyectosTab;
