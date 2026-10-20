import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import i18n from '../lib/i18n.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, errors can be dispatched to an error aggregation service
    if (process.env.NODE_ENV !== 'production') {
      process.stderr.write(`Uncaught error: ${error.message}\n${errorInfo.componentStack}\n`);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FFFDF9] dark:bg-[#171311] text-[#3A2E2A] dark:text-[#F5EFEB]">
          <div className="max-w-md w-full p-8 rounded-[12px] border border-[#B83226]/30 bg-white dark:bg-[#1F1A17] dark:border-[#E56658]/40 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-[8px] bg-[#B83226]/10 dark:bg-[#E56658]/10 flex items-center justify-center text-[#B83226] dark:text-[#E56658]">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">{i18n.t('error.title')}</h1>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] mb-6 leading-relaxed">
              {i18n.t('error.message')}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold text-white bg-[#C4562B] hover:bg-[#AF4A23] active:bg-[#993E1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>{i18n.t('error.retry')}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
