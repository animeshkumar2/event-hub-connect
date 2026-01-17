import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Home, AlertTriangle, WifiOff } from 'lucide-react';

interface InlineErrorProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  type?: 'error' | 'network';
}

export function InlineError({ 
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  error,
  onRetry,
  showHomeButton = false,
  type = 'error'
}: InlineErrorProps) {
  const isNetworkError = type === 'network' || error?.toLowerCase().includes('fetch') || error?.toLowerCase().includes('network');
  
  const Icon = isNetworkError ? WifiOff : AlertTriangle;
  const defaultTitle = isNetworkError ? 'Connection Lost' : title;
  const defaultMessage = isNetworkError 
    ? 'Unable to connect to the server. Please try again.'
    : message;

  return (
    <div className="relative bg-gradient-to-br from-background via-primary/5 to-secondary/10 overflow-hidden h-screen flex items-center justify-center p-8 md:p-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      {/* Main content - centered both vertically and horizontally */}
      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-6">
        {/* Animated error icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 w-24 h-24 -left-12 -top-12 rounded-full border-4 border-destructive/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 w-20 h-20 -left-10 -top-10 rounded-full border-4 border-destructive/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            
            {/* Center icon */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-primary">Oops!</span>
            <span className="text-foreground"> {defaultTitle}</span>
          </h2>
          
          <p className="text-base text-muted-foreground">
            {defaultMessage}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Button
            size="lg"
            onClick={onRetry || (() => window.location.reload())}
            className="min-w-[180px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isNetworkError ? 'Reconnect' : 'Try Again'}
          </Button>
          
          {showHomeButton && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="min-w-[180px] border-2 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>

        {/* Brand footer */}
        <div className="pt-4 text-sm text-muted-foreground">
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
