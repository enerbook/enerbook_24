import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import CameraOverlay from './CameraOverlay';
import { useAdvancedReceiptScanner } from '../../hooks/useAdvancedReceiptScanner';

export default function WebCamera({ isOpen, onClose, onCapture }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState('frontal');
  const [autoCaptureCoundtown, setAutoCaptureCoundtown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const autoCaptureTimeout = useRef(null);

  const {
    scannerState,
    detectedCorners,
    documentQuality,
    processFrame,
    captureWithPerspectiveCorrection,
    cleanup,
  } = useAdvancedReceiptScanner();

  // --- CÁMARA Y PERMISOS ---
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Esperar a que el video esté completamente listo
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            // Dar un pequeño delay para asegurar que el video está renderizando
            setTimeout(() => {
              if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                console.log('Video ready with dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                setIsReady(true);
              } else {
                console.log('Video metadata loaded but dimensions not ready yet');
                // Reintentar después de otro delay
                setTimeout(() => setIsReady(true), 500);
              }
            }, 100);
          }).catch((err) => {
            console.error('Error playing video:', err);
            setIsReady(true); // Intentar de todos modos
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
    cleanup(); // Limpiar matrices de OpenCV
  }, [stream, cleanup]);

  // --- PROCESAMIENTO DE VIDEO ---
  useEffect(() => {
    const processVideo = () => {
      if (videoRef.current &&
          videoRef.current.videoWidth > 0 &&
          videoRef.current.videoHeight > 0 &&
          !isProcessing) {
        const result = processFrame(videoRef.current);
        if (!result) {
          console.log('Frame processing returned null, will retry');
        }
      }
      animationFrameId.current = requestAnimationFrame(processVideo);
    };

    if (isOpen && isReady && !isProcessing) {
      // Dar un pequeño delay inicial para asegurar que todo está listo
      const startDelay = setTimeout(() => {
        animationFrameId.current = requestAnimationFrame(processVideo);
      }, 300);

      return () => {
        clearTimeout(startDelay);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOpen, isReady, processFrame, isProcessing]);

  // --- AUTO-CAPTURA ---
  useEffect(() => {
    if (scannerState === 'ready_to_capture' && !isProcessing) {
      let countdown = 3;
      setAutoCaptureCoundtown(countdown);

      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setAutoCaptureCoundtown(countdown);

        if (countdown === 0) {
          clearInterval(countdownInterval);
          handleAutoCapture();
        }
      }, 1000);

      autoCaptureTimeout.current = countdownInterval;

      return () => {
        clearInterval(countdownInterval);
        setAutoCaptureCoundtown(null);
      };
    } else {
      if (autoCaptureTimeout.current) {
        clearInterval(autoCaptureTimeout.current);
        autoCaptureTimeout.current = null;
      }
      setAutoCaptureCoundtown(null);
    }
  }, [scannerState, isProcessing]);

  // --- CAPTURA DE IMAGEN ---
  useEffect(() => {
    if (!isOpen) {
      setCapturedPhotos([]);
      setCurrentStep('frontal');
    }
  }, [isOpen]);

  const handleAutoCapture = useCallback(async () => {
    if (!videoRef.current || !detectedCorners || isProcessing) return;

    setIsProcessing(true);

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      }

      const correctedCanvas = captureWithPerspectiveCorrection(videoRef.current, detectedCorners);

      if (correctedCanvas) {
        correctedCanvas.toBlob((blob) => {
          const fileName = currentStep === 'frontal' ? 'receipt-frontal.jpg' : 'receipt-posterior.jpg';
          const file = new File([blob], fileName, { type: 'image/jpeg' });

          const newPhotos = [...capturedPhotos, file];
          setCapturedPhotos(newPhotos);

          if (currentStep === 'frontal') {
            setCurrentStep('posterior');
            setIsProcessing(false);
            setTimeout(() => alert('¡Excelente! Parte frontal capturada. Ahora muestra la parte posterior.'), 500);
          } else {
            onCapture(newPhotos);
            handleClose();
          }
        }, 'image/jpeg', 0.95);
      } else {
        throw new Error('No se pudo procesar la imagen');
      }
    } catch (error) {
      console.error('Error en captura automática:', error);
      alert('Error al capturar. Intenta de nuevo.');
      setIsProcessing(false);
    }
  }, [detectedCorners, capturedPhotos, currentStep, onCapture, captureWithPerspectiveCorrection, isProcessing]);

  const handleManualCapture = useCallback(async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      }

      let captureCanvas;

      if (detectedCorners && documentQuality?.isGreenCFE) {
        captureCanvas = captureWithPerspectiveCorrection(videoRef.current, detectedCorners);
      }

      if (!captureCanvas) {
        captureCanvas = canvasRef.current;
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = videoRef.current.videoWidth;
        captureCanvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
      }

      captureCanvas.toBlob((blob) => {
        const fileName = currentStep === 'frontal' ? 'receipt-frontal.jpg' : 'receipt-posterior.jpg';
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const newPhotos = [...capturedPhotos, file];
        setCapturedPhotos(newPhotos);

        if (currentStep === 'frontal') {
          setCurrentStep('posterior');
          setIsProcessing(false);
          setTimeout(() => alert('¡Bien! Ahora captura la parte posterior del recibo.'), 500);
        } else {
          onCapture(newPhotos);
          handleClose();
        }
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('No se pudo capturar la foto. Intenta de nuevo.');
      setIsProcessing(false);
    }
  }, [capturedPhotos, currentStep, onCapture, detectedCorners, documentQuality, captureWithPerspectiveCorrection, isProcessing]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // --- RENDERIZADO ---
  if (!isOpen) return null;

  if (hasPermission === false) {
    return (
      <div style={styles.modal}>
        <div style={styles.container}>
          <p style={styles.messageText}>No hay acceso a la cámara</p>
          <button style={styles.closeButton} onClick={handleClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  const isDocumentDetected = scannerState === 'detecting' && detectedCorners;
  const canManualCapture = !isProcessing && (scannerState === 'detecting' || scannerState === 'ready_to_capture');

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <div style={styles.cameraContainer}>
          <video ref={videoRef} autoPlay playsInline style={styles.video} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <CameraOverlay
            detectedCorners={detectedCorners}
            scannerState={scannerState}
            documentQuality={documentQuality}
          />
          
          <div style={styles.stepIndicator}>
            <div style={styles.stepBadge}>
              <div style={styles.stepNumber}>
                {currentStep === 'frontal' ? '1' : '2'}
              </div>
              <span style={styles.stepText}>
                {currentStep === 'frontal' ? 'Frente del recibo' : 'Reverso del recibo'}
              </span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: currentStep === 'frontal' ? '50%' : '100%'
                }}
              />
            </div>
          </div>

          {autoCaptureCoundtown !== null && (
            <div style={styles.countdownContainer}>
              <div style={styles.countdownCircle}>
                <span style={styles.countdownNumber}>{autoCaptureCoundtown}</span>
              </div>
              <span style={styles.countdownText}>Captura automática en...</span>
            </div>
          )}
          
          <div style={styles.controls}>
            <button style={styles.closeButtonTop} onClick={handleClose}>✕</button>
            <button
              style={{
                ...styles.captureButton,
                ...(canManualCapture ? styles.captureButtonReady : {}),
                ...(isProcessing ? styles.captureButtonDisabled : {})
              }}
              onClick={handleManualCapture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div style={styles.processingSpinner} />
              ) : (
                <div style={styles.captureButtonInner} />
              )}
            </button>

            {canManualCapture && !autoCaptureCoundtown && (
              <span style={styles.manualCaptureHint}>
                Toca para capturar manualmente
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS (sin cambios significativos) ---
const styles = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  messageText: {
    color: 'white',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '100px',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '120px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButtonTop: {
    position: 'absolute',
    top: '50px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 10,
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  captureButton: {
    width: '70px',
    height: '70px',
    borderRadius: '35px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
  },
  captureButtonReady: {
    borderColor: '#10B981', // Verde para indicar que está listo
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  captureButtonInner: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: 'white',
  },
  stepIndicator: {
    position: 'absolute',
    top: '100px',
    left: '20px',
    right: '20px',
    zIndex: 5,
  },
  stepBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  stepNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    backgroundColor: '#F59E0B',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  stepText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    transition: 'width 0.3s ease',
  },
  captureButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 15,
  },
  countdownCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 1s infinite',
  },
  countdownNumber: {
    fontSize: '48px',
    color: 'white',
    fontWeight: 'bold',
  },
  countdownText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  processingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  manualCaptureHint: {
    position: 'absolute',
    bottom: '-30px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  },
};