import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function CameraOverlay({ detectionState, detectionScore, currentStep }) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [countdownValue, setCountdownValue] = useState(null);

  // Colores según el estado
  const getOverlayColor = () => {
    switch (detectionState) {
      case 'detected':
        return '#10B981'; // Verde
      case 'capturing':
        return '#F59E0B'; // Naranja
      default:
        return '#EF4444'; // Rojo
    }
  };

  // Animación de pulso cuando detecta
  useEffect(() => {
    if (detectionState === 'detected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [detectionState]);

  // Countdown cuando está capturando
  useEffect(() => {
    if (detectionState === 'capturing') {
      let count = 3;
      setCountdownValue(count);
      
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownValue(count);
        } else {
          setCountdownValue('📸');
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCountdownValue(null);
    }
  }, [detectionState]);

  const overlayColor = getOverlayColor();

  return (
    <View style={styles.container}>
      {/* Máscara oscura con hueco transparente */}
      <View style={styles.maskContainer}>
        {/* Top mask */}
        <View style={[styles.maskRow, styles.maskTop]} />
        
        {/* Middle row with side masks and transparent center */}
        <View style={styles.maskMiddle}>
          <View style={styles.maskSide} />
          
          {/* Recuadro central con borde animado */}
          <Animated.View 
            style={[
              styles.frameContainer,
              { 
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            {/* Esquinas del recuadro */}
            <View style={[styles.corner, styles.cornerTopLeft, { borderColor: overlayColor }]} />
            <View style={[styles.corner, styles.cornerTopRight, { borderColor: overlayColor }]} />
            <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: overlayColor }]} />
            <View style={[styles.corner, styles.cornerBottomRight, { borderColor: overlayColor }]} />
            
            {/* Líneas de guía */}
            <View style={[styles.guideLine, styles.guideTop, { backgroundColor: overlayColor }]} />
            <View style={[styles.guideLine, styles.guideBottom, { backgroundColor: overlayColor }]} />
            <View style={[styles.guideLine, styles.guideLeft, { backgroundColor: overlayColor }]} />
            <View style={[styles.guideLine, styles.guideRight, { backgroundColor: overlayColor }]} />
          </Animated.View>
          
          <View style={styles.maskSide} />
        </View>
        
        {/* Bottom mask */}
        <View style={[styles.maskRow, styles.maskBottom]} />
      </View>

      {/* Instrucciones y feedback */}
      <View style={styles.instructionsContainer}>
        <View style={[styles.statusBadge, { backgroundColor: overlayColor }]}>
          <Text style={styles.statusText}>
            {detectionState === 'searching' && '🔍 Buscando recibo...'}
            {detectionState === 'detected' && '✅ ¡Recibo detectado!'}
            {detectionState === 'capturing' && '📸 Capturando...'}
          </Text>
        </View>
        
        {detectionScore > 0 && detectionState === 'searching' && (
          <Text style={styles.scoreText}>
            Calidad: {Math.round(detectionScore)}%
          </Text>
        )}
      </View>

      {/* Countdown overlay */}
      {countdownValue && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {countdownValue}
          </Text>
        </View>
      )}

      {/* Instrucciones de uso */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipText}>
          {detectionState === 'searching' && 'Centra el recibo en el recuadro'}
          {detectionState === 'detected' && 'Mantén la posición...'}
          {detectionState === 'capturing' && '¡No te muevas!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  maskContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  maskRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  maskTop: {
    flex: 1.5,
  },
  maskMiddle: {
    flex: 7,
    flexDirection: 'row',
  },
  maskBottom: {
    flex: 1.5,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  frameContainer: {
    flex: 8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  guideLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  guideTop: {
    top: 0,
    left: 50,
    right: 50,
    height: 2,
  },
  guideBottom: {
    bottom: 0,
    left: 50,
    right: 50,
    height: 2,
  },
  guideLeft: {
    left: 0,
    top: 50,
    bottom: 50,
    width: 2,
  },
  guideRight: {
    right: 0,
    top: 50,
    bottom: 50,
    width: 2,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  countdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tipText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});