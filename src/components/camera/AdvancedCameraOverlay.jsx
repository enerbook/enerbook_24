import React from 'react';

export default function AdvancedCameraOverlay({
  scannerState,
  isGreenDetected,
  greenPercentage,
  brightness,
  captureReady,
  autoCaptureCoundtown,
  currentStep,
  detectedPageType,
  autoDetectedPage,
  failedConditions,
  allowManualCapture
}) {

  const getInstructionText = () => {
    const pageText = currentStep === 'frontal' ? 'FRONTAL' : 'POSTERIOR';

    if (captureReady) {
      return currentStep === 'posterior'
        ? '¡Perfecto! Tabla de consumo centrada y lista'
        : `¡Perfecto! Página ${pageText} lista para capturar`;
    }

    if (autoDetectedPage && autoDetectedPage !== currentStep) {
      return `🔄 Voltea el recibo - Necesitas página ${pageText}`;
    }

    if (allowManualCapture && !captureReady) {
      return currentStep === 'posterior'
        ? '✋ Captura manual disponible - Centra la tabla de consumo'
        : `✋ Captura manual disponible - Página ${pageText}`;
    }

    if (greenPercentage > 0 && greenPercentage < 1.5) {
      return currentStep === 'posterior'
        ? '📏 Centra la tabla de consumo en el marco superior izquierdo'
        : `📏 Muestra toda la página ${pageText} en el marco`;
    }

    if (greenPercentage > 25) {
      return '📱 Aleja un poco el recibo';
    }

    if (scannerState === 'detecting') {
      return currentStep === 'posterior'
        ? '🔍 Detectando tabla de consumo...'
        : `🔍 Detectando página ${pageText}...`;
    }

    return currentStep === 'posterior'
      ? '📊 Enfoca la tabla de consumo (esquina superior izquierda)'
      : `📄 Coloca la página ${pageText} del recibo CFE`;
  };

  const getFrameColor = () => {
    if (captureReady) return '#10B981';
    if (autoDetectedPage && autoDetectedPage !== currentStep) return '#EF4444';
    if (allowManualCapture) return '#F59E0B';
    if (isGreenDetected) return '#F59E0B';
    return 'rgba(255, 255, 255, 0.5)';
  };

  const getInstructionColor = () => {
    if (captureReady) return '#10B981';
    if (autoDetectedPage && autoDetectedPage !== currentStep) return '#EF4444';
    if (allowManualCapture) return '#F59E0B';
    return 'rgba(255, 255, 255, 0.9)';
  };

  return (
    <>
      {/* Marco de guía horizontal */}
      <div style={styles.frameGuide}>
        {/* Esquinas del marco */}
        <div style={{ ...styles.corner, ...styles.cornerTopLeft, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerTopRight, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerBottomLeft, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerBottomRight, borderColor: getFrameColor() }} />

        {/* Bordes punteados */}
        <div style={{ ...styles.borderGuide, ...styles.borderTop, borderColor: getFrameColor() }} />
        <div style={{ ...styles.borderGuide, ...styles.borderBottom, borderColor: getFrameColor() }} />
        <div style={{ ...styles.borderGuide, ...styles.borderLeft, borderColor: getFrameColor() }} />
        <div style={{ ...styles.borderGuide, ...styles.borderRight, borderColor: getFrameColor() }} />
      </div>

      {/* Marco específico para tabla de consumo (solo posterior) */}
      {currentStep === 'posterior' && (
        <div style={styles.tableGuide}>
          <div style={{ ...styles.tableFrame, borderColor: getFrameColor() }}>
            <div style={styles.tableLabel}>
              <span style={styles.tableLabelText}>TABLA DE CONSUMO</span>
            </div>
          </div>
        </div>
      )}

      {/* Área oscura fuera del marco */}
      <div style={styles.outerDarkness}>
        <svg style={styles.svg}>
          <defs>
            <mask id="holeMask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x="5%"
                y="30%"
                width="90%"
                height="40%"
                rx="10"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#holeMask)"
          />
        </svg>
      </div>

      {/* Instrucciones superiores */}
      <div style={styles.instructionsContainer}>
        <div style={{
          ...styles.instructionBadge,
          backgroundColor: captureReady ? '#10B981' :
                          autoDetectedPage !== currentStep ? '#EF4444' :
                          allowManualCapture ? '#F59E0B' : 'rgba(0, 0, 0, 0.7)'
        }}>
          <p style={{ ...styles.instructionText, color: 'white' }}>
            {getInstructionText()}
          </p>
        </div>
      </div>

      {/* Panel de indicadores avanzado */}
      <div style={styles.indicatorsPanel}>
        {/* Estado de página */}
        <div style={styles.mainIndicator}>
          <div style={styles.pageStatus}>
            <span style={styles.expectedPage}>
              Necesita: {currentStep.toUpperCase()}
            </span>
            <span style={styles.detectedPage}>
              Detectada: {autoDetectedPage ? autoDetectedPage.toUpperCase() : 'Ninguna'}
            </span>
          </div>
          <div style={styles.statusIcon}>
            {captureReady ? '✅' :
             autoDetectedPage === currentStep ? '🔍' :
             autoDetectedPage && autoDetectedPage !== currentStep ? '🔄' : '❌'}
          </div>
        </div>

        {/* Indicadores de calidad */}
        <div style={styles.qualityGrid}>
          <div style={styles.qualityItem}>
            <span style={styles.qualityLabel}>Iluminación</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${brightness * 100}%`,
                  backgroundColor: brightness > 0.3 && brightness < 0.85 ? '#10B981' : '#EF4444'
                }}
              />
            </div>
          </div>

          <div style={styles.qualityItem}>
            <span style={styles.qualityLabel}>Contenido</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(greenPercentage * 4, 100)}%`,
                  backgroundColor: greenPercentage > 1 ? '#10B981' : '#EF4444'
                }}
              />
            </div>
          </div>
        </div>

        {/* Condiciones fallidas */}
        {failedConditions.length > 0 && !captureReady && (
          <div style={styles.diagnostics}>
            <div style={styles.diagnosticsHeader}>
              <span style={styles.diagnosticsTitle}>⚠️ Necesita mejorar:</span>
            </div>
            <div style={styles.diagnosticsList}>
              {failedConditions.slice(0, 3).map((condition, index) => (
                <div key={index} style={styles.diagnosticItem}>
                  <span style={styles.conditionName}>
                    {getConditionDisplayName(condition.name)}
                  </span>
                  <span style={styles.conditionValue}>
                    {formatConditionValue(condition.value)} / {condition.required}
                  </span>
                </div>
              ))}
              {failedConditions.length > 3 && (
                <div style={styles.moreConditions}>
                  +{failedConditions.length - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicador de captura manual */}
        {allowManualCapture && !captureReady && (
          <div style={styles.manualCaptureHint}>
            <span style={styles.manualIcon}>✋</span>
            <span>Captura manual disponible</span>
          </div>
        )}
      </div>

      {/* Contador de auto-captura */}
      {autoCaptureCoundtown !== null && autoCaptureCoundtown > 0 && (
        <div style={styles.countdownOverlay}>
          <div style={styles.countdownCircle}>
            <span style={styles.countdownNumber}>{autoCaptureCoundtown}</span>
          </div>
          <span style={styles.countdownText}>Capturando automáticamente...</span>
        </div>
      )}
    </>
  );
}

// Funciones auxiliares para mostrar condiciones
function getConditionDisplayName(conditionName) {
  const displayNames = {
    hasLogoGreen: 'Logo CFE',
    hasAppGreen: 'Gráfico app',
    hasBillingGreen: 'Tabla costos',
    hasBlueChart: 'Gráfica azul',
    hasHistoryChart: 'Gráfica historial',
    hasGreenBand: 'Franja verde',
    hasGreenLogos: 'Logos CFE',
    hasWhiteBackground: 'Fondo blanco',
    hasTextContent: 'Texto visible',
    goodLighting: 'Iluminación',
    greenRange: 'Verde total',
    bluePresent: 'Azul presente',
    lessGreenThanFrontal: 'Menos verde',
    hasStructuredData: 'Datos estructurados',
    isNotFrontalPattern: 'No es frontal',
    hasConsumptionTable: 'Tabla consumo',
    tableHasContent: 'Contenido tabla',
    tableWellPositioned: 'Tabla centrada',
    hasPersonalInfoTable: 'Tabla personal',
    personalTableHasContent: 'Contenido personal',
    personalTableWellFramed: 'Tabla personal centrada'
  };
  return displayNames[conditionName] || conditionName;
}

function formatConditionValue(value) {
  if (typeof value === 'number') {
    return value < 1 ? value.toFixed(2) : value.toFixed(1);
  }
  return value;
}

const styles = {
  frameGuide: {
    position: 'absolute',
    top: '30%',
    left: '5%',
    width: '90%',
    height: '40%',
    pointerEvents: 'none',
    zIndex: 20,
  },
  corner: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    borderStyle: 'solid',
    borderWidth: '3px',
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: '3px',
    borderLeftWidth: '3px',
    borderTopLeftRadius: '10px',
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: '3px',
    borderRightWidth: '3px',
    borderTopRightRadius: '10px',
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: '3px',
    borderLeftWidth: '3px',
    borderBottomLeftRadius: '10px',
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: '3px',
    borderRightWidth: '3px',
    borderBottomRightRadius: '10px',
  },
  borderGuide: {
    position: 'absolute',
    borderStyle: 'dashed',
    borderWidth: '1px',
    opacity: 0.4,
  },
  borderTop: {
    top: 0,
    left: '50px',
    right: '50px',
    height: 0,
    borderBottomWidth: 0,
  },
  borderBottom: {
    bottom: 0,
    left: '50px',
    right: '50px',
    height: 0,
    borderTopWidth: 0,
  },
  borderLeft: {
    left: 0,
    top: '50px',
    bottom: '50px',
    width: 0,
    borderRightWidth: 0,
  },
  borderRight: {
    right: 0,
    top: '50px',
    bottom: '50px',
    width: 0,
    borderLeftWidth: 0,
  },
  outerDarkness: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 15,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  instructionsContainer: {
    position: 'absolute',
    top: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 25,
  },
  instructionBadge: {
    padding: '12px 24px',
    borderRadius: '25px',
    backdropFilter: 'blur(10px)',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  instructionText: {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
  },
  indicatorsPanel: {
    position: 'absolute',
    bottom: '140px',
    left: '15px',
    right: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '15px',
    padding: '15px',
    backdropFilter: 'blur(10px)',
    zIndex: 25,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  mainIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
  },
  pageStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  expectedPage: {
    color: '#F59E0B',
    fontSize: '14px',
    fontWeight: '600',
  },
  detectedPage: {
    color: '#10B981',
    fontSize: '14px',
    fontWeight: '600',
  },
  statusIcon: {
    fontSize: '24px',
  },
  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px',
  },
  qualityItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  qualityLabel: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  diagnostics: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  diagnosticsHeader: {
    marginBottom: '8px',
  },
  diagnosticsTitle: {
    color: '#FCA5A5',
    fontSize: '13px',
    fontWeight: '600',
  },
  diagnosticsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  diagnosticItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionName: {
    color: '#FCA5A5',
    fontSize: '12px',
  },
  conditionValue: {
    color: '#FEE2E2',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  moreConditions: {
    color: '#FCA5A5',
    fontSize: '11px',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '4px',
  },
  manualCaptureHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    color: '#F59E0B',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '10px',
  },
  manualIcon: {
    fontSize: '16px',
  },
  countdownOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 30,
  },
  countdownCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 1s infinite',
    boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
  },
  countdownNumber: {
    fontSize: '60px',
    color: 'white',
    fontWeight: 'bold',
  },
  countdownText: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
  // Estilos para tabla de consumo (rectángulo horizontal acostado)
  tableGuide: {
    position: 'absolute',
    top: '32%',     // Ajustado para coincidir con zona de detección (15% + offset del marco principal)
    left: '7%',
    width: '60%',   // Más ancha - rectángulo acostado
    height: '25%',  // Ajustado para coincidir con zona de detección
    pointerEvents: 'none',
    zIndex: 22,
  },
  tableFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderWidth: '3px',
    borderStyle: 'dashed',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tableLabel: {
    position: 'absolute',
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  tableLabelText: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};