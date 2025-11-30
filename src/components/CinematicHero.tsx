import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
    <section className="relative min-h-[100vh] overflow-hidden pb-32">
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
        <div className="flex items-center min-h-[100vh] py-20">
          <div className="max-w-4xl space-y-8">
            {/* Main Headline - Bold, Stretched Typography */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tight">
              BOOK EVENT
              <br />
              VENDORS
            </h1>
            
            {/* Subtext Line */}
            <div className="h-1 w-24 bg-white/80" />
            
            {/* Animated Text Slides Container */}
            <div className="relative min-h-[320px] md:min-h-[280px] overflow-visible">
              {/* Slide 1: Vendor Types */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-in-out",
                  activeSlide === 0
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 -translate-x-full z-0"
                )}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  Find All Your
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Event Vendors
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide max-w-3xl leading-relaxed mb-8">
                  Photographers · Decorators · DJs · Makeup Artists · Caterers · More — All in One Place.
                </p>
                <div className="pt-4 relative z-20">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-2xl hover:shadow-primary/50 hover-lift transition-all duration-300 group"
                    asChild
                  >
                    <Link to="/search">
                      <Search className="mr-2 h-5 w-5" />
                      Browse Categories
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  Plan Your Complete
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                    Event Experience
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide max-w-3xl leading-relaxed mb-8">
                  Tell us your budget and event details. We'll recommend the perfect vendors and you can book them all in one checkout!
                </p>
                <div className="pt-4 relative z-20">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-2xl hover:shadow-primary/50 hover-lift transition-all duration-300 group"
                    asChild
                  >
                    <Link to="/event-planner">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Planning Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
