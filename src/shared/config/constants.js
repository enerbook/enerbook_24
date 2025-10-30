/**
 * Shared Configuration Constants
 * Centralized configuration for camera components and receipt scanning
 */

// Enerbook Brand Colors (aligned with tailwind.config.js)
export const COLORS = {
  primary: '#f59e0b',       // Enerbook orange (brand)
  primaryLight: '#FFCB45',  // Enerbook light orange (brandLight - degradado)
  dark: '#090e1a',          // Enerbook dark (ink)
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent'
};

// Camera Configuration
export const CAMERA_CONFIG = {
  facingMode: 'environment',
  idealWidth: 1920,
  idealHeight: 1080,
  jpegQuality: 0.95,
  mimeType: 'image/jpeg'
};

// File Naming
export const FILE_NAMES = {
  receiptFrontal: 'receipt-frontal.jpg',
  receiptPosterior: 'receipt-posterior.jpg'
};

// Receipt Scanning Steps
export const SCAN_STEPS = {
  frontal: 'frontal',
  posterior: 'posterior'
};

// UI Text (Spanish) - Ready for future i18n
export const UI_TEXT = {
  // Instructions
  instructionFrontal: 'Todo el recibo en el marco\nLogo CFE arriba izquierda',
  instructionPosterior: 'Solo la tabla de consumo\nCentra los números claramente',

  // Labels
  logoCFE: 'LOGO CFE',
  tablaConsumo: 'TABLA DE CONSUMO - SOLO ESTA ÁREA',

  // Steps
  stepFrontal: 'Página FRONTAL del recibo CFE',
  stepPosterior: 'Página POSTERIOR del recibo CFE',

  // Messages
  captureHint: 'Toca para capturar foto',
  successFrontal: '¡Frontal capturada! Ahora muestra la parte posterior',
  cameraError: 'No se pudo acceder a la cámara. Por favor, verifica los permisos.',
  noAccess: 'No hay acceso a la cámara',

  // Buttons
  close: 'Cerrar'
};

// Timeouts (milliseconds)
export const TIMEOUTS = {
  successMessage: 2000
};

// Overlay Dimensions (percentages and pixels)
export const OVERLAY_DIMENSIONS = {
  receiptFrame: {
    top: '15%',
    left: '10%',
    width: '80%',
    height: '70%'
  },
  cornerSize: '80px',
  cornerBorder: '6px',
  cornerRadius: '15px',

  logoGuide: {
    top: '20%',
    left: '15%',
    width: '25%',
    height: '12%'
  },

  tableGuide: {
    top: '35%',
    left: '5%',
    width: '90%',
    height: '30%'
  }
};

// Z-Index Layers
export const Z_INDEX = {
  modal: 9999,
  overlay: 20,
  guides: 22,
  instructions: 25,
  controls: 30
};

// Camera Controls Styling
export const CONTROL_STYLES = {
  captureButton: {
    size: '70px',
    borderWidth: '4px',
    innerSize: '50px'
  },
  closeButton: {
    size: '40px',
    fontSize: '24px'
  },
  stepIndicator: {
    bottom: '140px',
    numberSize: '30px'
  },
  controlsHeight: '120px'
};