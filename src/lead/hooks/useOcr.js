import { useState } from 'react';
import { router } from 'expo-router';
import logger, { analyticsLogger } from '../../utils/logger';

// Force reload - v4.0 - logger.log() method added
export function useOcr() {
  const [ocrData, setOcrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReceiptUpload = async (files) => {
    console.log('🔧 [DEBUG] handleReceiptUpload called - Version 3.0 - UPDATED!');

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

    console.log('🔧 Files to process:', files);

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

    console.log('🔧 Setting isLoading to true');
    setIsLoading(true);

    try {
      console.log('🔧 Sending request to webhook...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('🔧 Response received:', response);
      console.log('🔧 response.ok:', response.ok);

      if (response.ok) {
        console.log('🔧 Inside response.ok block');
        // Verificar que hay contenido antes de parsear JSON
        const contentType = response.headers.get('content-type');
        console.log('🔧 contentType:', contentType);

        if (contentType && contentType.includes('application/json')) {
          console.log('🔧 Content type is JSON, reading text...');
          const text = await response.text();
          console.log('🔧 Text received:', text);

          if (text) {
            console.log('🔧 Parsing JSON...');
            const result = JSON.parse(text);
            console.log('🔧 Parsed result:', result);

            setOcrData(result);
            console.log('🔧 About to call logger.log...');
            logger.log('OCR data received:', result);
            console.log('🔧 About to call analyticsLogger.trackEvent...');
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
