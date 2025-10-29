import React, { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';

const NotificacionesSection = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    cotizaciones: true,
    proyectos: true,
    newsletter: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // TODO: Guardar en Supabase cuando se implemente la tabla de preferencias
      // await supabase.from('user_preferences').upsert({ user_id: userId, ...preferences })

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulación
      setMessage('Preferencias guardadas correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Error al guardar preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <FiBell className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Preferencias de Notificación</h3>
          <p className="text-sm text-gray-500">Controla cómo y cuándo te contactamos</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Notificaciones de Cotizaciones */}
        <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Nuevas Cotizaciones</h4>
            <p className="text-sm text-gray-500">Recibe un email cuando un instalador envíe una cotización</p>
          </div>
          <button
            onClick={() => handleToggle('cotizaciones')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.cotizaciones ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.cotizaciones ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Actualizaciones de Proyectos */}
        <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Actualizaciones de Proyectos</h4>
            <p className="text-sm text-gray-500">Mantente informado sobre el progreso de tus proyectos</p>
          </div>
          <button
            onClick={() => handleToggle('proyectos')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.proyectos ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.proyectos ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Newsletter */}
        <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Newsletter Mensual</h4>
            <p className="text-sm text-gray-500">Tips, noticias y promociones sobre energía solar</p>
          </div>
          <button
            onClick={() => handleToggle('newsletter')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.newsletter ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.newsletter ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="px-6 py-2.5 rounded-full text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
      >
        {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
      </button>
    </div>
  );
};

export default NotificacionesSection;
