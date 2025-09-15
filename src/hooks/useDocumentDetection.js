import { useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useDocumentDetection() {
  const [detectionState, setDetectionState] = useState('searching'); // 'searching' | 'detected' | 'capturing'
  const [detectionScore, setDetectionScore] = useState(0);
  const detectionTimerRef = useRef(null);
  const captureTimerRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastDetectionRef = useRef(false);
  const consecutiveDetectionsRef = useRef(0);

  // Convertir RGB a HSV para mejor detección de color
  const rgbToHsv = useCallback((r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return {
      h: h * 360, // Hue en grados (0-360)
      s: s * 100, // Saturación en porcentaje (0-100)
      v: v * 100  // Valor en porcentaje (0-100)
    };
  }, []);

  // Detectar si un píxel es verde usando gama amplia
  const isGreenCFE = useCallback((r, g, b) => {
    const hsv = rgbToHsv(r, g, b);

    // Rangos ultra amplios para máxima sensibilidad
    // Hue: 70-170° (gama extra amplia de verdes)
    // Saturación: 15-100% (desde muy poco saturado hasta muy saturado)
    // Valor: 15-100% (desde muy oscuro hasta muy brillante)

    const hueInRange = hsv.h >= 70 && hsv.h <= 170;
    const satInRange = hsv.s >= 15 && hsv.s <= 100;
    const valInRange = hsv.v >= 15 && hsv.v <= 100;
    const isGreenHSV = hueInRange && satInRange && valInRange;

    // Validación RGB relajada: canal verde ligeramente dominante
    const greenDominant = g > r * 1.05 && g > b * 1.05;

    // Evitar falsos positivos en grises/blancos
    const notGrayish = Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10;

    return isGreenHSV && greenDominant && notGrayish;
  }, [rgbToHsv]);

  // Analizar píxeles verdes en el área
  const analyzeGreenPixels = useCallback((imageData) => {
    const { width, height, data } = imageData;
    
    // Definir área del recuadro (centro de la imagen, 80% del ancho/alto)
    const boxX = Math.floor(width * 0.1);
    const boxY = Math.floor(height * 0.15);
    const boxWidth = Math.floor(width * 0.8);
    const boxHeight = Math.floor(height * 0.7);
    
    let totalPixels = 0;
    let greenPixels = 0;
    let edgeContrast = 0;
    
    // Muestrear píxeles en el área del recuadro (cada 5 píxeles para optimizar)
    const sampleStep = 5;
    
    // Análisis del contenido del recuadro
    for (let y = boxY; y < boxY + boxHeight; y += sampleStep) {
      for (let x = boxX; x < boxX + boxWidth; x += sampleStep) {
        const idx = (y * width + x) * 4;
        
        if (idx < data.length - 3) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          totalPixels++;
          
          // Verificar si es verde CFE
          if (isGreenCFE(r, g, b)) {
            greenPixels++;
          }
        }
      }
    }
    
    // Análisis de bordes para detectar forma rectangular
    const edgePixels = [];
    
    // Borde superior
    for (let x = boxX; x < boxX + boxWidth; x += sampleStep) {
      const idx = (boxY * width + x) * 4;
      if (idx < data.length - 3) {
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        edgePixels.push(brightness);
      }
    }
    
    // Calcular contraste en los bordes
    if (edgePixels.length > 1) {
      let contrastSum = 0;
      for (let i = 1; i < edgePixels.length; i++) {
        contrastSum += Math.abs(edgePixels[i] - edgePixels[i - 1]);
      }
      edgeContrast = contrastSum / edgePixels.length;
    }
    
    // Calcular scores
    const greenPercentage = totalPixels > 0 ? (greenPixels / totalPixels) * 100 : 0;
    const contrastScore = Math.min(edgeContrast / 50 * 100, 100); // Normalizar a 0-100
    
    // Score final ponderado mejorado
    // 60% peso al verde (más importante), 25% al contraste, 15% bonus por densidad
    let finalScore = (greenPercentage * 0.6) + (contrastScore * 0.25);

    // Sistema de bonus ultra sensible
    if (greenPercentage > 10) {
      finalScore += 35; // Muy probable que sea CFE
    } else if (greenPercentage > 6) {
      finalScore += 25; // Probable que sea CFE
    } else if (greenPercentage > 3) {
      finalScore += 20; // Posible CFE
    } else if (greenPercentage > 1) {
      finalScore += 15; // Cualquier verde detectado
    }
    
    return {
      score: Math.min(finalScore, 100),
      greenPercentage,
      contrastScore,
      details: {
        greenPixels,
        totalPixels,
        edgeContrast
      }
    };
  }, [isGreenCFE]);

  // Procesar frame del video/cámara
  const processFrame = useCallback((videoRef) => {
    if (!videoRef || !videoRef.current) {
      console.log('❌ processFrame: videoRef no disponible');
      return;
    }

    frameCountRef.current++;

    // Procesar cada 5 frames para optimizar rendimiento
    if (frameCountRef.current % 5 !== 0) return;

    console.log('🎥 processFrame ejecutándose, frame:', frameCountRef.current);
    
    try {
      const video = videoRef.current;
      
      // Para web, necesitamos extraer el frame del video
      if (video.videoWidth && video.videoHeight) {
        console.log('📹 Video dimensiones:', video.videoWidth, 'x', video.videoHeight);

        // Crear canvas temporal para extraer frame
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar frame actual
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obtener datos de imagen
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        console.log('📊 ImageData obtenida:', imageData.width, 'x', imageData.height, 'píxeles');
        
        // Analizar frame
        const analysis = analyzeGreenPixels(imageData);

        // Log completo del análisis
        console.log('🔍 Análisis completo:', {
          score: analysis.score.toFixed(2),
          greenPercentage: analysis.greenPercentage.toFixed(2),
          contrastScore: analysis.contrastScore.toFixed(2),
          greenPixels: analysis.details.greenPixels,
          totalPixels: analysis.details.totalPixels,
          edgeContrast: analysis.details.edgeContrast.toFixed(2)
        });

        setDetectionScore(Math.round(analysis.score));

        // Lógica de detección ultra sensible para captura automática
        const isDetected = analysis.greenPercentage >= 3 && analysis.score >= 8;

        console.log('🎯 Detección:', {
          isDetected,
          greenPercentage: analysis.greenPercentage.toFixed(2),
          score: analysis.score.toFixed(2),
          consecutiveDetections: consecutiveDetectionsRef.current
        });
        
        if (isDetected) {
          consecutiveDetectionsRef.current++;

          console.log('✅ DETECTADO! Consecutivos:', consecutiveDetectionsRef.current);

          // Captura inmediata con 1 sola detección
          if (consecutiveDetectionsRef.current >= 1 && !lastDetectionRef.current) {
            console.log('🎉 CONFIRMANDO DETECCIÓN - Iniciando captura automática');
            // Primera detección confirmada
            setDetectionState('detected');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            lastDetectionRef.current = true;
            
            // Iniciar temporizador de captura automática
            if (captureTimerRef.current) {
              clearTimeout(captureTimerRef.current);
            }
            
            captureTimerRef.current = setTimeout(() => {
              console.log('📸 CAPTURANDO AHORA!');
              setDetectionState('capturing');
              lastDetectionRef.current = false; // Resetear para permitir nueva detección
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 500); // 0.5 segundos de espera - captura rápida

            console.log('⏰ Timer de captura configurado, esperando 0.5 segundos...');
          }
        } else {
          consecutiveDetectionsRef.current = 0;

          if (lastDetectionRef.current) {
            console.log('❌ Perdida de detección - PERO manteniendo timer de captura');
            // Perdimos la detección, pero NO cancelamos el timer
            // El usuario ya vio que se detectó, mantener captura programada
            setDetectionState('detected'); // Mantener estado detected hasta captura

            // NO cancelar captura automática - dejar que complete
            console.log('✅ Timer de captura se mantiene activo a pesar de pérdida temporal');
          }
        }
        
        // Debug info (opcional)
        if (frameCountRef.current % 30 === 0) { // Log cada ~1 segundo
          console.log('Detection analysis:', {
            score: analysis.score.toFixed(2),
            greenPercentage: analysis.greenPercentage.toFixed(2),
            contrastScore: analysis.contrastScore.toFixed(2),
            state: detectionState
          });
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, [analyzeGreenPixels, detectionState]);

  const startDetection = useCallback((videoRef) => {
    // Resetear contadores
    frameCountRef.current = 0;
    consecutiveDetectionsRef.current = 0;
    
    // Iniciar análisis periódico
    detectionTimerRef.current = setInterval(() => {
      processFrame(videoRef);
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
    consecutiveDetectionsRef.current = 0;
  }, []);

  const resetDetection = useCallback(() => {
    stopDetection();
    setDetectionState('searching');
    consecutiveDetectionsRef.current = 0;
  }, [stopDetection]);

  return {
    detectionState,
    detectionScore,
    startDetection,
    stopDetection,
    resetDetection,
    analyzeGreenPixels
  };
}