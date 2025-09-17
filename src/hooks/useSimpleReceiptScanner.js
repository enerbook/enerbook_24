import { useState, useCallback, useRef, useEffect } from 'react';

export function useSimpleReceiptScanner(currentStep = 'frontal') {
  const [scannerState, setScannerState] = useState('ready');
  const [isGreenDetected, setIsGreenDetected] = useState(false);
  const [greenPercentage, setGreenPercentage] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [captureReady, setCaptureReady] = useState(false);
  const [detectedPageType, setDetectedPageType] = useState(null);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Inicializar canvas oculto para procesamiento
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    contextRef.current = canvas.getContext('2d', { willReadFrequently: true });

    return () => {
      canvasRef.current = null;
      contextRef.current = null;
    };
  }, []);

  const analyzeFrontalCFE = useCallback((imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Zonas específicas para página FRONTAL
    const zones = {
      header: { y: 0, height: Math.floor(height * 0.25) },           // Logo CFE + datos cliente
      appSection: { y: Math.floor(height * 0.25), height: Math.floor(height * 0.35) }, // App verde + consumo
      billingTable: { y: Math.floor(height * 0.6), height: Math.floor(height * 0.4) }  // Tabla costos + códigos
    };

    let totalGreenPixels = 0;
    let totalWhitePixels = 0;
    let totalBlackPixels = 0;
    let totalBrightness = 0;
    let totalPixels = 0;

    const zoneAnalysis = {};

    Object.keys(zones).forEach(zoneName => {
      const zone = zones[zoneName];
      let zoneGreen = 0;
      let zoneWhite = 0;
      let zoneBlack = 0;
      let zonePixels = 0;

      for (let y = zone.y; y < zone.y + zone.height && y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          totalPixels++;
          zonePixels++;

          const pixelBrightness = (r + g + b) / 3;
          totalBrightness += pixelBrightness;

          // Detectar blanco (papel del recibo)
          if (r > 220 && g > 220 && b > 220) {
            totalWhitePixels++;
            zoneWhite++;
          }

          // Detectar negro (texto)
          if (r < 60 && g < 60 && b < 60) {
            totalBlackPixels++;
            zoneBlack++;
          }

          // Detectar verde CFE específico
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;

          let h = 0;
          if (delta !== 0) {
            if (max === r) {
              h = ((g - b) / delta) % 6;
            } else if (max === g) {
              h = (b - r) / delta + 2;
            } else {
              h = (r - g) / delta + 4;
            }
            h = Math.round(h * 60);
            if (h < 0) h += 360;
          }

          const s = max === 0 ? 0 : delta / max;
          const v = max / 255;

          // Verde CFE (120-160 grados)
          if (h >= 120 && h <= 160 && s > 0.25 && v > 0.25) {
            totalGreenPixels++;
            zoneGreen++;
          }
        }
      }

      zoneAnalysis[zoneName] = {
        green: (zoneGreen / zonePixels) * 100,
        white: (zoneWhite / zonePixels) * 100,
        black: (zoneBlack / zonePixels) * 100
      };
    });

    const greenRatio = (totalGreenPixels / totalPixels) * 100;
    const whiteRatio = (totalWhitePixels / totalPixels) * 100;
    const blackRatio = (totalBlackPixels / totalPixels) * 100;
    const avgBrightness = totalBrightness / totalPixels / 255;

    // Validaciones específicas para FRONTAL
    const hasLogoGreen = zoneAnalysis.header.green > 2;           // Logo CFE en header
    const hasAppGreen = zoneAnalysis.appSection.green > 5;       // App section prominente
    const hasBillingGreen = zoneAnalysis.billingTable.green > 3; // Tabla de costos
    const hasWhiteBackground = whiteRatio > 30;                  // Fondo blanco abundante
    const hasTextContent = blackRatio > 4;                       // Texto negro visible
    const goodLighting = avgBrightness > 0.35 && avgBrightness < 0.85;

    const isFrontalValid =
      hasLogoGreen &&
      hasAppGreen &&
      hasBillingGreen &&
      hasWhiteBackground &&
      hasTextContent &&
      goodLighting &&
      greenRatio > 3 && greenRatio < 20; // Verde distribuido pero no excesivo

    return {
      isValid: isFrontalValid,
      pageType: 'frontal',
      greenRatio,
      whiteRatio,
      blackRatio,
      brightness: avgBrightness,
      zones: zoneAnalysis,
      conditions: {
        hasLogoGreen,
        hasAppGreen,
        hasBillingGreen,
        hasWhiteBackground,
        hasTextContent,
        goodLighting
      }
    };
  }, []);

  const analyzePosteriorCFE = useCallback((imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Zonas específicas para página POSTERIOR
    const zones = {
      historySection: { y: 0, height: Math.floor(height * 0.4) },          // Historial + gráfica azul
      energySavingBand: { y: Math.floor(height * 0.4), height: Math.floor(height * 0.3) }, // Franja verde ahorro
      infoSection: { y: Math.floor(height * 0.7), height: Math.floor(height * 0.3) }      // Info + logos CFE
    };

    let totalGreenPixels = 0;
    let totalBluePixels = 0;
    let totalWhitePixels = 0;
    let totalBlackPixels = 0;
    let totalBrightness = 0;
    let totalPixels = 0;

    const zoneAnalysis = {};

    Object.keys(zones).forEach(zoneName => {
      const zone = zones[zoneName];
      let zoneGreen = 0;
      let zoneBlue = 0;
      let zoneWhite = 0;
      let zoneBlack = 0;
      let zonePixels = 0;

      for (let y = zone.y; y < zone.y + zone.height && y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          totalPixels++;
          zonePixels++;

          const pixelBrightness = (r + g + b) / 3;
          totalBrightness += pixelBrightness;

          // Detectar blanco
          if (r > 220 && g > 220 && b > 220) {
            totalWhitePixels++;
            zoneWhite++;
          }

          // Detectar negro
          if (r < 60 && g < 60 && b < 60) {
            totalBlackPixels++;
            zoneBlack++;
          }

          // Convertir a HSV
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;

          let h = 0;
          if (delta !== 0) {
            if (max === r) {
              h = ((g - b) / delta) % 6;
            } else if (max === g) {
              h = (b - r) / delta + 2;
            } else {
              h = (r - g) / delta + 4;
            }
            h = Math.round(h * 60);
            if (h < 0) h += 360;
          }

          const s = max === 0 ? 0 : delta / max;
          const v = max / 255;

          // Verde CFE
          if (h >= 120 && h <= 160 && s > 0.25 && v > 0.25) {
            totalGreenPixels++;
            zoneGreen++;
          }

          // Azul para gráficas históricas
          if (h >= 200 && h <= 260 && s > 0.3 && v > 0.3) {
            totalBluePixels++;
            zoneBlue++;
          }
        }
      }

      zoneAnalysis[zoneName] = {
        green: (zoneGreen / zonePixels) * 100,
        blue: (zoneBlue / zonePixels) * 100,
        white: (zoneWhite / zonePixels) * 100,
        black: (zoneBlack / zonePixels) * 100
      };
    });

    const greenRatio = (totalGreenPixels / totalPixels) * 100;
    const blueRatio = (totalBluePixels / totalPixels) * 100;
    const whiteRatio = (totalWhitePixels / totalPixels) * 100;
    const blackRatio = (totalBlackPixels / totalPixels) * 100;
    const avgBrightness = totalBrightness / totalPixels / 255;

    // Validaciones específicas para POSTERIOR
    const hasBlueChart = zoneAnalysis.historySection.blue > 2;      // Gráfica azul en historial
    const hasGreenBand = zoneAnalysis.energySavingBand.green > 8;   // Franja verde prominente
    const hasGreenLogos = zoneAnalysis.infoSection.green > 2;       // Logos CFE verdes
    const hasWhiteBackground = whiteRatio > 35;                     // Más fondo blanco que frontal
    const hasTextContent = blackRatio > 3;                          // Texto visible
    const goodLighting = avgBrightness > 0.35 && avgBrightness < 0.85;

    const isPosteriorValid =
      hasBlueChart &&
      hasGreenBand &&
      hasGreenLogos &&
      hasWhiteBackground &&
      hasTextContent &&
      goodLighting &&
      greenRatio > 2 && greenRatio < 15 && // Menos verde que frontal
      blueRatio > 1; // Presencia de azul característico

    return {
      isValid: isPosteriorValid,
      pageType: 'posterior',
      greenRatio,
      blueRatio,
      whiteRatio,
      blackRatio,
      brightness: avgBrightness,
      zones: zoneAnalysis,
      conditions: {
        hasBlueChart,
        hasGreenBand,
        hasGreenLogos,
        hasWhiteBackground,
        hasTextContent,
        goodLighting
      }
    };
  }, []);

  const processFrame = useCallback((videoElement) => {
    if (!videoElement || !canvasRef.current || !contextRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    const sampleWidth = 640;
    const sampleHeight = 480;

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    try {
      ctx.drawImage(videoElement, 0, 0, sampleWidth, sampleHeight);

      // Analizar área del marco
      const frameLeft = Math.floor(sampleWidth * 0.075);
      const frameTop = Math.floor(sampleHeight * 0.15);
      const frameWidth = Math.floor(sampleWidth * 0.85);
      const frameHeight = Math.floor(sampleHeight * 0.65);

      const frameData = ctx.getImageData(frameLeft, frameTop, frameWidth, frameHeight);

      // Usar el detector apropiado según la página actual
      const analysis = currentStep === 'frontal'
        ? analyzeFrontalCFE(frameData)
        : analyzePosteriorCFE(frameData);

      // Actualizar estados
      setIsGreenDetected(analysis.isValid);
      setGreenPercentage(analysis.greenRatio);
      setBrightness(analysis.brightness);
      setDetectedPageType(analysis.pageType);

      // Determinar estado del scanner
      if (analysis.isValid) {
        setScannerState('ready_to_capture');
        setCaptureReady(true);
      } else if (analysis.greenRatio > 0.5 || analysis.whiteRatio > 20) {
        setScannerState('detecting');
        setCaptureReady(false);
      } else {
        setScannerState('ready');
        setCaptureReady(false);
      }

      // Log específico por página
      if (analysis.greenRatio > 0.5) {
        console.log(`CFE ${analysis.pageType.toUpperCase()} Analysis:`, {
          green: `${analysis.greenRatio.toFixed(1)}%`,
          blue: analysis.blueRatio ? `${analysis.blueRatio.toFixed(1)}%` : 'N/A',
          white: `${analysis.whiteRatio.toFixed(1)}%`,
          black: `${analysis.blackRatio.toFixed(1)}%`,
          brightness: analysis.brightness.toFixed(2),
          zones: analysis.zones,
          conditions: analysis.conditions,
          valid: analysis.isValid,
          expectedPage: currentStep
        });
      }

    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, [currentStep, analyzeFrontalCFE, analyzePosteriorCFE]);

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
      }, 'image/jpeg', 0.95);
    });
  }, []);

  return {
    scannerState,
    isGreenDetected,
    greenPercentage,
    brightness,
    captureReady,
    detectedPageType,
    processFrame,
    capturePhoto
  };
}