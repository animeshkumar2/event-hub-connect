import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { BookingWidget } from './BookingWidget';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Heart,
  ArrowLeft,
  User,
  Package,
  AlertCircle,
  Loader2,
  IndianRupee,
  Edit,
  Eye,
  MessageSquare,
  HandCoins,
  Shield,
  Clock,
  ThumbsUp,
  ChevronRight
} from 'lucide-react';
import { useListingDetails, useVendorListings, useVendorReviews } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/shared/components/ui/dialog';
import { PremiumChatWindow } from '@/features/vendor/PremiumChatWindow';

import { CategorySpecificDisplay } from './CategorySpecificDisplay';
import { PackageDetailView } from './PackageDetailView';
import { RequestCallbackModal } from './RequestCallbackModal';

// Type for extra charges
interface ExtraCharge {
  name: string;
  price: number;
}

// Category-themed background config — SVG path icons for each category
const categoryThemes: Record<string, { icons: string[]; bgFrom: string; bgTo: string; iconColor: string }> = {
  caterer: {
    // fork-knife, plate, cupcake, chef-hat, wine-glass, pot
    icons: [
      'M7 2v6m0 0c0 2.2 1.8 4 4 4h2c2.2 0 4-1.8 4-4V2M7 8H3v2c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6v-2h-4',
      'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z',
      'M4 22h16M12 2l-4 8h8l-4-8zM8 10v8M16 10v8',
      'M6 13c0 3.3 2.7 6 6 6s6-2.7 6-6H6zM12 2v4M8 6h8',
      'M8 22h8M12 2v6M7 8h10l-1 6H8L7 8z',
      'M3 12h18M5 8c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4V8z',
    ],
    bgFrom: '#fff7ed', bgTo: '#fed7aa', iconColor: '#f97316',
  },
  decorator: {
    icons: [
      'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1-3-7z',
      'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z',
      'M5 3l14 18M5 21l14-18',
      'M12 2a10 10 0 00-7 17l7 3 7-3A10 10 0 0012 2z',
      'M8 2c-2 4-4 6-4 9a4 4 0 108 0c0-3-2-5-4-9z',
      'M12 3c-1.5 3-5 5-5 8a5 5 0 1010 0c0-3-3.5-5-5-8z',
    ],
    bgFrom: '#fdf2f8', bgTo: '#fbcfe8', iconColor: '#ec4899',
  },
  'photo-video': {
    icons: [
      'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
      'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M3 12h12',
      'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
      'M4 4h16v16H4zM9 9h6v6H9z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3',
      'M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z',
    ],
    bgFrom: '#eff6ff', bgTo: '#bfdbfe', iconColor: '#3b82f6',
  },
  photographer: {
    icons: [
      'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
      'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M3 12h12',
      'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
      'M4 4h16v16H4zM9 9h6v6H9z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3',
      'M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z',
    ],
    bgFrom: '#eff6ff', bgTo: '#bfdbfe', iconColor: '#3b82f6',
  },
  cinematographer: {
    icons: [
      'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
      'M4 4h16v16H4zM9 9h6v6H9z',
      'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3',
      'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M3 12h12',
      'M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z',
    ],
    bgFrom: '#eef2ff', bgTo: '#c7d2fe', iconColor: '#6366f1',
  },
  videographer: {
    icons: [
      'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
      'M4 4h16v16H4zM9 9h6v6H9z',
      'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3',
      'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M3 12h12',
      'M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z',
    ],
    bgFrom: '#eef2ff', bgTo: '#c7d2fe', iconColor: '#6366f1',
  },
  venue: {
    icons: [
      'M3 21h18M5 21V7l7-4 7 4v14',
      'M9 21v-6h6v6',
      'M3 21h18M9 3v18M15 3v18M3 9h18M3 15h18',
      'M12 2L2 7v15h20V7L12 2z',
      'M4 21V10l8-6 8 6v11M9 21v-5h6v5',
      'M2 22h20M6 22V6l6-4 6 4v16',
    ],
    bgFrom: '#ecfdf5', bgTo: '#a7f3d0', iconColor: '#10b981',
  },
  dj: {
    icons: [
      'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z',
      'M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z',
      'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
      'M9 2l6 6-6 6',
      'M12 2v20M2 12h20',
    ],
    bgFrom: '#f5f3ff', bgTo: '#ddd6fe', iconColor: '#8b5cf6',
  },
  'dj-entertainment': {
    icons: [
      'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
      'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z',
      'M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z',
      'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
      'M9 2l6 6-6 6',
      'M12 2v20M2 12h20',
    ],
    bgFrom: '#f5f3ff', bgTo: '#ddd6fe', iconColor: '#8b5cf6',
  },
  'live-music': {
    icons: [
      'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
      'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
      'M3 18v-6a9 9 0 0118 0v6',
      'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z',
      'M9 2l6 6-6 6',
      'M12 2v20M2 12h20',
    ],
    bgFrom: '#faf5ff', bgTo: '#e9d5ff', iconColor: '#a855f7',
  },
  'sound-lights': {
    icons: [
      'M12 2v20M2 12h20',
      'M12 2L2 7v10l10 5 10-5V7L12 2z',
      'M9 2l6 6-6 6',
      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.4-6.4l-.7.7M6.3 17.7l-.7.7m12.8 0l-.7-.7M6.3 6.3l-.7-.7M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      'M12 2a10 10 0 100 20 10 10 0 000-20z',
    ],
    bgFrom: '#fffbeb', bgTo: '#fde68a', iconColor: '#f59e0b',
  },
  mua: {
    icons: [
      'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z',
      'M20.8 4.6l-16 16M7.8 4.6l8 16',
      'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z',
      'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1-3-7z',
      'M8 2c-2 4-4 6-4 9a4 4 0 108 0c0-3-2-5-4-9z',
      'M5 3l14 18M5 21l14-18',
    ],
    bgFrom: '#fff1f2', bgTo: '#fecdd3', iconColor: '#f43f5e',
  },
  artists: {
    icons: [
      'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1-3-7z',
      'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z',
      'M5 3l14 18M5 21l14-18',
      'M12 2a10 10 0 100 20 10 10 0 000-20z',
      'M8 2c-2 4-4 6-4 9a4 4 0 108 0c0-3-2-5-4-9z',
      'M3 12h18M12 3v18',
    ],
    bgFrom: '#fff7ed', bgTo: '#fed7aa', iconColor: '#ea580c',
  },
};

