import { useState, useRef } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'photographer',
    name: 'Photographer',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=1000&fit=crop&q=80',
    description: 'Capture your special moments',
  },
  {
    id: 'decorator',
    name: 'Decorator',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=800&h=1000&fit=crop&q=80',
    description: 'Transform spaces into magic',
  },
  {
    id: 'dj',
    name: 'DJ / Sound & Lights',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=1000&fit=crop&q=80',
    description: 'Keep the party going',
  },
  {
    id: 'mua',
    name: 'Makeup Artist',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=1000&fit=crop&q=80',
    description: 'Look stunning on your day',
  },
  {
    id: 'caterer',
    name: 'Caterer',
    image: 'https://images.unsplash.com/photo-1555244162-803834f90033?w=800&h=1000&fit=crop&q=80',
    description: 'Delicious food for all',
  },
  {
    id: 'mehendi',
    name: 'Mehendi Artist',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=1000&fit=crop&q=80',
    description: 'Beautiful henna designs',
  },
  {
    id: 'event-coordinator',
    name: 'Event Planner',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=1000&fit=crop&q=80',
    description: 'Complete event management',
  },
];

export const FuturisticCategoryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = 360 + 24; // Card width (360px) + gap (24px)
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 360 + 24;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 360 + 24;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  return (
    <section 
      className="relative py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate category cards with stagger
                const cards = entry.target.querySelectorAll('.category-card');
                cards.forEach((card, index) => {
                  setTimeout(() => {
                    (card as HTMLElement).style.opacity = '1';
                    (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
                  }, index * 80);
                });
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );
        observer.observe(el);
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center animate-fade-in-up">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Explore Categories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 leading-tight">
            Browse by
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of event vendors
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative px-8 md:px-10">
          {/* Navigation Arrows - Fixed positioning */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 micro-bounce smooth-transition"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 micro-bounce smooth-transition"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-6"
            style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 8px' }}
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}&view=vendors`}
                className="flex-shrink-0 w-[280px] md:w-[300px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className={cn(
                  "category-card group relative h-[380px] md:h-[400px] overflow-hidden rounded-xl border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-on-scroll",
                  "animate-scale-in"
                )} style={{
                  opacity: 0,
                  transform: 'translateY(40px) scale(0.9)',
                  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                }}>
                  {/* Full-bleed Image */}
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </div>

                  {/* Brand Colored Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary-glow to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content Overlay */}
                  <CardContent className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                    <div className="space-y-3">
                      {/* Category Badge */}
                      <Badge className="bg-primary/20 backdrop-blur-md border-primary/30 text-white text-xs px-2.5 py-0.5">
                        {category.name}
                      </Badge>

                      <h3 className="text-2xl md:text-3xl font-black mb-1.5 group-hover:text-primary-glow transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-xs group-hover:text-white transition-colors duration-300">
                        {category.description}
                      </p>

                      {/* CTA Button */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pt-3">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-lg rounded-lg transition-all duration-300 text-xs px-4 py-2"
                        >
                          Browse {category.name}s
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  {/* Subtle Glow Border */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-xl border-2 border-primary/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                currentIndex === index
                  ? 'w-12 bg-gradient-to-r from-primary via-primary-glow to-secondary'
                  : 'w-2 bg-primary/30 hover:bg-primary/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
