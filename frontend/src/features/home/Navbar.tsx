import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ShoppingCart, User, Menu, Sparkles, ChevronDown, Camera, Palette, Music, Lightbulb, Sparkle, UtensilsCrossed, Mail, Mic2, Mic, ClipboardList, Heart, Cake, Gift, Briefcase, Gem, Baby } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/shared/contexts/CartContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { cn } from "@/shared/lib/utils";

// Vendor categories with Lucide icons
const vendorCategories = [
  { id: 'photographer', name: 'Photography & Cinematography', icon: Camera, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { id: 'decorator', name: 'Décor', icon: Palette, iconColor: 'text-pink-500', iconBg: 'bg-pink-50' },
  { id: 'dj', name: 'DJ', icon: Music, iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: Lightbulb, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50' },
  { id: 'mua', name: 'Makeup / Stylist', icon: Sparkle, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
  { id: 'caterer', name: 'Catering', icon: UtensilsCrossed, iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { id: 'invitations', name: 'Invitations', icon: Mail, iconColor: 'text-teal-500', iconBg: 'bg-teal-50' },
  { id: 'live-music', name: 'Live Music', icon: Mic2, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
  { id: 'anchors', name: 'Anchors', icon: Mic, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
  { id: 'event-coordinator', name: 'Event Coordinators', icon: ClipboardList, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
];

// Event types with Lucide icons
const eventTypes = [
  { id: 'wedding', name: 'Wedding', icon: Heart, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
  { id: 'birthday', name: 'Birthday', icon: Cake, iconColor: 'text-pink-500', iconBg: 'bg-pink-50' },
  { id: 'anniversary', name: 'Anniversary', icon: Gift, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
  { id: 'corporate', name: 'Corporate', icon: Briefcase, iconColor: 'text-slate-600', iconBg: 'bg-slate-100' },
  { id: 'engagement', name: 'Engagement', icon: Gem, iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
  { id: 'baby-shower', name: 'Baby Shower', icon: Baby, iconColor: 'text-pink-400', iconBg: 'bg-pink-50' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorsDropdownOpen, setVendorsDropdownOpen] = useState(false);
  const [eventTypesDropdownOpen, setEventTypesDropdownOpen] = useState(false);
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const { user, isAuthenticated, logout } = useAuth();
  const vendorsDropdownRef = useRef<HTMLDivElement>(null);
  const eventTypesDropdownRef = useRef<HTMLDivElement>(null);
  const mobileVendorsRef = useRef<HTMLDivElement>(null);
  const mobileEventTypesRef = useRef<HTMLDivElement>(null);

  const closeDropdowns = useCallback(() => {
    setVendorsDropdownOpen(false);
    setEventTypesDropdownOpen(false);
  }, []);

  const toggleVendorsDropdown = useCallback(() => {
    setVendorsDropdownOpen((open) => {
      const next = !open;
      if (next) setEventTypesDropdownOpen(false);
      return next;
    });
  }, []);

  const toggleEventTypesDropdown = useCallback(() => {
    setEventTypesDropdownOpen((open) => {
      const next = !open;
      if (next) setVendorsDropdownOpen(false);
      return next;
    });
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    closeDropdowns();
  }, [closeDropdowns]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const isOutside = (refs: React.RefObject<HTMLElement>[], target: Node) =>
      refs.every((ref) => ref.current && !ref.current.contains(target));

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOutside(
          [vendorsDropdownRef, mobileVendorsRef],
          target
        )
      ) {
        setVendorsDropdownOpen(false);
      }
      if (
        isOutside(
          [eventTypesDropdownRef, mobileEventTypesRef],
          target
        )
      ) {
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
        closeDropdowns();
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeDropdowns]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-lg md:text-xl font-bold text-[#5046E5] transition-all duration-200 group-hover:opacity-90">
              cartevent<span className="text-[#7C6BFF]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary hover:bg-primary/5"
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
                  toggleVendorsDropdown();
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  'text-foreground hover:text-primary hover:bg-primary/5',
                  vendorsDropdownOpen && 'text-primary bg-primary/5'
                )}
              >
                Find Vendors
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  vendorsDropdownOpen && 'rotate-180'
                )} />
              </button>
              
              {/* Dropdown Menu */}
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

            {/* Event Types Dropdown */}
            <div 
              ref={eventTypesDropdownRef}
              className="relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEventTypesDropdown();
                }}
                className={cn(
                  'text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md',
                  'text-foreground hover:text-primary hover:bg-primary/5',
                  eventTypesDropdownOpen && 'text-primary bg-primary/5'
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

            <Link
              to="/event-planner"
              className="text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md hover:text-primary hover:bg-primary/5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            {(!user || (user.role !== 'VENDOR' && user.role !== 'vendor')) && (
              <Link
                to="/for-vendors"
                className="text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary hover:bg-primary/5"
              >
                Become a Vendor
              </Link>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 transition-all duration-200 rounded-md hover:bg-primary/5"
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

            {/* User Menu or Login/Signup */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 relative z-50">
                {user.role === 'VENDOR' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md hover:bg-primary/5"
                      asChild
                    >
                      <Link to="/profile">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        My Orders
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md"
                      asChild
                    >
                      <Link to="/vendor/dashboard">
                        Dashboard
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md hover:bg-primary/5"
                    asChild
                  >
                    <Link to="/profile">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      {user.fullName || user.email.split('@')[0]}
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md hover:bg-destructive hover:text-destructive-foreground hover:border-destructive z-50"
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
                  className="h-8 px-3 text-xs font-medium transition-all duration-200 rounded-md hover:bg-primary/5"
                  asChild
                >
                  <Link to="/login">
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Login
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-4 text-xs font-semibold transition-all duration-200 rounded-md bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg"
                  asChild
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden transition-colors hover:text-primary"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <ChevronDown className="h-6 w-6 rotate-180" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-border">
            <Link
              to="/"
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 hover:text-primary hover:bg-primary/5"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            
            {/* Mobile Vendors Section */}
            <div ref={mobileVendorsRef}>
              <button
                className="w-full flex items-center justify-between py-2.5 px-2 text-xs font-medium transition-all duration-200 rounded-md hover:text-primary hover:bg-primary/5"
                onClick={toggleVendorsDropdown}
              >
                Find Vendors
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
                      className="flex items-center gap-2 py-2 px-2.5 rounded-md text-xs transition-all duration-150 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => {
                        closeMobileMenu();
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
            <div ref={mobileEventTypesRef}>
              <button
                className="w-full flex items-center justify-between py-2.5 px-2 text-xs font-medium transition-all duration-200 rounded-md hover:text-primary hover:bg-primary/5"
                onClick={toggleEventTypesDropdown}
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
                      className="flex items-center gap-2 py-2 px-2.5 rounded-md text-xs transition-all duration-150 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => {
                        closeMobileMenu();
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
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2 hover:text-primary hover:bg-primary/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            {(!user || (user.role !== 'VENDOR' && user.role !== 'vendor')) && (
              <Link
                to="/for-vendors"
                className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 hover:text-primary hover:bg-primary/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Vendor
              </Link>
            )}

            <Link
              to="/cart"
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2 relative hover:text-primary hover:bg-primary/5"
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

            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated && user ? (
                <>
                  {user.role === 'VENDOR' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="flex-1 h-8 text-xs font-medium border-border"
                      >
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          My Orders
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        asChild 
                        className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 shadow-md"
                      >
                        <Link to="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                    </div>
                  )}
                  {user.role !== 'VENDOR' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="flex-1 h-8 text-xs font-medium border-border"
                    >
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        {user.fullName || user.email.split('@')[0]}
                      </Link>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 text-xs font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="flex-1 h-8 text-xs font-medium border-border"
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Login
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild 
                    className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 shadow-md"
                  >
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
