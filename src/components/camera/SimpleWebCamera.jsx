import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AdvancedCameraOverlay from './AdvancedCameraOverlay';
import { useAdvancedReceiptScanner } from '../../hooks/useAdvancedReceiptScanner';

export default function SimpleWebCamera({ isOpen, onClose, onCapture }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState('frontal');
  const [autoCaptureCoundtown, setAutoCaptureCoundtown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef(null);
  const animationFrameId = useRef(null);
  const autoCaptureTimeout = useRef(null);
  const stableFrameCount = useRef(0);

  const {
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
  } = useAdvancedReceiptScanner(currentStep);

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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsReady(true);
            console.log('Camera ready');
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
    stableFrameCount.current = 0;
  }, [stream]);

  // --- PROCESAMIENTO DE VIDEO ---
  useEffect(() => {
    const processVideo = () => {
      if (videoRef.current && !isProcessing) {
        processFrame(videoRef.current);
      }
      animationFrameId.current = requestAnimationFrame(processVideo);
    };

    if (isOpen && isReady && !isProcessing) {
      animationFrameId.current = requestAnimationFrame(processVideo);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOpen, isReady, processFrame, isProcessing]);

  // --- AUTO-CAPTURA ---
  useEffect(() => {
    if (captureReady && !isProcessing) {
      stableFrameCount.current++;

      if (stableFrameCount.current > 15) { // Esperar 15 frames estables
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
      }
    } else {
      stableFrameCount.current = 0;
      if (autoCaptureTimeout.current) {
        clearInterval(autoCaptureTimeout.current);
        autoCaptureTimeout.current = null;
      }
      setAutoCaptureCoundtown(null);
    }
  }, [captureReady, isProcessing]);

  // --- CAPTURA ---
  const handleAutoCapture = useCallback(async () => {
    if (!videoRef.current || isProcessing) return;

    setIsProcessing(true);
    setAutoCaptureCoundtown(null);

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      }

      const blob = await capturePhoto(videoRef.current);
      const fileName = currentStep === 'frontal' ? 'receipt-frontal.jpg' : 'receipt-posterior.jpg';
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      const newPhotos = [...capturedPhotos, file];
      setCapturedPhotos(newPhotos);

      if (currentStep === 'frontal') {
        setCurrentStep('posterior');
        setIsProcessing(false);
        stableFrameCount.current = 0;
        setTimeout(() => {
          alert('¡Excelente! Parte frontal capturada. Ahora muestra la parte posterior del recibo.');
        }, 500);
      } else {
        onCapture(newPhotos);
        handleClose();
      }
    } catch (error) {
      console.error('Error en captura:', error);
      alert('Error al capturar. Intenta de nuevo.');
      setIsProcessing(false);
    }
  }, [videoRef, currentStep, capturedPhotos, onCapture, capturePhoto, isProcessing]);

  const handleManualCapture = useCallback(async () => {
    if (!videoRef.current || isProcessing || autoCaptureCoundtown !== null) return;

    setIsProcessing(true);

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      }

      const blob = await capturePhoto(videoRef.current);
      const fileName = currentStep === 'frontal' ? 'receipt-frontal.jpg' : 'receipt-posterior.jpg';
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      const newPhotos = [...capturedPhotos, file];
      setCapturedPhotos(newPhotos);

      if (currentStep === 'frontal') {
        setCurrentStep('posterior');
        setIsProcessing(false);
        stableFrameCount.current = 0;
        setTimeout(() => {
          alert('¡Bien! Ahora captura la parte posterior del recibo.');
        }, 500);
      } else {
        onCapture(newPhotos);
        handleClose();
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('No se pudo capturar la foto. Intenta de nuevo.');
      setIsProcessing(false);
    }
  }, [videoRef, currentStep, capturedPhotos, onCapture, capturePhoto, isProcessing, autoCaptureCoundtown]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // --- RESET AL CAMBIAR DE PASO ---
  useEffect(() => {
    if (!isOpen) {
      setCapturedPhotos([]);
      setCurrentStep('frontal');
      stableFrameCount.current = 0;
    }
  }, [isOpen]);

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

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <div style={styles.cameraContainer}>
          <video ref={videoRef} autoPlay playsInline muted style={styles.video} />

          <AdvancedCameraOverlay
            scannerState={scannerState}
            isGreenDetected={isGreenDetected}
            greenPercentage={greenPercentage}
            brightness={brightness}
            captureReady={captureReady}
            autoCaptureCoundtown={autoCaptureCoundtown}
            currentStep={currentStep}
            detectedPageType={detectedPageType}
            autoDetectedPage={autoDetectedPage}
            failedConditions={failedConditions}
            allowManualCapture={allowManualCapture}
          />

          {/* Indicador de pasos */}
          <div style={styles.stepIndicator}>
            <div style={styles.stepBadge}>
              <div style={styles.stepNumber}>
                {currentStep === 'frontal' ? '1' : '2'}
              </div>
              <span style={styles.stepText}>
                {currentStep === 'frontal' ? 'Página FRONTAL del recibo CFE' : 'Página POSTERIOR del recibo CFE'}
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

          {/* Controles */}
          <div style={styles.controls}>
            <button style={styles.closeButtonTop} onClick={handleClose}>✕</button>

            <button
              style={{
                ...styles.captureButton,
                ...(captureReady ? styles.captureButtonReady : allowManualCapture ? styles.captureButtonManual : {}),
                ...(isProcessing || autoCaptureCoundtown ? styles.captureButtonDisabled : {})
              }}
              onClick={handleManualCapture}
              disabled={isProcessing || autoCaptureCoundtown !== null || (!captureReady && !allowManualCapture)}
            >
              {isProcessing ? (
                <div style={styles.processingSpinner} />
              ) : (
                <div style={styles.captureButtonInner} />
              )}
            </button>

            {!autoCaptureCoundtown && !isProcessing && (
              <p style={styles.manualCaptureHint}>
                {captureReady ? 'Toca para capturar ahora' :
                 allowManualCapture ? 'Captura manual disponible' :
                 'Posiciona el recibo correctamente'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  stepIndicator: {
    position: 'absolute',
    top: '100px',
    left: '20px',
    right: '20px',
    zIndex: 25,
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
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    gap: '5px',
  },
  closeButtonTop: {
    position: 'absolute',
    top: '30px',
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
    zIndex: 30,
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
    transition: 'all 0.3s ease',
  },
  captureButtonReady: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    transform: 'scale(1.1)',
  },
  captureButtonManual: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    transform: 'scale(1.05)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  captureButtonInner: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: 'white',
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
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
    margin: 0,
  },
};