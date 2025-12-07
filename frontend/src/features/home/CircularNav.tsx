import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CircularNavProps {
  className?: string;
}

export const CircularNav = ({ className }: CircularNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'listings',
      label: 'Browse Listings',
      icon: Search,
      path: '/search',
      color: 'hsla(245, 58%, 51%, 0.9)',
      hoverColor: 'hsla(245, 70%, 65%, 0.95)',
    },
    {
      id: 'planner',
      label: 'AI Event Planner',
      icon: Sparkles,
      path: '/event-planner',
      color: 'hsla(38, 92%, 50%, 0.9)',
      hoverColor: 'hsla(38, 92%, 55%, 0.95)',
    },
  ];

  const toggleMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setTimeout(() => navigate(path), 200);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => {
      setIsOpen(false);
    };

    // Small delay to avoid immediate closing
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // For 2 items in a semi-circle (180deg total)
  // Central angle per item: 180 / 2 = 90deg
  // We'll use 85deg per item for better visual spacing
  const centralAngle = 85;
  const totalAngle = centralAngle * 2; // 170deg
  const offsetAngle = (180 - totalAngle) / 2; // 5deg offset to center

  return (
    <div className={cn("circular-nav-container relative inline-block", className)}>
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary via-primary-glow to-secondary text-white font-bold text-2xl md:text-3xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 z-20 relative flex items-center justify-center backdrop-blur-sm",
          isOpen && "rotate-45 scale-110"
        )}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className="transition-transform duration-300">{isOpen ? '×' : '+'}</span>
      </button>

      {/* Circular Navigation Wrapper */}
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out origin-center",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
        )}
        style={{
          width: '26em',
          height: '26em',
          marginBottom: '-13em',
          marginLeft: '-13em',
        }}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          // Calculate rotation: start from offset, then add index * centralAngle
          // For 2 items: 5deg (offset) and 90deg (offset + 85deg)
          const rotation = offsetAngle + (index * centralAngle);
          const skewAngle = 90 - centralAngle; // 5deg skew
          const unskew = -skewAngle; // -5deg
          const unrotate = -(90 - centralAngle / 2); // -47.5deg

          return (
            <div
              key={item.id}
              className="absolute overflow-hidden"
              style={{
                width: '10em',
                height: '10em',
                left: '50%',
                top: '50%',
                marginLeft: '-10em',
                marginTop: '-1.3em',
                transformOrigin: '100% 100%',
                transform: isOpen 
                  ? `rotate(${rotation}deg) skew(${skewAngle}deg)` 
                  : `rotate(76deg) skew(${skewAngle}deg)`,
                transition: `all 0.4s ease ${0.3 + index * 0.15}s`,
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              <button
                onClick={(e) => handleItemClick(item.path, e)}
                className="absolute right-0 bottom-0 w-[14.5em] h-[14.5em] rounded-full text-white flex flex-col items-center justify-center text-xs font-semibold shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-white/20"
                style={{
                  background: `radial-gradient(transparent 30%, ${item.color} 30%)`,
                  transform: `skew(${unskew}deg) rotate(${unrotate}deg)`,
                  transformOrigin: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `radial-gradient(transparent 30%, ${item.hoverColor} 30%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `radial-gradient(transparent 30%, ${item.color} 30%)`;
                }}
              >
                <Icon 
                  className="w-6 h-6 md:w-7 md:h-7 mb-1.5" 
                  style={{ transform: 'rotate(47.5deg)' }} 
                />
                <span 
                  className="text-[10px] md:text-xs text-center px-2 leading-tight font-medium whitespace-nowrap"
                  style={{ transform: 'rotate(47.5deg)' }}
                >
                  {item.label}
                </span>
              </button>
            </div>
          );
        })}

        {/* Cover to prevent extra clickable area */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[6.2em] h-[6.2em] rounded-full bg-transparent z-10 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[5] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

