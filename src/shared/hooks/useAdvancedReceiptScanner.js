import { useCallback } from 'react';
import { CAMERA_CONFIG } from '../config/constants';

export function useAdvancedReceiptScanner() {
  // Solo función de captura - sin estados innecesarios
  const capturePhoto = useCallback(async (videoElement) => {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, CAMERA_CONFIG.mimeType, CAMERA_CONFIG.jpegQuality);
    });
  }, []);

  return {
    capturePhoto
  };
}