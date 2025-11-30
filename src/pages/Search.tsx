import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { VendorCard } from "@/components/VendorCard";
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
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Get relevant categories for the event type
  const relevantCategories = useMemo(() => {
    if (!eventType) return categories;
    const categoryIds = eventTypeCategories[eventType] || categories.map(cat => cat.id);
    return categories.filter(cat => categoryIds.includes(cat.id));
  }, [eventType]);

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
      setSelectedCategory("");
    } else {
      // Toggle on: set category filter
      setSelectedCategory(categoryId);
      params.set("category", categoryId);
    }
    if (eventType) params.set("eventType", eventType);
    setSearchParams(params);
  };

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

      // Category filter - show all vendors if no category selected, otherwise filter by category
      if (eventType) {
        // When eventType is present, show all vendors if no category selected, otherwise filter by category
        if (selectedCategory && vendor.category !== selectedCategory) {
          return false;
        }
      } else {
        // Normal category filter when no eventType
        if (selectedCategory && selectedCategory !== "all" && vendor.category !== selectedCategory) {
          return false;
        }
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
  }, [searchQuery, selectedCategory, selectedCity, minBudget, maxBudget, eventType]);

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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {eventType ? `Explore ${eventType} Vendors` : "Find Your Perfect Vendors"}
          </h1>

          {/* Category Tabs - Show when eventType is present */}
          {eventType && relevantCategories.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Browse by Category
                </h2>
                
                {/* Category Scroll Container */}
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollCategories('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-border shadow-md hover:bg-primary/10 hover:border-primary transition-all duration-200"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                  
                  {/* Right Arrow */}
                  {canScrollRight && (
                    <button
                      onClick={() => scrollCategories('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-border shadow-md hover:bg-primary/10 hover:border-primary transition-all duration-200"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                  
                  {/* Scrollable Container */}
                  <div 
                    ref={categoryScrollRef}
                    className="overflow-x-auto scrollbar-hide pb-2 px-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={checkScrollPosition}
                  >
                    <div className="flex gap-3 min-w-max">
                      {relevantCategories.map((category) => {
                        const isActive = selectedCategory === category.id;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={cn(
                              "px-5 py-2.5 rounded-lg font-medium transition-all duration-200 border whitespace-nowrap",
                              "hover:shadow-md active:scale-95",
                              isActive
                                ? "bg-primary text-white border-primary shadow-md"
                                : "bg-white text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span>{category.name}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Active Category Badge */}
              {selectedCategory ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm">
                    Showing: {relevantCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete("category");
                      setSearchParams(params);
                      setSelectedCategory("");
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Show all
                  </Button>
                </div>
              ) : (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Showing all {eventType} vendors
                </Badge>
              )}
            </div>
          )}

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

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={eventType ? selectedCategory : (selectedCategory || "all")} 
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        const params = new URLSearchParams(searchParams);
                        if (value === "all") {
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

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredVendors.length === 0 ? (
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
        )}
      </div>
    </div>
  );
};

export default Search;
