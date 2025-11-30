import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Sparkles className="h-3 w-3 mr-2" />
            Explore Categories
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
            Browse by
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of event vendors
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative px-12">
          {/* Navigation Arrows - Fixed positioning */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8"
            style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 12px' }}
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="flex-shrink-0 w-[360px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className="group relative h-[500px] overflow-hidden rounded-2xl border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
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
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content Overlay */}
                  <CardContent className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="space-y-4">
                      {/* Category Badge */}
                      <Badge className="bg-primary/20 backdrop-blur-md border-primary/30 text-white">
                        {category.name}
                      </Badge>

                      <h3 className="text-3xl md:text-4xl font-black mb-2 group-hover:text-primary-glow transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">
                        {category.description}
                      </p>

                      {/* CTA Button */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pt-4">
                        <Button
                          className="bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary border-0 shadow-lg rounded-xl transition-all duration-300"
                        >
                          Browse {category.name}s
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  {/* Subtle Glow Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
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
