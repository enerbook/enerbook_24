import React from 'react';

export default function AdvancedCameraOverlay({
  currentStep,
  allowManualCapture
}) {

  const getInstructionText = () => {
    if (currentStep === 'frontal') {
      return '📄 Coloca el recibo FRONTAL - Alinea el logo CFE en el cuadro verde';
    } else {
      return '📊 Coloca el recibo POSTERIOR - Centra la tabla de consumo';
    }
  };

  const getFrameColor = () => {
    return '#10B981'; // Siempre verde para guías
  };

  return (
    <>
      {/* Marco principal vertical del recibo */}
      <div style={styles.receiptFrame}>
        {/* Esquinas del marco principal */}
        <div style={{ ...styles.corner, ...styles.cornerTopLeft, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerTopRight, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerBottomLeft, borderColor: getFrameColor() }} />
        <div style={{ ...styles.corner, ...styles.cornerBottomRight, borderColor: getFrameColor() }} />

        {/* Etiqueta del marco principal */}
        <div style={styles.receiptLabel}>
          <span style={styles.receiptLabelText}>
            RECIBO CFE {currentStep.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Cuadro específico para logo CFE (solo frontal) */}
      {currentStep === 'frontal' && (
        <div style={styles.logoGuide}>
          <div style={{ ...styles.logoFrame, borderColor: getFrameColor() }}>
            <div style={styles.logoLabel}>
              <span style={styles.logoLabelText}>LOGO CFE</span>
            </div>
          </div>
        </div>
      )}

      {/* Cuadro específico para tabla de consumo (solo posterior) */}
      {currentStep === 'posterior' && (
        <div style={styles.tableGuide}>
          <div style={{ ...styles.tableFrame, borderColor: getFrameColor() }}>
            <div style={styles.tableLabel}>
              <span style={styles.tableLabelText}>TABLA DE CONSUMO</span>
            </div>
          </div>
        </div>
      )}

      {/* Área oscura fuera del marco principal */}
      <div style={styles.outerDarkness}>
        <svg style={styles.svg}>
          <defs>
            <mask id="holeMask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x="10%"
                y="15%"
                width="80%"
                height="70%"
                rx="15"
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
        <div style={styles.instructionBadge}>
          <p style={styles.instructionText}>
            {getInstructionText()}
          </p>
        </div>
      </div>
    </>
  );
}

// Estilos simplificados para guías visuales

const styles = {
  // Marco principal del recibo (vertical)
  receiptFrame: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '80%',
    height: '70%',
    pointerEvents: 'none',
    zIndex: 20,
  },

  // Esquinas del marco
  corner: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderStyle: 'solid',
    borderWidth: '4px',
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: '4px',
    borderLeftWidth: '4px',
    borderTopLeftRadius: '15px',
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: '4px',
    borderRightWidth: '4px',
    borderTopRightRadius: '15px',
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: '4px',
    borderLeftWidth: '4px',
    borderBottomLeftRadius: '15px',
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: '4px',
    borderRightWidth: '4px',
    borderBottomRightRadius: '15px',
  },

  // Etiqueta del marco principal
  receiptLabel: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    padding: '10px 24px',
    borderRadius: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  receiptLabelText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Cuadro específico para logo CFE (frontal)
  logoGuide: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '35%',
    height: '18%',
    pointerEvents: 'none',
    zIndex: 22,
  },
  logoFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderWidth: '3px',
    borderStyle: 'dashed',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  logoLabel: {
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    padding: '6px 16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  logoLabelText: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Cuadro específico para tabla de consumo (posterior)
  tableGuide: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '25%',
    pointerEvents: 'none',
    zIndex: 22,
  },
  tableFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderWidth: '3px',
    borderStyle: 'dashed',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  tableLabel: {
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    padding: '6px 16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  tableLabelText: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Área oscura fuera del marco
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

  // Instrucciones
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
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  instructionText: {
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    color: 'white',
  },
};