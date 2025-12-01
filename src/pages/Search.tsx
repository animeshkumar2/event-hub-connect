import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { VendorCard } from "@/components/VendorCard";
import { PackageCard } from "@/components/PackageCard";
import { PackageTypeFilters } from "@/components/PackageTypeFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { mockVendors, categories, cities } from "@/data/mockData";
import { flattenPackages, getPackageTypesForCategory } from "@/utils/packageUtils";
import { applyFilters, PackageFilters } from "@/utils/packageFilters";
import { sortPackages, SortOption } from "@/utils/packageSort";
import { cn } from "@/lib/utils";

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
  const [showFilters, setShowFilters] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const eventType = searchParams.get("eventType") || "";
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedPackageType, setSelectedPackageType] = useState(searchParams.get("packageType") || "All Packages");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Flatten packages from vendors
  const allPackages = useMemo(() => flattenPackages(mockVendors, eventType || undefined), [eventType]);

  // Get relevant categories for the event type
  const relevantCategories = useMemo(() => {
    if (!eventType) return categories;
    const categoryIds = eventTypeCategories[eventType] || categories.map(cat => cat.id);
    return categories.filter(cat => categoryIds.includes(cat.id));
  }, [eventType]);

  // Get package types for selected category
  const packageTypes = useMemo(() => {
    if (!selectedCategory) return [];
    return getPackageTypesForCategory(allPackages, selectedCategory);
  }, [allPackages, selectedCategory]);

  // Set default category to first one if eventType is present and no category is selected
  // Only set default on initial load, not when user explicitly clears it
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    // Only set default if eventType exists, categories are available, and no category param exists
    // This ensures we set default only on initial navigation, not when user clears selection
    if (eventType && relevantCategories.length > 0 && !categoryParam && selectedCategory === "") {
      const firstCategoryId = relevantCategories[0].id;
      const params = new URLSearchParams(searchParams);
      params.set("category", firstCategoryId);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType]);

  // Sync selectedCategory with URL param
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam || "");
    }
  }, [searchParams, selectedCategory]);

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

  // Handle category selection with toggle functionality
  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory === categoryId) {
      // Toggle off: remove category filter
      params.delete("category");
      params.delete("packageType");
      setSelectedCategory("");
      setSelectedPackageType("All Packages");
    } else {
      // Toggle on: set category filter
      setSelectedCategory(categoryId);
      params.set("category", categoryId);
      params.delete("packageType");
      setSelectedPackageType("All Packages");
    }
    if (eventType) params.set("eventType", eventType);
    setSearchParams(params);
  };

  // Handle package type selection
  const handlePackageTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    setSelectedPackageType(type);
    if (type === 'All Packages') {
      params.delete("packageType");
    } else {
      params.set("packageType", type);
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
    // Packages are already filtered by eventType in flattenPackages
    let packages = allPackages;
    
    // Apply additional category filter if eventType is present
    if (eventType && selectedCategory) {
      packages = packages.filter(pkg => pkg.category === selectedCategory);
    }

    // Apply filters
    const filters: PackageFilters = {
      category: eventType ? selectedCategory : undefined, // Only use category filter when eventType is present
      packageType: selectedPackageType !== 'All Packages' ? selectedPackageType : undefined,
      city: selectedCity !== 'all' ? selectedCity : undefined,
      minBudget: minBudget ? parseInt(minBudget) : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
      searchQuery: searchQuery || undefined,
    };

    const filtered = applyFilters(packages, filters);

    // Apply sorting
    return sortPackages(filtered, sortBy);
  }, [allPackages, eventType, selectedCategory, selectedPackageType, selectedCity, minBudget, maxBudget, searchQuery, sortBy]);

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
                      <Label>Package Type</Label>
                      <Select value={selectedPackageType} onValueChange={handlePackageTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Packages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Packages">All Packages</SelectItem>
                          {packageTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={eventType ? (selectedCategory || "") : (selectedCategory || "all")} 
                      onValueChange={(value) => {
                        setSelectedCategory(value);
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
                      setSelectedCategory("all");
                      setSelectedCity("all");
                      setMinBudget("");
                      setMaxBudget("");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Package Type Filters - Show ONLY when eventType is present and category is selected */}
        {eventType && selectedCategory && packageTypes.length > 0 && (
          <PackageTypeFilters
            packageTypes={packageTypes}
            selectedType={selectedPackageType}
            onTypeChange={handlePackageTypeChange}
          />
        )}

        {/* Sort and Results Count - Show ONLY for event type (package view) */}
        {eventType && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {filteredAndSortedPackages.length} package{filteredAndSortedPackages.length !== 1 ? "s" : ""}
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
                  setSelectedCategory("");
                  setSelectedPackageType("All Packages");
                  setSelectedCity("all");
                  setMinBudget("");
                  setMaxBudget("");
                  setSearchQuery("");
                  setSortBy("relevance");
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPackages.map((pkg) => (
                <PackageCard
                  key={`${pkg.vendorId}-${pkg.packageId}`}
                  package={pkg}
                  searchQuery={searchQuery}
                />
              ))}
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
                  setSelectedCategory("all");
                  setSelectedCity("all");
                  setMinBudget("");
                  setMaxBudget("");
                  setSearchQuery("");
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
