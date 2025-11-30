import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export const MinimalNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link to="/" className="flex items-center space-x-2">
            <span
              className={cn(
                'text-xl md:text-2xl font-bold transition-colors',
                scrolled ? 'text-foreground' : 'text-white'
              )}
            >
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={cn(
                'text-sm font-medium transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
            >
              Vendors
            </Link>
            <Link
              to="/search"
              className={cn(
                'text-sm font-medium transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
            >
              Event Types
            </Link>
            <Link
              to="/about"
              className={cn(
                'text-sm font-medium transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
            >
              About
            </Link>
            
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
              asChild
            >
              <Link to="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
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
                'transition-colors',
                scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              )}
              asChild
            >
              <Link to="/login">Login</Link>
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
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <Link
              to="/"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/search"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vendors
            </Link>
            <Link
              to="/search"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Event Types
            </Link>
            <Link
              to="/about"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/cart"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <div className="flex items-center space-x-3 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

