import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Heart, Cake, Gift, Briefcase, Gem, Baby, Moon, Music, PartyPopper, LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { eventTypes } from '@/shared/constants/mockData';
import { usePreLaunch } from '@/shared/contexts/PreLaunchContext';

interface EventCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string; // For background
  cardImage?: string; // For card image (optional, falls back to image)
  gradient: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  stats: {
    label: string;
    value: string;
  };
  link: string;
}

const CDN_BASE = 'https://images.cartevent.com/trivial-images/home-page';
const LOCAL_FALLBACK = '/events';

// Helper to get fallback local path from CDN URL
const getLocalFallback = (cdnUrl: string): string => {
  const filename = cdnUrl.split('/').pop()?.replace('.webp', '.jpg') || '';
  return `${LOCAL_FALLBACK}/${filename}`;
};

const eventCards: EventCard[] = [
  {
    id: 'wedding',
    title: 'Wedding',
    subtitle: 'Your Perfect Day',
    description: 'Complete wedding services from photography to catering, all in one place',
    image: `${CDN_BASE}/haldi.webp`,
    cardImage: `${CDN_BASE}/mehendi.webp`,
    gradient: 'from-amber-900/80 via-yellow-800/70 to-amber-700/80',
    icon: Heart,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    stats: { label: 'Weddings Booked', value: '2,500+' },
    link: '/search?eventType=Wedding',
  },
  {
    id: 'birthday',
    title: 'Birthday',
    subtitle: 'Celebrate in Style',
    description: 'Make every birthday unforgettable with our curated vendors',
    image: `${CDN_BASE}/birthday2.webp`,
    cardImage: `${CDN_BASE}/birthday.webp`,
    gradient: 'from-blue-600/80 via-cyan-500/70 to-indigo-600/80',
    icon: Cake,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-50',
    stats: { label: 'Birthdays Celebrated', value: '5,000+' },
    link: '/search?eventType=Birthday',
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    subtitle: 'Mark the Milestone',
    description: 'Celebrate your special moments with elegance and style',
    image: `${CDN_BASE}/anniversary.webp`,
    cardImage: `${CDN_BASE}/anniversary.webp`,
    gradient: 'from-pink-700/80 via-rose-600/70 to-red-600/80',
    icon: Gift,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    stats: { label: 'Anniversaries', value: '800+' },
    link: '/search?eventType=Anniversary',
  },
  {
    id: 'corporate',
    title: 'Corporate',
    subtitle: 'Professional Events',
    description: 'Elevate your corporate events with premium services',
    image: `${CDN_BASE}/corporate.webp`,
    cardImage: `${CDN_BASE}/corporate.webp`,
    gradient: 'from-slate-800/80 via-gray-700/70 to-slate-600/80',
    icon: Briefcase,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    stats: { label: 'Corporate Events', value: '1,200+' },
    link: '/search?eventType=Corporate',
  },
  {
    id: 'engagement',
    title: 'Engagement',
    subtitle: 'Start Your Journey',
    description: 'Begin your forever story with beautiful engagement celebrations',
    image: `${CDN_BASE}/engagement.webp`,
    cardImage: `${CDN_BASE}/engagement.webp`,
    gradient: 'from-purple-700/80 via-pink-600/70 to-rose-600/80',
    icon: Gem,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    stats: { label: 'Engagements', value: '1,500+' },
    link: '/search?eventType=Engagement',
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower',
    subtitle: 'Welcome the Little One',
    description: 'Celebrate new beginnings with joy and excitement',
    image: `${CDN_BASE}/baby_shower.webp`,
    cardImage: `${CDN_BASE}/baby-shower2.webp`,
    gradient: 'from-pink-500/80 via-purple-500/70 to-indigo-500/80',
    icon: Baby,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-50',
    stats: { label: 'Baby Showers', value: '600+' },
    link: '/search?eventType=Baby Shower',
  },
  {
    id: 'nightlife',
    title: 'Nightlife',
    subtitle: 'Party All Night',
    description: 'Epic nightlife experiences with top DJs, stunning venues, and unforgettable vibes',
    image: `${CDN_BASE}/nightlife.webp`,
    cardImage: `${CDN_BASE}/nightlife.webp`,
    gradient: 'from-violet-900/80 via-purple-800/70 to-indigo-900/80',
    icon: Moon,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
    stats: { label: 'Nightlife Events', value: '400+' },
    link: '/search?eventType=Nightlife',
  },
  {
    id: 'concert',
    title: 'Concert',
    subtitle: 'Live Music Magic',
    description: 'From intimate acoustic sets to grand live performances, bring music to your events',
    image: `${CDN_BASE}/concert.webp`,
    cardImage: `${CDN_BASE}/concert.webp`,
    gradient: 'from-red-800/80 via-orange-700/70 to-yellow-600/80',
    icon: Music,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    stats: { label: 'Concerts & Shows', value: '300+' },
    link: '/search?eventType=Concert',
  },
  {
    id: 'other',
    title: 'Other',
    subtitle: 'Custom Events',
    description: 'We support all types of celebrations! From festivals to reunions, we\'re expanding to cover every special moment.',
    image: `${CDN_BASE}/corporate.webp`,
    cardImage: `${CDN_BASE}/corporate.webp`,
    gradient: 'from-gray-700/80 via-slate-600/70 to-gray-500/80',
    icon: PartyPopper,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    stats: { label: 'Custom Events', value: 'Coming Soon' },
    link: '/search?eventType=Other',
  },
];

