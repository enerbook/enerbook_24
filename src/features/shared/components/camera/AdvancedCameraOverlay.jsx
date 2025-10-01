import React from 'react';

export default function AdvancedCameraOverlay({
  currentStep,
  allowManualCapture
}) {

  const getInstructionText = () => {
    if (currentStep === 'frontal') {
      return 'Todo el recibo en el marco\nLogo CFE arriba izquierda';
    } else {
      return 'Solo la tabla de consumo\nCentra los números claramente';
    }
  };

  const getFrameColor = () => {
    return '#f59f0b'; // Color brand de Enerbook
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

      </div>

      {/* Cuadro específico para logo CFE (solo frontal) */}
      {currentStep === 'frontal' && (
        <div style={styles.logoGuide}>
          <div style={{ ...styles.logoFrame, borderColor: '#090e1a' }}>
            <div style={styles.logoLabel}>
              <span style={styles.logoLabelText}>LOGO CFE</span>
            </div>
          </div>
        </div>
      )}

      {/* Cuadro específico para tabla de consumo (solo posterior) */}
      {currentStep === 'posterior' && (
        <div style={styles.tableGuide}>
          <div style={{ ...styles.tableFrame, borderColor: '#090e1a' }}>
            <div style={styles.tableLabel}>
              <span style={styles.tableLabelText}>TABLA DE CONSUMO - SOLO ESTA ÁREA</span>
            </div>
          </div>
        </div>
      )}


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
    width: '80px',
    height: '80px',
    borderStyle: 'solid',
    borderWidth: '6px',
    borderColor: 'transparent',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: '6px',
    borderLeftWidth: '6px',
    borderTopLeftRadius: '15px',
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: '6px',
    borderRightWidth: '6px',
    borderTopRightRadius: '15px',
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: '6px',
    borderLeftWidth: '6px',
    borderBottomLeftRadius: '15px',
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: '6px',
    borderRightWidth: '6px',
    borderBottomRightRadius: '15px',
  },


  // Cuadro específico para logo CFE (frontal)
  logoGuide: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '25%',
    height: '12%',
    pointerEvents: 'none',
    zIndex: 22,
  },
  logoFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderRadius: '8px',
    borderColor: '#090e1a',
    backgroundColor: 'rgba(9, 14, 26, 0.08)',
    opacity: 0.8,
  },
  logoLabel: {
    position: 'absolute',
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(9, 14, 26, 0.9)',
    padding: '4px 12px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    opacity: 0.9,
  },
  logoLabelText: {
    color: 'white',
    fontSize: '10px',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Cuadro específico para tabla de consumo (posterior)
  tableGuide: {
    position: 'absolute',
    top: '35%',
    left: '5%',
    width: '90%',
    height: '30%',
    pointerEvents: 'none',
    zIndex: 22,
  },
  tableFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderRadius: '8px',
    borderColor: '#090e1a',
    backgroundColor: 'rgba(9, 14, 26, 0.08)',
    opacity: 0.8,
  },
  tableLabel: {
    position: 'absolute',
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(9, 14, 26, 0.9)',
    padding: '4px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    opacity: 0.9,
    whiteSpace: 'nowrap',
  },
  tableLabelText: {
    color: 'white',
    fontSize: '10px',
    fontWeight: '600',
    textAlign: 'center',
  },


  // Instrucciones
  instructionsContainer: {
    position: 'absolute',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '300px',
    zIndex: 25,
  },
  instructionBadge: {
    padding: '8px 16px',
    borderRadius: '15px',
    backgroundColor: 'rgba(245, 159, 11, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  instructionText: {
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    color: 'white',
    lineHeight: '1.4',
    whiteSpace: 'pre-line',
  },
};