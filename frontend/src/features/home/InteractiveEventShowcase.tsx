import { useState, useEffect } from 'react';
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

  // Auto-rotate cards every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % eventCards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, eventCards.length]);

  const activeCard = eventCards[activeIndex];

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % eventCards.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + eventCards.length) % eventCards.length);
  };

  const goToEvent = (eventType: string) => {
    const index = eventCards.findIndex(card => card.title === eventType);
    if (index !== -1) {
      setActiveIndex(index);
    }
  };

  return (
    <section 
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-2 text-sm font-medium">
            <Sparkles className="h-3 w-3 mr-2" />
            Explore Event Types
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
            Plan Your Perfect
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Celebration
            </span>
          </h2>
        </div>

        {/* Main Card Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover-lift"
            aria-label="Previous event"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover-lift"
            aria-label="Next event"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>

          {/* Active Card */}
          <Card className="relative border-0 shadow-2xl overflow-hidden bg-white rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Side - Clear without blur */}
              <div className="relative aspect-square md:aspect-auto md:h-[500px] overflow-hidden">
                <img
                  src={activeCard.cardImage || activeCard.image}
                  alt={activeCard.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content Side */}
              <CardContent className="flex flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white">
                <div className="space-y-4">
                  {/* Icon and Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-4xl md:text-5xl">
                      {activeCard.icon}
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
                      {activeCard.subtitle}
                    </Badge>
                  </div>

                  {/* Title - Smaller */}
                  <h3 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                    {activeCard.title}
                  </h3>

                  {/* Description - Smaller */}
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {activeCard.description}
                  </p>

                  {/* Stats - Smaller */}
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">{activeCard.stats.value}</div>
                        <div className="text-xs text-muted-foreground">{activeCard.stats.label}</div>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">8+</div>
                        <div className="text-xs text-muted-foreground">Cities</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6 border-t">
                  <Button 
                    size="lg" 
                    className="w-full text-base px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-semibold shadow-lg hover-lift transition-all duration-300 group"
                    asChild
                  >
                    <Link to={activeCard.link}>
                      Explore {activeCard.title} Packages
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>

              {/* Progress Indicator */}
              {!isPaused && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-5000 ease-linear"
                    style={{
                      width: '0%',
                    }}
                    key={activeIndex}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* All Event Types - Bottom Navigation */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {eventTypes.map((eventType) => {
            const card = eventCards.find(c => c.title === eventType);
            const isActive = activeCard.title === eventType;
            
            return (
              <button
                key={eventType}
                onClick={() => goToEvent(eventType)}
                className={cn(
                  'px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift backdrop-blur-md border-2',
                  isActive
                    ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30'
                )}
              >
                <span className="flex items-center gap-2">
                  {card?.icon && <span className="text-xl">{card.icon}</span>}
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
              onClick={() => setActiveIndex(index)}
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

