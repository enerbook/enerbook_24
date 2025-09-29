import React from "react";
import Reveal from "./Reveal";

const items = [
  {
    photo: "/img/reviews/paula.jpg",
    text: "Por fin una plataforma que no me hace hablar con mil vendedores. Subí mi recibo y en minutos ya tenía cotizaciones claras y profesionales. ",
    author: "Paula Gutiérrez",
    city: "Puebla",
    tag: "Ingeniera Industrial",
  },
  {
    photo: "/img/reviews/luis.jpg",
    text: "Apenas subí mi recibo y en un rato ya estaba viendo cuánto podía ahorrar. Ojalá todas las plataformas fueran así de claras y rápidas.",
    author: "Luis Fernando",
    city: "Puebla", 
    tag: "Cliente residencial",
  },
  {
    photo: "/img/reviews/gerardo.avif",
    text: "Gracias a Enerbook encontré un proveedor en mi zona que me ofreció mejor precio y garantía que otros que había visto. La atención fue excelente.",
    author: "Gerardo López",
    city: "Querétaro",
    tag: "Cliente residencial",
  },
  {
    photo: "/img/reviews/andrea.jpg",
    text: "El Power Team de Enerbook realmente hace la diferencia. Me acompañaron desde el inicio y resolvieron todas mis dudas técnicas antes de decidirme.",
    author: "Andrea Cárdenas", 
    city: "Cancún",
    tag: "Consultora energética",
  },
];

const Reviews = () => (
  <section id="reviews" className="min-h-screen flex items-center py-8 sm:py-12 md:py-16 relative" style={{background: 'linear-gradient(180deg, #F59E0B 0%, #FFCB45 100%)'}}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Título REVIEWS centrado */}
      <div className="text-center mb-6 sm:mb-8">
        <Reveal>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white uppercase tracking-wider">
            REVIEWS
          </h2>
        </Reveal>
      </div>

      {/* Grid de reseñas 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto items-stretch">
        {items.map((review, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 relative h-full flex flex-col">
              {/* Contenedor interno con bordes más redondeados */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 flex flex-col relative border border-gray-100">
                {/* Estrellas en pastilla naranja centradas */}
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                    ★★★★★
                  </div>
                </div>
                
                {/* Comillas grandes en negro */}
                <div className="absolute top-4 sm:top-6 right-6 sm:right-8 text-black text-4xl sm:text-6xl font-black" style={{fontFamily: 'serif'}}>
                  ❝
                </div>
                
                {/* Texto de la reseña centrado */}
                <div className="text-center flex-grow flex items-center">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic font-medium w-full pr-6 sm:pr-8">
                    {review.text}
                  </p>
                </div>
                
                {/* Autor centrado */}
                <div className="text-center mt-4 sm:mt-6">
                  <p className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                    {review.author}, {review.city}
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {review.tag}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Reviews;
