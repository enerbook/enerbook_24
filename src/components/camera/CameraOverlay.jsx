import React, { useEffect, useRef } from 'react';

export default function CameraOverlay({ detectedCorners, scannerState, documentQuality }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const video = document.querySelector('video');
    if (!video) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const guideWidth = canvas.width * 0.85;
    const guideHeight = guideWidth * (11/8.5);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(
      centerX - guideWidth/2,
      centerY - guideHeight/2,
      guideWidth,
      guideHeight
    );
    ctx.setLineDash([]);

    const cornerLength = 30;
    const cornerLineWidth = 3;
    const corners = [
      { x: centerX - guideWidth/2, y: centerY - guideHeight/2 },
      { x: centerX + guideWidth/2, y: centerY - guideHeight/2 },
      { x: centerX + guideWidth/2, y: centerY + guideHeight/2 },
      { x: centerX - guideWidth/2, y: centerY + guideHeight/2 }
    ];

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = cornerLineWidth;

    corners.forEach(corner => {
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y + cornerLength);
      ctx.lineTo(corner.x, corner.y);
      ctx.lineTo(corner.x + cornerLength, corner.y);
      ctx.stroke();
    });

    if (detectedCorners && detectedCorners.length === 4) {
      ctx.beginPath();
      ctx.moveTo(detectedCorners[0].x, detectedCorners[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(detectedCorners[i].x, detectedCorners[i].y);
      }
      ctx.closePath();

      let strokeColor = '#FFA500';
      let fillOpacity = 0.1;
      let lineWidth = 3;

      if (scannerState === 'detecting' && documentQuality?.isGreenCFE) {
        strokeColor = '#10B981';
        fillOpacity = 0.15;
        lineWidth = 4;
      } else if (scannerState === 'ready_to_capture') {
        strokeColor = '#10B981';
        fillOpacity = 0.2;
        lineWidth = 5;

        const time = Date.now() / 200;
        const pulse = Math.sin(time) * 0.5 + 0.5;
        ctx.shadowBlur = 10 + pulse * 10;
        ctx.shadowColor = strokeColor;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      ctx.fillStyle = `rgba(16, 185, 129, ${fillOpacity})`;
      ctx.fill();

      ctx.shadowBlur = 0;

      detectedCorners.forEach(corner => {
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [detectedCorners, scannerState, documentQuality]);

  const getInstructionText = () => {
    if (scannerState === 'loading') return 'Cargando escáner...';
    if (scannerState === 'ready_to_capture') return '¡Perfecto! Mantén estable para capturar';
    if (scannerState === 'detecting' && documentQuality?.isGreenCFE) return 'Recibo CFE detectado - Alinea mejor';
    if (scannerState === 'detecting') return 'Documento detectado - Verificando tipo...';
    return 'Encuadra el recibo CFE dentro del marco';
  };

  const getStatusColor = () => {
    if (scannerState === 'ready_to_capture') return '#10B981';
    if (scannerState === 'detecting' && documentQuality?.isGreenCFE) return '#F59E0B';
    if (scannerState === 'detecting') return '#FFA500';
    return 'rgba(255, 255, 255, 0.8)';
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.instructionsContainer}>
        <p style={{ ...styles.instructionsText, color: getStatusColor() }}>
          {getInstructionText()}
        </p>
      </div>

      {documentQuality && (
        <div style={styles.qualityIndicators}>
          <div style={styles.indicator}>
            <span style={styles.indicatorLabel}>Nitidez</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${documentQuality.sharpness * 100}%`,
                  backgroundColor: documentQuality.sharpness > 0.5 ? '#10B981' : '#F59E0B'
                }}
              />
            </div>
          </div>

          <div style={styles.indicator}>
            <span style={styles.indicatorLabel}>Iluminación</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${documentQuality.brightness * 100}%`,
                  backgroundColor:
                    documentQuality.brightness > 0.3 && documentQuality.brightness < 0.8
                      ? '#10B981' : '#F59E0B'
                }}
              />
            </div>
          </div>

          {documentQuality.isGreenCFE && (
            <div style={styles.indicator}>
              <span style={styles.indicatorLabel}>CFE Detectado</span>
              <div style={styles.cfeDetected}>
                <span style={styles.checkmark}>✓</span>
                <span>{Math.round(documentQuality.confidence * 100)}%</span>
              </div>
            </div>
          )}

          {documentQuality.isStable && (
            <div style={styles.stabilityIndicator}>
              <span style={styles.stabilityIcon}>📸</span>
              <span>Estable - Listo para capturar</span>
            </div>
          )}
        </div>
      )}

      <div style={styles.scanLineContainer}>
        <div style={styles.scanLine} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  instructionsContainer: {
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '12px 24px',
    borderRadius: '25px',
    backdropFilter: 'blur(10px)',
  },
  instructionsText: {
    fontSize: '17px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    transition: 'color 0.3s ease',
  },
  qualityIndicators: {
    position: 'absolute',
    bottom: '140px',
    left: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorLabel: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '80px',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginLeft: '10px',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  cfeDetected: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10B981',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: '18px',
  },
  stabilityIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  stabilityIcon: {
    fontSize: '20px',
  },
  scanLineContainer: {
    position: 'absolute',
    top: '50%',
    left: '7.5%',
    right: '7.5%',
    height: '2px',
    overflow: 'hidden',
    opacity: 0.3,
  },
  scanLine: {
    position: 'absolute',
    width: '100px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
    animation: 'scan 2s linear infinite',
  },
};