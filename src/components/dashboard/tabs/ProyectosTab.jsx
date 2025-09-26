import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useSolicitarCotizaciones } from '../../../hooks/useSolicitarCotizaciones';
import SolicitarCotizacionesModal from '../modals/SolicitarCotizacionesModal';

const ProyectosTab = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, openModal, closeModal, handleSuccess } = useSolicitarCotizaciones();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }

      // Load user projects
      const { data: proyectosData, error: proyectosError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('usuarios_id', user.id)
        .order('created_at', { ascending: false });

      if (proyectosError) {
        console.error('Error loading projects:', proyectosError);
      } else {
        setProyectos(proyectosData || []);
      }

      // Load quotations for user projects
      if (proyectosData && proyectosData.length > 0) {
        const proyectoIds = proyectosData.map(p => p.id);
        const { data: cotizacionesData, error: cotizacionesError } = await supabase
          .from('cotizaciones_final')
          .select(`
            *,
            proveedores:proveedores_id (
              nombre_empresa,
              calificacion_promedio
            )
          `)
          .in('proyectos_id', proyectoIds)
          .order('created_at', { ascending: false });

        if (cotizacionesError) {
          console.error('Error loading quotations:', cotizacionesError);
        } else {
          setCotizaciones(cotizacionesData || []);
        }
      }

      // Load contracts for user
      const { data: contratosData, error: contratosError } = await supabase
        .from('contratos')
        .select(`
          *,
          proveedores:proveedores_id (
            nombre_empresa
          ),
          cotizaciones_final:cotizaciones_final_id (
            proyectos:proyectos_id (
              titulo
            )
          )
        `)
        .eq('usuarios_id', user.id)
        .order('created_at', { ascending: false });

      if (contratosError) {
        console.error('Error loading contracts:', contratosError);
      } else {
        setContratos(contratosData || []);
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

  return (
    <main className="flex-1 px-4 pt-2 pb-8 bg-gray-50 overflow-y-auto">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  onClick={openModal}
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
                    <div key={proyecto.id} className="bg-white rounded-lg p-4 border border-gray-200">
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Mis Contratos */}
          <div className="p-6 rounded-lg border border-gray-100" style={{ backgroundColor: '#fcfcfc' }}>
            <h2 className="text-sm font-bold text-gray-900 mb-6">Mis Contratos</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                <p className="text-sm text-gray-600 ml-4">Cargando contratos...</p>
              </div>
            ) : contratos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Tienes Contratos Activos</h3>
                <p className="text-sm text-gray-500">Una vez que aceptes una cotización, aparecerá aquí como contrato</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contratos.map((contrato) => (
                  <div key={contrato.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {contrato.cotizaciones_final?.proyectos?.titulo || contrato.numero_contrato}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contrato.estado === 'firmado'
                          ? 'bg-blue-100 text-blue-800'
                          : contrato.estado === 'completado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contrato.estado === 'firmado' ? 'Firmado' :
                         contrato.estado === 'completado' ? 'Completado' : contrato.estado}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Proveedor:</span>
                        <span className="font-medium">{contrato.proveedores?.nombre_empresa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precio total:</span>
                        <span className="font-semibold text-gray-900">
                          ${contrato.precio_total_sistema?.toLocaleString()} MXN
                        </span>
                      </div>
                      {contrato.fecha_inicio && (
                        <div className="flex justify-between">
                          <span>Fecha de inicio:</span>
                          <span>{new Date(contrato.fecha_inicio).toLocaleDateString('es-MX')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SolicitarCotizacionesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccessWithReload}
      />
    </main>
  );
};

export default ProyectosTab;
