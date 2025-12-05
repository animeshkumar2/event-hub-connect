import React, { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/features/home/Navbar";
import { VendorCard } from "@/features/vendor/VendorCard";
import { PackageCard } from "@/features/search/PackageCard";
import { PremiumPackageCard } from "@/features/search/PremiumPackageCard";
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
import { Search as SearchIcon, SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { useSearchListings, useSearchVendors, useEventTypes, useCategories } from "@/shared/hooks/useApi";
import { publicApi } from "@/shared/services/api";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/shared/contexts/CartContext";
import { useToast } from "@/shared/hooks/use-toast";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch reference data first
  const { data: eventTypesData, loading: eventTypesLoading, error: eventTypesError } = useEventTypes();
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories();
  const eventTypes = eventTypesData || [];
  const categories = categoriesData || [];

  // Get event type and category from URL
  const eventTypeParam = searchParams.get('eventType');
  const selectedCategory = searchParams.get('category') || 'all';
  const listingType = (searchParams.get('listingType') || 'all') as 'all' | 'packages';
  const viewParam = searchParams.get('view');
  
  // Determine if we should show vendors (when view=vendors or category selected without eventType)
  const showVendors = viewParam === 'vendors' || (selectedCategory !== 'all' && !eventTypeParam);


  // Resolve eventType: handle both numeric ID and string name
  const eventTypeId = useMemo(() => {
    if (!eventTypeParam) return undefined;
    
    // Try to parse as number first
    const numericId = parseInt(eventTypeParam, 10);
    if (!isNaN(numericId)) {
      return numericId;
    }
    
    // If not a number, try to find by name (case-insensitive)
    const eventType = eventTypes.find((et: any) => 
      et.name?.toLowerCase() === eventTypeParam.toLowerCase() ||
      et.displayName?.toLowerCase() === eventTypeParam.toLowerCase()
    );
    
    return eventType?.id;
  }, [eventTypeParam, eventTypes]);

  // Fetch vendors or listings based on view mode
  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useSearchVendors({
    category: showVendors && selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const { data: listingsData, loading: listingsLoading, error: listingsError } = useSearchListings({
    eventType: !showVendors && eventTypeId && !isNaN(eventTypeId) ? eventTypeId : undefined,
    category: !showVendors && selectedCategory !== 'all' ? selectedCategory : undefined,
    listingType: listingType === 'packages' ? 'packages' : undefined,
  });

  // Ensure data is always an array - handle both direct arrays and wrapped responses
  const vendors = useMemo(() => {
    if (!vendorsData) return [];
    if (Array.isArray(vendorsData)) return vendorsData;
    // If data is wrapped in an object with a data property
    if (vendorsData && typeof vendorsData === 'object' && 'data' in vendorsData) {
      const data = (vendorsData as any).data;
      return Array.isArray(data) ? data : (data ? [data] : []);
    }
    return [vendorsData];
  }, [vendorsData]);

  const listings = useMemo(() => {
    if (!listingsData) return [];
    if (Array.isArray(listingsData)) return listingsData;
    // If data is wrapped in an object with a data property
    if (listingsData && typeof listingsData === 'object' && 'data' in listingsData) {
      const data = (listingsData as any).data;
      return Array.isArray(data) ? data : (data ? [data] : []);
    }
    return [listingsData];
  }, [listingsData]);

  // Transform API listings to match component expectations
  const transformedListings = useMemo(() => {
    try {
      return listings.map((listing: any) => {
        // Safely transform each listing
        const transformed = {
          ...listing,
          // Map API field names to component expected names
          includedItems: listing.includedItemsText || [],
          excludedItems: listing.excludedItemsText || [],
          addOns: listing.addOns || [], // Will be empty for now, can be fetched separately if needed
          category: listing.categoryId || listing.category || '',
          // Ensure images is always an array
          images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : []),
          // Ensure price is a number
          price: typeof listing.price === 'number' ? listing.price : parseFloat(listing.price || 0),
          // Ensure required fields exist
          name: listing.name || 'Unnamed Listing',
          description: listing.description || '',
          vendorId: listing.vendorId || '',
          vendorName: listing.vendorName || 'Unknown Vendor',
          // Add default vendor fields (these aren't in API response, so set defaults)
          vendorRating: listing.vendorRating || 0,
          vendorReviewCount: listing.vendorReviewCount || 0,
          vendorCity: listing.vendorCity || '',
          vendorCoverageRadius: listing.vendorCoverageRadius || 0,
        };
        return transformed;
      });
    } catch (error) {
      console.error('Error transforming listings:', error);
      return [];
    }
  }, [listings]);

  // Filter listings based on listing type
  const filteredListings = useMemo(() => {
    let filtered = transformedListings;
    if (listingType === 'packages') {
      filtered = filtered.filter((item: any) => item.type === 'PACKAGE' || item.type === 'package');
    }
    return filtered;
  }, [transformedListings, listingType]);

  // Get current event type name
  const currentEventType = eventTypes.find((et: any) => et.id === eventTypeId);

  const handleCategoryClick = (categoryId: string) => {
    flushSync(() => {
      if (categoryId === 'all' || selectedCategory === categoryId) {
        // Clicking "All Categories" or clicking the same category (toggle off)
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('category');
          // If in vendor view and removing category, keep view=vendors to show all vendors
          if (showVendors && !eventTypeParam) {
            newParams.set('view', 'vendors');
          } else if (!eventTypeParam) {
            newParams.delete('view');
          }
          return newParams;
        });
      } else {
        // Selecting a different category
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set('category', categoryId);
          // If no eventType, ensure view=vendors is set
          if (!eventTypeParam) {
            newParams.set('view', 'vendors');
          }
          return newParams;
        });
      }
    });
  };

  const handleListingTypeChange = (type: 'all' | 'packages') => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (type === 'all') {
        newParams.delete('listingType');
      } else {
        newParams.set('listingType', type);
      }
      return newParams;
    });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const interval = setInterval(checkScroll, 100);
    return () => clearInterval(interval);
  }, [categories]);

  const handleBook = (listing: any) => {
    addToCart({
      id: listing.id,
      name: listing.name,
      price: listing.price,
      vendorId: listing.vendorId,
      vendorName: listing.vendorName,
      image: listing.images?.[0],
      type: listing.type === 'PACKAGE' ? 'package' : 'item',
    });
    toast({
      title: "Added to cart",
      description: `${listing.name} has been added to your cart.`,
    });
  };

  // Debug: Log data to help diagnose issues
  useEffect(() => {
    console.log('Search component state:', {
      showVendors,
      selectedCategory,
      eventTypeParam,
      vendorsData,
      listingsData,
      vendorsLoading,
      listingsLoading,
      vendorsError,
      listingsError,
    });
  }, [showVendors, selectedCategory, eventTypeParam, vendorsData, listingsData, vendorsLoading, listingsLoading, vendorsError, listingsError]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {showVendors 
              ? (selectedCategory !== 'all' 
                  ? `Browse ${categories.find((c: any) => c.id === selectedCategory)?.name || 'Category'} Vendors`
                  : 'Browse All Vendors')
              : (currentEventType ? `Explore ${currentEventType.name} Packages` : 'Explore All Packages')}
          </h1>
          <p className="text-muted-foreground">
            {showVendors 
              ? 'Discover the perfect vendors for your event'
              : 'Discover the perfect vendors for your event'}
          </p>
        </div>

        {/* Listing Type Filter - Only show when not in vendor view */}
        {!showVendors && (
          <div className="mb-6 flex gap-4">
            <Button
              variant={listingType === 'all' ? 'default' : 'outline'}
              onClick={() => handleListingTypeChange('all')}
            >
              All Listings
            </Button>
            <Button
              variant={listingType === 'packages' ? 'default' : 'outline'}
              onClick={() => handleListingTypeChange('packages')}
            >
              Packages Only
            </Button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="relative">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scrollCategories('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div
              ref={categoryScrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => handleCategoryClick('all')}
                className="whitespace-nowrap"
              >
                📦 All Categories
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => handleCategoryClick(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scrollCategories('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error States */}
        {(eventTypesError || categoriesError) && (
          <Card className="p-6 mb-6 border-destructive">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Failed to load data</p>
                <p className="text-sm text-muted-foreground">
                  {eventTypesError || categoriesError}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {(showVendors ? vendorsError : listingsError) && (
          <Card className="p-6 mb-6 border-destructive">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Failed to load {showVendors ? 'vendors' : 'listings'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showVendors ? vendorsError : listingsError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(eventTypesLoading || categoriesLoading || (showVendors ? vendorsLoading : listingsLoading)) ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {eventTypesLoading || categoriesLoading 
                ? 'Loading categories...' 
                : showVendors 
                  ? 'Loading vendors...' 
                  : 'Loading listings...'}
            </p>
          </div>
        ) : showVendors ? (
          // Vendors View
          vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No vendors found.</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or browse all categories.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {vendors.map((vendor: any) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={{
                      id: vendor.id,
                      businessName: vendor.businessName || vendor.name,
                      category: vendor.categoryId || vendor.category,
                      categoryName: vendor.categoryName,
                      city: vendor.city,
                      cityName: vendor.cityName,
                      rating: vendor.rating || vendor.averageRating,
                      reviewCount: vendor.reviewCount || vendor.totalReviews,
                      startingPrice: vendor.startingPrice || vendor.minPrice,
                      coverImage: vendor.coverImage || vendor.profileImage,
                      isVerified: vendor.isVerified,
                    }}
                  />
                ))}
              </div>
            </>
          )
        ) : (
          // Listings View
          filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No listings found.</p>
              <p className="text-sm text-muted-foreground">
                {eventTypeParam && !eventTypeId 
                  ? `Event type "${eventTypeParam}" not found. Try selecting from the filters above.`
                  : 'Try adjusting your filters or browse all categories.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
                </p>
              </div>

              <div className={cn(
                "grid gap-4",
                listingType === 'packages' ? "lg:grid-cols-3" : "lg:grid-cols-4"
              )}>
                {filteredListings.map((listing: any) => {
                  try {
                    const isPackage = listing.type === 'PACKAGE' || listing.type === 'package';
                    
                    if (listingType === 'packages' && isPackage) {
                      return (
                        <PremiumPackageCard
                          key={listing.id}
                          pkg={listing}
                          vendorId={listing.vendorId || ''}
                          vendorName={listing.vendorName || 'Unknown Vendor'}
                          vendorCategory={listing.categoryId || listing.category}
                          onBook={(pkg, addOns, customizations) => {
                            const totalPrice = pkg.price + 
                              (addOns?.reduce((sum: number, a: any) => sum + (a.price || 0), 0) || 0) +
                              (customizations?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) || 0);
                            handleBook({
                              ...listing,
                              price: totalPrice,
                            });
                          }}
                          theme="wedding"
                        />
                      );
                    } else {
                      return (
                        <PackageCard
                          key={listing.id}
                          package={listing}
                          isPackage={isPackage}
                          onBook={() => handleBook(listing)}
                        />
                      );
                    }
                  } catch (error) {
                    console.error('Error rendering listing:', listing.id, error);
                    return (
                      <Card key={listing.id} className="p-4 border-destructive">
                        <CardContent>
                          <p className="text-sm text-destructive">Error rendering listing: {listing.name || listing.id}</p>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
