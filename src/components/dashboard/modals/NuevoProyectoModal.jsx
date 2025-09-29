import React, { useState } from 'react';
import { authService } from '../../../services';

const NuevoProyectoModal = ({ isOpen, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Validate total number of files (max 2)
    if (files.length + selectedFiles.length > 2) {
      setError('Máximo 2 archivos permitidos');
      return;
    }

    // Validate each file
    for (const file of selectedFiles) {
      // Validate file type (images and PDFs)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Por favor selecciona archivos válidos (JPG, PNG, WebP o PDF)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Archivo demasiado grande. Máximo 10MB por archivo.');
        return;
      }
    }

    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Por favor selecciona al menos un archivo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Check if N8N webhook URL is configured
      if (!process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL) {
        throw new Error('URL del webhook N8N no configurada. Contacta al administrador.');
      }

      // Create FormData for normal file upload
      const formData = new FormData();

      // Append files with correct names
      if (files.length >= 1) {
        formData.append('data-frontal', files[0]);
      }
      if (files.length >= 2) {
        formData.append('data-posterior', files[1]);
      }

      // Append metadata in multiple formats to ensure N8N receives it
      formData.append('user_id', user.id);
      formData.append('userId', user.id);
      formData.append('usuario_id', user.id);
      formData.append('file_count', files.length.toString());

      // Debug FormData contents
      console.log('=== DEBUG FORMDATA ===');
      console.log('User from Supabase:', user);
      console.log('User ID being sent:', user.id);
      console.log('File count:', files.length);

      // Log all FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }

      // Send to N8N webhook - also add user_id as query parameter
      const webhookUrl = `${process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL}/ocr-nuevo-proyecto?user_id=${encodeURIComponent(user.id)}`;
      console.log('Sending to webhook URL:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText);
        throw new Error('El servidor no devolvió una respuesta JSON válida. Verifica la configuración del webhook N8N.');
      }

      const result = await response.json();
      console.log('N8N response:', result);

      if (result.success) {
        onSuccess();
      } else {
        throw new Error(result.error || 'Error desconocido en el procesamiento');
      }

    } catch (error) {
      console.error('Error processing receipt:', error);
      setError(error.message || 'Error al procesar el recibo. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nuevo Proyecto</h3>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir Recibo CFE
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Sube hasta 2 fotos o PDFs de tu recibo de CFE para crear automáticamente un nuevo proyecto con análisis de consumo y dimensionamiento solar.
              </p>

              <div className="relative">
                <input
                  type="file"
                  id="receipt-upload"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading || files.length >= 2}
                  multiple
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading || files.length >= 2
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">
                      {files.length >= 2 ? 'Máximo 2 archivos' : 'JPG, PNG, WebP o PDF (máx. 10MB c/u)'}
                    </p>
                    {files.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        {files.length}/2 archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-green-700 font-medium">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={files.length === 0 || uploading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: files.length === 0 || uploading
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)'
                }}
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Crear Proyecto'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevoProyectoModal;