import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary para capturar errores de React
 * Uso: <ErrorBoundary><YourComponent /></ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (could send to monitoring service)
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    // Intentar recargar el componente
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizado
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            {/* Icono de error */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle size={48} className="text-red-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              ¡Ups! Algo salió mal
            </h1>

            {/* Mensaje */}
            <p className="text-gray-600 text-center mb-8">
              Lo sentimos, ha ocurrido un error inesperado. 
              {this.props.fallbackMessage || 'Por favor, intenta recargar la página o regresa al inicio.'}
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 p-4 bg-gray-50 rounded-lg">
                <summary className="font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                  Detalles técnicos (desarrollo)
                </summary>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-mono text-red-600">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-white rounded border">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Acciones */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={20} />
                Intentar de nuevo
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <Home size={20} />
                Ir al inicio
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
              Si el problema persiste, contacta al administrador del sistema.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
