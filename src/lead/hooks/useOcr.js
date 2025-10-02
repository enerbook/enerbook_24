import { useState } from 'react';
import { router } from 'expo-router';
import { logger, analyticsLogger } from '../utils/logger';

export function useOcr() {
  const [ocrData, setOcrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReceiptUpload = async (files) => {
    if (ocrData) {
      // Si ya tenemos datos OCR y temp_lead_id, redirigir con el ID
      if (ocrData.temp_lead_id) {
        router.push(`/lead-panel?temp_lead_id=${ocrData.temp_lead_id}`);
      } else {
        router.push('/lead-panel');
      }
      return;
    }

    const webhookUrl = 'https://services.enerbook.mx/webhook/ocr-input';
    const formData = new FormData();

    files.forEach((file) => {
      if (files.length === 1) {
        formData.append('data-frontal', file);
      } else {
        if (!formData.has('data-frontal')) {
          formData.append('data-frontal', file);
        } else {
          formData.append('data-posterior', file);
        }
      }
    });

    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Verificar que hay contenido antes de parsear JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            const result = JSON.parse(text);
            setOcrData(result);
            logger.log('OCR data received:', result);
            analyticsLogger.trackEvent('OCR_SUCCESS', { hasLeadId: !!result.temp_lead_id });

            // Si el OCR devuelve temp_lead_id, redirigir inmediatamente al dashboard de lead
            if (result.temp_lead_id) {
              logger.log('Redirecting to lead dashboard with ID:', result.temp_lead_id);
              analyticsLogger.trackLeadConversion(result.temp_lead_id, 'receipt_uploaded');
              router.push(`/lead-panel?temp_lead_id=${result.temp_lead_id}`);
            }
          } else {
            logger.error('Empty response from webhook');
            analyticsLogger.trackEvent('OCR_ERROR', { type: 'empty_response' });
            alert('El servidor devolvió una respuesta vacía. Por favor, inténtalo de nuevo.');
          }
        } else {
          logger.error('Response is not JSON:', contentType);
          analyticsLogger.trackEvent('OCR_ERROR', { type: 'invalid_content_type', contentType });
          alert('Error en el formato de respuesta del servidor. Por favor, contacta al administrador.');
        }
      } else {
        const errorText = await response.text();
        logger.error('Failed to process files:', errorText);
        analyticsLogger.trackEvent('OCR_ERROR', { type: 'server_error', status: response.status });
        alert('Error al procesar el recibo. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      logger.error('Error uploading files:', error);
      analyticsLogger.trackError(error, { context: 'OCR upload' });
      alert('Ocurrió un error de red. Por favor, verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ocrData,
    isLoading,
    setOcrData,
    handleReceiptUpload,
  };
}
