import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabaseClient';
import { authService } from '../../services/authService';
import { quotationService } from '../../services/quotationService';
import AcceptQuotationModal from '../modals/AcceptQuotationModal';

const DetallesProyectoSolar = ({ proyectoId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [cotizacionInicial, setCotizacionInicial] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
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
      // Cargar proyecto
      const { data: proyectoData, error: proyectoError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', proyectoId)
        .single();

      if (proyectoError) throw proyectoError;
      setProyecto(proyectoData);

      // Cargar cotización inicial
      if (proyectoData.cotizaciones_inicial_id) {
        const { data: cotizacionInicialData, error: cotizacionError } = await supabase
          .from('cotizaciones_inicial')
          .select('*')
          .eq('id', proyectoData.cotizaciones_inicial_id)
          .single();

        if (!cotizacionError) {
          setCotizacionInicial(cotizacionInicialData);
        }
      }

      // Cargar cotizaciones finales de proveedores
      const { data: cotizacionesData, error: cotizacionesError } = await supabase
        .from('cotizaciones_final')
        .select(`
          *,
          proveedores (
            id,
            nombre_empresa,
            nombre_contacto,
            email,
            telefono
          )
        `)
        .eq('proyectos_id', proyectoId)
        .order('created_at', { ascending: false });

      if (!cotizacionesError) {
        setCotizaciones(cotizacionesData || []);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDiasRestantes = (fechaLimite) => {
    return Math.ceil((new Date(fechaLimite) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      'abierto': 'bg-green-100 text-green-800',
      'cerrado': 'bg-gray-100 text-gray-800',
      'adjudicado': 'bg-blue-100 text-blue-800',
      'en_progreso': 'bg-yellow-100 text-yellow-800',
      'completado': 'bg-purple-100 text-purple-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getCotizacionEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'aceptada': { color: 'bg-green-100 text-green-800', text: 'Aceptada' },
      'rechazada': { color: 'bg-red-100 text-red-800', text: 'Rechazada' }
    };
    return badges[estado] || badges['pendiente'];
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClose}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Proyectos
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(proyecto.estado)}`}>
              {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1).replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">{proyecto.titulo}</h1>
          <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
            <span>Fecha límite: {formatDate(proyecto.fecha_limite)}</span>
            <span className={diasRestantes > 7 ? 'text-green-600' : diasRestantes > 0 ? 'text-orange-600' : 'text-red-600'}>
              {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencido'}
            </span>
            <span>{cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''} recibida{cotizaciones.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Información Técnica Inicial */}
        {cotizacionInicial && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Información Técnica del Proyecto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sistema recomendado */}
              {cotizacionInicial.sizing_results?.results && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">Sistema Recomendado</h3>
                    <p className="text-sm font-bold text-gray-900">
                      {cotizacionInicial.sizing_results.results.kWp_needed} kWp
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {cotizacionInicial.sizing_results.results.n_panels} paneles de {cotizacionInicial.sizing_results.results.panel_wp}W
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">Producción Anual Estimada</h3>
                    <p className="text-sm font-bold text-gray-900">
                      {cotizacionInicial.sizing_results.results.yearly_prod?.toLocaleString()} kWh
                    </p>
                  </div>
                </>
              )}

              {/* Información del recibo */}
              {cotizacionInicial.recibo_cfe && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">Tarifa CFE</h3>
                    <p className="text-sm font-bold text-gray-900">
                      {cotizacionInicial.recibo_cfe.tarifa || 'No especificada'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">Ubicación</h3>
                    <p className="text-sm font-bold text-gray-900">
                      CP {cotizacionInicial.recibo_cfe.codigo_postal || 'No especificado'}
                    </p>
                  </div>
                </>
              )}

              {/* Consumo promedio */}
              {cotizacionInicial.resumen_energetico?.consumo_promedio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2">Consumo Promedio</h3>
                  <p className="text-sm font-bold text-gray-900">
                    {cotizacionInicial.resumen_energetico.consumo_promedio} kWh/mes
                  </p>
                </div>
              )}

              {/* Irradiación */}
              {cotizacionInicial.sizing_results?.inputs?.irr_avg_day && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2">Irradiación Promedio</h3>
                  <p className="text-sm font-bold text-gray-900">
                    {cotizacionInicial.sizing_results.inputs.irr_avg_day} kWh/m²/día
                  </p>
                </div>
              )}
            </div>

            {/* Historial de Consumo */}
            {cotizacionInicial.consumo_kwh_historico && cotizacionInicial.consumo_kwh_historico.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-900 mb-3">Historial de Consumo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-600">Período</th>
                        <th className="text-right py-2 font-medium text-gray-600">Consumo (kWh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizacionInicial.consumo_kwh_historico.slice(0, 6).map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-900">{item.periodo}</td>
                          <td className="py-2 text-right text-gray-900">{item.kwh}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cotizaciones Recibidas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Cotizaciones Recibidas ({cotizaciones.length})
          </h2>

          {cotizaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Aún No Hay Cotizaciones</h3>
              <p className="text-sm text-gray-500">
                Los instaladores tienen hasta el {formatDate(proyecto.fecha_limite)} para enviar sus propuestas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cotizaciones.map((cotizacion) => {
                const badge = getCotizacionEstadoBadge(cotizacion.estado);
                const precioFinal = cotizacion.precio_final?.total || 0;

                return (
                  <div
                    key={cotizacion.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedCotizacion(selectedCotizacion?.id === cotizacion.id ? null : cotizacion)}
                  >
                    {/* Header de la cotización */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {cotizacion.proveedores?.nombre_empresa || 'Proveedor'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {cotizacion.proveedores?.nombre_contacto}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${precioFinal.toLocaleString()} MXN
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.color} mt-1`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>

                    {/* Información breve */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                      {cotizacion.paneles?.marca && (
                        <div>
                          <span className="font-medium">Paneles:</span> {cotizacion.paneles.marca} ({cotizacion.paneles.cantidad})
                        </div>
                      )}
                      {cotizacion.inversores?.marca && (
                        <div>
                          <span className="font-medium">Inversor:</span> {cotizacion.inversores.marca}
                        </div>
                      )}
                    </div>

                    {/* Opciones de pago */}
                    {cotizacion.opciones_pago && cotizacion.opciones_pago.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Opciones de Pago:</p>
                        <div className="flex flex-wrap gap-2">
                          {cotizacion.opciones_pago.map((opcion, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {opcion.tipo === 'upfront' && 'Pago Total'}
                              {opcion.tipo === 'milestones' && 'Pagos por Hitos'}
                              {opcion.tipo === 'financing' && 'Financiamiento'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detalles expandibles */}
                    {selectedCotizacion?.id === cotizacion.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Paneles */}
                        {cotizacion.paneles && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Paneles Solares</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                              <div><span className="font-medium">Marca:</span> {cotizacion.paneles.marca}</div>
                              <div><span className="font-medium">Modelo:</span> {cotizacion.paneles.modelo}</div>
                              <div><span className="font-medium">Cantidad:</span> {cotizacion.paneles.cantidad}</div>
                              <div><span className="font-medium">Potencia:</span> {cotizacion.paneles.potencia_wp}W</div>
                              {cotizacion.paneles.precio && (
                                <div className="col-span-2"><span className="font-medium">Precio:</span> ${cotizacion.paneles.precio.toLocaleString()} MXN</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Inversores */}
                        {cotizacion.inversores && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Inversor</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                              <div><span className="font-medium">Marca:</span> {cotizacion.inversores.marca}</div>
                              <div><span className="font-medium">Modelo:</span> {cotizacion.inversores.modelo}</div>
                              <div><span className="font-medium">Tipo:</span> {cotizacion.inversores.tipo}</div>
                              <div><span className="font-medium">Potencia:</span> {cotizacion.inversores.potencia_kw} kW</div>
                              {cotizacion.inversores.precio && (
                                <div className="col-span-2"><span className="font-medium">Precio:</span> ${cotizacion.inversores.precio.toLocaleString()} MXN</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Estructura */}
                        {cotizacion.estructura && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Estructura</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                              <div><span className="font-medium">Tipo:</span> {cotizacion.estructura.tipo}</div>
                              <div><span className="font-medium">Material:</span> {cotizacion.estructura.material}</div>
                              {cotizacion.estructura.precio && (
                                <div className="col-span-2"><span className="font-medium">Precio:</span> ${cotizacion.estructura.precio.toLocaleString()} MXN</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sistema Eléctrico */}
                        {cotizacion.sistema_electrico && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Sistema Eléctrico</h4>
                            <div className="text-xs text-gray-700">
                              {cotizacion.sistema_electrico.descripcion && (
                                <p className="mb-2">{cotizacion.sistema_electrico.descripcion}</p>
                              )}
                              {cotizacion.sistema_electrico.precio && (
                                <div><span className="font-medium">Precio:</span> ${cotizacion.sistema_electrico.precio.toLocaleString()} MXN</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notas del proveedor */}
                        {cotizacion.notas_proveedor && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-blue-900 mb-2">Notas del Proveedor</h4>
                            <p className="text-xs text-blue-800">{cotizacion.notas_proveedor}</p>
                          </div>
                        )}

                        {/* Contacto */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            <p>📧 {cotizacion.proveedores?.email}</p>
                            <p>📞 {cotizacion.proveedores?.telefono}</p>
                          </div>
                          {cotizacion.estado === 'pendiente' && (
                            <button
                              onClick={() => {
                                setCotizacionToAccept(cotizacion);
                                setShowAcceptModal(true);
                              }}
                              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
                            >
                              Aceptar Cotización
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Click indicator */}
                    <div className="text-center mt-3 pt-3 border-t border-gray-100">
                      <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                        {selectedCotizacion?.id === cotizacion.id ? '▲ Ver menos' : '▼ Ver más detalles'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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