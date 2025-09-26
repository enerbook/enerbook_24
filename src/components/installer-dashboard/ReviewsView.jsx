import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ReviewCard from './ReviewCard';

const ReviewsView = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    setLoading(true);
    try {
      // Get current user's provider ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }

      // Find provider by auth user ID
      const { data: proveedor, error: proveedorError } = await supabase
        .from('proveedores')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (proveedorError || !proveedor) {
        console.error('No provider found for user:', proveedorError);
        setLoading(false);
        return;
      }

      // Get contracts for this provider first
      const { data: contratos, error: contratosError } = await supabase
        .from('contratos')
        .select(`
          id,
          numero_contrato,
          precio_total_sistema,
          fecha_completado,
          usuarios:usuarios_id (
            nombre
          ),
          cotizaciones_final:cotizaciones_final_id (
            proyectos:proyectos_id (
              titulo,
              descripcion
            )
          )
        `)
        .eq('proveedores_id', proveedor.id);

      if (contratosError) {
        console.error('Error loading contracts:', contratosError);
        setLoading(false);
        return;
      }

      if (!contratos || contratos.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Get reviews for these contracts
      const contratoIds = contratos.map(c => c.id);
      const { data: resenas, error } = await supabase
        .from('resenas')
        .select('*')
        .in('contratos_id', contratoIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
        setLoading(false);
        return;
      }

      const formattedReviews = resenas?.map((resena, index) => {
        const contrato = contratos.find(c => c.id === resena.contratos_id);
        const usuario = contrato?.usuarios;
        const proyecto = contrato?.cotizaciones_final?.proyectos;

        return {
          id: resena.id,
          title: `Reseña ${index + 1}`,
          projectName: proyecto?.titulo || proyecto?.descripcion || `Proyecto ${contrato?.numero_contrato?.slice(0, 8)}`,
          clientName: usuario?.nombre || 'Cliente no especificado',
          totalAmount: contrato?.precio_total_sistema ?
            `$${contrato.precio_total_sistema.toLocaleString()} MXN` :
            'Monto no disponible',
          completionDate: contrato?.fecha_completado ?
            new Date(contrato.fecha_completado).toLocaleDateString('es-MX') :
            'Fecha no disponible',
          comment: resena.comentario || 'Sin comentario',
          rating: resena.puntuacion || 0,
          qualityRating: resena.puntuacion_calidad,
          timeRating: resena.puntuacion_tiempo,
          communicationRating: resena.puntuacion_comunicacion,
          wouldRecommend: resena.recomendaria,
          photos: resena.fotos_instalacion,
          rawData: resena
        };
      }) || [];

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          <p className="text-sm text-gray-600 ml-4">Cargando reseñas...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reseñas</h3>
          <p className="text-sm text-gray-600">Aún no tienes reseñas de proyectos completados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsView;