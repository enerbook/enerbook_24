/**
 * Gradient configuration for Enerbook
 * Centralized gradients to maintain consistency across the app
 */

export const GRADIENTS = {
  // Brand primary gradient
  primary: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)',

  // Estado de cotizaciones
  pendiente: 'linear-gradient(135deg, #F59E0B 0%, #FFCB45 100%)',
  aceptada: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  rechazada: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',

  // Estado de proyectos
  abierto: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  cerrado: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
  adjudicado: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  en_progreso: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  completado: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  cancelado: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',

  // Métricas técnicas y categorías
  sistema: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  produccion: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  tarifa: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  ubicacion: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  consumo: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
  irradiacion: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
};

export default GRADIENTS;