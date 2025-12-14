import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface ButtonOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Search;
  path: string;
  gradientClass: string;
  hoverGradientClass: string;
}

export const buttonOptions: ButtonOption[] = [
  {
    id: 'listings',
    label: 'Browse Listings',
    description: 'Check out packages and services. See prices, photos, and reviews to pick what works for you.',
    icon: Search,
    path: '/search',
    gradientClass: 'from-primary to-primary-glow',
    hoverGradientClass: 'hover:from-primary-glow hover:to-primary',
  },
  {
    id: 'professionals',
    label: 'Browse Professionals',
    description: 'Find photographers, caterers, and other pros. We\'ve got the best people to make your day special.',
    icon: Users,
    path: '/search?view=vendors',
    gradientClass: 'from-secondary to-primary',
    hoverGradientClass: 'hover:from-primary hover:to-secondary',
  },
  {
    id: 'planner',
    label: 'Event Planner',
    description: 'Share your budget and event details. We\'ll suggest vendors that fit your needs.',
    icon: Sparkles,
    path: '/event-planner',
    gradientClass: 'from-purple-500 via-pink-500 to-orange-500',
    hoverGradientClass: 'hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
  },
];

interface SlidingButtonsProps {
  onActiveChange?: (description: string) => void;
}

export const SlidingButtons = ({ onActiveChange }: SlidingButtonsProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  // Handle scroll to update active index - exactly like category carousel
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const buttonWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / buttonWidth);
    
    // Update text FIRST, then index - for immediate sync
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < buttonOptions.length) {
      if (onActiveChange) {
        onActiveChange(buttonOptions[newIndex].description);
      }
      setActiveIndex(newIndex);
    }
  };

  const goToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const buttonWidth = scrollRef.current.offsetWidth;
    
    // Update text IMMEDIATELY before scrolling
    if (onActiveChange) {
      onActiveChange(buttonOptions[index].description);
    }
    setActiveIndex(index);
    
    // Then scroll smoothly
    scrollRef.current.scrollTo({
      left: index * buttonWidth,
      behavior: 'smooth',
    });
  };

  // Notify parent on mount
  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(buttonOptions[activeIndex].description);
    }
  }, [onActiveChange]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Scrollable Button Container - Same as category carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 16px' }}
      >
        {buttonOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex-shrink-0 w-full flex justify-center items-center"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Button
                size="lg"
                onClick={(e) => handleClick(option.path, e)}
                className={cn(
                  "text-base px-8 py-6 rounded-xl bg-gradient-to-r text-white border-0 shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 group font-semibold backdrop-blur-sm animate-fade-in-up",
                  `bg-gradient-to-r ${option.gradientClass} ${option.hoverGradientClass}`
                )}
                style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  minWidth: '200px',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Icon className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg" />
                <span className="drop-shadow-lg font-bold">{option.label}</span>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {buttonOptions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300 cursor-pointer",
              index === activeIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            aria-label={`Go to ${buttonOptions[index].label}`}
          />
        ))}
      </div>
    </div>
  );
};
