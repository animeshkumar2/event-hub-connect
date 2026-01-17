import { useEffect, useState } from 'react';

interface BrandedLoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export function BrandedLoader({ fullScreen = true, message }: BrandedLoaderProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Logo */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/20 animate-spin" 
             style={{ animationDuration: '3s' }} />
        
        {/* Inner pulsing ring */}
        <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-primary/40 animate-pulse" />
        
        {/* Center logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">
              <span className="text-primary">cart</span>
              <span className="text-primary/80">event</span>
              <span className="text-secondary">.</span>
            </div>
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 w-24 h-24 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
        </div>
        <div className="absolute inset-0 w-24 h-24 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rounded-full" />
        </div>
      </div>

      {/* Loading text */}
      {message && (
        <div className="text-center">
          <p className="text-foreground/80 font-medium">
            {message}{dots}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
