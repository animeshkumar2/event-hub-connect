import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';

export const CinematicHero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 2);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] overflow-hidden pb-20">
      {/* Single Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/_.jpeg)',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Dark Gradient Overlay at Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content - Left Aligned, Bold Typography */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center min-h-[85vh] py-16">
          <div className="max-w-3xl space-y-6">
            {/* Main Headline - Bold, Stretched Typography */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
              BOOK EVENT
              <br />
              VENDORS
            </h1>
            
            {/* Subtext Line */}
            <div className="h-0.5 w-20 bg-white/80" />
            
            {/* Animated Text Slides Container */}
            <div className="relative min-h-[240px] md:min-h-[200px] overflow-visible">
              {/* Slide 1: Vendor Types */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-in-out",
                  activeSlide === 0
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 -translate-x-full z-0"
                )}
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                  Find All Your
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Event Vendors
                  </span>
                </h2>
                <p className="text-base md:text-lg text-white/90 font-light tracking-wide max-w-2xl leading-relaxed mb-6">
                  Photographers · Decorators · DJs · Makeup Artists · Caterers · More — All in One Place.
                </p>
                <div className="pt-2 relative z-20">
                  <Button 
                    size="default" 
                    className="text-sm px-6 py-5 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-xl hover:shadow-primary/50 hover-lift transition-all duration-300 group"
                    asChild
                  >
                    <Link to="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Categories
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Slide 2: Event Planner */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-in-out",
                  activeSlide === 1
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 translate-x-full z-0"
                )}
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                  Plan Your Complete
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Event Experience
                  </span>
                </h2>
                <p className="text-base md:text-lg text-white/90 font-light tracking-wide max-w-2xl leading-relaxed mb-6">
                  Tell us your budget and event details. We'll recommend the perfect vendors and you can book them all in one checkout!
                </p>
                <div className="pt-2 relative z-20">
                  <Button 
                    size="default" 
                    className="text-sm px-6 py-5 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-xl hover:shadow-primary/50 hover-lift transition-all duration-300 group"
                    asChild
                  >
                    <Link to="/event-planner">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Planning Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
