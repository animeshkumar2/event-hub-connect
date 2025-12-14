import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ChevronDown, Search, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  image: string;
  location: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'photographer',
    name: 'PHOTOGRAPHY & CINEMATOGRAPHY',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
    location: 'Wedding Photography & Films',
    description: 'Capture your precious moments',
  },
  {
    id: 'decorator',
    name: 'DÉCOR',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8a1c6?w=400',
    location: 'Event Decoration',
    description: 'Transform spaces into magic',
  },
  {
    id: 'dj',
    name: 'DJ & MUSIC',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    location: 'Sound & Lighting',
    description: 'Keep the party going',
  },
  {
    id: 'mua',
    name: 'MAKEUP ARTIST',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    location: 'Bridal Makeup',
    description: 'Look stunning on your day',
  },
  {
    id: 'caterer',
    name: 'CATERING',
    image: 'https://images.unsplash.com/photo-1555244162-803834f90033?w=400',
    location: 'Food & Beverages',
    description: 'Delicious food for all',
  },
];

export const CategoryNavigation = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLink, setActiveLink] = useState('CATEGORIES');

  return (
    <nav className="relative w-full bg-white z-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              EVENTHUB
            </span>
          </Link>

          {/* Navigation Links - Right Side (matching reference) */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors relative",
                activeLink === 'HOME' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}
              onMouseEnter={() => setActiveLink('HOME')}
            >
              HOME
              {activeLink === 'HOME' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </Link>
            <Link
              to="/search"
              className={cn(
                "text-sm font-medium transition-colors relative",
                activeLink === 'VENDORS' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}
              onMouseEnter={() => setActiveLink('VENDORS')}
            >
              VENDORS
              {activeLink === 'VENDORS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </Link>
            <div
              className="relative"
              onMouseEnter={() => {
                setShowDropdown(true);
                setActiveLink('CATEGORIES');
              }}
              onMouseLeave={() => {
                setShowDropdown(false);
              }}
            >
              <button className={cn(
                "text-sm font-medium transition-colors relative flex items-center gap-1",
                activeLink === 'CATEGORIES' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}>
                CATEGORIES
                <ChevronDown className="h-3 w-3" />
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              </button>
              
              {/* Dropdown with Category Cards */}
              {showDropdown && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[95vw] max-w-7xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 z-50"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="p-10">
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/search?category=${category.id}`}
                          className="group flex-shrink-0 w-[300px]"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Card className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift bg-white">
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            </div>
                            <CardContent className="p-6 bg-white">
                              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
                                {category.location}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                {category.name}
                              </h3>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/event-planner"
              className={cn(
                "text-sm font-medium transition-colors relative",
                activeLink === 'PLANNER' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}
              onMouseEnter={() => setActiveLink('PLANNER')}
            >
              EVENT PLANNER
              {activeLink === 'PLANNER' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </Link>
            <Link
              to="/about"
              className={cn(
                "text-sm font-medium transition-colors relative",
                activeLink === 'ABOUT' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}
              onMouseEnter={() => setActiveLink('ABOUT')}
            >
              ABOUT
              {activeLink === 'ABOUT' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </Link>
            <Link
              to="/contact"
              className={cn(
                "text-sm font-medium transition-colors relative",
                activeLink === 'CONTACT' 
                  ? "text-gray-900" 
                  : "text-gray-700 hover:text-gray-900"
              )}
              onMouseEnter={() => setActiveLink('CONTACT')}
            >
              CONTACT
              {activeLink === 'CONTACT' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
              )}
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-gray-900"
              asChild
            >
              <Link to="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-gray-900"
              asChild
            >
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden border-t border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              HOME
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              VENDORS
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              CATEGORIES
            </Link>
            <Link
              to="/event-planner"
              className="text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              EVENT PLANNER
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

