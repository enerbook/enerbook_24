import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Platform, Linking } from 'react-native';
import { Camera } from 'expo-camera/legacy';
import * as Haptics from 'expo-haptics';
import CameraOverlay from './CameraOverlay';
import { useDocumentDetection } from '../../hooks/useDocumentDetection';

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState('frontal'); // 'frontal' | 'posterior'
  const cameraRef = useRef(null);
  
  const {
    detectionState,
    detectionScore,
    startDetection,
    stopDetection,
    resetDetection
  } = useDocumentDetection();

  // Solicitar permisos de cámara
  useEffect(() => {
    (async () => {
      if (isOpen) {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'Permiso de cámara',
            'Necesitamos acceso a tu cámara para escanear el recibo de CFE.',
            [
              { text: 'Cancelar', onPress: onClose },
              { text: 'Configuración', onPress: () => {
                // En producción, abrir configuración del dispositivo
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            ]
          );
        }
      }
    })();
  }, [isOpen]);

  // Iniciar detección cuando la cámara esté lista
  useEffect(() => {
    if (isReady && cameraRef.current) {
      startDetection(cameraRef);
    }
    
    return () => {
      stopDetection();
    };
  }, [isReady]);

  // Capturar automáticamente cuando el estado sea 'capturing'
  useEffect(() => {
    if (detectionState === 'capturing') {
      setTimeout(() => {
        handleCapture();
      }, 3000); // Esperar 3 segundos del countdown
    }
  }, [detectionState]);

  // Resetear cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setCapturedPhotos([]);
      setCurrentStep('frontal');
    }
  }, [isOpen]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        // Vibración de feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Capturar foto
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
          skipProcessing: false,
        });
        
        // Convertir URI a File/Blob para mantener compatibilidad con el flujo existente
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const fileName = currentStep === 'frontal' ? 'receipt-front.jpg' : 'receipt-back.jpg';
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        
        const newPhotos = [...capturedPhotos, file];
        setCapturedPhotos(newPhotos);
        
        // Si es la primera foto, pasar a la segunda
        if (currentStep === 'frontal') {
          setCurrentStep('posterior');
          resetDetection(); // Resetear detección para la segunda foto
          Alert.alert(
            '¡Perfecto!',
            'Ahora captura la parte posterior del recibo.',
            [{ text: 'OK', onPress: () => {} }]
          );
        } else {
          // Si ya tenemos ambas fotos, enviar y cerrar
          onCapture(newPhotos);
          handleClose();
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        Alert.alert('Error', 'No se pudo capturar la foto. Intenta de nuevo.');
        resetDetection();
      }
    }
  };

  const handleManualCapture = () => {
    // Permitir captura manual con un tap
    if (detectionState !== 'capturing') {
      handleCapture();
    }
  };

  const handleClose = () => {
    stopDetection();
    setIsReady(false);
    onClose();
  };

  if (!isOpen) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={isOpen} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.messageText}>Solicitando permisos de cámara...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={isOpen} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.messageText}>No hay acceso a la cámara</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants?.Type?.back || 'back'}
          flashMode={Camera.Constants?.FlashMode?.on || 'on'}
          onCameraReady={() => setIsReady(true)}
          ratio="4:3"
        >
          {/* Overlay con recuadro y feedback visual */}
          <CameraOverlay 
            detectionState={detectionState}
            detectionScore={detectionScore}
            currentStep={currentStep}
          />
          
          {/* Indicador de paso actual */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepBadge}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>
                  {currentStep === 'frontal' ? '1' : '2'}
                </Text>
              </View>
              <Text style={styles.stepText}>
                {currentStep === 'frontal' ? 'Parte frontal' : 'Parte posterior'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: currentStep === 'frontal' ? '50%' : '100%' }
              ]} />
            </View>
          </View>
          
          {/* Controles de la cámara */}
          <View style={styles.controls}>
            {/* Botón de cerrar */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {/* Botón de captura manual (como respaldo) */}
            {detectionState !== 'capturing' && (
              <TouchableOpacity 
                style={[
                  styles.captureButton,
                  detectionState === 'detected' && styles.captureButtonReady
                ]}
                onPress={handleManualCapture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            )}
          </View>
        </Camera>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  messageText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonReady: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  stepIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
});