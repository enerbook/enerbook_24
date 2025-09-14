import React from 'react';
import { FiStar } from 'react-icons/fi';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FFCB45" />
            </linearGradient>
          </defs>
        </svg>
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            key={index}
            className="w-6 h-6"
            fill={index < rating ? 'url(#starGradient)' : '#d1d5db'}
            viewBox="0 0 24 24"
            stroke="none"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 rounded-2xl border border-gray-100" style={{backgroundColor: '#fcfcfc'}}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{review.title}</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Proyecto</span>
          <span className="text-sm text-gray-900">{review.projectName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Cliente</span>
          <span className="text-sm text-gray-900">{review.clientName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Monto Total</span>
          <span className="text-sm text-gray-900">{review.totalAmount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Fecha de Finalización</span>
          <span className="text-sm text-gray-900">{review.completionDate}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Comentario del Cliente</h4>
        <p className="text-sm text-gray-900 leading-relaxed">{review.comment}</p>
      </div>

      <div className="flex justify-center">
        {renderStars(review.rating)}
      </div>
    </div>
  );
};

export default ReviewCard;