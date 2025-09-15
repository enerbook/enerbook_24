import React, { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import CameraOverlay from './CameraOverlay';
import { useDocumentDetection } from '../../hooks/useDocumentDetection';

export default function WebCamera({ isOpen, onClose, onCapture }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const {
    detectionState,
    detectionScore,
    startDetection,
    stopDetection,
    resetDetection
  } = useDocumentDetection();

  // Solicitar permisos y activar cámara
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Cámara trasera
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
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
    stopDetection();
  };

  // Iniciar detección cuando esté listo
  useEffect(() => {
    if (isReady) {
      startDetection(videoRef);
    }
  }, [isReady]);

  // Capturar automáticamente cuando el estado sea 'capturing'
  useEffect(() => {
    if (detectionState === 'capturing') {
      setTimeout(() => {
        handleCapture();
      }, 3000); // Esperar 3 segundos del countdown
    }
  }, [detectionState]);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      try {
        // Vibración de feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Configurar el canvas con las dimensiones del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir canvas a blob
        canvas.toBlob((blob) => {
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          
          // Enviar la foto capturada
          onCapture([file]);
          
          // Cerrar la cámara
          handleClose();
        }, 'image/jpeg', 0.9);
        
      } catch (error) {
        console.error('Error capturing photo:', error);
        alert('No se pudo capturar la foto. Intenta de nuevo.');
        resetDetection();
      }
    }
  };

  const handleManualCapture = () => {
    // Permitir captura manual con un click
    if (detectionState !== 'capturing') {
      handleCapture();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  if (hasPermission === false) {
    return (
      <div style={styles.modal}>
        <div style={styles.container}>
          <p style={styles.messageText}>No hay acceso a la cámara</p>
          <button style={styles.closeButton} onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <div style={styles.cameraContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
          
          {/* Canvas oculto para capturar la imagen */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Overlay con recuadro y feedback visual */}
          <CameraOverlay 
            detectionState={detectionState}
            detectionScore={detectionScore}
          />
          
          {/* Controles de la cámara */}
          <div style={styles.controls}>
            {/* Botón de cerrar */}
            <button 
              style={styles.closeButtonTop} 
              onClick={handleClose}
            >
              ✕
            </button>
            
            {/* Botón de captura manual (como respaldo) */}
            {detectionState !== 'capturing' && (
              <button 
                style={{
                  ...styles.captureButton,
                  ...(detectionState === 'detected' ? styles.captureButtonReady : {})
                }}
                onClick={handleManualCapture}
              >
                <div style={styles.captureButtonInner} />
              </button>
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
    border: '4px solid white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  captureButtonReady: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  captureButtonInner: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: 'white',
  },
};