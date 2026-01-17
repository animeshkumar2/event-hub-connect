import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePreLaunch } from '@/shared/contexts/PreLaunchContext';

interface ButtonOption {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  icon: typeof Search;
  path: string;
  bgColor: string;
  accentColor: string;
  iconBg: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const buttonOptions: ButtonOption[] = [
  {
    id: 'find-vendors',
    label: 'Find Vendors',
    subtitle: 'For Customers',
    description: 'Discover trusted vendors for your events.\nCompare prices, view portfolios & book instantly!',
    icon: Search,
    path: '/search',
    bgColor: 'bg-[#1a1a2e]',
    accentColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20 border-cyan-500/30',
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'join-vendor',
    label: 'Join as Vendor',
    subtitle: 'For Businesses',
    description: 'List your services and grow your business.\nJoin India\'s fastest-growing event marketplace today!',
    icon: Users,
    path: '/join-vendors',
    bgColor: 'bg-[#0f172a]',
    accentColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    disabled: false,
    comingSoon: false,
  },
  {
    id: 'planner',
    label: 'AI Planner',
    subtitle: 'Smart Planning',
    description: 'Plan your perfect event with AI assistance.\nGet personalized recommendations in minutes!',
    icon: Sparkles,
    path: '/event-planner',
    bgColor: 'bg-[#1e1b4b]',
    accentColor: 'text-violet-400',
    iconBg: 'bg-violet-500/20 border-violet-500/30',
    disabled: true,
    comingSoon: true,
  },
];

export const SlidingButtons = () => {
  const navigate = useNavigate();
  const { hasFullAccess } = usePreLaunch();
  const [activeIndex, setActiveIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string, path: string, disabled: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    // Admins with full access can click any button
    if (hasFullAccess) {
      navigate(path);
      return;
    }
    if (id === 'find-vendors') {
      navigate('/signup?type=customer');
      return;
    }
    if (disabled) return;
    navigate(path);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const buttonWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / buttonWidth);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < buttonOptions.length) {
      setActiveIndex(newIndex);
    }
  };

  const goToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const buttonWidth = scrollRef.current.offsetWidth;
    setActiveIndex(index);
    scrollRef.current.scrollTo({
      left: index * buttonWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      const buttonWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: activeIndex * buttonWidth,
        behavior: 'auto',
      });
    }
  }, []);

  const activeOption = buttonOptions[activeIndex];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Dynamic Description Text */}
      <div className="text-center mb-4 px-4 min-h-[50px] flex items-center justify-center">
        <p 
          key={activeIndex}
          className="text-sm leading-relaxed transition-all duration-300 text-white/70"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {activeOption.description.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i === 0 && <br />}
            </React.Fragment>
          ))}
        </p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-2"
        style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 8px' }}
      >
        {buttonOptions.map((option, index) => {
          const Icon = option.icon;
          // If admin has full access, nothing is disabled
          const isDisabled = hasFullAccess ? false : (option.disabled || false);
          const isComingSoon = option.comingSoon || false;
          const isActive = index === activeIndex;
          
          return (
            <div
              key={option.id}
              className="flex-shrink-0 w-full flex justify-center items-center"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative w-full max-w-[260px]">
                {/* Button Card */}
                <button
                  onClick={(e) => handleClick(option.id, option.path, isDisabled, e)}
                  disabled={isDisabled}
                  className={cn(
                    "relative w-full px-4 py-3.5 rounded-xl transition-all duration-300",
                    "flex items-center justify-between gap-3",
                    option.bgColor,
                    "border border-white/10",
                    isDisabled 
                      ? "cursor-not-allowed opacity-60" 
                      : cn(
                          "hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
                          isActive && "border-white/25 shadow-xl"
                        )
                  )}
                >
                  {/* Text */}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {option.label}
                      </h3>
                      {/* Status Badge - Inline */}
                      {hasFullAccess && isComingSoon ? (
                        // Admin access badge for coming soon features
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold bg-purple-500/20 text-purple-400 uppercase tracking-wide">
                          <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                          Admin
                        </span>
                      ) : isComingSoon ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-bold bg-white/10 text-white/50 uppercase tracking-wide">
                          Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                          Live
                        </span>
                      )}
                    </div>
                    <p className={cn("text-[10px] font-medium mt-0.5", option.accentColor)}>
                      {option.subtitle}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "p-2.5 rounded-lg border backdrop-blur-sm flex-shrink-0",
                    option.iconBg
                  )}>
                    <Icon className={cn("h-5 w-5", option.accentColor)} />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {buttonOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "rounded-full transition-all duration-300 cursor-pointer",
              index === activeIndex
                ? cn("w-5 h-1.5", 
                    option.id === 'find-vendors' ? "bg-cyan-400" :
                    option.id === 'join-vendor' ? "bg-amber-400" : "bg-violet-400"
                  )
                : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
            )}
            aria-label={`Go to ${buttonOptions[index].label}`}
          />
        ))}
      </div>

      {/* Fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
