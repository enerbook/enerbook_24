import React, { useState } from 'react';
import { FiLock, FiAlertTriangle, FiDownload, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../../../../lib/supabaseClient';

const SeguridadSection = ({ userEmail }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setMessage('Contraseña actualizada correctamente');
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('Error al actualizar contraseña: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar exportación real de datos
      alert('Funcionalidad de descarga de datos en desarrollo');
    } catch (error) {
      console.error('Error downloading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      '¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.\n\nEscribe "ELIMINAR" para confirmar.'
    );

    if (confirmed) {
      const finalConfirm = prompt('Escribe "ELIMINAR" para confirmar:');
      if (finalConfirm === 'ELIMINAR') {
        // TODO: Implementar eliminación de cuenta
        alert('Funcionalidad de eliminación de cuenta en desarrollo');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <FiLock className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Seguridad y Privacidad</h3>
          <p className="text-sm text-gray-500">Gestiona la seguridad de tu cuenta</p>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Contraseña</h4>
            <p className="text-sm text-gray-500">••••••••</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Modal de Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>

            {message && (
              <div className={`p-3 rounded-lg mb-4 ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ current: '', new: '', confirm: '' });
                  setMessage('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading || !passwordData.new || !passwordData.confirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)' }}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datos Personales */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Descargar mis Datos</h4>
            <p className="text-sm text-gray-500">Obtén una copia de toda tu información personal</p>
          </div>
          <button
            onClick={handleDownloadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4" />
            Descargar
          </button>
        </div>
      </div>

      {/* Zona de Peligro */}
      <div className="p-6 border-2 border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 mb-4">
          <FiAlertTriangle className="w-5 h-5 text-red-600" />
          <h4 className="text-sm font-bold text-red-900">Zona de Peligro</h4>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h5 className="text-sm font-medium text-red-900 mb-1">Eliminar Cuenta</h5>
            <p className="text-sm text-red-700">Esta acción es permanente y no se puede deshacer</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeguridadSection;
