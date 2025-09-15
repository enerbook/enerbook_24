import { useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useDocumentDetection() {
  const [detectionState, setDetectionState] = useState('searching'); // 'searching' | 'detected' | 'capturing'
  const [detectionScore, setDetectionScore] = useState(0);
  const detectionTimerRef = useRef(null);
  const captureTimerRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastDetectionRef = useRef(false);

  const analyzeFrame = useCallback((imageData) => {
    const { width, height, data } = imageData;
    
    // Definir área del recuadro (centro de la imagen, 80% del ancho/alto)
    const boxX = width * 0.1;
    const boxY = height * 0.15;
    const boxWidth = width * 0.8;
    const boxHeight = height * 0.7;
    
    // Analizar bordes del recuadro
    let edgePixels = 0;
    let highContrastPixels = 0;
    
    // Muestrear píxeles en los bordes del recuadro
    const sampleStep = 5; // Muestrear cada 5 píxeles para optimizar
    
    // Bordes horizontales
    for (let x = boxX; x < boxX + boxWidth; x += sampleStep) {
      // Borde superior
      checkEdgeContrast(data, x, boxY, width);
      // Borde inferior
      checkEdgeContrast(data, x, boxY + boxHeight, width);
    }
    
    // Bordes verticales
    for (let y = boxY; y < boxY + boxHeight; y += sampleStep) {
      // Borde izquierdo
      checkEdgeContrast(data, boxX, y, width);
      // Borde derecho
      checkEdgeContrast(data, boxX + boxWidth, y, width);
    }
    
    function checkEdgeContrast(data, x, y, width) {
      const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
      
      // Convertir a escala de grises
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Verificar píxeles adyacentes para detectar bordes
      const idxNext = idx + 4;
      if (idxNext < data.length) {
        const grayNext = (data[idxNext] + data[idxNext + 1] + data[idxNext + 2]) / 3;
        const contrast = Math.abs(gray - grayNext);
        
        edgePixels++;
        if (contrast > 50) { // Umbral de contraste
          highContrastPixels++;
        }
      }
    }
    
    // Calcular score de detección (0-100)
    const score = edgePixels > 0 ? (highContrastPixels / edgePixels) * 100 : 0;
    return score;
  }, []);

  const processFrame = useCallback((cameraRef) => {
    if (!cameraRef || !cameraRef.current) return;
    
    frameCountRef.current++;
    
    // Procesar cada 5 frames para optimizar rendimiento
    if (frameCountRef.current % 5 !== 0) return;
    
    try {
      // Simular análisis de frame (en producción, esto vendría del canvas)
      // Por ahora, usamos un score simulado basado en tiempo
      const simulatedScore = Math.random() * 100;
      
      setDetectionScore(simulatedScore);
      
      // Umbral de detección: score > 70
      const isDetected = simulatedScore > 70;
      
      if (isDetected && !lastDetectionRef.current) {
        // Primera detección
        setDetectionState('detected');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        lastDetectionRef.current = true;
        
        // Iniciar temporizador de captura automática
        captureTimerRef.current = setTimeout(() => {
          setDetectionState('capturing');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000); // 2 segundos de espera
        
      } else if (!isDetected && lastDetectionRef.current) {
        // Perdimos la detección
        setDetectionState('searching');
        lastDetectionRef.current = false;
        
        // Cancelar captura automática
        if (captureTimerRef.current) {
          clearTimeout(captureTimerRef.current);
          captureTimerRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, []);

  const startDetection = useCallback((cameraRef) => {
    // Iniciar análisis periódico
    detectionTimerRef.current = setInterval(() => {
      processFrame(cameraRef);
    }, 200); // Cada 200ms
  }, [processFrame]);

  const stopDetection = useCallback(() => {
    // Limpiar temporizadores
    if (detectionTimerRef.current) {
      clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    
    if (captureTimerRef.current) {
      clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    
    // Resetear estado
    setDetectionState('searching');
    setDetectionScore(0);
    frameCountRef.current = 0;
    lastDetectionRef.current = false;
  }, []);

  const resetDetection = useCallback(() => {
    stopDetection();
    setDetectionState('searching');
  }, [stopDetection]);

  return {
    detectionState,
    detectionScore,
    startDetection,
    stopDetection,
    resetDetection,
    analyzeFrame
  };
}