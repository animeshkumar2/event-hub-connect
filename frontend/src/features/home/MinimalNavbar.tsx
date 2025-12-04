import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ShoppingCart, User, Menu, Sparkles, ChevronDown, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/shared/contexts/CartContext';
import { cn } from '@/shared/lib/utils';

// Vendor categories
const vendorCategories = [
  { id: 'photographer', name: 'Photography', icon: '📸' },
  { id: 'cinematographer', name: 'Cinematography', icon: '🎬' },
  { id: 'decorator', name: 'Décor', icon: '🎨' },
  { id: 'dj', name: 'DJ', icon: '🎵' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: '💡' },
  { id: 'mua', name: 'Makeup / Stylist', icon: '💄' },
  { id: 'caterer', name: 'Catering', icon: '🍽️' },
  { id: 'return-gifts', name: 'Return Gifts', icon: '🎁' },
  { id: 'invitations', name: 'Invitations', icon: '✉️' },
  { id: 'live-music', name: 'Live Music', icon: '🎤' },
  { id: 'anchors', name: 'Anchors', icon: '🎙️' },
  { id: 'event-coordinator', name: 'Event Coordinators', icon: '📋' },
];

// Event types
const eventTypes = [
  { id: 'wedding', name: 'Wedding', icon: '💒' },
  { id: 'birthday', name: 'Birthday', icon: '🎂' },
  { id: 'anniversary', name: 'Anniversary', icon: '🎉' },
  { id: 'corporate', name: 'Corporate', icon: '💼' },
  { id: 'engagement', name: 'Engagement', icon: '💍' },
  { id: 'baby-shower', name: 'Baby Shower', icon: '👶' },
];

export const MinimalNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vendorsDropdownOpen, setVendorsDropdownOpen] = useState(false);
  const [eventTypesDropdownOpen, setEventTypesDropdownOpen] = useState(false);
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const vendorsDropdownRef = useRef<HTMLDivElement>(null);
  const eventTypesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        vendorsDropdownRef.current &&
        !vendorsDropdownRef.current.contains(event.target as Node)
      ) {
        setVendorsDropdownOpen(false);
      }
      if (
        eventTypesDropdownRef.current &&
        !eventTypesDropdownRef.current.contains(event.target as Node)
      ) {
        setEventTypesDropdownOpen(false);
      }
    };

    if (vendorsDropdownOpen || eventTypesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [vendorsDropdownOpen, eventTypesDropdownOpen]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span
              className={cn(
                'text-lg md:text-xl font-bold transition-all duration-200',
                scrolled 
                  ? 'bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent' 
                  : 'text-white group-hover:text-white/90'
              )}
            >
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                'text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              Home
            </Link>
            
            {/* Vendors Dropdown */}
            <div 
              ref={vendorsDropdownRef}
              className="relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVendorsDropdownOpen(!vendorsDropdownOpen);
                  setEventTypesDropdownOpen(false);
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  scrolled 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10',
                  vendorsDropdownOpen && (scrolled ? 'text-primary bg-primary/5' : 'text-white bg-white/10')
                )}
              >
                Vendors
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  vendorsDropdownOpen && 'rotate-180'
                )} />
              </button>
              
              {/* Dropdown Menu */}
              {vendorsDropdownOpen && (
                <div
                  className={cn(
                    'absolute top-full left-0 mt-1.5 w-72 bg-white rounded-lg shadow-2xl border border-border/50 overflow-hidden',
                    'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
                  )}
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="py-1.5 max-h-[28rem] overflow-y-auto custom-scrollbar">
                    {vendorCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/search?category=${category.id}&view=vendors`}
                        className={cn(
                          'flex items-center gap-2.5 px-3.5 py-2 mx-1 rounded-md',
                          'text-xs text-foreground/80 hover:text-primary hover:bg-primary/5',
                          'transition-all duration-150 active:scale-[0.98]'
                        )}
                        onClick={() => setVendorsDropdownOpen(false)}
                      >
                        <span className="text-base leading-none">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Event Types Dropdown */}
            <div 
              ref={eventTypesDropdownRef}
              className="relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventTypesDropdownOpen(!eventTypesDropdownOpen);
                  setVendorsDropdownOpen(false);
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  scrolled 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10',
                  eventTypesDropdownOpen && (scrolled ? 'text-primary bg-primary/5' : 'text-white bg-white/10')
                )}
              >
                Event Types
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  eventTypesDropdownOpen && 'rotate-180'
                )} />
              </button>
              
              {/* Dropdown Menu */}
              {eventTypesDropdownOpen && (
                <div
                  className={cn(
                    'absolute top-full left-0 mt-1.5 w-56 bg-white rounded-lg shadow-2xl border border-border/50 overflow-hidden',
                    'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
                  )}
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="py-1.5">
                    {eventTypes.map((eventType) => (
                      <Link
                        key={eventType.id}
                        to={`/search?eventType=${eventType.id}`}
                        className={cn(
                          'flex items-center gap-2.5 px-3.5 py-2 mx-1 rounded-md',
                          'text-xs text-foreground/80 hover:text-primary hover:bg-primary/5',
                          'transition-all duration-150 active:scale-[0.98]'
                        )}
                        onClick={() => setEventTypesDropdownOpen(false)}
                      >
                        <span className="text-base leading-none">{eventType.icon}</span>
                        <span className="font-medium">{eventType.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/event-planner"
              className={cn(
                'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            <Link
              to="/vendor/onboarding"
              className={cn(
                'text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              Become a Vendor
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative h-8 w-8 transition-all duration-200 rounded-md',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-semibold bg-primary text-primary-foreground border-2 border-white shadow-sm">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Login */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              asChild
            >
              <Link to="/login">
                <User className="h-3.5 w-3.5 mr-1.5" />
                Login
              </Link>
            </Button>

            {/* Sign Up */}
            <Button
              size="sm"
              className={cn(
                'h-8 px-4 text-xs font-semibold transition-all duration-200 rounded-md',
                scrolled 
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg' 
                  : 'bg-white/95 hover:bg-white text-foreground shadow-md hover:shadow-lg border border-white/20'
              )}
              asChild
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden transition-colors',
              scrolled ? 'text-foreground' : 'text-white'
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={cn(
            'md:hidden py-4 space-y-3 border-t transition-colors',
            scrolled ? 'border-border' : 'border-white/20'
          )}>
            <Link
              to="/"
              className={cn(
                'block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Mobile Vendors Section */}
            <div>
              <button
                className={cn(
                  'w-full flex items-center justify-between py-2.5 text-xs font-medium transition-all duration-200 rounded-md px-2',
                  scrolled 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
                onClick={() => {
                  setVendorsDropdownOpen(!vendorsDropdownOpen);
                  setEventTypesDropdownOpen(false);
                }}
              >
                Vendors
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  vendorsDropdownOpen && 'rotate-180'
                )} />
              </button>
              {vendorsDropdownOpen && (
                <div className="pl-3 mt-1.5 space-y-0.5">
                  {vendorCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/search?category=${category.id}&view=vendors`}
                      className={cn(
                        'flex items-center gap-2 py-2 px-2.5 rounded-md text-xs transition-all duration-150',
                        scrolled 
                          ? 'text-muted-foreground hover:text-primary hover:bg-primary/5' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setVendorsDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Event Types Section */}
            <div>
              <button
                className={cn(
                  'w-full flex items-center justify-between py-2.5 text-xs font-medium transition-all duration-200 rounded-md px-2',
                  scrolled 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
                onClick={() => {
                  setEventTypesDropdownOpen(!eventTypesDropdownOpen);
                  setVendorsDropdownOpen(false);
                }}
              >
                Event Types
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  eventTypesDropdownOpen && 'rotate-180'
                )} />
              </button>
              {eventTypesDropdownOpen && (
                <div className="pl-3 mt-1.5 space-y-0.5">
                  {eventTypes.map((eventType) => (
                    <Link
                      key={eventType.id}
                      to={`/search?eventType=${eventType.id}`}
                      className={cn(
                        'flex items-center gap-2 py-2 px-2.5 rounded-md text-xs transition-all duration-150',
                        scrolled 
                          ? 'text-muted-foreground hover:text-primary hover:bg-primary/5' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setEventTypesDropdownOpen(false);
                      }}
                    >
                      <span className="text-sm">{eventType.icon}</span>
                      <span className="font-medium">{eventType.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/event-planner"
              className={cn(
                'block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            <Link
              to="/vendor/onboarding"
              className={cn(
                'block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Become a Vendor
            </Link>

            <Link
              to="/cart"
              className={cn(
                'block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2 relative',
                scrolled 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Cart
              {cartCount > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] font-semibold bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Link>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className={cn(
                  'flex-1 h-8 text-xs font-medium',
                  scrolled 
                    ? 'border-border' 
                    : 'border-white/30 text-white hover:bg-white/10 hover:border-white/40'
                )}
              >
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Login
                </Link>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className={cn(
                  'flex-1 h-8 text-xs font-semibold',
                  scrolled 
                    ? 'bg-primary hover:bg-primary/90 shadow-md' 
                    : 'bg-white/95 hover:bg-white text-foreground shadow-md border border-white/20'
                )}
              >
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};


