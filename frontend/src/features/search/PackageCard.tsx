import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRight, Heart, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { FlattenedPackage } from '@/shared/utils/packageUtils';
import { useCategories } from '@/shared/hooks/useApi';
import { cn } from '@/shared/lib/utils';

interface PackageCardProps {
  package: FlattenedPackage;
  onViewDetails?: (packageId: string, vendorId: string) => void;
  onBookNow?: (packageId: string, vendorId: string) => void;
  searchQuery?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg }) => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [isLiked, setIsLiked] = React.useState(false);

  const handleCardClick = () => navigate(`/listing/${pkg.packageId || pkg.id}`);

  const categoryName = (pkg as any).customCategoryName
    || (pkg as any).categoryName
    || (categories as any[])?.find((c: any) => c.id === pkg.category)?.name
    || '';

  // Check for badges
  const isPopular = (pkg as any).isPopular;
  const isTrending = (pkg as any).isTrending;
  const rating = (pkg as any).vendorRating || (pkg as any).rating;
  const reviewCount = (pkg as any).vendorReviewCount || (pkg as any).reviewCount;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl border border-gray-100/80 hover:border-[#5950b3]/20"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <img
            src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
            alt={pkg.packageName || pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {isPopular && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-orange-500 text-white shadow-lg shadow-orange-500/30">
              <TrendingUp className="h-3 w-3" />
              Popular
            </span>
          )}
          {isTrending && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-purple-500 text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="h-3 w-3" />
              Trending
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 backdrop-blur-sm",
            isLiked 
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </button>

        {/* Category badge - positioned at bottom of image */}
        {categoryName && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/95 text-[#5950b3] shadow-md backdrop-blur-sm border border-[#5950b3]/10">
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#5950b3] transition-colors">
          {pkg.packageName || pkg.name}
        </h3>

        {/* Location & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          {pkg.vendorCity && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-[#5950b3] flex-shrink-0" />
              <span className="truncate">{pkg.vendorCity}</span>
            </div>
          )}
          {rating && rating > 0 && (
            <div className="flex items-center gap-1 text-xs flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-700">{Number(rating).toFixed(1)}</span>
              {reviewCount && reviewCount > 0 && (
                <span className="text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Price & CTA Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Price */}
          <div className="min-w-0">
            {(pkg.price || 0) > 0 ? (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  ₹{(pkg.price || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">onwards</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-[#5950b3]">Get Quote</span>
            )}
          </div>

          {/* CTA Button */}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] text-white transition-all shadow-md hover:shadow-lg hover:shadow-[#5950b3]/25 group/btn"
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          >
            View
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-[#5950b3]/0 group-hover:ring-[#5950b3]/20 transition-all duration-300 pointer-events-none" />
    </div>
  );
};
