import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';

export const PremiumHero = () => {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Collage Background */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {/* Top Left - Wedding */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 opacity-80" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=800')] bg-cover bg-center mix-blend-overlay opacity-30" />
        </div>
        
        {/* Top Right - DJ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-900 via-black to-indigo-900 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800')] bg-cover bg-center mix-blend-overlay opacity-40" />
        </div>
        
        {/* Bottom Left - Birthday */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-yellow-50 to-pink-100 opacity-80" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800')] bg-cover bg-center mix-blend-overlay opacity-30" />
        </div>
        
        {/* Bottom Right - Corporate */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-slate-700 via-slate-600 to-slate-500 opacity-85" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?w=800')] bg-cover bg-center mix-blend-overlay opacity-40" />
        </div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-[90vh] py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Book Trusted Event Vendors.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Transparent Prices. Instant Booking.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Photographers · Decorators · DJs · Caterers · Makeup Artists · More
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-elegant hover-lift" asChild>
              <Link to="/event-planner">
                <Sparkles className="mr-2 h-5 w-5" />
                Plan My Event
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 rounded-xl border-2 hover-lift bg-white/80 backdrop-blur-sm" 
              asChild
            >
              <Link to="/search">
                <Search className="mr-2 h-5 w-5" />
                Browse Vendors
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};


