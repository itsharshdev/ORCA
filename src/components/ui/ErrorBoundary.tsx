import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ORCA Component Error Boundary caught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[250px] hud-glass rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-rose-500/30 text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-label-caps tracking-wider">
              {this.props.fallbackTitle || 'COMPONENT RENDER INTERRUPTED'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md font-sans">
              {this.props.fallbackMessage || 'An unexpected rendering error occurred. You can retry mounting the component.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-label-caps flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY COMPONENT</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
