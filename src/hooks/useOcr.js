import { useState } from 'react';
import { router } from 'expo-router';

export function useOcr() {
  const [ocrData, setOcrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReceiptUpload = async (files) => {
    if (ocrData) {
      router.push('/dashboard');
      return;
    }

    const webhookUrl = 'https://n8n.varac.io/webhook/ocr-input';
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
        const result = await response.json();
        setOcrData(result);
        console.log('OCR data received:', result);
      } else {
        console.error('Failed to process files:', await response.text());
        alert('Error al procesar el recibo. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
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
