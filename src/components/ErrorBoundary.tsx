import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void-950 text-void-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-void-900 border border-void-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircleIcon className="w-6 h-6 text-red-400" />
              <h2 className="text-lg font-semibold text-void-100">Something went wrong</h2>
            </div>
            
            <p className="text-void-300 mb-4">
              The Void editor encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-void-400 hover:text-void-300">
                  Error Details
                </summary>
                <pre className="mt-2 p-2 bg-void-800 rounded text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
