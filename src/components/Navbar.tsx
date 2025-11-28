import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">
              Find Vendors
            </Link>
            <Link to="/vendors" className="text-sm font-medium hover:text-primary transition-colors">
              Become a Vendor
            </Link>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border animate-in slide-in-from-top-2">
            <Link
              to="/search"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Find Vendors
            </Link>
            <Link
              to="/vendors"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Become a Vendor
            </Link>
            <div className="flex items-center space-x-3 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