const defaultTheme = {
  icons: [
    'M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1-3-7z',
    'M12 22c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z',
    'M5 3l14 18M5 21l14-18',
    'M12 2a10 10 0 100 20 10 10 0 000-20z',
    'M9 18V5l12-2v13',
    'M3 12h18M12 3v18',
  ],
  bgFrom: '#f5f3ff', bgTo: '#c7d2fe', iconColor: '#5950b3',
};

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { data: listingData, loading, error } = useListingDetails(listingId || null);
  
  // Check if vendor wants to see customer view
  const forceCustomerView = searchParams.get('view') === 'customer';
  
  // Debug logging
  useEffect(() => {
    if (listingId) {
      console.log('🔍 ListingDetail Debug:', {
        listingId,
        loading,
        error,
        rawData: listingData,
        extractedListing: listing,
        hasListing: !!listing,
        listingType: listing?.type,
      });
    }
  }, [listingId, loading, error, listingData]);
  
  // Handle API response structure
  // The API returns { success: true, data: ListingDTO } or { success: false, message: string, data: null }
  // listingData is already the unwrapped data from useApi hook
  const listing = listingData;
  const vendorId = listing?.vendorId;
  
  // Check if current user is the vendor owner of this listing
  const isOwnerRaw = useMemo(() => {
    if (!isAuthenticated || !user || !listing) return false;
    // Check multiple conditions to determine ownership:
    // 1. user.vendorId matches listing's vendorId
    // 2. user has role VENDOR and their vendor profile's userId matches
    // 3. Check via stored vendorId in localStorage (set during vendor login)
    const storedVendorId = localStorage.getItem('vendor_id');
    return (
      (user as any).vendorId === vendorId || 
      user.id === listing.vendor?.userId ||
      storedVendorId === vendorId
    );
  }, [isAuthenticated, user, listing, vendorId]);
  
  // If forceCustomerView is true, show customer view even if user is owner
  const isOwner = forceCustomerView ? false : isOwnerRaw;

  // Fetch vendor listings for linked items in packages
  const { data: vendorListingsData } = useVendorListings(vendorId || null);
  const vendorListings = Array.isArray(vendorListingsData) ? vendorListingsData : ((vendorListingsData as any)?.data || vendorListingsData || []);

  // Fetch reviews
  const { data: reviewsData } = useVendorReviews(vendorId || null, 0, 5);
  const reviews = (reviewsData as any)?.data?.content || [];

  // Backend returns lowercase 'package' or 'item', but also handle uppercase
  const isPackage = listing?.type?.toLowerCase() === 'package' || listing?.type === 'PACKAGE';
  const isItem = listing?.type?.toLowerCase() === 'item' || listing?.type === 'ITEM';

  // Extract display price - prioritize category-specific price over main price
  const displayPrice = useMemo(() => {
    if (!listing) return 0;
    
    // If main price is valid (not draft marker), use it
    if (listing.price && Number(listing.price) > 0.01) {
      return Number(listing.price);
    }

    // Otherwise, try to extract from category-specific data
    if (listing.categorySpecificData) {
      try {
        const categoryData = JSON.parse(listing.categorySpecificData);
        
        // Extract based on category
        switch (listing.categoryId) {
          case 'caterer':
            return categoryData.pricePerPlateVeg || categoryData.pricePerPlateNonVeg || 0;
          case 'photographer':
          case 'cinematographer':
          case 'videographer':
            return categoryData.photographyPrice || categoryData.videographyPrice || categoryData.price || 0;
          case 'decorator':
          case 'venue':
          case 'dj':
          case 'live-music':
          case 'sound-lights':
            return categoryData.price || 0;
          case 'mua':
            return categoryData.bridalPrice || categoryData.nonBridalPrice || 0;
          default:
            return categoryData.price || 0;
        }
      } catch {
        return Number(listing.price) || 0;
      }
    }

    return Number(listing.price) || 0;
  }, [listing]);

  // Parse extra charges JSON if available
  const parsedExtraCharges: ExtraCharge[] = useMemo(() => {
    if (listing?.extraChargesJson) {
      try {
        return JSON.parse(listing.extraChargesJson);
      } catch {
        return [];
      }
    }
    return [];
  }, [listing?.extraChargesJson]);

  // Get linked items from vendor listings
  const linkedItems = useMemo(() => {
    if (!listing?.includedItemIds || !listing.includedItemIds.length) {
      return [];
    }
    if (!vendorListings || !vendorListings.length) {
      return [];
    }
    return vendorListings.filter((l: any) => 
      listing.includedItemIds.includes(l.id)
    );
  }, [listing?.includedItemIds, vendorListings]);

  // Use highlights if available, otherwise fall back to includedItemsText for highlights
  const displayHighlights = listing?.highlights?.length > 0 
    ? listing.highlights 
    : listing?.includedItemsText?.slice(0, 4) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Check if we have an error or if listing is null/undefined after loading
  if (!loading && (error || !listing)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The listing you're looking for doesn't exist or has been removed."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/search')} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
                <Button onClick={() => navigate('/')} variant="default">
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use enhanced PackageDetailView for packages with bundled items
  if (isPackage && listing.includedItemIds && listing.includedItemIds.length > 0) {
    return (
      <PackageDetailView 
        listing={listing} 
        isOwner={isOwner}
        reviews={reviews}
      />
    );
  }

  // Get category theme for background — check categoryId first, then try matching by name
  const getCategoryTheme = () => {
    if (!listing) return defaultTheme;
    
    // Direct match on categoryId
    if (listing.categoryId && categoryThemes[listing.categoryId]) {
      return categoryThemes[listing.categoryId];
    }
    
    // Try matching by category name keywords
    const catName = (listing.categoryName || listing.customCategoryName || listing.categoryId || '').toLowerCase();
    if (catName.includes('cater') || catName.includes('food') || catName.includes('buffet')) return categoryThemes.caterer;
    if (catName.includes('photo') || catName.includes('video') || catName.includes('cinema')) return categoryThemes['photo-video'];
    if (catName.includes('decor') || catName.includes('décor') || catName.includes('flor')) return categoryThemes.decorator;
    if (catName.includes('venue') || catName.includes('hall') || catName.includes('banquet')) return categoryThemes.venue;
    if (catName.includes('dj') || catName.includes('entertain')) return categoryThemes.dj;
    if (catName.includes('music') || catName.includes('band') || catName.includes('live')) return categoryThemes['live-music'];
    if (catName.includes('sound') || catName.includes('light')) return categoryThemes['sound-lights'];
    if (catName.includes('makeup') || catName.includes('mua') || catName.includes('bridal') || catName.includes('styling')) return categoryThemes.mua;
    if (catName.includes('artist') || catName.includes('perform') || catName.includes('danc')) return categoryThemes.artists;
    
    return defaultTheme;
  };
  const theme = getCategoryTheme();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.bgFrom }}>
      {/* Full-page category-themed background — immersive feel */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient base — category-tinted, fades from top to bottom */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, ${theme.bgTo} 0%, ${theme.bgFrom} 30%, ${theme.bgFrom} 70%, ${theme.bgTo}80 100%)`
        }} />

        {/* Scattered SVG icons — the category "wallpaper" feel */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {(() => {
            // Generate a grid of icons across the full page
            const items: { x: number; y: number; size: number; rotate: number; opacity: number; iconIdx: number }[] = [];
            const cols = 8;
            const rows = 12;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                // Stagger odd rows
                const offsetX = r % 2 === 0 ? 0 : 6;
                const x = (c * 12.5) + offsetX + 1;
                const y = (r * 8.3) + 2;
                // Skip icons that would overlap with center content area (roughly 10%-85% x, all y)
                if (x > 12 && x < 82) continue;
                items.push({
                  x, y,
                  size: 20 + (((r * cols + c) * 7) % 10),
                  rotate: -20 + (((r * cols + c) * 13) % 40),
                  opacity: 0.06 + (((r * cols + c) * 3) % 5) * 0.01,
                  iconIdx: (r * cols + c) % theme.icons.length,
                });
              }
            }
            return items.map((item, i) => (
              <g key={i} transform={`translate(${item.x}%, ${item.y}%) rotate(${item.rotate})`}>
                <path
                  d={theme.icons[item.iconIdx]}
                  fill="none"
                  stroke={theme.iconColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={item.opacity}
                  style={{ transform: `scale(${item.size / 24})`, transformOrigin: '12px 12px' }}
                />
              </g>
            ));
          })()}
        </svg>

        {/* Soft gradient orbs for depth */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: theme.bgTo, opacity: 0.4, filter: 'blur(80px)' }} />
        <div className="absolute top-[50%] -right-20 w-[350px] h-[350px] rounded-full" style={{ background: theme.bgTo, opacity: 0.3, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-20 left-[30%] w-[400px] h-[400px] rounded-full" style={{ background: theme.bgTo, opacity: 0.3, filter: 'blur(80px)' }} />
      </div>

      <Navbar />
      
      {/* Vendor Owner Banner - Customer's View */}
      {isOwner && (
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">👁️ Customer's View</p>
                  <p className="text-[10px] text-primary/70">How customers see this listing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/vendor/listings')}
                  className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/vendor/listings?edit=${listingId}`)}
                  className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button - hidden for vendor preview since they have their own back button */}
      {!isOwner && (
      <div className="max-w-6xl mx-auto px-4 pt-3 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/search');
            }
          }}
          className="h-7 text-xs mb-2"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
      </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Photo Gallery - Compact */}
            <ScrollReveal animation="fadeInUp">
              <div className="relative rounded-xl overflow-hidden bg-slate-200 aspect-[2/1] ring-1 ring-black/5" style={{ borderTop: `3px solid ${theme.iconColor}` }}>
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {listing.images.slice(1, 4).map((img: string, i: number) => (
                      <div key={i} className="w-10 h-10 rounded border-2 border-white shadow overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {listing.images.length > 4 && (
                      <div className="w-10 h-10 rounded bg-black/60 flex items-center justify-center border-2 border-white">
                        <span className="text-white text-[10px] font-bold">+{listing.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {isPackage && (
                    <Badge className="bg-primary/90 text-white text-[10px] h-5 px-1.5">
                      <Package className="h-2.5 w-2.5 mr-0.5" />Package
                    </Badge>
                  )}
                  {isItem && (
                    <Badge className="bg-emerald-500/90 text-white text-[10px] h-5 px-1.5">Service</Badge>
                  )}
                  {listing.isPopular && (
                    <Badge className="bg-orange-500/90 text-white text-[10px] h-5 px-1.5">🔥 Popular</Badge>
                  )}
                  {listing.isTrending && (
                    <Badge className="bg-purple-500/90 text-white text-[10px] h-5 px-1.5">⭐ Trending</Badge>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Header Section - Compact */}
            <ScrollReveal animation="fadeInUp" delay={100}>
              <section>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {listing.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                    <Link 
                      to={`/vendor/${listing.vendorId}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <User className="h-3 w-3" />
                      <span className="font-medium">{listing.vendorName}</span>
                    </Link>
                    {listing.vendorCity && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.vendorCity}
                        </span>
                      </>
                    )}
                    {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount && (
                            <span>({listing.vendorReviewCount})</span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              </section>
            </ScrollReveal>

            {/* Listing Highlights - Compact */}
            {displayHighlights.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={200}>
                <section>
                <Card>
                  <CardContent className="p-3">
                    <h2 className="text-xs font-semibold mb-2">Highlights</h2>
                    <div className="grid grid-cols-2 gap-1">
                      {displayHighlights.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Description - Compact */}
            <ScrollReveal animation="fadeInUp" delay={300}>
              <section>
              <Card>
                <CardContent className="p-3">
                  <h2 className="text-xs font-semibold mb-2">About this {isPackage ? 'package' : 'service'}</h2>
                  <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                    {listing.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
              </section>
            </ScrollReveal>

            {/* Included Items - Clickable linked items - Compact */}
            {isPackage && linkedItems.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={350}>
                <section>
                <Card>
                  <CardContent className="p-3">
                    <h2 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-primary" />
                      Bundled Items ({linkedItems.length})
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {linkedItems.map((item: any) => (
                        <Link key={item.id} to={`/listing/${item.id}`} className="group block">
                          <div className="rounded border overflow-hidden bg-white hover:border-primary transition-colors">
                            <div className="aspect-square bg-slate-100 relative">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-slate-300" />
                                </div>
                              )}
                              <Badge className="absolute bottom-0.5 right-0.5 bg-white/90 text-slate-900 text-[9px] h-4 px-1 shadow">
                                ₹{Number(item.price).toLocaleString('en-IN')}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-medium p-1 truncate group-hover:text-primary">{item.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-slate-600">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {linkedItems.length} items included
                        </span>
                        <span className="text-slate-500">
                          Value: ₹{linkedItems.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Included/Excluded - Side by side - Compact */}
            <div className="grid grid-cols-2 gap-3">
              {/* What's Included */}
              {isPackage && listing.includedItemsText && listing.includedItemsText.length > 0 && (
                <ScrollReveal animation="fadeInUp" delay={400}>
                  <Card>
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2 text-green-700">✓ Included</h2>
                      <div className="space-y-0.5">
                        {listing.includedItemsText.map((item: string, index: number) => (
                          <p key={index} className="text-[10px] text-slate-600 flex items-start gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}

              {/* What's Not Included */}
              {isPackage && listing.excludedItemsText && listing.excludedItemsText.length > 0 && (
                <ScrollReveal animation="fadeInUp" delay={500}>
                  <Card>
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2 text-red-700">✗ Not Included</h2>
                      <div className="space-y-0.5">
                        {listing.excludedItemsText.map((item, index) => (
                          <p key={index} className="text-[10px] text-slate-600 flex items-start gap-1">
                            <XCircle className="h-2.5 w-2.5 text-red-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}
            </div>

            {/* Extra Charges - Compact */}
            {(parsedExtraCharges.length > 0 || (listing.extraCharges && listing.extraCharges.length > 0)) && (
              <ScrollReveal animation="fadeInUp" delay={600}>
                <section>
                  <Card>
                    <CardContent className="p-3">
                      <h2 className="text-xs font-semibold mb-2">Extra Charges</h2>
                      <div className="space-y-0.5">
                        {parsedExtraCharges.map((charge, index) => (
                          <div key={`detailed-${index}`} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-slate-50">
                            <span className="text-slate-600">{charge.name}</span>
                            <span className="font-medium text-primary flex items-center">
                              <IndianRupee className="h-2.5 w-2.5 mr-0.5" />
                              {Number(charge.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                        {parsedExtraCharges.length === 0 && listing.extraCharges?.map((charge: string, index: number) => (
                          <div key={`text-${index}`} className="text-[10px] p-1.5 rounded bg-slate-50 text-slate-600">
                            {charge}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Service Details - Modern Design */}
            <ScrollReveal animation="fadeInUp" delay={650}>
              <section>
                <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/20">
                        <Package className="h-4 w-4" />
                      </div>
                      Service Details
                    </h2>
                  </div>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {/* Delivery Time - Hide for DJ and Venue categories */}
                      {listing.categoryId !== 'dj-entertainment' && listing.categoryId !== 'venue' && listing.deliveryTime && (
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 hover:shadow-md transition-all">
                          <div className="inline-flex p-2 rounded-lg bg-blue-100 mb-2 group-hover:scale-110 transition-transform">
                            <Star className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-xs font-medium text-blue-600/80 uppercase tracking-wide">Delivery</p>
                          <p className="text-sm font-bold text-blue-900 mt-0.5">{listing.deliveryTime}</p>
                        </div>
                      )}
                      
                      {/* Service Mode - Hide for venue category */}
                      {listing.categoryId !== 'venue' && listing.serviceMode && (
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60 hover:shadow-md transition-all">
                          <div className="inline-flex p-2 rounded-lg bg-violet-100 mb-2 group-hover:scale-110 transition-transform">
                            <MapPin className="h-4 w-4 text-violet-600" />
                          </div>
                          <p className="text-xs font-medium text-violet-600/80 uppercase tracking-wide">Service Mode</p>
                          <p className="text-sm font-bold text-violet-900 mt-0.5">
                            {listing.serviceMode === 'CUSTOMER_VISITS' ? 'Visit Venue' : 
                             listing.serviceMode === 'VENDOR_TRAVELS' ? 'We Travel' : 'Flexible'}
                          </p>
                        </div>
                      )}
                      
                      {/* Negotiation */}
                      {listing.openForNegotiation !== undefined && (
                        <div className={cn(
                          "group p-4 rounded-xl border hover:shadow-md transition-all",
                          listing.openForNegotiation 
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60" 
                            : "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/60"
                        )}>
                          <div className={cn(
                            "inline-flex p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform",
                            listing.openForNegotiation ? "bg-emerald-100" : "bg-slate-100"
                          )}>
                            <IndianRupee className={cn(
                              "h-4 w-4",
                              listing.openForNegotiation ? "text-emerald-600" : "text-slate-500"
                            )} />
                          </div>
                          <p className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            listing.openForNegotiation ? "text-emerald-600/80" : "text-slate-500/80"
                          )}>Price</p>
                          <p className={cn(
                            "text-sm font-bold mt-0.5",
                            listing.openForNegotiation ? "text-emerald-900" : "text-slate-700"
                          )}>
                            {listing.openForNegotiation ? 'Negotiable' : 'Non-negotiable'}
                          </p>
                        </div>
                      )}
                      
                      {/* Unit for items */}
                      {isItem && listing.unit && (
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-md transition-all">
                          <div className="inline-flex p-2 rounded-lg bg-amber-100 mb-2 group-hover:scale-110 transition-transform">
                            <Package className="h-4 w-4 text-amber-600" />
                          </div>
                          <p className="text-xs font-medium text-amber-600/80 uppercase tracking-wide">Unit</p>
                          <p className="text-sm font-bold text-amber-900 mt-0.5">{listing.unit}</p>
                        </div>
                      )}
                      
                      {/* Minimum Quantity */}
                      {isItem && listing.minimumQuantity && (
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60 hover:shadow-md transition-all">
                          <div className="inline-flex p-2 rounded-lg bg-rose-100 mb-2 group-hover:scale-110 transition-transform">
                            <User className="h-4 w-4 text-rose-600" />
                          </div>
                          <p className="text-xs font-medium text-rose-600/80 uppercase tracking-wide">Min. Qty</p>
                          <p className="text-sm font-bold text-rose-900 mt-0.5">{listing.minimumQuantity}</p>
                        </div>
                      )}
                      
                      {/* Venue Location - Only for venue category */}
                      {listing.categoryId === 'venue' && listing.venueAddress && (
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 hover:shadow-md transition-all col-span-2 sm:col-span-3">
                          <div className="inline-flex p-2 rounded-lg bg-emerald-100 mb-2 group-hover:scale-110 transition-transform">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="text-xs font-medium text-emerald-600/80 uppercase tracking-wide">Venue Location</p>
                          <p className="text-sm font-bold text-emerald-900 mt-0.5">{listing.venueAddress}</p>
                          {listing.venueCity && (
                            <p className="text-xs text-emerald-700 mt-0.5">{listing.venueCity}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </ScrollReveal>

            {/* Category-Specific Details - Compact */}
            {listing.categorySpecificData && (
              <ScrollReveal animation="fadeInUp" delay={675}>
                <section>
                  <CategorySpecificDisplay 
                    categoryId={listing.categoryId} 
                    categorySpecificData={listing.categorySpecificData}
                  />
                </section>
              </ScrollReveal>
            )}

            {/* Reviews Section - Compact */}
            {reviews.length > 0 && (
              <ScrollReveal animation="fadeInUp" delay={700}>
                <section>
                  <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-semibold">
                        Reviews
                        {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                          <span className="ml-1 font-normal text-slate-400">
                            ({listing.vendorRating.toFixed(1)})
                          </span>
                        )}
                      </h2>
                      <Link to={`/vendor/${listing.vendorId}?tab=reviews`}>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                          View All
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {reviews.slice(0, 2).map((review: any) => (
                        <div key={review.id} className="border-b last:border-0 pb-2 last:pb-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-medium">{review.customerName || 'Anonymous'}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-2.5 w-2.5",
                                    i < (review.rating || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </section>
              </ScrollReveal>
            )}

            {/* Vendor Profile Card - Compact */}
            {!isOwner && (
            <ScrollReveal animation="fadeInUp" delay={800}>
              <section>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Vendor Profile Image */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#5950b3] to-[#7867dc]">
                        {listing.vendorProfileImage ? (
                          <img 
                            src={listing.vendorProfileImage} 
                            alt={listing.vendorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {listing.vendorName?.charAt(0)?.toUpperCase() || 'V'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xs text-slate-500 mb-0.5">Meet your vendor</h2>
                      <p className="text-sm font-semibold text-slate-900 truncate">{listing.vendorName}</p>
                      {listing.vendorRating !== undefined && listing.vendorRating !== null && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-slate-700">{listing.vendorRating.toFixed(1)}</span>
                          {listing.vendorReviewCount !== undefined && listing.vendorReviewCount !== null && (
                            <span className="text-slate-400">({listing.vendorReviewCount} reviews)</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* View Profile Button */}
                    <Link to={`/vendors/${listing.vendorId}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              </section>
            </ScrollReveal>
            )}

          </div>

          {/* Right Column - Booking Widget - Compact */}
          {!isOwner && (
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-20 space-y-2">
              {/* Request Callback - Primary CTA */}
              {listing && (
                <RequestCallbackModal
                  listingId={listing.id || listingId || ''}
                  listingName={listing.name || ''}
                  vendorId={listing.vendorId || ''}
                  vendorName={listing.vendorName || ''}
                  category={listing.customCategoryName || listing.categoryName || ''}
                />
              )}
              
              {/* Chat/Offer Button - Commented out for now
              {listing && (listing.openForNegotiation !== false) && (() => {
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                if (!finalListingId || finalListingId === '') {
                  return null;
                }
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow h-9 text-xs" size="sm">
                        <HandCoins className="mr-1.5 h-3.5 w-3.5" />
                        Chat & Make Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <DialogTitle className="sr-only">Chat with {listing?.vendorName || 'Vendor'}</DialogTitle>
                      <PremiumChatWindow
                        key={`chat-${finalListingId}`}
                        vendorId={listing?.vendorId || ''}
                        vendorName={listing?.vendorName || ''}
                        listingId={finalListingId}
                        listingPrice={typeof listing?.price === 'number' ? listing.price : parseFloat(String(listing?.price || '0'))}
                        openForNegotiation={listing?.openForNegotiation !== false}
                      />
                    </DialogContent>
                  </Dialog>
                );
              })()}
              */}
              
              {/* Regular Chat Button - Commented out for now
              {listing && !listing.openForNegotiation && (() => {
                const finalListingId = listing?.id 
                  ? String(listing.id).trim() 
                  : (listingId ? String(listingId).trim() : undefined);
                
                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-lg h-9 text-xs" size="sm">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Chat with Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 [&>button]:top-2 [&>button]:right-2 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-1">
                      <DialogTitle className="sr-only">Chat with {listing.vendorName || 'Vendor'}</DialogTitle>
                      <PremiumChatWindow
                        key={`chat-${finalListingId || 'no-listing'}`}
                        vendorId={listing.vendorId || ''}
                        vendorName={listing.vendorName || ''}
                        listingId={finalListingId}
                        listingPrice={typeof listing.price === 'number' ? listing.price : parseFloat(String(listing.price || '0'))}
                        openForNegotiation={false}
                      />
                    </DialogContent>
                  </Dialog>
                );
              })()}
              */}
              
              <BookingWidget
                listing={{
                  id: listing.id || listingId || '',
                  name: listing.name || '',
                  price: displayPrice,
                  type: listing.type || 'ITEM',
                  unit: listing.unit,
                  minimumQuantity: listing.minimumQuantity,
                  vendorId: listing.vendorId || '',
                  vendorName: listing.vendorName || '',
                  addOns: [],
                }}
                isVendorPreview={false}
              />
            </div>

            {/* Below-sticky content — scrolls naturally with the page */}
            <div className="space-y-3 mt-3">
              {/* Vendor's Other Listings */}
              {(() => {
                const otherListings = (vendorListings as any[])?.filter(
                  (l: any) => l.id !== (listing.id || listingId) && l.type !== 'PACKAGE'
                )?.slice(0, 3);
                if (!otherListings?.length) return null;
                return (
                  <Card className="overflow-hidden border-0 shadow-sm">
                    <div className="px-4 py-2.5 border-b bg-slate-50/80">
                      <p className="text-xs font-semibold text-slate-700">More from {listing.vendorName}</p>
                    </div>
                    <CardContent className="p-2 space-y-1">
                      {otherListings.map((item: any) => (
                        <Link
                          key={item.id}
                          to={`/listing/${item.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate group-hover:text-primary transition-colors">{item.name}</p>
                            {item.price > 0 && (
                              <p className="text-[11px] font-semibold text-primary mt-0.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                            )}
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                        </Link>
                      ))}
                      {(vendorListings as any[])?.filter((l: any) => l.id !== (listing.id || listingId)).length > 3 && (
                        <Link
                          to={`/vendors/${listing.vendorId}`}
                          className="block text-center py-2 text-[11px] font-medium text-primary hover:underline"
                        >
                          View all listings →
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

