import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
import AcceptQuotationModal from '../modals/AcceptQuotationModal';
import ProyectoHeader from './proyecto-details/ProyectoHeader';
import CotizacionesList from './proyecto-details/CotizacionesList';
import UserInfoBar from './common/UserInfoBar';
import MetricsGrid from './common/MetricsGrid';
import AnalysisCharts from './common/AnalysisCharts';
import HistorialConsumoTable from './proyecto-details/HistorialConsumoTable';

const DetallesProyectoSolar = ({ proyectoId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [cotizacionInicial, setCotizacionInicial] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [cotizacionToAccept, setCotizacionToAccept] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (proyectoId) {
      loadProyectoDetails();
    }
  }, [proyectoId]);

  useEffect(() => {
    const getUserId = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const loadProyectoDetails = async () => {
    setLoading(true);
    try {
      // Use optimized query that loads everything in one request
      const { proyecto: proyectoData, cotizacionInicial: cotizacionInicialData, cotizaciones: cotizacionesData } =
        await projectService.getProjectWithDetails(proyectoId);

      setProyecto(proyectoData);
      setCotizacionInicial(cotizacionInicialData);
      setCotizaciones(cotizacionesData);

      console.log('✅ Project details loaded (optimized):', {
        proyecto: proyectoData.titulo,
        hasCotizacionInicial: !!cotizacionInicialData,
        cotizacionesCount: cotizacionesData.length
      });
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiasRestantes = (fechaLimite) => {
    return Math.ceil((new Date(fechaLimite) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleAcceptQuotation = (cotizacion) => {
    setCotizacionToAccept(cotizacion);
    setShowAcceptModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Cargando detalles del proyecto...</p>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-600">Proyecto no encontrado</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const diasRestantes = getDiasRestantes(proyecto.fecha_limite);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <ProyectoHeader
        proyecto={proyecto}
        onClose={onClose}
        diasRestantes={diasRestantes}
        cotizacionesCount={cotizaciones.length}
      />

      <div className="px-6 py-6">
        {/* User Info Bar */}
        <UserInfoBar />

        {/* Metrics Grid */}
        <div className="mb-6">
          <MetricsGrid />
        </div>

        {/* Analysis Charts */}
        <AnalysisCharts />

        {/* Historial de Consumo */}
        {cotizacionInicial?.consumo_kwh_historico && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Historial de Consumo</h2>
            <HistorialConsumoTable consumoHistorico={cotizacionInicial.consumo_kwh_historico} />
          </div>
        )}

        {/* Cotizaciones Recibidas */}
        <CotizacionesList
          cotizaciones={cotizaciones}
          proyecto={proyecto}
          onAcceptQuotation={handleAcceptQuotation}
        />
      </div>

      {/* Accept Quotation Modal */}
      {showAcceptModal && cotizacionToAccept && currentUserId && (
        <AcceptQuotationModal
          quotation={cotizacionToAccept}
          userId={currentUserId}
          onClose={() => {
            setShowAcceptModal(false);
            setCotizacionToAccept(null);
          }}
          onSuccess={() => {
            loadProyectoDetails(); // Reload project details after accepting
          }}
        />
      )}
    </div>
  );
};

export default DetallesProyectoSolar;