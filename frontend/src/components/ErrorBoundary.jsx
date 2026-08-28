import React from 'react'
import { AlertTriangle, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sentinel-mist flex items-center justify-center p-6 text-sentinel-ink font-sans">
          <div className="max-w-lg w-full rounded-lg border border-slate-200 bg-white p-6 shadow-md text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-sentinel-ink">
                Surveillance Interface Error Caught
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                A component runtime exception was intercepted to prevent a blank screen.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-md bg-slate-900 p-3 text-left font-mono text-xs text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-sentinel-teal px-4 text-xs font-bold text-white hover:bg-sentinel-teal-dark shadow-xs cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>Return to Command Centre</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
