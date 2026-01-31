import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Palette, Music2, ChefHat, Building2, Theater, LucideIcon, CalendarCheck } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { usePreLaunch } from '@/shared/contexts/PreLaunchContext';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  searchPath: string;
}

const categories: Category[] = [
  { id: 'photo-video', name: 'Photographer', icon: Camera, searchPath: '/search?category=photo-video&view=vendors' },
  { id: 'decorator', name: 'Decorator', icon: Palette, searchPath: '/search?category=decorator&view=vendors' },
  { id: 'dj', name: 'DJ / Sound & Lights', icon: Music2, searchPath: '/search?category=dj&view=vendors' },
  { id: 'mua', name: 'Makeup Artist', icon: Sparkles, searchPath: '/search?category=mua&view=vendors' },
  { id: 'caterer', name: 'Caterer', icon: ChefHat, searchPath: '/search?category=caterer&view=vendors' },
  { id: 'artists', name: 'Mehendi Artist', icon: Theater, searchPath: '/search?category=artists&view=vendors' },
  { id: 'venue', name: 'Event Planners', icon: CalendarCheck, searchPath: '/search?category=venue&view=vendors' },
];

const galleryImages = [
  { src: '/events/corporate.webp', alt: 'Corporate event' },
  { src: '/events/birthday2.webp', alt: 'Birthday celebration' },
  { src: '/events/concert.webp', alt: 'Concert' },
  { src: '/events/engagement.webp', alt: 'Engagement' },
  { src: '/events/haldi.webp', alt: 'Haldi ceremony' },
];

export const CategoryServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { hasFullAccess } = usePreLaunch();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.service-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, index * 60);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-12 md:py-20 bg-gradient-to-b from-background to-muted/20 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-10 md:mb-14">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Explore Services
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Browse{' '}
            <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Service Providers
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-stretch max-w-6xl mx-auto">
          
          {/* Left Side - Services Card (Hero) */}
          <div className="lg:col-span-3">
            {/* Services Card */}
            <div className="relative bg-gradient-to-br from-slate-50 via-primary/[0.02] to-secondary/[0.04] dark:from-slate-900 dark:via-primary/[0.05] dark:to-secondary/[0.08] border border-primary/10 rounded-2xl p-8 md:p-10 shadow-md shadow-primary/5">
              {/* Coming Soon Badge */}
              {!hasFullAccess && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-4 py-1.5 shadow-md uppercase tracking-wider border-0">
                    Coming Soon
                  </Badge>
                </div>
              )}
              
              <p className="text-lg text-muted-foreground mb-10 mt-2">
                What are you looking for?
              </p>
              
              {/* 3-column Services Grid with last item centered */}
              <div className="space-y-10">
                {/* First row - 3 items */}
                <div className="grid grid-cols-3 gap-6">
                  {categories.slice(0, 3).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300",
                        hasFullAccess 
                          ? "cursor-pointer hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-14 h-14 mb-3 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                        <category.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Second row - 3 items */}
                <div className="grid grid-cols-3 gap-6">
                  {categories.slice(3, 6).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300",
                        hasFullAccess 
                          ? "cursor-pointer hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-14 h-14 mb-3 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                        <category.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Third row - 1 item centered */}
                <div className="flex justify-center">
                  {categories.slice(6, 7).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 w-1/3",
                        hasFullAccess 
                          ? "cursor-pointer hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-14 h-14 mb-3 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                        <category.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image Collage */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3 self-stretch">
            {/* Left column */}
            <div className="flex flex-col gap-3">
              <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden group">
                <img 
                  src={galleryImages[0].src} 
                  alt={galleryImages[0].alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
              <div className="relative flex-[1.4] min-h-[220px] rounded-2xl overflow-hidden group">
                <img 
                  src={galleryImages[2].src} 
                  alt={galleryImages[2].alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
            </div>
            
            {/* Right column */}
            <div className="flex flex-col gap-3 pt-8">
              <div className="relative flex-[1.2] min-h-[200px] rounded-2xl overflow-hidden group">
                <img 
                  src={galleryImages[1].src} 
                  alt={galleryImages[1].alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
              <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden group">
                <img 
                  src={galleryImages[3].src} 
                  alt={galleryImages[3].alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
