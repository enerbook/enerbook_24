import React from 'react';

export default function SimpleCameraOverlay({
  scannerState,
  isGreenDetected,
  greenPercentage,
  brightness,
  captureReady,
  autoCaptureCoundtown,
  currentStep,
  detectedPageType
}) {

  const getInstructionText = () => {
    const pageText = currentStep === 'frontal' ? 'FRONTAL' : 'POSTERIOR';

    if (captureReady) {
      return `¡Perfecto! Página ${pageText} detectada correctamente`;
    }

    if (detectedPageType && detectedPageType !== currentStep) {
      return `Voltea el recibo - Se necesita página ${pageText}`;
    }

    if (greenPercentage > 0 && greenPercentage < 2) {
      return `Muestra toda la página ${pageText} en el marco`;
    }

    if (greenPercentage > 25) {
      return 'Aleja un poco el recibo';
    }

    if (scannerState === 'detecting') {
      return `Detectando página ${pageText} del recibo CFE...`;
    }

    return `Coloca la página ${pageText} del recibo CFE en el marco`;
  };

  const getFrameColor = () => {
    if (captureReady) return '#10B981';
    if (isGreenDetected) return '#F59E0B';
    return 'rgba(255, 255, 255, 0.5)';
  };

  return (
    <>
      {/* Marco de guía principal - Orientación vertical para recibo CFE */}
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

      {/* Área oscura fuera del marco */}
      <div style={styles.outerDarkness}>
        <svg style={styles.svg}>
          <defs>
            <mask id="holeMask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x="7.5%"
                y="15%"
                width="85%"
                height="65%"
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
        <div style={{ ...styles.instructionBadge, backgroundColor: captureReady ? '#10B981' : 'rgba(0, 0, 0, 0.7)' }}>
          <p style={styles.instructionText}>
            {getInstructionText()}
          </p>
        </div>
      </div>

      {/* Panel de indicadores */}
      <div style={styles.indicatorsPanel}>
        {/* Indicador de Página CFE */}
        <div style={styles.indicator}>
          <span style={styles.indicatorLabel}>
            Página {currentStep === 'frontal' ? 'FRONTAL' : 'POSTERIOR'}
          </span>
          <div style={styles.indicatorValue}>
            {isGreenDetected ? (
              <span style={styles.checkmark}>✓</span>
            ) : (
              <span style={styles.xmark}>✗</span>
            )}
            <span style={styles.percentage}>
              {detectedPageType ? detectedPageType.toUpperCase() : 'Buscando...'}
            </span>
          </div>
        </div>

        {/* Indicador de Iluminación */}
        <div style={styles.indicator}>
          <span style={styles.indicatorLabel}>Iluminación</span>
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

        {/* Estado de captura */}
        {captureReady && (
          <div style={styles.readyIndicator}>
            <span style={styles.readyIcon}>📸</span>
            <span>Listo para capturar</span>
          </div>
        )}
      </div>

      {/* Contador de auto-captura */}
      {autoCaptureCoundtown !== null && autoCaptureCoundtown > 0 && (
        <div style={styles.countdownOverlay}>
          <div style={styles.countdownCircle}>
            <span style={styles.countdownNumber}>{autoCaptureCoundtown}</span>
          </div>
          <span style={styles.countdownText}>Capturando en...</span>
        </div>
      )}
    </>
  );
}

const styles = {
  frameGuide: {
    position: 'absolute',
    top: '15%',
    left: '7.5%',  // Marco horizontal más amplio
    width: '85%',  // Ancho para formato horizontal de recibo
    height: '65%', // Altura ajustada para recibo horizontal
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
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
  },
  instructionText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
  },
  indicatorsPanel: {
    position: 'absolute',
    bottom: '140px',
    left: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '15px',
    padding: '15px',
    backdropFilter: 'blur(10px)',
    zIndex: 25,
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  indicatorLabel: {
    color: 'white',
    fontSize: '15px',
    fontWeight: '500',
  },
  indicatorValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkmark: {
    color: '#10B981',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  xmark: {
    color: '#EF4444',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  percentage: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
  },
  progressBar: {
    width: '120px',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  readyIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  readyIcon: {
    fontSize: '24px',
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
};