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
  disabled?: boolean; // PHASE 1: Mark customer features as disabled
  comingSoon?: boolean; // PHASE 1: Show "Coming Soon" badge
}

export const buttonOptions: ButtonOption[] = [
  {
    id: 'find-vendors',
    label: 'For Customers',
    description: 'Browse vendors, compare prices, and book services for your events with ease.',
    icon: Search,
    path: '/search',
    gradientClass: 'from-blue-500/40 via-indigo-500/40 to-purple-500/40',
    hoverGradientClass: 'hover:from-blue-500/50 hover:via-indigo-500/50 hover:to-purple-500/50',
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'join-vendor',
    label: 'For Vendors',
    description: 'List your services and grow your business. Join India\'s fastest-growing event marketplace today!',
    icon: Users,
    path: '/for-vendors',
    gradientClass: 'from-green-500 via-emerald-500 to-teal-500',
    hoverGradientClass: 'hover:from-green-600 hover:via-emerald-600 hover:to-teal-600',
    disabled: false,
    comingSoon: false,
  },
  {
    id: 'planner',
    label: 'Event Planner',
    description: 'AI-powered recommendations to find perfect vendors for your budget and event type.',
    icon: Sparkles,
    path: '/event-planner',
    gradientClass: 'from-purple-500/40 via-fuchsia-500/40 to-pink-500/40',
    hoverGradientClass: 'hover:from-purple-500/50 hover:via-fuchsia-500/50 hover:to-pink-500/50',
    disabled: true,
    comingSoon: true,
  },
];

interface SlidingButtonsProps {
  onActiveChange?: (description: string) => void;
}

export const SlidingButtons = ({ onActiveChange }: SlidingButtonsProps) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1); // PHASE 1: Default to "For Vendors" button
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (path: string, disabled: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) {
      // Show toast for coming soon features
      // You can add toast notification here if you have a toast library
      return;
    }
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

  // Notify parent on mount and scroll to default position
  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(buttonOptions[activeIndex].description);
    }
    // Scroll to the active index on mount
    if (scrollRef.current) {
      const buttonWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: activeIndex * buttonWidth,
        behavior: 'auto', // Instant scroll on mount
      });
    }
  }, [onActiveChange]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Scrollable Button Container - Same as category carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-6"
        style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 16px' }}
      >
        {buttonOptions.map((option, index) => {
          const Icon = option.icon;
          const isDisabled = option.disabled || false;
          const isComingSoon = option.comingSoon || false;
          
          return (
            <div
              key={option.id}
              className="flex-shrink-0 w-full flex justify-center items-center"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative pt-3 pr-3">
                {/* Coming Soon Badge - Redesigned */}
                {isComingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-75 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                        Soon
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Live Badge for active button */}
                {!isDisabled && !isComingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-md opacity-75 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Live
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  size="lg"
                  onClick={(e) => handleClick(option.path, isDisabled, e)}
                  disabled={isDisabled}
                  className={cn(
                    "text-base px-8 py-6 rounded-xl bg-gradient-to-r text-white border-0 shadow-2xl transition-all duration-300 group font-semibold backdrop-blur-sm animate-fade-in-up relative overflow-hidden",
                    `bg-gradient-to-r ${option.gradientClass}`,
                    isDisabled 
                      ? "cursor-not-allowed" 
                      : `${option.hoverGradientClass} hover:shadow-2xl hover:scale-105 ring-2 ring-green-400/50`
                  )}
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                    minWidth: '200px',
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Shine effect for active button */}
                  {!isDisabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                  
                  <Icon className={cn(
                    "mr-2 h-5 w-5 drop-shadow-lg transition-transform duration-300 relative z-10",
                    !isDisabled && "group-hover:rotate-12 group-hover:scale-110"
                  )} />
                  <span className="drop-shadow-lg font-bold relative z-10">{option.label}</span>
                </Button>
              </div>
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
