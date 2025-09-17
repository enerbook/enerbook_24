import { useState, useCallback, useRef, useEffect } from 'react';

export function useAdvancedReceiptScanner(currentStep = 'frontal') {
  const [scannerState, setScannerState] = useState('ready');
  const [isGreenDetected, setIsGreenDetected] = useState(false);
  const [greenPercentage, setGreenPercentage] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [captureReady, setCaptureReady] = useState(false);
  const [detectedPageType, setDetectedPageType] = useState(null);
  const [autoDetectedPage, setAutoDetectedPage] = useState(null);
  const [failedConditions, setFailedConditions] = useState([]);
  const [allowManualCapture, setAllowManualCapture] = useState(false);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

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
      header: { y: 0, height: Math.floor(height * 0.25) },
      appSection: { y: Math.floor(height * 0.25), height: Math.floor(height * 0.35) },
      billingTable: { y: Math.floor(height * 0.6), height: Math.floor(height * 0.4) }
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

          if (r > 210 && g > 210 && b > 210) {
            totalWhitePixels++;
            zoneWhite++;
          }

          if (r < 70 && g < 70 && b < 70) {
            totalBlackPixels++;
            zoneBlack++;
          }

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

          // Verde CFE más permisivo
          if (h >= 100 && h <= 170 && s > 0.2 && v > 0.2) {
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

    // Umbrales relajados para FRONTAL
    const hasLogoGreen = zoneAnalysis.header.green > 0.8;      // Más permisivo
    const hasAppGreen = zoneAnalysis.appSection.green > 2;     // Más permisivo
    const hasBillingGreen = zoneAnalysis.billingTable.green > 1; // Más permisivo
    const hasWhiteBackground = whiteRatio > 20;                // Más permisivo
    const hasTextContent = blackRatio > 2;                     // Más permisivo
    const goodLighting = avgBrightness > 0.25 && avgBrightness < 0.9; // Más permisivo

    // Condiciones con feedback
    const conditions = {
      hasLogoGreen: { passed: hasLogoGreen, value: zoneAnalysis.header.green, required: '>0.8%' },
      hasAppGreen: { passed: hasAppGreen, value: zoneAnalysis.appSection.green, required: '>2%' },
      hasBillingGreen: { passed: hasBillingGreen, value: zoneAnalysis.billingTable.green, required: '>1%' },
      hasWhiteBackground: { passed: hasWhiteBackground, value: whiteRatio, required: '>20%' },
      hasTextContent: { passed: hasTextContent, value: blackRatio, required: '>2%' },
      goodLighting: { passed: goodLighting, value: avgBrightness, required: '0.25-0.9' },
      greenRange: { passed: greenRatio > 1.5 && greenRatio < 25, value: greenRatio, required: '1.5-25%' }
    };

    const isFrontalValid =
      hasLogoGreen &&
      hasAppGreen &&
      hasBillingGreen &&
      hasWhiteBackground &&
      hasTextContent &&
      goodLighting &&
      greenRatio > 1.5 && greenRatio < 25;

    // Calcular confianza de detección
    const frontalConfidence = [
      hasLogoGreen ? 15 : 0,
      hasAppGreen ? 25 : 0,      // Mayor peso para app section
      hasBillingGreen ? 15 : 0,
      hasWhiteBackground ? 20 : 0,
      hasTextContent ? 10 : 0,
      goodLighting ? 15 : 0
    ].reduce((a, b) => a + b, 0);

    return {
      isValid: isFrontalValid,
      pageType: 'frontal',
      confidence: frontalConfidence,
      greenRatio,
      whiteRatio,
      blackRatio,
      brightness: avgBrightness,
      zones: zoneAnalysis,
      conditions
    };
  }, []);

  const analyzePosteriorCFE = useCallback((imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const zones = {
      // Tabla de consumo horizontal acostada (parte superior del recibo)
      consumptionTable: {
        x: Math.floor(width * 0.07),
        y: Math.floor(height * 0.15),  // Más arriba - donde realmente está la tabla
        width: Math.floor(width * 0.60),  // Rectángulo horizontal acostado
        height: Math.floor(height * 0.25) // Altura ajustada para la tabla real
      },
      // Franja verde de ahorro (debajo de la tabla)
      energySavingBand: {
        x: Math.floor(width * 0.07),
        y: Math.floor(height * 0.45),
        width: Math.floor(width * 0.60),
        height: Math.floor(height * 0.15)
      },
      historySection: { y: 0, height: Math.floor(height * 0.4) },
      infoSection: { y: Math.floor(height * 0.65), height: Math.floor(height * 0.35) }
    };

    let totalGreenPixels = 0;
    let totalBluePixels = 0;
    let totalGrayPixels = 0;
    let totalWhitePixels = 0;
    let totalBlackPixels = 0;
    let totalBrightness = 0;
    let totalPixels = 0;
    let chartPixels = 0; // Para cualquier gráfica (azul, gris, etc.)

    const zoneAnalysis = {};

    Object.keys(zones).forEach(zoneName => {
      const zone = zones[zoneName];
      let zoneGreen = 0;
      let zoneBlue = 0;
      let zoneGray = 0;
      let zoneChart = 0;
      let zoneWhite = 0;
      let zoneBlack = 0;
      let zonePixels = 0;
      let zoneTableStructure = 0; // Para detectar estructura tabular

      // Manejar zona con coordenadas específicas (tabla de consumo)
      const startX = zone.x || 0;
      const startY = zone.y || 0;
      const zoneWidth = zone.width || width;
      const zoneHeight = zone.height || zone.height;

      for (let y = startY; y < startY + zoneHeight && y < height; y += 2) {
        for (let x = startX; x < startX + zoneWidth && x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          totalPixels++;
          zonePixels++;

          const pixelBrightness = (r + g + b) / 3;
          totalBrightness += pixelBrightness;

          if (r > 210 && g > 210 && b > 210) {
            totalWhitePixels++;
            zoneWhite++;
          }

          if (r < 70 && g < 70 && b < 70) {
            totalBlackPixels++;
            zoneBlack++;
          }

          // Detectar gris (para gráficas grises)
          const rgbDiff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
          if (rgbDiff < 30 && pixelBrightness > 80 && pixelBrightness < 180) {
            totalGrayPixels++;
            zoneGray++;
          }

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
          if (h >= 100 && h <= 170 && s > 0.2 && v > 0.2) {
            totalGreenPixels++;
            zoneGreen++;
          }

          // Azul (para recibos digitales)
          if (h >= 180 && h <= 280 && s > 0.2 && v > 0.2) {
            totalBluePixels++;
            zoneBlue++;
          }

          // Detectar cualquier gráfica (azul, gris, o datos estructurados)
          const isChartPixel = (
            // Azul de gráficas digitales
            (h >= 180 && h <= 280 && s > 0.2 && v > 0.2) ||
            // Gris de gráficas físicas
            (rgbDiff < 30 && pixelBrightness > 80 && pixelBrightness < 180) ||
            // Datos tabulares oscuros
            (pixelBrightness > 50 && pixelBrightness < 150 && s < 0.3)
          );

          if (isChartPixel) {
            chartPixels++;
            zoneChart++;
          }

          // Detectar estructura tabular específica para tabla de consumo
          if (zoneName === 'consumptionTable') {
            const relativeX = x - startX;
            const relativeY = y - startY;

            const isTableStructure = (
              // Headers de tabla (primera zona, texto más denso)
              (relativeY < zoneHeight * 0.15 && r < 80 && g < 80 && b < 80) ||
              // Líneas horizontales de separación entre filas
              (pixelBrightness < 90 && relativeY % 20 < 2) ||
              // Líneas verticales de separación entre columnas (Período, kWh, Importe, etc.)
              (pixelBrightness < 90 && (relativeX % 100 < 3 || relativeX % 200 < 3)) ||
              // Texto de datos (números y texto)
              (r < 85 && g < 85 && b < 85 && rgbDiff < 15) ||
              // Bordes y estructura general
              (rgbDiff < 12 && pixelBrightness > 30 && pixelBrightness < 95)
            );

            if (isTableStructure) {
              zoneTableStructure++;
            }
          }
        }
      }

      zoneAnalysis[zoneName] = {
        green: (zoneGreen / zonePixels) * 100,
        blue: (zoneBlue / zonePixels) * 100,
        gray: (zoneGray / zonePixels) * 100,
        chart: (zoneChart / zonePixels) * 100,
        white: (zoneWhite / zonePixels) * 100,
        black: (zoneBlack / zonePixels) * 100,
        tableStructure: zoneName === 'consumptionTable' ? (zoneTableStructure / zonePixels) * 100 : 0
      };
    });

    const greenRatio = (totalGreenPixels / totalPixels) * 100;
    const blueRatio = (totalBluePixels / totalPixels) * 100;
    const grayRatio = (totalGrayPixels / totalPixels) * 100;
    const chartRatio = (chartPixels / totalPixels) * 100;
    const whiteRatio = (totalWhitePixels / totalPixels) * 100;
    const blackRatio = (totalBlackPixels / totalPixels) * 100;
    const avgBrightness = totalBrightness / totalPixels / 255;

    // Validaciones ajustadas para recibos físicos reales
    const hasConsumptionTable = zoneAnalysis.consumptionTable.tableStructure > 1.5; // Más permisivo
    const tableHasContent = zoneAnalysis.consumptionTable.black > 4;               // Reducido de 6 a 4
    const tableWellPositioned = zoneAnalysis.consumptionTable.white > 12;          // Reducido de 35 a 12
    const hasHistoryChart = zoneAnalysis.historySection.chart > 1.5;               // Más permisivo
    const hasGreenBand = zoneAnalysis.energySavingBand.green > 1.5;                // Más permisivo
    // Removido: hasGreenLogos - no hay logos CFE en página posterior
    const hasWhiteBackground = whiteRatio > 18;                                    // Reducido de 25 a 18
    const hasTextContent = blackRatio > 1.2;                                       // Reducido de 1.5 a 1.2
    const goodLighting = avgBrightness > 0.2 && avgBrightness < 0.95;             // Más permisivo

    // Características distintivas de la posterior vs frontal
    const lessGreenThanFrontal = greenRatio < 15;                   // Menos verde que frontal
    const hasStructuredData = chartRatio > 1.5 || grayRatio > 3;   // Datos estructurados
    const isNotFrontalPattern = zoneAnalysis.historySection.green < 5; // No es patrón frontal

    const conditions = {
      hasConsumptionTable: { passed: hasConsumptionTable, value: zoneAnalysis.consumptionTable.tableStructure, required: '>1.5%' },
      tableHasContent: { passed: tableHasContent, value: zoneAnalysis.consumptionTable.black, required: '>4%' },
      tableWellPositioned: { passed: tableWellPositioned, value: zoneAnalysis.consumptionTable.white, required: '>12%' },
      hasHistoryChart: { passed: hasHistoryChart, value: zoneAnalysis.historySection.chart, required: '>1.5%' },
      hasGreenBand: { passed: hasGreenBand, value: zoneAnalysis.energySavingBand.green, required: '>1.5%' },
      hasWhiteBackground: { passed: hasWhiteBackground, value: whiteRatio, required: '>18%' },
      hasTextContent: { passed: hasTextContent, value: blackRatio, required: '>1.2%' },
      goodLighting: { passed: goodLighting, value: avgBrightness, required: '0.2-0.95' },
      lessGreenThanFrontal: { passed: lessGreenThanFrontal, value: greenRatio, required: '<15%' },
      hasStructuredData: { passed: hasStructuredData, value: chartRatio, required: '>1.5%' },
      isNotFrontalPattern: { passed: isNotFrontalPattern, value: zoneAnalysis.historySection.green, required: '<5%' }
    };

    const isPosteriorValid =
      hasConsumptionTable &&    // Tabla de consumo detectada
      tableHasContent &&        // Tabla tiene contenido visible
      tableWellPositioned &&    // Tabla bien enmarcada
      hasHistoryChart &&        // Gráfica en zona superior (azul O gris)
      hasGreenBand &&          // Franja verde de ahorro
      hasWhiteBackground &&    // Fondo blanco abundante
      hasTextContent &&        // Texto visible
      goodLighting &&          // Buena iluminación
      lessGreenThanFrontal &&  // Menos verde que frontal
      isNotFrontalPattern;     // No es patrón de frontal

    // Calcular confianza con énfasis en tabla de consumo
    const posteriorConfidence = [
      hasConsumptionTable ? 35 : 0,   // Tabla de consumo (mayor peso)
      tableHasContent ? 25 : 0,       // Contenido en tabla
      tableWellPositioned ? 20 : 0,   // Tabla bien posicionada
      hasHistoryChart ? 15 : 0,       // Gráfica (cualquier color)
      hasGreenBand ? 25 : 0,          // Franja verde (característica única)
      hasWhiteBackground ? 10 : 0,    // Fondo blanco
      hasTextContent ? 5 : 0,         // Texto
      goodLighting ? 10 : 0,          // Iluminación
      isNotFrontalPattern ? 15 : 0    // NO es frontal (discriminativo)
    ].reduce((a, b) => a + b, 0);

    return {
      isValid: isPosteriorValid,
      pageType: 'posterior',
      confidence: posteriorConfidence,
      greenRatio,
      blueRatio,
      grayRatio,
      chartRatio,
      whiteRatio,
      blackRatio,
      brightness: avgBrightness,
      zones: zoneAnalysis,
      conditions
    };
  }, []);

  const autoDetectPage = useCallback((imageData) => {
    const frontalAnalysis = analyzeFrontalCFE(imageData);
    const posteriorAnalysis = analyzePosteriorCFE(imageData);

    // Auto-detectar página basado en confianza
    if (frontalAnalysis.confidence > posteriorAnalysis.confidence) {
      return { detectedPage: 'frontal', confidence: frontalAnalysis.confidence, analysis: frontalAnalysis };
    } else {
      return { detectedPage: 'posterior', confidence: posteriorAnalysis.confidence, analysis: posteriorAnalysis };
    }
  }, [analyzeFrontalCFE, analyzePosteriorCFE]);

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

      const frameLeft = Math.floor(sampleWidth * 0.05);
      const frameTop = Math.floor(sampleHeight * 0.30);
      const frameWidth = Math.floor(sampleWidth * 0.90);
      const frameHeight = Math.floor(sampleHeight * 0.40);

      const frameData = ctx.getImageData(frameLeft, frameTop, frameWidth, frameHeight);

      // Auto-detectar página
      const autoDetection = autoDetectPage(frameData);
      setAutoDetectedPage(autoDetection.detectedPage);

      // Usar análisis específico para la página esperada
      const targetAnalysis = currentStep === 'frontal'
        ? analyzeFrontalCFE(frameData)
        : analyzePosteriorCFE(frameData);

      // Extraer condiciones fallidas
      const failed = Object.entries(targetAnalysis.conditions)
        .filter(([_, condition]) => !condition.passed)
        .map(([name, condition]) => ({
          name,
          value: condition.value,
          required: condition.required
        }));

      setFailedConditions(failed);

      // Estados principales
      setDetectedPageType(autoDetection.detectedPage);
      setGreenPercentage(targetAnalysis.greenRatio);
      setBrightness(targetAnalysis.brightness);

      // Lógica de validación mejorada
      const isPageCorrect = autoDetection.detectedPage === currentStep;
      const isValidForPage = targetAnalysis.isValid;
      const hasMinimumContent = targetAnalysis.greenRatio > 0.5 && targetAnalysis.whiteRatio > 15;

      // Permitir captura manual si hay contenido mínimo
      setAllowManualCapture(hasMinimumContent);

      if (isPageCorrect && isValidForPage) {
        // Página correcta y válida
        setIsGreenDetected(true);
        setScannerState('ready_to_capture');
        setCaptureReady(true);
      } else if (hasMinimumContent) {
        // Hay contenido pero no perfecto
        setIsGreenDetected(isPageCorrect);
        setScannerState('detecting');
        setCaptureReady(false);
      } else {
        // No hay suficiente contenido
        setIsGreenDetected(false);
        setScannerState('ready');
        setCaptureReady(false);
      }

      // Log mejorado
      if (targetAnalysis.greenRatio > 0.5) {
        console.log(`CFE Scanner:`, {
          expectedPage: currentStep,
          detectedPage: autoDetection.detectedPage,
          confidence: autoDetection.confidence,
          pageMatch: isPageCorrect,
          valid: isValidForPage,
          allowManual: hasMinimumContent,
          failedConditions: failed.length,
          analysis: targetAnalysis
        });
      }

    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, [currentStep, autoDetectPage, analyzeFrontalCFE, analyzePosteriorCFE]);

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
    autoDetectedPage,
    failedConditions,
    allowManualCapture,
    processFrame,
    capturePhoto
  };
}