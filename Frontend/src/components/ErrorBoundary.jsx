import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry, LogRocket)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can send to external service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E11] text-[#E6E8E5] p-6">
          <div className="max-w-2xl w-full space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <AlertTriangle className="relative w-20 h-20 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                System Error
              </h1>
              <p className="text-lg text-white/60 font-mono">
                Something went wrong. Don't worry, we're on it.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-[#1A1D21] border border-red-500/20 rounded-lg p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-mono text-red-400 uppercase tracking-wider">
                    Error Details:
                  </p>
                  <pre className="text-xs text-white/80 overflow-x-auto whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </div>
                {this.state.errorInfo && (
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-red-400 uppercase tracking-wider">
                      Component Stack:
                    </p>
                    <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-words max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="group relative px-8 py-4 flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 hover:border-[#17E1FF] transition-colors"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <RefreshCw
                  size={18}
                  className="relative z-10 group-hover:text-black transition-colors"
                />
                <span className="relative z-10 font-bold uppercase tracking-wider text-sm group-hover:text-black transition-colors">
                  Reload Page
                </span>
              </button>

              <button
                onClick={this.handleReset}
                className="group relative px-8 py-4 flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 hover:border-white/40 transition-colors"
              >
                <Home size={18} className="relative z-10" />
                <span className="relative z-10 font-bold uppercase tracking-wider text-sm">
                  Go Home
                </span>
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
                If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
