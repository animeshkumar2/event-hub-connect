import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Users, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { eventTypes } from '@/shared/constants/mockData';

interface EventCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string; // For background
  cardImage?: string; // For card image (optional, falls back to image)
  gradient: string;
  icon: string;
  stats: {
    label: string;
    value: string;
  };
  link: string;
}

const eventCards: EventCard[] = [
  {
    id: 'wedding',
    title: 'Wedding',
    subtitle: 'Your Perfect Day',
    description: 'Complete wedding services from photography to catering, all in one place',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=1920&h=1080&fit=crop&q=80',
    cardImage: "/Aditi Rao Hydari's Dreamy Wedding Decor Setup at Alila Fort Bishangarh.jpeg",
    gradient: 'from-amber-900/80 via-yellow-800/70 to-amber-700/80',
    icon: '💒',
    stats: { label: 'Weddings Booked', value: '2,500+' },
    link: '/search?eventType=Wedding',
  },
  {
    id: 'birthday',
    title: 'Birthday',
    subtitle: 'Celebrate in Style',
    description: 'Make every birthday unforgettable with our curated vendors',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&h=1080&fit=crop&q=80',
    cardImage: '/_.jpeg',
    gradient: 'from-blue-600/80 via-cyan-500/70 to-indigo-600/80',
    icon: '🎂',
    stats: { label: 'Birthdays Celebrated', value: '5,000+' },
    link: '/search?eventType=Birthday',
  },
  {
    id: 'corporate',
    title: 'Corporate',
    subtitle: 'Professional Events',
    description: 'Elevate your corporate events with premium services',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop&q=80',
    cardImage: '/_.jpeg',
    gradient: 'from-slate-800/80 via-gray-700/70 to-slate-600/80',
    icon: '💼',
    stats: { label: 'Corporate Events', value: '1,200+' },
    link: '/search?eventType=Corporate',
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    subtitle: 'Mark the Milestone',
    description: 'Celebrate your special moments with elegance and style',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&h=1080&fit=crop&q=80',
    cardImage: '/_.jpeg',
    gradient: 'from-pink-700/80 via-rose-600/70 to-red-600/80',
    icon: '💝',
    stats: { label: 'Anniversaries', value: '800+' },
    link: '/search?eventType=Anniversary',
  },
  {
    id: 'engagement',
    title: 'Engagement',
    subtitle: 'Start Your Journey',
    description: 'Begin your forever story with beautiful engagement celebrations',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=1920&h=1080&fit=crop&q=80',
    cardImage: '/_.jpeg',
    gradient: 'from-purple-700/80 via-pink-600/70 to-rose-600/80',
    icon: '💍',
    stats: { label: 'Engagements', value: '1,500+' },
    link: '/search?eventType=Engagement',
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower',
    subtitle: 'Welcome the Little One',
    description: 'Celebrate new beginnings with joy and excitement',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&h=1080&fit=crop&q=80',
    cardImage: '/_.jpeg',
    gradient: 'from-pink-500/80 via-purple-500/70 to-indigo-500/80',
    icon: '👶',
    stats: { label: 'Baby Showers', value: '600+' },
    link: '/search?eventType=Baby Shower',
  },
];

export const InteractiveEventShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-rotate cards every 5 seconds (disabled for scrolling)
  useEffect(() => {
    if (isPaused) return;
    // Disable auto-rotation when using scroll
    // const interval = setInterval(() => {
    //   setActiveIndex((prev) => (prev + 1) % eventCards.length);
    // }, 5000);
    // return () => clearInterval(interval);
  }, [isPaused, eventCards.length]);

  const activeCard = eventCards[activeIndex];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.offsetWidth; // Full width of container
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const goToNext = () => {
    scroll('right');
  };

  const goToPrevious = () => {
    scroll('left');
  };

  const goToEvent = (eventType: string) => {
    const index = eventCards.findIndex(card => card.title === eventType);
    if (index !== -1) {
      goToSlide(index);
    }
  };

  return (
    <section 
      className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-b from-background to-muted/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate the main card
                const card = entry.target.querySelector('.main-event-card');
                if (card) {
                  setTimeout(() => {
                    (card as HTMLElement).style.opacity = '1';
                    (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
                  }, 200);
                }
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );
        observer.observe(el);
      }}
    >
      {/* Sliding Background Images */}
      <div className="absolute inset-0">
        {eventCards.map((card, index) => (
          <div
            key={card.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === activeIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
            )}
            style={{
              backgroundImage: `url(${card.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br', card.gradient)} />
          </div>
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Explore Event Types
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
            Plan Your Perfect
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Celebration
            </span>
          </h2>
        </div>

        {/* Scrollable Card Container - Same as category carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute -left-3 md:-left-10 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-colors duration-200"
            aria-label="Previous event"
            style={{ willChange: 'auto' }}
          >
            <ChevronLeft className="h-5 w-5 text-primary" style={{ transform: 'translateZ(0)' }} />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-3 md:-right-10 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-colors duration-200"
            aria-label="Next event"
            style={{ willChange: 'auto' }}
          >
            <ChevronRight className="h-5 w-5 text-primary" style={{ transform: 'translateZ(0)' }} />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 16px' }}
          >
            {eventCards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className={cn(
                  "main-event-card relative border-0 shadow-xl overflow-hidden bg-white rounded-xl animate-on-scroll",
                  "animate-scale-in"
                )} style={{
                  opacity: index === activeIndex ? 1 : 0.7,
                  transform: index === activeIndex ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image Side - Clear without blur */}
                    <div className="relative aspect-square md:aspect-auto md:h-[400px] overflow-hidden">
                      <img
                        src={card.cardImage || card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content Side */}
                    <CardContent className="flex flex-col justify-between p-5 md:p-6 bg-gradient-to-br from-slate-50 to-white">
                      <div className="space-y-3">
                        {/* Icon and Badge */}
                        <div className="flex items-center gap-2.5">
                          <div className="text-3xl md:text-4xl">
                            {card.icon}
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-medium">
                            {card.subtitle}
                          </Badge>
                        </div>

                        {/* Title - Smaller */}
                        <h3 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                          {card.title}
                        </h3>

                        {/* Description - Smaller */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>

                        {/* Stats - Smaller */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-foreground">{card.stats.value}</div>
                              <div className="text-xs text-muted-foreground">{card.stats.label}</div>
                            </div>
                          </div>
                          <div className="h-6 w-px bg-border" />
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-foreground">8+</div>
                              <div className="text-xs text-muted-foreground">Cities</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4 border-t">
                        <Button 
                          size="default" 
                          className="w-full text-sm px-6 py-5 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-semibold shadow-lg hover-lift transition-all duration-300 group micro-bounce"
                          asChild
                        >
                          <Link to={card.link}>
                            Explore {card.title} Packages
                            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform smooth-transition" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* All Event Types - Bottom Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {eventTypes.map((eventType) => {
            const card = eventCards.find(c => c.title === eventType);
            const isActive = activeCard.title === eventType;
            
            return (
              <button
                key={eventType}
                onClick={() => goToEvent(eventType)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 hover-lift backdrop-blur-md border-2',
                  isActive
                    ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {card?.icon && <span className="text-base">{card.icon}</span>}
                  <span>{eventType}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {eventCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => goToSlide(index)}
              className={cn(
                'relative h-2 rounded-full transition-all duration-500',
                index === activeIndex
                  ? 'w-12 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to ${card.title}`}
            >
              {index === activeIndex && (
                <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

