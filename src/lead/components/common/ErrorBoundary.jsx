import React from 'react';
import { View } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error a servicio de monitoreo (ej: Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar a un servicio de logging
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ⚠️ Algo salió mal
            </h2>

            <p className="text-gray-600 mb-4">
              Ocurrió un error inesperado al cargar tu análisis. No te preocupes, tus datos están seguros.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                  Detalles técnicos (solo en desarrollo)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Intentar de nuevo
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver al inicio
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Si el problema persiste, contáctanos en{' '}
              <a href="mailto:soporte@enerbook.mx" className="text-orange-500 hover:underline">
                soporte@enerbook.mx
              </a>
            </p>
          </div>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
