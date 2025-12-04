import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ShoppingCart, User, Menu, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/shared/contexts/CartContext";
import { cn } from "@/shared/lib/utils";

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

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorsDropdownOpen, setVendorsDropdownOpen] = useState(false);
  const [eventTypesDropdownOpen, setEventTypesDropdownOpen] = useState(false);
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const vendorsDropdownRef = useRef<HTMLDivElement>(null);
  const eventTypesDropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent transition-all duration-200 group-hover:opacity-90">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
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
                  setVendorsDropdownOpen(!vendorsDropdownOpen);
                  setEventTypesDropdownOpen(false);
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
              className="text-xs font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-md hover:text-primary hover:bg-primary/5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            <Link
              to="/vendor/onboarding"
              className="text-xs font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary hover:bg-primary/5"
            >
              Become a Vendor
            </Link>

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

            {/* Login */}
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

            {/* Sign Up */}
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-semibold transition-all duration-200 rounded-md bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg"
              asChild
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden transition-colors hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-border">
            <Link
              to="/"
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 hover:text-primary hover:bg-primary/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {/* Mobile Vendors Section */}
            <div>
              <button
                className="w-full flex items-center justify-between py-2.5 px-2 text-xs font-medium transition-all duration-200 rounded-md hover:text-primary hover:bg-primary/5"
                onClick={() => {
                  setVendorsDropdownOpen(!vendorsDropdownOpen);
                  setEventTypesDropdownOpen(false);
                }}
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
                className="w-full flex items-center justify-between py-2.5 px-2 text-xs font-medium transition-all duration-200 rounded-md hover:text-primary hover:bg-primary/5"
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
                      className="flex items-center gap-2 py-2 px-2.5 rounded-md text-xs transition-all duration-150 text-muted-foreground hover:text-primary hover:bg-primary/5"
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
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2 hover:text-primary hover:bg-primary/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Event Planner
            </Link>

            <Link
              to="/vendor/onboarding"
              className="block py-2.5 px-2 text-xs font-medium rounded-md transition-all duration-200 hover:text-primary hover:bg-primary/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Become a Vendor
            </Link>

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

            <div className="flex items-center gap-2 pt-2">
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
