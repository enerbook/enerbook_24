import React, { useState } from 'react';
import { projectService } from '../../services/projectService';

const PublicarProyectoModal = ({ isOpen, onClose, projectId, onPublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [option, setOption] = useState(null); // 'publish' o 'later'

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await projectService.publishProject(projectId);
      if (onPublish) onPublish();
      onClose();
    } catch (error) {
      console.error('Error publishing project:', error);
      alert('Error al publicar el proyecto. Por favor intenta de nuevo.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¡Tu Proyecto Ha Sido Creado!
          </h2>
          <p className="text-sm text-gray-600">
            Tu análisis de recibo CFE se ha guardado exitosamente. ¿Quieres publicar tu proyecto ahora para empezar a recibir cotizaciones?
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Option 1: Publish now */}
          <button
            onClick={() => setOption('publish')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              option === 'publish'
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-200'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  option === 'publish'
                    ? 'border-orange-400 bg-orange-400'
                    : 'border-gray-300'
                }`}
              >
                {option === 'publish' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Sí, publicar ahora
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Empieza a recibir cotizaciones de instaladores certificados inmediatamente
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Review later */}
          <button
            onClick={() => setOption('later')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              option === 'later'
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-200'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  option === 'later'
                    ? 'border-orange-400 bg-orange-400'
                    : 'border-gray-300'
                }`}
              >
                {option === 'later' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  No, lo revisaré primero
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Podrás publicar tu proyecto más tarde desde tu panel de proyectos
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={option === 'publish' ? handlePublish : handleLater}
            disabled={!option || isPublishing}
            className="flex-1 py-3 px-4 rounded-lg text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{
              background: option && !isPublishing
                ? 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'
                : '#E5E7EB'
            }}
          >
            {isPublishing ? 'Publicando...' : option === 'publish' ? 'Publicar Proyecto' : option === 'later' ? 'Continuar al Dashboard' : 'Selecciona una opción'}
          </button>
        </div>

        {/* Info note */}
        {option === 'publish' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">💡 Nota:</span> Los instaladores certificados podrán ver tu proyecto y enviarte cotizaciones. Podrás pausarlo en cualquier momento.
            </p>
          </div>
        )}

        {option === 'later' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">ℹ️ Recuerda:</span> Tu proyecto quedará en estado "Cerrado" hasta que lo publiques desde la sección "Mis Proyectos".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicarProyectoModal;
