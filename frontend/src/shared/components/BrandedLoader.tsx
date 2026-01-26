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
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Animated Logo Container with Glow Effect */}
      <div className="relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl animate-pulse" />
        
        {/* Outer rotating ring with gradient */}
        <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-border animate-spin" 
             style={{ 
               animationDuration: '3s',
               background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--primary) 100%)',
               WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               WebkitMaskComposite: 'xor',
               maskComposite: 'exclude',
               padding: '4px'
             }} />
        
        {/* Middle rotating ring - opposite direction */}
        <div className="absolute inset-3 w-22 h-22 rounded-full border-[3px] border-primary/30 animate-spin" 
             style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        
        {/* Inner pulsing ring */}
        <div className="absolute inset-5 w-18 h-18 rounded-full border-[3px] border-secondary/40 animate-pulse" 
             style={{ animationDuration: '1.5s' }} />
        
        {/* Center logo with enhanced styling */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="text-center transform transition-transform hover:scale-110">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-primary drop-shadow-lg">cart</span>
              <span className="text-primary/90 drop-shadow-lg">event</span>
              <span className="text-secondary drop-shadow-lg animate-pulse">.</span>
            </div>
          </div>
        </div>
        
        {/* Orbiting dots with trails */}
        <div className="absolute inset-0 w-28 h-28 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
        </div>
        <div className="absolute inset-0 w-28 h-28 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.33s' }}>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-secondary rounded-full shadow-lg shadow-secondary/50" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-secondary/40 rounded-full" />
        </div>
        <div className="absolute inset-0 w-28 h-28 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.66s' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
        </div>
      </div>

      {/* Loading text with enhanced styling */}
      {message && (
        <div className="text-center space-y-3 animate-fade-in">
          <p className="text-lg font-semibold text-foreground bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent animate-pulse">
            {message}{dots}
          </p>
          {/* Progress bar - centered */}
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer" 
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }} />
          </div>
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
