import React, { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/features/home/Navbar";
import { VendorCard } from "@/features/vendor/VendorCard";
import { PackageCard } from "@/features/search/PackageCard";
import { PremiumPackageCard } from "@/features/search/PremiumPackageCard";
import { getVendorById } from "@/shared/constants/mockData";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Search as SearchIcon, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { mockVendors, categories, cities } from "@/shared/constants/mockData";
import { flattenPackages, getPackageTypesForCategory } from "@/shared/utils/packageUtils";
import { applyFilters, PackageFilters } from "@/shared/utils/packageFilters";
import { sortPackages, SortOption } from "@/shared/utils/packageSort";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/shared/contexts/CartContext";
import { useToast } from "@/shared/hooks/use-toast";

// Mapping of event types to relevant categories
const eventTypeCategories: Record<string, string[]> = {
  Wedding: ['photographer', 'decorator', 'caterer', 'mua', 'dj', 'cinematographer', 'sound-lights', 'live-music', 'anchors', 'invitations', 'return-gifts', 'event-coordinator'],
  Birthday: ['photographer', 'decorator', 'caterer', 'dj', 'sound-lights', 'invitations', 'return-gifts'],
  Anniversary: ['photographer', 'decorator', 'caterer', 'dj', 'live-music', 'invitations'],
  Corporate: ['photographer', 'decorator', 'caterer', 'sound-lights', 'anchors', 'event-coordinator'],
  Engagement: ['photographer', 'decorator', 'caterer', 'mua', 'dj', 'cinematographer', 'invitations'],
  'Baby Shower': ['photographer', 'decorator', 'caterer', 'invitations', 'return-gifts'],
  Other: categories.map(cat => cat.id),
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const isUserClickRef = useRef(false); // Track if category change is from user click
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const eventType = searchParams.get("eventType") || "";
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  // Use state for selectedCategory but sync with URL params
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");
  const [listingType, setListingType] = useState<'all' | 'packages'>(searchParams.get("listingType") === 'packages' ? 'packages' : 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Flatten packages and listings from vendors
  const allPackages = useMemo(() => flattenPackages(mockVendors, eventType || undefined, listingType), [eventType, listingType]);

  // Get relevant categories for the event type
  // IMPORTANT: Only show categories that have items matching the eventType
  const relevantCategories = useMemo(() => {
    if (!eventType) return categories;
    
    // Get categories that are in the eventType mapping
    const categoryIds = eventTypeCategories[eventType] || categories.map(cat => cat.id);
    
    // Additionally, filter to only include categories that actually have items for this eventType
    // This ensures we don't show empty category tabs
    const categoriesWithItems = new Set<string>();
    allPackages.forEach(pkg => {
      if (pkg.category && categoryIds.includes(pkg.category)) {
        categoriesWithItems.add(pkg.category);
      }
    });
    
    // Return categories that are both in the mapping AND have items
    return categories.filter(cat => 
      categoryIds.includes(cat.id) && categoriesWithItems.has(cat.id)
    );
  }, [eventType, allPackages]);

  // Sync selectedCategory with URL params (for initial load and browser navigation)
  // This ensures state is always in sync with URL, but doesn't interfere with user clicks
  useEffect(() => {
    // Skip sync if this was a user-initiated change
    if (isUserClickRef.current) {
      isUserClickRef.current = false;
      return;
    }
    
    const categoryParam = searchParams.get("category");
    const urlCategory = categoryParam || "all";
    
    // Sync state with URL (for browser back/forward, initial load, etc.)
    // Use functional update to avoid dependency on selectedCategory
    setSelectedCategory(prevCategory => {
      if (urlCategory !== prevCategory) {
        return urlCategory;
      }
      return prevCategory;
    });
  }, [searchParams]); // Only depend on searchParams to avoid loops

  // Set default category to "all" if eventType is present and no category is selected
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    // Only set default if eventType exists and no category param exists
    if (eventType && !categoryParam) {
      const params = new URLSearchParams(searchParams);
      params.delete("category"); // Remove category param for "all" (it's the default)
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType]);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll category bar
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? categoryScrollRef.current.scrollLeft - scrollAmount
        : categoryScrollRef.current.scrollLeft + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position on mount and when categories change
  useEffect(() => {
    checkScrollPosition();
    if (categoryScrollRef.current) {
      categoryScrollRef.current.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        if (categoryScrollRef.current) {
          categoryScrollRef.current.removeEventListener('scroll', checkScrollPosition);
        }
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [relevantCategories]);

  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    // Mark as user-initiated to prevent useEffect from interfering
    isUserClickRef.current = true;
    
    // Update state immediately and synchronously for instant UI response
    // Use flushSync to ensure state update happens before URL update
    flushSync(() => {
      setSelectedCategory(categoryId);
    });
    
    // Update URL params after state is updated
    const params = new URLSearchParams(searchParams);
    if (categoryId === "all") {
      params.delete("category"); // Remove category param for "all"
    } else {
      params.set("category", categoryId);
    }
    if (eventType) params.set("eventType", eventType);
    if (listingType !== 'all') params.set("listingType", listingType);
    setSearchParams(params, { replace: true });
  };

  // Handle listing type selection (Packages vs All Listings)
  const handleListingTypeChange = (type: 'all' | 'packages') => {
    const params = new URLSearchParams(searchParams);
    setListingType(type);
    if (type === 'all') {
      params.delete("listingType");
    } else {
      params.set("listingType", type);
    }
    if (selectedCategory) params.set("category", selectedCategory);
    if (eventType) params.set("eventType", eventType);
    setSearchParams(params);
  };

  // Filter vendors (for non-event type browsing)
  const filteredVendors = useMemo(() => {
    return mockVendors.filter((vendor) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = vendor.businessName.toLowerCase().includes(query);
        const matchesCategory = vendor.category.toLowerCase().includes(query);
        const matchesBio = vendor.bio.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesBio) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== "all" && vendor.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== "all" && vendor.city !== selectedCity) {
        return false;
      }

      // Budget filter
      if (minBudget && vendor.startingPrice < parseInt(minBudget)) {
        return false;
      }
      if (maxBudget && vendor.startingPrice > parseInt(maxBudget)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedCity, minBudget, maxBudget]);

  // Filter and sort packages (for event type browsing)
  const filteredAndSortedPackages = useMemo(() => {
    // Start with a fresh copy to avoid any stale references
    let packages = [...allPackages];
    
    // CRITICAL: If eventType is present, filter by relevant categories FIRST
    // This ensures items only appear if their category is valid for the selected event type
    if (eventType) {
      const allowedCategoryIds = eventTypeCategories[eventType] || [];
      packages = packages.filter(pkg => {
        // Item's category must be in the allowed categories for this event type
        if (!pkg.category) {
          return false; // Exclude items without category
        }
        // Check if item's category is allowed for this event type
        if (allowedCategoryIds.length > 0 && !allowedCategoryIds.includes(pkg.category)) {
          return false; // Exclude items whose category is not valid for this event type
        }
        return true;
      });
    }
    
    // Apply category filter if eventType is present and a specific category is selected (not "all")
    // CRITICAL: Filter by listing/package category, NOT vendor category
    // Each item must have its category exactly match the selected category
    // This filter MUST run after eventType category filter
    if (eventType && selectedCategory && selectedCategory !== "all") {
      // Create a new array with only matching items - don't mutate the original
      packages = packages.filter(pkg => {
        // STRICT FILTERING: Only show items where the item's own category matches exactly
        // This ensures:
        // - Photography listings (category: 'photographer') only show in Photography section
        // - Decorator listings (category: 'decorator') only show in Décor section
        // - Each listing/package appears ONLY in its correct category section
        
        // First check: item must have a category
        if (!pkg.category) {
          return false; // Exclude items without category
        }
        
        // Second check: category must be a string (defensive check)
        if (typeof pkg.category !== 'string') {
          return false;
        }
        
        // Third check: Exact match required - category must match selectedCategory exactly
        // No partial matches, no fallbacks - strict equality check
        // Trim and normalize to handle any whitespace issues
        const itemCategory = String(pkg.category).trim();
        const targetCategory = String(selectedCategory).trim();
        
        return itemCategory === targetCategory;
      });
    }

    // Apply additional filters (but category is already filtered above)
    const filters: PackageFilters = {
      // Don't apply category filter again since we already filtered above
      city: selectedCity !== 'all' ? selectedCity : undefined,
      minBudget: minBudget ? parseInt(minBudget) : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
      searchQuery: searchQuery || undefined,
    };

    const filtered = applyFilters(packages, filters);

    // Apply sorting
    return sortPackages(filtered, sortBy);
  }, [allPackages, eventType, selectedCategory, selectedCity, minBudget, maxBudget, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedCity !== "all") params.set("city", selectedCity);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              {eventType ? `Explore ${eventType} Packages` : "Find Your Perfect Vendors"}
            </h1>
            
            {/* Search and Filter - Top Right */}
            {eventType && (
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search packages..."
                      className="pl-9 h-9 w-48 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-9"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Category Tabs - Show when eventType is present */}
          {eventType && relevantCategories.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  Browse by Category
                </h2>
                
                {/* Category Scroll Container */}
                <div className="relative group">
                  {/* Left Arrow - with gradient fade */}
                  {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
                  )}
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollCategories('left')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 backdrop-blur-sm border-2 border-border shadow-lg hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 hover:scale-110"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  
                  {/* Right Arrow - with gradient fade */}
                  {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
                  )}
                  {canScrollRight && (
                    <button
                      onClick={() => scrollCategories('right')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 backdrop-blur-sm border-2 border-border shadow-lg hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 hover:scale-110"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                  
                  {/* Scrollable Container */}
                  <div 
                    ref={categoryScrollRef}
                    className="overflow-x-auto scrollbar-hide pb-3"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={checkScrollPosition}
                  >
                    <div className="flex gap-3 px-1">
                      {/* All Category Button - First */}
                      <button
                        onClick={() => handleCategoryClick("all")}
                        className={cn(
                          "px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 whitespace-nowrap",
                          "hover:shadow-lg active:scale-95 flex-shrink-0",
                          selectedCategory === "all" || !selectedCategory
                            ? "bg-primary text-white border-primary shadow-lg scale-105"
                            : "bg-white text-foreground border-border hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-xl">📦</span>
                          <span className="text-sm">All Categories</span>
                        </span>
                      </button>
                      
                      {/* Individual Category Buttons */}
                      {relevantCategories.map((category) => {
                        const isActive = selectedCategory === category.id;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={cn(
                              "px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 whitespace-nowrap",
                              "hover:shadow-lg active:scale-95 flex-shrink-0",
                              isActive
                                ? "bg-primary text-white border-primary shadow-lg scale-105"
                                : "bg-white text-foreground border-border hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5"
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-xl">{category.icon}</span>
                              <span className="text-sm">{category.name}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Form - Only show when no eventType */}
          {!eventType && (
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </form>
          )}

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {eventType && (
                    <div className="space-y-2">
                      <Label>Listing Type</Label>
                      <Select value={listingType} onValueChange={(value) => handleListingTypeChange(value as 'all' | 'packages')}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Listings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Listings</SelectItem>
                          <SelectItem value="packages">Packages Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={eventType ? (selectedCategory || "") : (selectedCategory || "all")} 
                      onValueChange={(value) => {
                        // Mark as user-initiated
                        isUserClickRef.current = true;
                        
                        // Update state immediately
                        const newCategory = value === "all" || value === "" ? "all" : value;
                        setSelectedCategory(newCategory);
                        
                        // Update URL params
                        const params = new URLSearchParams(searchParams);
                        if (value === "all" || value === "") {
                          params.delete("category");
                        } else {
                          params.set("category", value);
                        }
                        setSearchParams(params);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {!eventType && <SelectItem value="all">All Categories</SelectItem>}
                        {(eventType ? relevantCategories : categories).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Budget (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Budget (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                onClick={() => {
                  setSelectedCity("all");
                  setMinBudget("");
                  setMaxBudget("");
                  setSearchQuery("");
                  setListingType("all");
                  const params = new URLSearchParams(searchParams);
                  params.delete("category");
                  params.delete("listingType");
                  if (eventType) params.set("eventType", eventType);
                  setSearchParams(params);
                }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Listing Type Filter - Show when eventType is present */}
        {eventType && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleListingTypeChange('all')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 whitespace-nowrap text-sm',
                  'hover:shadow-md active:scale-95',
                  listingType === 'all'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-foreground border-border hover:border-primary hover:bg-primary/5'
                )}
              >
                All Listings
              </button>
              <button
                onClick={() => handleListingTypeChange('packages')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 whitespace-nowrap text-sm',
                  'hover:shadow-md active:scale-95',
                  listingType === 'packages'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-foreground border-border hover:border-primary hover:bg-primary/5'
                )}
              >
                Packages Only
              </button>
            </div>
          </div>
        )}

        {/* Sort and Results Count - Show ONLY for event type (package/listing view) */}
        {eventType && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {filteredAndSortedPackages.length} {listingType === 'packages' ? 'package' : 'listing'}{filteredAndSortedPackages.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Count - Show for vendor view (no event type) */}
        {!eventType && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Conditional Rendering: Packages for Event Type, Vendors for Category Browse */}
        {eventType ? (
          // Package Grid (for event type browsing)
          filteredAndSortedPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No packages found matching your criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setListingType("all");
                  setSelectedCity("all");
                  setMinBudget("");
                  setMaxBudget("");
                  setSearchQuery("");
                  setSortBy("relevance");
                  const params = new URLSearchParams(searchParams);
                  params.delete("category");
                  params.delete("listingType");
                  if (eventType) params.set("eventType", eventType);
                  setSearchParams(params);
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div 
              className={cn(
                "grid gap-4",
                listingType === 'packages' 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // 3 packages per row
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" // 4 cards per row for all listings
              )} 
              key={`category-${selectedCategory}-${listingType}`}
            >
              {filteredAndSortedPackages.map((pkg) => {
                // Use PremiumPackageCard when "Packages Only" is selected
                if (listingType === 'packages' && pkg.type === 'package') {
                  const vendor = getVendorById(pkg.vendorId);
                  const actualPackage = vendor?.packages.find(p => p.id === (pkg.packageId || pkg.id));
                  
                  if (!actualPackage) return null;
                  
                  // Determine theme based on category
                  const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
                    photographer: 'wedding',
                    decorator: 'wedding',
                    dj: 'dj',
                    'sound-lights': 'dj',
                    caterer: 'corporate',
                    mua: 'wedding',
                    cinematographer: 'wedding',
                  };
                  const theme = themeMap[pkg.category] || 'wedding';
                  
                  return (
                    <PremiumPackageCard
                      key={`premium-${pkg.vendorId}-${pkg.id}-${pkg.category}`}
                      pkg={actualPackage}
                      vendorId={pkg.vendorId}
                      vendorName={pkg.vendorName}
                      vendorCategory={pkg.category}
                      onBook={(pkgItem, addOns, customizations) => {
                        const totalPrice =
                          pkgItem.price +
                          addOns.reduce((sum, a) => sum + a.price, 0) +
                          customizations.reduce((sum, c) => sum + c.price, 0);
                        
                        addToCart({
                          vendorId: pkg.vendorId,
                          vendorName: pkg.vendorName,
                          packageId: pkgItem.id,
                          packageName: pkgItem.name,
                          price: totalPrice,
                          basePrice: pkgItem.price,
                          addOns: addOns.map(a => ({ id: a.id, title: a.title, price: a.price })),
                          quantity: 1,
                        });

                        toast({
                          title: 'Added to Cart!',
                          description: `${pkgItem.name} has been added to your cart`,
                        });
                      }}
                      theme={theme}
                    />
                  );
                }
                
                // Use regular PackageCard for listings or when "All Listings" is selected
                return (
                  <PackageCard
                    key={`${pkg.vendorId}-${pkg.id}-${pkg.category}`}
                    package={pkg}
                    searchQuery={searchQuery}
                  />
                );
              })}
            </div>
          )
        ) : (
          // Vendor Grid (for category browsing)
          filteredVendors.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No vendors found matching your criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCity("all");
                  setMinBudget("");
                  setMaxBudget("");
                  setSearchQuery("");
                  const params = new URLSearchParams(searchParams);
                  params.delete("category");
                  setSearchParams(params);
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
