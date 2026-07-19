import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[Skyline] Caught render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error)
          : this.props.fallback;
      }
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-lg font-semibold text-slate-800">Something didn't load correctly.</p>
          <p className="max-w-md text-sm text-slate-500">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
