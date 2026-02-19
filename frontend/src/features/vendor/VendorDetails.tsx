import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/features/home/Navbar';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { 
  Star, MapPin, ShoppingCart, AlertCircle, Loader2, 
  Award, TrendingUp, Calendar, Shield, CheckCircle2, 
  Phone, Heart, Share2, ChevronRight, Sparkles, Camera,
  ThumbsUp, Quote, Eye, ArrowRight, Play, ImageIcon, Users,
  X, ChevronLeft, ZoomIn, Download, Grid3X3, IndianRupee
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { useCart } from '@/shared/contexts/CartContext';
import { cn } from '@/shared/lib/utils';
import { PremiumPackageCard } from '@/features/search/PremiumPackageCard';
import { BookExactSetup } from '@/features/vendor/BookExactSetup';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { RequestCallbackModal } from '@/features/listing/RequestCallbackModal';
import { 
  useVendor, 
  useVendorListings,
  useVendorPackages,
  useVendorReviews, 
  useVendorFAQs, 
  useVendorPastEvents, 
  useVendorBookableSetups,
  useCategories
} from '@/shared/hooks/useApi';

// Fullscreen Gallery Lightbox Component
const GalleryLightbox = ({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0,
  vendorName 
}: { 
  images: string[]; 
  isOpen: boolean; 
  onClose: () => void; 
  initialIndex?: number;
  vendorName: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Auto-scroll thumbnail into view when currentIndex changes
  useEffect(() => {
    const thumb = thumbnailRefs.current[currentIndex];
    const container = thumbnailContainerRef.current;
    if (thumb && container) {
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      
      // If thumbnail is out of view, scroll to center it
      if (thumbLeft < scrollLeft + 60 || thumbLeft + thumbWidth > scrollLeft + containerWidth - 60) {
        container.scrollTo({
          left: thumbLeft - containerWidth / 2 + thumbWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{
            background: `radial-gradient(circle, rgba(89, 80, 179, 0.4) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="text-white">
            <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">{vendorName}</p>
            <p className="text-base sm:text-lg font-semibold">{currentIndex + 1} <span className="text-white/40 font-normal">/ {images.length}</span></p>
          </div>
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            viewMode === 'grid' 
              ? "bg-white text-black" 
              : "bg-white/10 hover:bg-white/20 text-white"
          )}
        >
          {viewMode === 'grid' ? 'Single View' : 'View All'}
        </button>
      </div>

      {viewMode === 'single' ? (
        <>
          {/* Main Image with cinematic framing */}
          <div className="absolute inset-0 flex items-center justify-center px-2 sm:px-4 pt-16 sm:pt-20 pb-28 sm:pb-44">
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
              </button>
            </>
          )}

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 sm:pt-12 pb-4 sm:pb-8">
              <div className="px-3 sm:px-6">
                <p className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-4 font-medium">Gallery</p>
                <div className="relative">
                  {/* Fade edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                  
                  {/* Scrollable container */}
                  <div ref={thumbnailContainerRef} className="flex gap-2 sm:gap-3 overflow-x-auto py-2 scrollbar-hide px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        ref={(el) => { thumbnailRefs.current[idx] = el; }}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          "relative flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden transition-all duration-300 group",
                          currentIndex === idx 
                            ? "w-20 h-14 sm:w-32 sm:h-20 ring-2 ring-white shadow-lg shadow-white/20 scale-105" 
                            : "w-16 h-11 sm:w-28 sm:h-[72px] opacity-60 hover:opacity-100 hover:scale-105"
                        )}
                      >
                        <img 
                          src={img} 
                          alt={`Thumb ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay */}
                        <div className={cn(
                          "absolute inset-0 transition-all",
                          currentIndex === idx 
                            ? "bg-transparent" 
                            : "bg-black/20 group-hover:bg-transparent"
                        )} />
                        {/* Active indicator */}
                        {currentIndex === idx && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5950b3] to-[#7867dc]" />
                        )}
                        {/* Number badge */}
                        <div className={cn(
                          "absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold transition-all",
                          currentIndex === idx 
                            ? "bg-white text-black" 
                            : "bg-black/60 text-white/80"
                        )}>
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Pinterest-style masonry grid */
        <div className="absolute inset-0 overflow-y-auto pt-20 sm:pt-24 pb-8 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-4 sm:mb-6 font-medium">All Photos</p>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('single');
                  }}
                  className="relative w-full mb-3 sm:mb-4 rounded-xl overflow-hidden group block break-inside-avoid"
                >
                  <img 
                    src={img} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl" 
                    loading="lazy"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  {/* Number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-[10px] sm:text-xs font-bold border border-white/10">
                    {idx + 1}
                  </div>
                  {/* Hover zoom indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [highlightedPackageId, setHighlightedPackageId] = useState<string | null>(null);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  // Fetch data from API
  const { data: vendorData, loading: vendorLoading, error: vendorError } = useVendor(vendorId || null);
  const { data: packagesData, loading: packagesLoading } = useVendorPackages(vendorId || null);
  const { data: listingsData, loading: listingsLoading } = useVendorListings(vendorId || null);
  const { data: reviewsData, loading: reviewsLoading } = useVendorReviews(vendorId || null);
  const { data: faqsData, loading: faqsLoading } = useVendorFAQs(vendorId || null);
  const { data: pastEventsData, loading: pastEventsLoading } = useVendorPastEvents(vendorId || null);
  const { data: bookableSetupsData, loading: bookableSetupsLoading } = useVendorBookableSetups(vendorId || null);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Transform API data
  const vendor = useMemo(() => {
    if (!vendorData) return null;

    const packages = (packagesData || []).map((l: any) => ({
      id: l.id,
      vendorId: vendorId || '',
      name: l.name,
      description: l.description,
      price: parseFloat(l.price),
      images: l.images || [],
      includedItems: l.includedItemsText || [],
      excludedItems: l.excludedItemsText || [],
      deliveryTime: l.deliveryTime,
      extraCharges: l.extraCharges || [],
      category: l.categoryId,
      isPopular: l.isPopular,
      isTrending: l.isTrending,
      addOns: l.addOns || [],
    }));

    const listings = (listingsData || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      price: parseFloat(l.price),
      images: l.images || [],
      category: l.categoryId,
      unit: l.unit,
      minimumQuantity: l.minimumQuantity,
    }));

    return {
      id: vendorData.id,
      businessName: vendorData.businessName,
      category: vendorData.categoryId || vendorData.categoryName || '',
      categoryName: vendorData.categoryName || vendorData.categoryId || '',
      city: vendorData.cityName || '',
      bio: vendorData.bio || '',
      rating: parseFloat(vendorData.rating || 0),
      reviewCount: vendorData.reviewCount || 0,
      startingPrice: parseFloat(vendorData.startingPrice || 0),
      coverImage: vendorData.coverImage || '',
      profileImage: vendorData.profileImage || '',
      portfolioImages: vendorData.portfolioImages || [],
      coverageRadius: vendorData.coverageRadius || 0,
      isVerified: vendorData.isVerified || false,
      packages,
      listings,
      reviews: (reviewsData || []).map((r: any) => ({
        id: r.id,
        userName: r.userName || 'Anonymous',
        rating: parseFloat(r.rating || 0),
        comment: r.comment || '',
        eventType: r.eventType,
        date: r.createdAt || r.date,
        images: r.images || [],
      })),
      faqs: (faqsData || []).map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
      pastEvents: (pastEventsData || []).map((e: any) => ({
        id: e.id,
        image: e.image,
        eventType: e.eventType,
        date: e.eventDate || e.date,
      })),
      bookableSetups: (bookableSetupsData || []).map((s: any) => ({
        id: s.id,
        vendorId: vendorId || '',
        image: s.image,
        title: s.title,
        description: s.description,
        price: parseFloat(s.price || 0),
        category: s.categoryId,
      })),
    };
  }, [vendorData, packagesData, listingsData, reviewsData, faqsData, pastEventsData, bookableSetupsData]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'overview');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    const packageId = searchParams.get('packageId') || searchParams.get('package');
    
    if (packageId && tab !== 'listings') {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'listings');
      params.set('packageId', packageId);
      params.delete('package');
      setSearchParams(params, { replace: true });
      return;
    }
    
    if (tab === 'listings') {
      if (packageId) {
        setHighlightedPackageId(packageId);
        setShowAllPackages(false);
      }
      setTimeout(() => {
        const listingsSection = document.getElementById('listings-section');
        if (listingsSection) {
          listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      setHighlightedPackageId(null);
      setShowAllPackages(false);
    }
  }, [searchParams, setSearchParams]);

  // Loading state
  if (vendorLoading || packagesLoading || listingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5950b3]" />
              </div>
            </div>
            <p className="text-gray-500 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Vendor not found</h1>
            <p className="text-gray-500 mb-6">{vendorError || 'The vendor you are looking for does not exist.'}</p>
            <Button asChild className="bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:opacity-90">
              <Link to="/search">Back to Search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookPackage = (packageId: string) => {
    navigate(`/listing/${packageId}`);
  };

  const totalPackages = vendor.packages.length;
  const totalListings = vendor.listings?.length || 0;
  const totalReviews = vendor.reviews.length;
  const averageRating = vendor.rating;
  const verifiedBadge = vendor.isVerified;
  const categoryDisplayName = vendor.categoryName || categories.find(c => c.id === vendor.category)?.name || vendor.category;
  const firstPackage = vendor.packages[0];

  // Used for gallery navigation
  const handleGalleryClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'portfolio');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 overflow-x-hidden">
      <Navbar />

      {/* ========== IMMERSIVE HERO GALLERY ========== */}
      <div className="relative">
        {/* Full-Width Cinematic Gallery */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden bg-gray-900">
          {/* Gallery Grid - Only show if we have images */}
          {(vendor.coverImage || (vendor.portfolioImages && vendor.portfolioImages.length > 0)) ? (
            <div className="h-full">
              {/* Masonry-style Gallery Layout */}
              <div className="grid grid-cols-12 grid-rows-6 h-full gap-2 p-2">
                {/* Main Cover - Large hero image (left side) */}
                <div 
                  className="col-span-12 md:col-span-7 row-span-6 relative group cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => {
                    setGalleryStartIndex(0);
                    setGalleryOpen(true);
                  }}
                >
                  <img
                    src={vendor.coverImage || vendor.portfolioImages?.[0] || ''}
                    alt="Cover"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Right Column - Stacked portfolio images */}
                <div className="hidden md:grid col-span-5 row-span-6 grid-rows-3 gap-2">
                  {/* Top Right - Large */}
                  <div 
                    className="row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-800"
                    onClick={() => {
                      setGalleryStartIndex(1);
                      setGalleryOpen(true);
                    }}
                  >
                    {vendor.portfolioImages?.[0] ? (
                      <img 
                        src={vendor.portfolioImages[0]} 
                        alt="Portfolio 1"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <ImageIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Right - Two smaller images */}
                  <div className="row-span-1 grid grid-cols-2 gap-2">
                    {[1, 2].map((idx) => {
                      const img = vendor.portfolioImages?.[idx];
                      const isLast = idx === 2;
                      const remainingCount = (vendor.portfolioImages?.length || 0) - 3;
                      
                      return (
                        <div 
                          key={idx}
                          className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-800"
                          onClick={() => {
                            setGalleryStartIndex(idx + 1);
                            setGalleryOpen(true);
                          }}
                        >
                          {img ? (
                            <>
                              <img 
                                src={img} 
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              
                              {/* Show +X more overlay on last image if more photos exist */}
                              {isLast && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                  <span className="text-2xl font-bold">+{remainingCount}</span>
                                  <span className="text-xs text-white/70">more photos</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                              <ImageIcon className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No images at all - show fancy placeholder */
            <div className="w-full h-full bg-gradient-to-br from-[#2d2660] via-[#3d3578] to-[#5950b3] flex items-center justify-center relative overflow-hidden">
              {/* Animated floating shapes */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Large blurred orbs */}
                <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-[#7867dc]/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[20%] right-[15%] w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                <div className="absolute top-[50%] left-[60%] w-48 h-48 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                
                {/* Decorative grid of faint photo frames */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                  <div className="grid grid-cols-4 gap-4 -rotate-12 scale-125">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-20 h-24 sm:w-28 sm:h-32 rounded-lg border-2 border-white" />
                    ))}
                  </div>
                </div>
                
                {/* Sparkle dots */}
                <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute top-[25%] right-[30%] w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute bottom-[35%] left-[40%] w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
                <div className="absolute bottom-[40%] right-[20%] w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
              </div>
              
              <div className="text-center text-white relative z-10 px-4">
                {/* Stacked photo frames icon */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6">
                  {/* Back frame */}
                  <div className="absolute inset-2 rounded-xl border-2 border-white/15 rotate-6 bg-white/5" />
                  {/* Middle frame */}
                  <div className="absolute inset-1 rounded-xl border-2 border-white/20 -rotate-3 bg-white/5" />
                  {/* Front frame */}
                  <div className="absolute inset-0 rounded-xl border-2 border-white/25 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-white/50" />
                  </div>
                </div>
                
                <h3 className="text-white/90 text-lg sm:text-xl font-semibold mb-2">No photos yet</h3>
                <p className="text-white/40 text-sm sm:text-base max-w-xs mx-auto">This vendor hasn't uploaded their portfolio. Check back soon for amazing work.</p>
              </div>
            </div>
          )}

          {/* Top Navigation Bar */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <Link 
              to="/search" 
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl bg-white/95 backdrop-blur-sm text-gray-700 text-sm font-medium hover:bg-white transition-all shadow-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Back</span>
            </Link>
          </div>

          {/* View All Photos Button */}
          {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
            <button
              onClick={() => {
                setGalleryStartIndex(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 px-5 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg text-gray-800 text-sm font-medium hover:bg-white transition-all flex items-center gap-2 z-20"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        images={[vendor.coverImage, ...(vendor.portfolioImages || [])].filter(Boolean)}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryStartIndex}
        vendorName={vendor.businessName}
      />

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tab Content (2 columns) */}
          <div className="lg:col-span-2 min-w-0">
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <Tabs 
            defaultValue="overview"
            value={searchParams.get('tab') || 'overview'} 
            className="w-full" 
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams);
              params.set('tab', value);
              setSearchParams(params, { replace: true });
            }}
          >
            <div className="border-b border-gray-100 relative">
              {/* Right fade + scroll hint - mobile only */}
              <div className="sm:hidden absolute right-0 top-0 bottom-0 z-10 flex items-center pointer-events-none">
                <div className="w-12 h-full bg-gradient-to-l from-white via-white/90 to-transparent" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 animate-pulse">
                  <ChevronRight className="h-4 w-4 text-[#5950b3]/50" />
                </div>
              </div>
              <div className="px-4 sm:px-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <TabsList className="h-auto bg-transparent p-0 gap-0 inline-flex w-max sm:w-full sm:flex">
                  {[
                    { value: 'overview', label: 'Overview', icon: Sparkles },
                    { value: 'listings', label: 'Packages', icon: ShoppingCart },
                    { value: 'portfolio', label: 'Portfolio', icon: ImageIcon },
                    { value: 'reviews', label: 'Reviews', icon: Star },
                    { value: 'faqs', label: 'FAQs', icon: Quote },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={cn(
                        "relative sm:flex-1 px-5 sm:px-4 py-3.5 sm:py-4 rounded-none border-b-2 border-transparent whitespace-nowrap",
                        "data-[state=active]:border-[#5950b3] data-[state=active]:text-[#5950b3]",
                        "text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm sm:text-base",
                        "flex items-center justify-center gap-1.5 sm:gap-2"
                      )}
                    >
                      <tab.icon className="h-4 w-4 hidden sm:block" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* ========== OVERVIEW TAB ========== */}
              <TabsContent value="overview" className="mt-0 space-y-8">
                {/* About Section */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    About {vendor.businessName}
                  </h2>
                  {vendor.bio ? (
                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{vendor.bio}</p>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-400 italic">No description available yet.</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Star, label: 'Rating', value: averageRating.toFixed(1), color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
                    { icon: ThumbsUp, label: 'Reviews', value: totalReviews.toString(), color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
                    { icon: ShoppingCart, label: 'Packages', value: totalPackages.toString(), color: 'from-[#5950b3] to-[#7867dc]', bg: 'bg-purple-50' },
                    { icon: Calendar, label: 'Events Done', value: (vendor.pastEvents?.length || 0).toString(), color: 'from-green-400 to-emerald-500', bg: 'bg-green-50' },
                  ].map((stat, idx) => (
                    <div key={idx} className={cn("rounded-2xl p-5", stat.bg)}>
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", stat.color)}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Featured Packages */}
                {vendor.packages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        Featured Packages
                      </h2>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('tab', 'listings');
                          setSearchParams(params, { replace: true });
                        }}
                        className="text-[#5950b3] font-medium hover:underline flex items-center gap-1"
                      >
                        View all <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {vendor.packages.slice(0, 2).map((pkg) => (
                        <div 
                          key={pkg.id} 
                          className="group relative bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-[#5950b3]/30 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('tab', 'listings');
                            params.set('packageId', pkg.id);
                            setSearchParams(params, { replace: true });
                          }}
                        >
                          {/* Trending/Popular Badge */}
                          {(pkg.isTrending || pkg.isPopular) && (
                            <div className="absolute -top-3 left-6">
                              <Badge className={cn(
                                "shadow-lg px-3 py-1",
                                pkg.isTrending 
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                                  : "bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white"
                              )}>
                                {pkg.isTrending ? (
                                  <><TrendingUp className="h-3 w-3 mr-1" /> Trending</>
                                ) : (
                                  <><Award className="h-3 w-3 mr-1" /> Popular</>
                                )}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#5950b3] transition-colors">
                                {pkg.name}
                              </h3>
                              <p className="text-gray-500 line-clamp-2 mb-4">{pkg.description}</p>
                              <p className="text-2xl font-bold text-[#5950b3]">
                                ₹{pkg.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#5950b3] transition-colors shrink-0">
                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Exact Setups */}
                {vendor.bookableSetups && vendor.bookableSetups.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      Book This Exact Setup
                    </h2>
                    <p className="text-gray-500 mb-5">Click on any setup to book it directly</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendor.bookableSetups.map((setup) => (
                        <BookExactSetup
                          key={setup.id}
                          setup={setup}
                          vendorName={vendor.businessName}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Events Gallery */}
                {vendor.pastEvents && vendor.pastEvents.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      Past Events
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vendor.pastEvents.slice(0, 8).map((event) => (
                        <div key={event.id} className="group cursor-pointer">
                          <div className="aspect-square rounded-2xl overflow-hidden relative">
                            <img
                              src={event.image}
                              alt={event.eventType}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-medium truncate">{event.eventType}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Review */}
                {vendor.reviews.length > 0 && (
                  <div className="bg-gradient-to-br from-[#5950b3]/5 via-purple-50/50 to-[#7867dc]/5 rounded-2xl p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center shrink-0">
                        <Quote className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-5 w-5",
                                i < Math.floor(vendor.reviews[0].rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-lg italic mb-4 leading-relaxed">"{vendor.reviews[0].comment}"</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">— {vendor.reviews[0].userName}</p>
                          <button
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set('tab', 'reviews');
                              setSearchParams(params, { replace: true });
                            }}
                            className="text-[#5950b3] font-medium hover:underline flex items-center gap-1"
                          >
                            Read all reviews <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ========== PACKAGES TAB ========== */}
              <TabsContent value="listings" id="listings-section" className="mt-0 space-y-8">
                {/* Packages Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      All Packages
                      <span className="ml-2 text-base font-normal text-gray-500">
                        ({totalPackages} available)
                      </span>
                    </h2>
                  </div>
                  
                  {vendor.packages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {vendor.packages.map((pkg) => {
                        const themeMap: Record<string, 'wedding' | 'dj' | 'birthday' | 'corporate'> = {
                          photographer: 'wedding',
                          decorator: 'wedding',
                          dj: 'dj',
                          'sound-lights': 'dj',
                          caterer: 'corporate',
                          mua: 'wedding',
                          'event-planner': 'wedding',
                        };
                        const theme = themeMap[vendor.category] || 'wedding';
                        const isHighlighted = highlightedPackageId === pkg.id;
                        const shouldShow = showAllPackages || !highlightedPackageId || isHighlighted;
                        
                        if (!shouldShow) return null;
                        
                        return (
                          <div
                            key={pkg.id}
                            className={cn(
                              "transition-all duration-500",
                              highlightedPackageId && !showAllPackages && !isHighlighted
                                ? "opacity-30 blur-sm pointer-events-none"
                                : ""
                            )}
                          >
                            <PremiumPackageCard
                              pkg={pkg}
                              vendorId={vendor.id}
                              vendorName={vendor.businessName}
                              vendorCategory={vendor.category}
                              onBook={(pkg) => handleBookPackage(pkg.id)}
                              theme={theme}
                              showOtherPackagesButton={isHighlighted && !showAllPackages && !!highlightedPackageId}
                              onShowOtherPackages={() => setShowAllPackages(true)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No packages available yet.</p>
                    </div>
                  )}
                </div>

                {/* Individual Listings */}
                {vendor.listings && vendor.listings.length > 0 && (
                  <div className="pt-6 md:pt-8 border-t border-gray-100">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                      Individual Items
                      <span className="ml-2 text-sm md:text-base font-normal text-gray-500">
                        ({totalListings} available)
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {vendor.listings.map((listing) => {
                        const listingCategory = listing.category || vendor.category;
                        const categoryName = categories.find(c => c.id === listingCategory)?.name || listingCategory;
                        const verifiedBookings = vendor.reviewCount ? Math.floor(vendor.reviewCount * 1.5) : 0;
                        
                        return (
                          <div 
                            key={listing.id} 
                            className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            {/* Image Section */}
                            <div className="relative">
                              <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
                                <img
                                  src={listing.images?.[0] || `https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop`}
                                  alt={listing.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop';
                                  }}
                                />
                              </div>
                              
                              {/* Wave separator */}
                              <div className="absolute -bottom-1 left-0 right-0">
                                <svg viewBox="0 0 500 50" preserveAspectRatio="none" className="w-full h-4 md:h-5">
                                  <path 
                                    d="M0,50 L0,25 Q125,50 250,25 T500,25 L500,50 Z" 
                                    fill="white"
                                  />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="p-3 sm:p-4 pt-1">
                              {/* Category */}
                              <div className="inline-block mb-1.5 md:mb-2">
                                <span className="text-[10px] md:text-[11px] font-semibold text-[#5950b3] bg-[#5950b3]/10 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md">
                                  {categoryName}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1.5 md:mb-2 line-clamp-2">
                                {listing.name}
                              </h3>
                              
                              {/* Location */}
                              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mb-2 md:mb-2.5">
                                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#5950b3] flex-shrink-0" />
                                <span className="truncate">{vendor.city}</span>
                                {verifiedBookings > 0 && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-500 flex-shrink-0" />
                                    <span className="text-green-600 whitespace-nowrap">{verifiedBookings} booked</span>
                                  </>
                                )}
                              </div>

                              {/* Price */}
                              {listing.price > 0 && (
                                <div className="flex items-center gap-1 text-sm md:text-base font-bold text-gray-900 mb-2.5 md:mb-3">
                                  <span>₹{listing.price.toLocaleString('en-IN')}</span>
                                  <span className="text-[10px] md:text-xs font-normal text-gray-400">onwards</span>
                                </div>
                              )}
                              
                              {/* CTA Button */}
                              <Button 
                                className="w-full h-9 md:h-10 rounded-full font-semibold text-xs md:text-sm bg-[#5950b3] hover:bg-[#4a42a0] text-white transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/listing/${listing.id}`);
                                }}
                              >
                                View More →
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ========== PORTFOLIO TAB ========== */}
              <TabsContent value="portfolio" className="mt-0">
                {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#5950b3] to-[#7867dc]" />
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-gray-900">Our Work</h2>
                          <p className="text-xs md:text-sm text-gray-500">{vendor.portfolioImages.length} photos showcasing our craft</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium gallery board */}
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-stone-200/60" style={{ background: 'linear-gradient(145deg, #fdfcfa 0%, #f8f5f0 25%, #f4efe7 50%, #f8f5f0 75%, #fdfcfa 100%)' }}>
                      {/* Fabric texture */}
                      <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23d4c5a9\' fill-opacity=\'0.06\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'/%3E%3C/svg%3E")' }} />
                      
                      {/* Warm center glow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2/3 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                      
                      {/* Gold accent lines top & bottom */}
                      <div className="absolute top-0 left-6 right-6 md:left-10 md:right-10 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-6 right-6 md:left-10 md:right-10 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent pointer-events-none" />
                      
                      {/* === MOBILE: Horizontal swipeable carousel === */}
                      <div className="sm:hidden relative p-4 pt-6 pb-2">
                        <div className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                          {vendor.portfolioImages.map((image, index) => (
                            <div
                              key={index}
                              className="snap-center flex-shrink-0 w-[75vw] max-w-[300px] cursor-pointer group"
                              onClick={() => {
                                setGalleryStartIndex(index);
                                setGalleryOpen(true);
                              }}
                            >
                              <div className="relative -rotate-1 group-hover:rotate-0 transition-transform duration-500">
                                {/* Gold pushpin */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-400 shadow-md border border-amber-400/30 relative">
                                    <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/70" />
                                  </div>
                                </div>
                                
                                {/* Polaroid */}
                                <div className="bg-white p-1.5 pb-3 rounded-[3px] shadow-[0_2px_12px_rgba(120,100,60,0.1)]">
                                  <div className="aspect-[4/5] overflow-hidden rounded-[1px]">
                                    <img
                                      src={image}
                                      alt={`Portfolio ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&fit=crop';
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Scroll dots indicator */}
                        <div className="flex justify-center gap-1.5 pt-1">
                          {vendor.portfolioImages.map((_, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-[#5950b3]/20 first:bg-[#5950b3]/60" />
                          ))}
                        </div>
                      </div>
                      
                      {/* === DESKTOP: Pinboard grid === */}
                      <div className="hidden sm:block p-6 md:p-12">
                        <div className="relative grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                          {vendor.portfolioImages.map((image, index) => {
                            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0', '-rotate-2'];
                            const rotation = rotations[index % rotations.length];
                            const pinOffsets = ['left-1/2 -translate-x-1/2', 'left-[45%] -translate-x-1/2', 'left-[55%] -translate-x-1/2'];
                            const pinOffset = pinOffsets[index % pinOffsets.length];
                            
                            return (
                              <div
                                key={index}
                                className={`${rotation} hover:rotate-0 hover:scale-105 hover:z-10 transition-all duration-500 cursor-pointer group`}
                                onClick={() => {
                                  setGalleryStartIndex(index);
                                  setGalleryOpen(true);
                                }}
                              >
                                <div className="relative">
                                  {/* Gold pushpin */}
                                  <div className={`absolute -top-2.5 ${pinOffset} z-20`}>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-400 shadow-md border border-amber-400/30 relative">
                                      <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white/70" />
                                    </div>
                                    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/15 rounded-full blur-[1px]" />
                                  </div>
                                  
                                  {/* Polaroid */}
                                  <div className="bg-white p-1.5 pb-3 rounded-[3px] shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(120,100,60,0.08)] group-hover:shadow-[0_8px_30px_rgba(120,100,60,0.14),0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-500">
                                    <div className="aspect-[4/5] overflow-hidden rounded-[1px]">
                                      <img
                                        src={image}
                                        alt={`Portfolio ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&fit=crop';
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* View in gallery mode button */}
                      {vendor.portfolioImages.length > 4 && (
                        <div className="pb-5 md:pb-8 text-center relative">
                          <button
                            onClick={() => {
                              setGalleryStartIndex(0);
                              setGalleryOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-gray-700 hover:border-[#5950b3]/30 hover:text-[#5950b3] shadow-sm hover:shadow-md transition-all"
                          >
                            <Grid3X3 className="h-4 w-4" />
                            View in Gallery Mode
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">No Portfolio Yet</h3>
                    <p className="text-gray-400 text-sm">Check back soon for photos of our work</p>
                  </div>
                )}
              </TabsContent>

              {/* ========== REVIEWS TAB ========== */}
              <TabsContent value="reviews" className="mt-0">
                {/* Reviews Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#5950b3] to-[#7867dc]" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Reviews</h2>
                      <p className="text-xs sm:text-sm text-gray-500">{totalReviews} verified reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-amber-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-400 text-amber-400" />
                    <div>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                      <p className="text-[10px] sm:text-xs text-gray-500 leading-none">/5</p>
                    </div>
                  </div>
                </div>
                
                {vendor.reviews.length > 0 ? (
                  <div className="space-y-5 sm:space-y-6">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="pb-5 sm:pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-100 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-[#5950b3] to-[#7867dc] text-white font-semibold text-sm sm:text-base">
                              {review.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{review.userName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < Math.floor(review.rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  {review.eventType && (
                                    <Badge variant="outline" className="text-xs">
                                      {review.eventType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-400">
                                {new Date(review.date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-4">
                                {review.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-xl"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl p-10 sm:p-12 text-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30 border border-gray-100">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 sm:h-10 sm:w-10 text-amber-300" />
                    </div>
                    <p className="text-gray-700 font-semibold text-base sm:text-lg mb-1">No reviews yet</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">This vendor is new. Be the first to share your experience after booking.</p>
                  </div>
                )}
              </TabsContent>

              {/* ========== FAQS TAB ========== */}
              <TabsContent value="faqs" className="mt-0">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#5950b3] to-[#7867dc]" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <p className="text-xs sm:text-sm text-gray-500">{vendor.faqs.length} questions answered</p>
                  </div>
                </div>
                
                {vendor.faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
                    {vendor.faqs.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border-0 rounded-xl sm:rounded-2xl overflow-hidden group/faq"
                      >
                        <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl data-[state=open]:shadow-md transition-all overflow-hidden group-data-[state=open]/faq:border-[#5950b3]/20">
                          <AccordionTrigger className="hover:no-underline px-4 sm:px-5 py-4 sm:py-5 gap-3 [&>svg]:hidden">
                            <div className="flex items-center gap-3 sm:gap-4 text-left flex-1">
                              {/* Question number bubble */}
                              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#5950b3]/10 to-[#7867dc]/10 flex items-center justify-center flex-shrink-0 group-data-[state=open]/faq:from-[#5950b3] group-data-[state=open]/faq:to-[#7867dc] transition-all">
                                <span className="text-xs sm:text-sm font-bold text-[#5950b3] group-data-[state=open]/faq:text-white transition-colors">
                                  Q{faqIndex + 1}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                                {faq.question}
                              </span>
                            </div>
                            {/* Custom chevron */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-data-[state=open]/faq:bg-[#5950b3]/10 flex items-center justify-center flex-shrink-0 transition-all">
                              <ChevronRight className="h-4 w-4 text-gray-400 group-data-[state=open]/faq:text-[#5950b3] group-data-[state=open]/faq:rotate-90 transition-all duration-300" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-[3.25rem] sm:pl-[3.75rem]">
                              <div className="bg-gradient-to-r from-[#5950b3]/[0.03] to-[#7867dc]/[0.03] rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-3 border-[#5950b3]/20">
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="rounded-2xl p-10 sm:p-12 text-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30 border border-gray-100">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[#5950b3]/40" />
                    </div>
                    <p className="text-gray-700 font-semibold text-base sm:text-lg mb-1">No FAQs yet</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">Have a question? Reach out to the vendor directly via callback.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          </div>
          </div>

          {/* Right: Vendor Card Sidebar (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Vendor Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 text-center border-b border-gray-100">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#5950b3]/20 mx-auto bg-gradient-to-br from-[#5950b3] to-[#7867dc]">
                      {vendor.profileImage ? (
                        <img 
                          src={vendor.profileImage} 
                          alt={vendor.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {vendor.businessName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {verifiedBadge && (
                      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Category */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{vendor.businessName}</h2>
                  <p className="text-sm text-gray-500 mb-3">{categoryDisplayName}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-[#5950b3]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.city}</p>
                      {vendor.coverageRadius > 0 && (
                        <p className="text-xs text-gray-500">Travels up to {vendor.coverageRadius}km</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.pastEvents?.length || 0} events completed</p>
                      <p className="text-xs text-gray-500">Experienced professional</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{totalPackages} packages available</p>
                      <p className="text-xs text-gray-500">Multiple options to choose</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4 pt-0">
                  {firstPackage && (
                    <RequestCallbackModal
                      listingId={firstPackage.id}
                      listingName={firstPackage.name}
                      vendorId={vendor.id}
                      vendorName={vendor.businessName}
                      category={categoryDisplayName}
                    />
                  )}
                </div>

                {/* Trust Badge */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg py-2">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    <span>100% secure · No spam calls</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating CTA for Mobile */}
        {firstPackage && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 lg:hidden z-50">
            <RequestCallbackModal
              listingId={firstPackage.id}
              listingName={firstPackage.name}
              vendorId={vendor.id}
              vendorName={vendor.businessName}
              category={categoryDisplayName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;
