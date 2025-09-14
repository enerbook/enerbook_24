import React from 'react';
import ReviewCard from './ReviewCard';

const ReviewsView = () => {
  // Mock data basado en la imagen
  const reviews = [
    {
      id: 1,
      title: 'Reseña 1',
      projectName: 'Instalación en Los Fuentes 9 kWp',
      clientName: 'Luis Raúl Morales Hernández',
      totalAmount: '$87,500 MXN',
      completionDate: '9/09/2025',
      comment: 'Estoy muy satisfecho con la instalación. El equipo fue puntual, resolvieron todas mis dudas y el sistema quedó funcionando perfectamente. Solo tuvieron un pequeño retraso por clima, pero avisaron con tiempo.',
      rating: 5
    },
    {
      id: 2,
      title: 'Reseña 2',
      projectName: 'Sistema Solar para Cafetería "La Aurora"',
      clientName: 'Sebastian Campos Ruiz',
      totalAmount: '$112,300 MXN',
      completionDate: '26/07/2025',
      comment: 'Excelente atención desde el primer contacto. La instalación fue limpia, rápida y los técnicos explicaron todo muy bien. ¡Ya estamos viendo el ahorro en la factura!',
      rating: 4
    },
    {
      id: 3,
      title: 'Reseña 3',
      projectName: 'Residencial "El Mirador" - 12 paneles',
      clientName: 'Karla Juárez Moreno',
      totalAmount: '$92,000 MXN',
      completionDate: '02/08/2025',
      comment: 'Todo perfecto hasta ahora y me encantó el sistema. Solo tardaron un poco más de lo prometido por un problema con el inversor, pero lo resolvieron sin costo extra. Muy profesionales.',
      rating: 3
    },
    {
      id: 4,
      title: 'Reseña 4',
      projectName: 'Instalación en Rancho "Los Pinos"',
      clientName: 'Fernando Rodríguez Vela',
      totalAmount: '$168,000 MXN',
      completionDate: '20/07/2025',
      comment: 'La instalación fue bien, pero no me contactaron rápido en el seguimiento post-venta. Me hubiera gustado un poco más de acompañamiento técnico después del cierre.',
      rating: 3
    }
  ];

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {reviews.map((review) => (
          <ReviewCard 
            key={review.id}
            review={review}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsView;