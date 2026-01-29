import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ShoppingCart, User, Menu, Sparkles, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { cn } from '@/shared/lib/utils';

// Vendor categories
const vendorCategories = [
  { id: 'photographer', name: 'Photography & Cinematography', icon: '📸' },
  { id: 'decorator', name: 'Décor', icon: '🎨' },
  { id: 'dj', name: 'DJ', icon: '🎵' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: '💡' },
  { id: 'mua', name: 'Makeup / Stylist', icon: '💄' },
  { id: 'caterer', name: 'Catering', icon: '🍽️' },
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
  const { user, isAuthenticated, logout } = useAuth();
  const vendorsDropdownRef = useRef<HTMLDivElement>(null);
  const eventTypesDropdownRef = useRef<HTMLDivElement>(null);
  const mobileVendorsRef = useRef<HTMLDivElement>(null);
  const mobileEventTypesRef = useRef<HTMLDivElement>(null);
  const bodyOverflowRef = useRef<string | null>(null);
  const isSolidNav = scrolled || mobileMenuOpen;

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setVendorsDropdownOpen(false);
    setEventTypesDropdownOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        setVendorsDropdownOpen(false);
        setEventTypesDropdownOpen(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      bodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else if (bodyOverflowRef.current !== null) {
      document.body.style.overflow = bodyOverflowRef.current;
      bodyOverflowRef.current = null;
    }

    return () => {
      if (bodyOverflowRef.current !== null) {
        document.body.style.overflow = bodyOverflowRef.current;
        bodyOverflowRef.current = null;
      }
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen, closeMobileMenu]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const isOutside = (refs: React.RefObject<HTMLElement>[], target: Node) =>
      refs.every((ref) => ref.current && !ref.current.contains(target));

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isOutside([vendorsDropdownRef, mobileVendorsRef], target)) {
        setVendorsDropdownOpen(false);
      }
      if (isOutside([eventTypesDropdownRef, mobileEventTypesRef], target)) {
        setEventTypesDropdownOpen(false);
      }
    };

    if (vendorsDropdownOpen || eventTypesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [vendorsDropdownOpen, eventTypesDropdownOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVendorsDropdownOpen(false);
        setEventTypesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isSolidNav
          ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 relative">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span
              className={cn(
                'text-lg md:text-xl font-bold transition-all duration-200',
                isSolidNav 
                  ? 'text-[#5046E5]' 
                  : 'text-white group-hover:text-white/90'
              )}
            >
              cartevent<span className={isSolidNav ? 'text-[#7C6BFF]' : 'text-white/80'}>.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* PHASE 1: Simplified navigation - Home removed (logo serves this purpose) */}
            
            {/* PHASE 1: Customer features commented out - uncomment for Phase 2 */}
            {/* Vendors Dropdown 
            <div 
              ref={vendorsDropdownRef}
              className="relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVendorsDropdownOpen((open) => {
                    const next = !open;
                    if (next) setEventTypesDropdownOpen(false);
                    return next;
                  });
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  isSolidNav 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10',
                  vendorsDropdownOpen && (isSolidNav ? 'text-primary bg-primary/5' : 'text-white bg-white/10')
                )}
              >
                Vendors
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  vendorsDropdownOpen && 'rotate-180'
                )} />
              </button>
              
              {vendorsDropdownOpen && (
                <div
                  className={cn(
                    'absolute top-full left-0 mt-1.5 w-80 rounded-xl overflow-hidden backdrop-blur-md',
                    'border border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-primary/10',
                    'bg-white/95 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
                  )}
                >
                  <div className="px-4 pt-3 pb-2 border-b border-border/60 bg-gradient-to-r from-primary/5 via-white to-secondary/5">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Popular vendor types</p>
                    <p className="text-[12px] text-muted-foreground">Browse by category</p>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[26rem] overflow-y-auto custom-scrollbar bg-white/98">
                    {vendorCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/search?category=${category.id}&view=vendors`}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent',
                          'text-xs text-foreground/80 hover:text-primary',
                          'hover:bg-primary/5 hover:border-primary/20 transition-all duration-150 active:scale-[0.99]'
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
            */}

            {/* Event Types Dropdown 
            <div 
              ref={eventTypesDropdownRef}
              className="relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventTypesDropdownOpen((open) => {
                    const next = !open;
                    if (next) setVendorsDropdownOpen(false);
                    return next;
                  });
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  isSolidNav 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10',
                  eventTypesDropdownOpen && (isSolidNav ? 'text-primary bg-primary/5' : 'text-white bg-white/10')
                )}
              >
                Event Types
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  eventTypesDropdownOpen && 'rotate-180'
                )} />
              </button>
              
              {eventTypesDropdownOpen && (
                <div
                  className={cn(
                    'absolute top-full left-0 mt-1.5 w-64 rounded-xl overflow-hidden backdrop-blur-md',
                    'border border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-primary/10',
                    'bg-white/95 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
                  )}
                >
                  <div className="px-4 pt-3 pb-2 border-b border-border/60 bg-gradient-to-r from-secondary/10 via-white to-primary/5">
                    <p className="text-[11px] font-semibold text-secondary uppercase tracking-[0.12em]">Event types</p>
                    <p className="text-[12px] text-muted-foreground">Pick your occasion</p>
                  </div>
                  <div className="p-3 space-y-1 max-h-[22rem] overflow-y-auto custom-scrollbar bg-white/98">
                    {eventTypes.map((eventType) => (
                      <Link
                        key={eventType.id}
                        to={`/search?eventType=${eventType.id}`}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent',
                          'text-xs text-foreground/80 hover:text-primary',
                          'hover:bg-primary/5 hover:border-primary/20 transition-all duration-150 active:scale-[0.99]'
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
            */}

            {/* Event Planner 
            <Link
              to="/event-planner"
              className={cn(
                'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                isSolidNav 
                  ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>
            */}

            {/* For Vendors - Keep this active for Phase 1 */}
            {/* For Vendors - Keep this active for Phase 1 */}
            {(!user || (user.role !== 'VENDOR' && user.role !== 'vendor')) && (
              <Link
                to="/join-vendors"
                className={cn(
                  'text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md',
                isSolidNav 
                    ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                For Vendors
              </Link>
            )}

            {/* Cart - Commented out for Phase 1 
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative h-8 w-8 transition-all duration-200 rounded-md',
                isSolidNav 
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
            */}

            {/* User Menu or Login/Signup */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 relative z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md',
                    isSolidNav 
                      ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                  asChild
                >
                  {user.role === 'VENDOR' ? (
                    <Link to="/vendor/dashboard">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link to="/profile">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      {user.fullName || user.email.split('@')[0]}
                    </Link>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md z-50',
                    isSolidNav 
                      ? 'border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive' 
                      : 'border-white/30 bg-white/95 text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm backdrop-blur-sm'
                  )}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md',
                    isSolidNav 
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
                <Button
                  size="sm"
                  className={cn(
                    'h-8 px-4 text-xs font-semibold transition-all duration-200 rounded-md',
                    isSolidNav 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg' 
                      : 'bg-white/95 hover:bg-white text-foreground shadow-md hover:shadow-lg border border-white/20'
                  )}
                  asChild
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden transition-colors',
              isSolidNav ? 'text-foreground' : 'text-white'
            )}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg border-t z-50">
            <div className="px-4 py-4 space-y-4">
              {/* For Vendors Link - styled as a card */}
              {(!user || (user.role !== 'VENDOR' && user.role !== 'vendor')) && (
                <Link
                  to="/join-vendors"
                  className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl hover:from-primary/10 hover:to-primary/15 transition-all group"
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">For Vendors</span>
                      <span className="block text-xs text-gray-500">Grow your business with us</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {/* Auth Buttons */}
              {isAuthenticated && user ? (
                <div className="space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    asChild 
                    className="w-full justify-center h-12 text-sm font-medium border-gray-200"
                  >
                    {user.role === 'VENDOR' ? (
                      <Link to="/vendor/dashboard" onClick={closeMobileMenu}>
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    ) : (
                      <Link to="/profile" onClick={closeMobileMenu}>
                        <User className="h-4 w-4 mr-2" />
                        {user.fullName || user.email.split('@')[0]}
                      </Link>
                    )}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-center h-11 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Button 
                    asChild 
                    className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90"
                  >
                    <Link to="/auth?mode=signup" onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full h-11 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Link to="/auth?mode=login" onClick={closeMobileMenu}>
                      Already have an account? <span className="text-primary ml-1">Login</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
