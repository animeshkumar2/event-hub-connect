import React, { useState, useEffect } from 'react';
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
    description: 'Explore curated packages and individual services. Browse through detailed listings with transparent pricing, photos, and reviews to find exactly what you need for your event.',
    icon: Search,
    path: '/search',
    gradientClass: 'from-primary to-primary-glow',
    hoverGradientClass: 'hover:from-primary-glow hover:to-primary',
  },
  {
    id: 'professionals',
    label: 'Browse Professionals',
    description: 'Find the perfect professionals for your event in minutes. From photographers to caterers, we bring together the best professionals to make your special day truly memorable.',
    icon: Users,
    path: '/search?view=vendors',
    gradientClass: 'from-secondary to-primary',
    hoverGradientClass: 'hover:from-primary hover:to-secondary',
  },
  {
    id: 'planner',
    label: 'Event Planner',
    description: 'Tell us your budget and event details, and we\'ll recommend the perfect vendors. Get personalized recommendations tailored to your needs and preferences.',
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

  const goToIndex = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      if (onActiveChange) {
        onActiveChange(buttonOptions[index].description);
      }
    }
  };

  const handleClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  // Notify parent on mount and when activeIndex changes
  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(buttonOptions[activeIndex].description);
    }
  }, [activeIndex, onActiveChange]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Button Container with Sliding Effect */}
      <div className="relative h-16 overflow-hidden rounded-xl">
        <div className="relative w-full h-full">
          <div
            className="flex absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {buttonOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="flex-shrink-0 flex justify-center items-center w-full"
                >
                  <Button
                    size="lg"
                    onClick={(e) => handleClick(option.path, e)}
                    className={cn(
                      "text-base px-8 py-6 rounded-xl bg-gradient-to-r text-white border-0 shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 group font-semibold backdrop-blur-sm",
                      `bg-gradient-to-r ${option.gradientClass} ${option.hoverGradientClass}`
                    )}
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                      minWidth: '200px',
                    }}
                  >
                    <Icon className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300 drop-shadow-lg" />
                    <span className="drop-shadow-lg font-bold">{option.label}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {buttonOptions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
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