export const InteractiveEventShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { hasFullAccess } = usePreLaunch();

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
          >
            {/* Background image with fallback */}
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes(LOCAL_FALLBACK)) {
                  target.src = getLocalFallback(card.image);
                }
              }}
            />
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
        <div className="relative max-w-5xl mx-auto w-full px-2 sm:px-4 md:px-12 lg:px-16">
          {/* Navigation Arrows - positioned inside the container */}
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label="Previous event"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label="Next event"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = card.cardImage || card.image;
                          if (!target.src.includes(LOCAL_FALLBACK)) {
                            target.src = getLocalFallback(currentSrc);
                          }
                        }}
                      />
                    </div>
                    
                    {/* Content Side */}
                    <CardContent className="flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-[280px] sm:min-h-[320px] md:min-h-[400px] w-full">
                      <div className="space-y-2 sm:space-y-3">
                        {/* Icon and Badge */}
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className={cn("p-2.5 rounded-xl", card.iconBg)}>
                            <card.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", card.iconColor)} />
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
                          {/* Badge - Admin or Soon */}
                          {!hasFullAccess && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-75 animate-pulse"></div>
                                <Badge className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 shadow-lg uppercase tracking-wider border-0">
                                  Soon
                                </Badge>
                              </div>
                            </div>
                          )}
                          {hasFullAccess && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full blur-md opacity-75 animate-pulse"></div>
                                <Badge className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] font-black px-3 py-1.5 shadow-lg uppercase tracking-wider border-0">
                                  Admin
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            size="default" 
                            className={cn(
                              "w-full text-xs sm:text-sm px-4 sm:px-6 py-3 sm:py-5 rounded-lg text-white font-semibold shadow-lg",
                              hasFullAccess 
                                ? "bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 cursor-pointer"
                                : "bg-gradient-to-r from-primary/40 to-primary-glow/40 cursor-not-allowed"
                            )}
                            disabled={!hasFullAccess}
                            onClick={() => hasFullAccess && navigate(card.link)}
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
        <div className="mt-6 sm:mt-8 pb-4 px-4">
          {/* Wrap on desktop, scroll on mobile */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {eventTypes.map((eventType) => {
              const card = eventCards.find(c => c.title === eventType);
              const isActive = activeCard.title === eventType;
              
              return (
                <button
                  key={eventType}
                  onClick={() => goToEvent(eventType)}
                  className={cn(
                    'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border',
                    isActive
                      ? 'bg-white text-gray-900 border-white shadow-lg'
                      : 'bg-transparent text-white border-white/40 hover:bg-white/10 hover:border-white/60'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {card?.icon && <card.icon className={cn("h-3.5 w-3.5", isActive ? card.iconColor : "text-current")} />}
                    <span className="whitespace-nowrap">{eventType}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

