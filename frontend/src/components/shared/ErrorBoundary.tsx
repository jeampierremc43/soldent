import React, { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  showDetails?: boolean
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary Component
 *
 * A production-ready React Error Boundary that catches JavaScript errors anywhere in the child component tree.
 * It displays a user-friendly error message and provides options to retry or view error details.
 *
 * Features:
 * - Catches unhandled errors in child components
 * - Displays graceful fallback UI
 * - Provides retry functionality to reset error state
 * - Logs errors to console in development
 * - Customizable fallback UI via render prop
 * - Custom error handler callback
 * - Option to show error details
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={(error, retry) => (
 *     <div>
 *       <p>Custom error: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   )}
 *   onError={(error, info) => {
 *     console.error('Error caught:', error, info)
 *   }}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
    }

    // Update state with error details
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, showDetails = false, className } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry)
      }

      // Default error UI
      return (
        <Card className={cn('m-4 border-red-200 bg-red-50', className)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  Oops! Algo salió mal
                </h2>

                <p className="text-sm text-red-700 mb-4">
                  Encontramos un error inesperado. Por favor, intenta nuevamente o
                  contacta con soporte si el problema persiste.
                </p>

                {/* Error message */}
                <div className="mb-4 p-3 bg-red-100 rounded-md border border-red-200">
                  <p className="font-mono text-xs text-red-800 break-words">
                    {error.toString()}
                  </p>
                </div>

                {/* Error details (only in development or if showDetails is true) */}
                {(process.env.NODE_ENV === 'development' || showDetails) && errorInfo && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-xs font-semibold text-red-700 hover:text-red-900">
                      Detalles técnicos
                    </summary>
                    <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-48 border border-red-200">
                      <code className="text-red-800">
                        {errorInfo.componentStack}
                      </code>
                    </pre>
                  </details>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={this.handleRetry}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                      'bg-red-600 text-white font-medium text-sm',
                      'hover:bg-red-700 active:bg-red-800',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    )}
                  >
                    <RotateCw className="h-4 w-4" />
                    Intentar de nuevo
                  </button>

                  <a
                    href="/"
                    className={cn(
                      'inline-flex items-center px-4 py-2 rounded-md',
                      'bg-gray-200 text-gray-700 font-medium text-sm',
                      'hover:bg-gray-300 active:bg-gray-400',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                    )}
                  >
                    Ir al inicio
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return children
  }
}

export default ErrorBoundary
