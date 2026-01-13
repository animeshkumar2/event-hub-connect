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
    image: '/events/haldi.jpg',
    cardImage: '/events/mehendi.jpg',
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
    image: '/events/birthday2.jpg',
    cardImage: '/events/birthday.jpg',
    gradient: 'from-blue-600/80 via-cyan-500/70 to-indigo-600/80',
    icon: '🎂',
    stats: { label: 'Birthdays Celebrated', value: '5,000+' },
    link: '/search?eventType=Birthday',
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    subtitle: 'Mark the Milestone',
    description: 'Celebrate your special moments with elegance and style',
    image: '/events/anniversary.jpg',
    cardImage: '/events/anniversary.jpg',
    gradient: 'from-pink-700/80 via-rose-600/70 to-red-600/80',
    icon: '💝',
    stats: { label: 'Anniversaries', value: '800+' },
    link: '/search?eventType=Anniversary',
  },
  {
    id: 'corporate',
    title: 'Corporate',
    subtitle: 'Professional Events',
    description: 'Elevate your corporate events with premium services',
    image: '/events/corporate.jpg',
    cardImage: '/events/corporate.jpg',
    gradient: 'from-slate-800/80 via-gray-700/70 to-slate-600/80',
    icon: '💼',
    stats: { label: 'Corporate Events', value: '1,200+' },
    link: '/search?eventType=Corporate',
  },
  {
    id: 'engagement',
    title: 'Engagement',
    subtitle: 'Start Your Journey',
    description: 'Begin your forever story with beautiful engagement celebrations',
    image: '/events/engagement.jpg',
    cardImage: '/events/engagement.jpg',
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
    image: '/events/baby_shower.jpg',
    cardImage: '/events/baby-shower2.jpg',
    gradient: 'from-pink-500/80 via-purple-500/70 to-indigo-500/80',
    icon: '👶',
    stats: { label: 'Baby Showers', value: '600+' },
    link: '/search?eventType=Baby Shower',
  },
  {
    id: 'other',
    title: 'Other',
    subtitle: 'Custom Events',
    description: 'We support all types of celebrations! From festivals to reunions, we\'re expanding to cover every special moment.',
    image: '/events/corporate.jpg',
    cardImage: '/events/corporate.jpg',
    gradient: 'from-gray-700/80 via-slate-600/70 to-gray-500/80',
    icon: '🎉',
    stats: { label: 'Custom Events', value: 'Coming Soon' },
    link: '/search?eventType=Other',
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
    // Get the first card element to calculate proper width
    const firstCard = container.querySelector('.flex-shrink-0') as HTMLElement;
    if (!firstCard) return;
    // Get computed gap from container
    const containerStyle = window.getComputedStyle(container);
    const gap = parseInt(containerStyle.gap) || 16;
    const cardWidth = firstCard.offsetWidth + gap;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const firstCard = scrollRef.current.querySelector('.flex-shrink-0') as HTMLElement;
    if (!firstCard) return;
    // Get computed gap from container
    const containerStyle = window.getComputedStyle(scrollRef.current);
    const gap = parseInt(containerStyle.gap) || 16;
    const cardWidth = firstCard.offsetWidth + gap;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, newIndex), eventCards.length - 1));
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
      className="relative py-8 sm:py-12 md:py-20 overflow-x-hidden bg-gradient-to-b from-background to-muted/30"
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
      <div className="relative z-20 container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-2 sm:mb-3 bg-white/20 backdrop-blur-md text-white border-white/30 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Explore Event Types
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 px-2">
            Plan Your Perfect
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Celebration
            </span>
          </h2>
        </div>

        {/* Scrollable Card Container - Same as category carousel */}
        <div className="relative max-w-5xl mx-auto w-full px-2 sm:px-4 md:px-0">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-0 md:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white shadow-xl border-2 border-primary/30 hover:border-primary hover:shadow-2xl hover:scale-110 transition-all duration-200"
            aria-label="Previous event"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </button>

          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-0 md:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white shadow-xl border-2 border-primary/30 hover:border-primary hover:shadow-2xl hover:scale-110 transition-all duration-200"
            aria-label="Next event"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory w-full"
            style={{ 
              scrollSnapType: 'x mandatory', 
              scrollPadding: '0 12px',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              maxWidth: '100%',
              overflowY: 'hidden'
            }}
          >
            {eventCards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-[calc(100%-24px)] sm:w-[calc(100%-32px)] md:w-[calc(100%-48px)] lg:w-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className={cn(
                  "main-event-card relative border-0 shadow-xl overflow-hidden bg-white rounded-lg sm:rounded-xl animate-on-scroll w-full",
                  "animate-scale-in"
                )} style={{
                  opacity: index === activeIndex ? 1 : 0.7,
                  transform: index === activeIndex ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
                    {/* Image Side - Clear without blur */}
                    <div className="relative aspect-square sm:aspect-[4/3] md:aspect-auto md:h-[400px] overflow-hidden w-full">
                      <img
                        src={card.cardImage || card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Content Side */}
                    <CardContent className="flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-[280px] sm:min-h-[320px] md:min-h-[400px] w-full">
                      <div className="space-y-2 sm:space-y-3">
                        {/* Icon and Badge */}
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="text-2xl sm:text-3xl md:text-4xl">
                            {card.icon}
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-2 sm:px-2.5 py-0.5 text-xs font-medium">
                            {card.subtitle}
                          </Badge>
                        </div>

                        {/* Title - Smaller */}
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-foreground leading-tight">
                          {card.title}
                        </h3>

                        {/* Description - Smaller */}
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>

                        {/* PHASE 1: Stats commented out - will show real data in Phase 2 */}
                        {/* <div className="flex items-center gap-3 sm:gap-4 pt-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10">
                              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-foreground">{card.stats.value}</div>
                              <div className="text-xs text-muted-foreground leading-tight">{card.stats.label}</div>
                            </div>
                          </div>
                          <div className="h-5 sm:h-6 w-px bg-border" />
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10">
                              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-foreground">8+</div>
                              <div className="text-xs text-muted-foreground leading-tight">Cities</div>
                            </div>
                          </div>
                        </div> */}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-3 sm:pt-4 border-t mt-auto">
                        <div className="relative">
                          {/* PHASE 1: Soon Badge on Button */}
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-75 animate-pulse"></div>
                              <Badge className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 shadow-lg uppercase tracking-wider border-0">
                                Soon
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            size="default" 
                            className="w-full text-xs sm:text-sm px-4 sm:px-6 py-3 sm:py-5 rounded-lg bg-gradient-to-r from-primary/40 to-primary-glow/40 text-white font-semibold shadow-lg cursor-not-allowed"
                            disabled
                          >
                            Explore {card.title} Packages
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* All Event Types - Bottom Navigation */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 px-2">
          {eventTypes.map((eventType) => {
            const card = eventCards.find(c => c.title === eventType);
            const isActive = activeCard.title === eventType;
            
            return (
              <button
                key={eventType}
                onClick={() => goToEvent(eventType)}
                className={cn(
                  'px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all duration-300 hover-lift backdrop-blur-md border-2',
                  isActive
                    ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30'
                )}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  {card?.icon && <span className="text-sm sm:text-base">{card.icon}</span>}
                  <span className="whitespace-nowrap">{eventType}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Indicators */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-1.5 sm:gap-2">
          {eventCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => goToSlide(index)}
              className={cn(
                'relative h-1.5 sm:h-2 rounded-full transition-all duration-500',
                index === activeIndex
                  ? 'w-8 sm:w-12 bg-white'
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
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

