import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Camera, Palette, Music2, ChefHat, Hand, CalendarCheck, LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  searchPath: string;
}

const categories: Category[] = [
  {
    id: 'photographer',
    name: 'Photographer',
    icon: Camera,
    searchPath: '/search?category=photographer&view=vendors',
  },
  {
    id: 'decorator',
    name: 'Decorator',
    icon: Palette,
    searchPath: '/search?category=decorator&view=vendors',
  },
  {
    id: 'dj',
    name: 'DJ / Sound & Lights',
    icon: Music2,
    searchPath: '/search?category=dj&view=vendors',
  },
  {
    id: 'mua',
    name: 'Makeup Artist',
    icon: Sparkles,
    searchPath: '/search?category=mua&view=vendors',
  },
  {
    id: 'caterer',
    name: 'Caterer',
    icon: ChefHat,
    searchPath: '/search?category=caterer&view=vendors',
  },
  {
    id: 'mehendi',
    name: 'Mehendi Artist',
    icon: Hand,
    searchPath: '/search?category=mehendi&view=vendors',
  },
  {
    id: 'event-coordinator',
    name: 'Event Planners',
    icon: CalendarCheck,
    searchPath: '/search?category=event-coordinator&view=vendors',
  },
];

// Event images from public folder
const galleryImages = {
  decor: '/Aditi Rao Hydari\'s Dreamy Wedding Decor Setup at Alila Fort Bishangarh.jpeg', // Wedding decor
  event: '/Background event Photos - Download Free High-Quality Pictures _ Freepik.jpeg', // Event background
  colorful: '/Rainbow Hued Décor Ideas That Wowed Us!.jpeg', // Colorful decor
};

export const CategoryServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Animate service cards with stagger
            const cards = entry.target.querySelectorAll('.service-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, index * 50);
            });
            // Unobserve after animation to prevent re-triggering
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string) => {
    const img = e.currentTarget as HTMLImageElement;
    // Prevent infinite loops by checking if already using fallback
    if (img.dataset.fallbackUsed === 'true') return;
    
    if (fallback) {
      img.dataset.fallbackUsed = 'true';
      img.src = fallback;
    } else {
      // Use a data URI placeholder to prevent further errors
      img.dataset.fallbackUsed = 'true';
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3C/svg%3E';
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative pt-12 md:pt-20 pb-0 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center animate-fade-in-up">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Explore Categories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight">
            Browse
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Service Providers
            </span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start">
          {/* Left Column - Services */}
          <section className="flex flex-col order-2 lg:order-1">
            {/* Services selection card */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm min-h-[400px] sm:h-[436px] md:h-[576px] flex flex-col justify-center">
              <h4 className="text-base sm:text-lg font-medium text-muted-foreground mb-4 sm:mb-6">
                What are you looking for?
              </h4>
              {/* Grid container for service categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={category.searchPath}
                    className={cn(
                      "service-card flex flex-col items-center justify-center text-center p-4 bg-muted/50 rounded-lg hover:bg-primary/10 transition-all duration-300 group animate-on-scroll",
                      index === 6 && "sm:col-start-2" // Event Planners spans 2 columns on small screens
                    )}
                    style={{
                      opacity: 0,
                      transform: 'translateY(20px)',
                      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                    }}
                  >
                    <div 
                      className="w-12 h-12 mb-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/20 p-2 group-hover:scale-110 transition-all duration-300 flex items-center justify-center"
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) rotateX(-5deg) scale(1.1) translateZ(10px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1) translateZ(0px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(99, 102, 241, 0.1)';
                      }}
                    >
                      <category.icon 
                        className="w-6 h-6 text-primary group-hover:text-primary-glow transition-colors duration-300"
                        style={{
                          transform: 'translateZ(5px)',
                          filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column - Image Gallery */}
          <aside className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 order-1 lg:order-2">
            {/* Top image, spans full width */}
            <div className="col-span-2 row-span-1">
              <div className="relative w-full h-[200px] sm:h-[250px] md:h-[340px] rounded-xl overflow-hidden group">
                <img
                  alt="Dreamy wedding decor setup"
                  src={galleryImages.decor}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Bottom left image */}
            <div className="col-span-1 row-span-1">
              <div className="relative w-full h-[140px] sm:h-[170px] md:h-[220px] rounded-xl overflow-hidden group">
                <img
                  alt="Event background"
                  src={galleryImages.event}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Bottom right image */}
            <div className="col-span-1 row-span-1">
              <div className="relative w-full h-[140px] sm:h-[170px] md:h-[220px] rounded-xl overflow-hidden group">
                <img
                  alt="Colorful décor ideas"
                  src={galleryImages.colorful}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

