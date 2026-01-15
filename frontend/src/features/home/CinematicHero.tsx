import { Camera, Music, Utensils, Sparkles, Palette, Heart } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { SlidingButtons } from './SlidingButtons';

export const CinematicHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const floatingIconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Parallax effect on scroll - limited to hero section height
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroHeight = heroRef.current.offsetHeight;
      const scrolled = window.scrollY;
      
      // Only apply parallax within the hero section bounds
      if (scrolled < heroHeight) {
        const parallax = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${parallax}px)`;
      } else {
        // Reset transform when scrolled past hero section
        heroRef.current.style.transform = 'translateY(0)';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating icons animation
  const floatingIcons = [
    { icon: Camera, delay: 0, x: '10%', y: '20%' },
    { icon: Music, delay: 0.5, x: '85%', y: '30%' },
    { icon: Utensils, delay: 1, x: '15%', y: '70%' },
    { icon: Sparkles, delay: 1.5, x: '80%', y: '65%' },
    { icon: Palette, delay: 2, x: '50%', y: '15%' },
    { icon: Heart, delay: 2.5, x: '70%', y: '80%' },
  ];

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85vh] md:min-h-[90vh] max-h-[90vh] overflow-hidden z-0"
      style={{
        isolation: 'isolate',
        willChange: 'transform',
      }}
    >
      {/* Background Image with Strong Blur */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/_.jpeg)',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.4)',
            transform: `scale(1.15) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
        {/* Strong Dark Overlay for Better Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60" />
      </div>

      {/* Animated Blur Circles Behind Text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            animation: 'pulse-slow 4s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(${-mousePosition.x * 0.05}px, ${-mousePosition.y * 0.05}px)`,
            animation: 'pulse-slow 4s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-primary-glow/15 blur-3xl"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
            animation: 'pulse-slow 5s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Floating Icons */}
      <div ref={floatingIconsRef} className="absolute inset-0 pointer-events-none z-0">
        {floatingIcons.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="absolute opacity-25 hover:opacity-40 transition-opacity duration-300 animate-float-icon"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <Icon 
                className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Content - Center Aligned */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-center min-h-[85vh] md:min-h-[90vh] py-12 sm:py-16 md:py-20">
          <div 
            ref={textRef}
            className={cn(
              "max-w-4xl space-y-4 sm:space-y-6 text-center px-2",
              isLoaded && "animate-fade-in-up"
            )} 
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
            }}
          >
            {/* Main Headline - Center Aligned, Smaller */}
            <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] sm:leading-[1.2] tracking-tight drop-shadow-2xl">
                <span 
                  className={cn(
                    "inline-block",
                    isLoaded && "animate-hero-slide-in-left"
                  )}
                  style={{
                    animationDelay: isLoaded ? '0.2s' : '0s',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  One Stop
                </span>
                <br />
                <span 
                  className={cn(
                    "inline-block",
                    isLoaded && "animate-hero-slide-in-left"
                  )}
                  style={{
                    animationDelay: isLoaded ? '0.4s' : '0s',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  for All Your
                </span>
                <br />
                <span 
                  className={cn(
                    "inline-block bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-gradient-text",
                    isLoaded && "animate-hero-slide-in-left"
                  )}
                  style={{
                    animationDelay: isLoaded ? '0.6s' : '0s',
                    filter: 'drop-shadow(0 4px 20px rgba(120, 103, 220, 0.5))',
                  }}
                >
                  Events
                </span>
              </h1>
            </div>
            
            {/* Decorative Line - Centered */}
            <div 
              className={cn(
                "h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-5",
                isLoaded && "animate-hero-expand-width"
              )}
              style={{
                animationDelay: isLoaded ? '0.8s' : '0s',
              }}
            />
            
            {/* Sliding Buttons - Centered */}
            <div 
              className={cn(
                "flex justify-center",
                isLoaded && "animate-hero-bounce-in"
              )}
              style={{
                animationDelay: isLoaded ? '1.2s' : '0s',
              }}
            >
              <SlidingButtons />
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Particles - More Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => {
          const delay = Math.random() * 5;
          const duration = Math.random() * 10 + 15;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-float-particle blur-sm"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    </section>
  );
};
