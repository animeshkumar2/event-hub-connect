import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Palette, Music2, ChefHat, Theater, LucideIcon, ClipboardList, Lightbulb, Mic } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { usePreLaunch } from '@/shared/contexts/PreLaunchContext';

interface Category {
  id: string;
  name: string;
  shortName: string; // For mobile
  icon: LucideIcon;
  searchPath: string;
}

const categories: Category[] = [
  { id: 'photo-video', name: 'Photographers', shortName: 'Photo', icon: Camera, searchPath: '/search?category=photo-video&view=vendors' },
  { id: 'decorator', name: 'Decorators', shortName: 'Décor', icon: Palette, searchPath: '/search?category=decorator&view=vendors' },
  { id: 'caterer', name: 'Caterers', shortName: 'Caterers', icon: ChefHat, searchPath: '/search?category=caterer&view=vendors' },
  { id: 'mua', name: 'Makeup Artists', shortName: 'Makeup', icon: Sparkles, searchPath: '/search?category=mua&view=vendors' },
  { id: 'dj', name: 'DJs', shortName: 'DJs', icon: Music2, searchPath: '/search?category=dj&view=vendors' },
  { id: 'sound-lights', name: 'Sound & Lights', shortName: 'Lights', icon: Lightbulb, searchPath: '/search?category=sound-lights&view=vendors' },
  { id: 'artists', name: 'Performers', shortName: 'Artists', icon: Theater, searchPath: '/search?category=artists&view=vendors' },
  { id: 'event-planner', name: 'Planners', shortName: 'Planners', icon: ClipboardList, searchPath: '/search?category=event-planner&view=vendors' },
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
              
              <p className="text-lg text-muted-foreground mb-6 sm:mb-10 mt-2">
                What are you looking for?
              </p>
              
              {/* Mobile: Horizontal scroll carousel */}
              <div className="sm:hidden -mx-8 px-4">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex-shrink-0 flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 snap-start",
                        "bg-white/80 backdrop-blur-sm border border-primary/10 shadow-sm min-w-[100px]",
                        hasFullAccess 
                          ? "cursor-pointer active:scale-95" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                        <category.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {category.shortName}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Swipe to explore →
                </p>
              </div>

              {/* Desktop: 4-column grid */}
              <div className="hidden sm:block space-y-6 sm:space-y-8">
                {/* First row - 4 items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {categories.slice(0, 4).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex flex-col items-center text-center p-3 sm:p-4 rounded-xl transition-all duration-300",
                        hasFullAccess 
                          ? "cursor-pointer hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                        <category.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">
                        <span className="hidden sm:inline">{category.name}</span>
                        <span className="sm:hidden">{category.shortName}</span>
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Second row - 4 items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {categories.slice(4, 8).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => hasFullAccess && navigate(category.searchPath)}
                      className={cn(
                        "service-card flex flex-col items-center text-center p-3 sm:p-4 rounded-xl transition-all duration-300",
                        hasFullAccess 
                          ? "cursor-pointer hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5" 
                          : "opacity-60"
                      )}
                      style={{ opacity: 0, transform: 'translateY(12px)', transition: 'all 0.4s ease-out' }}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                        <category.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">
                        <span className="hidden sm:inline">{category.name}</span>
                        <span className="sm:hidden">{category.shortName}</span>
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
