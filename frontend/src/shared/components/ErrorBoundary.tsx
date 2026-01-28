import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          </div>

          {/* Main content */}
          <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
            {/* Animated error icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Pulsing rings */}
                <div className="absolute inset-0 w-32 h-32 -left-16 -top-16 rounded-full border-4 border-destructive/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 w-24 h-24 -left-12 -top-12 rounded-full border-4 border-destructive/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                
                {/* Center icon */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-primary">Oops!</span>
                <span className="text-foreground"> Something went wrong</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Reload Page
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="min-w-[200px] border-2 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all"
              >
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Button>
            </div>

            {/* Brand footer */}
            <div className="pt-8 text-sm text-muted-foreground">
              <p>
                Need help? Contact us at{' '}
                <a href="mailto:support@cartevent.com" className="text-primary hover:underline">
                  support@cartevent.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}










