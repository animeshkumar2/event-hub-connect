import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MapPin, Tag, IndianRupee, CheckCircle2 } from 'lucide-react';
import { FlattenedPackage } from '@/shared/utils/packageUtils';
import { cn } from '@/shared/lib/utils';

interface PackageCardProps {
  package: FlattenedPackage;
  onViewDetails?: (packageId: string, vendorId: string) => void;
  onBookNow?: (packageId: string, vendorId: string) => void;
  searchQuery?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const itemId = pkg.packageId || pkg.id;
    navigate(`/listing/${itemId}`);
  };

  const handleVendorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vendor/${pkg.vendorId}?tab=packages`);
  };

  // Mock verified bookings - in real app this would come from API
  const verifiedBookings = pkg.vendorReviewCount ? Math.floor(pkg.vendorReviewCount * 1.5) : 0;

  return (
    <Card 
      className={cn(
        "group overflow-hidden cursor-pointer bg-white border-2 border-gray-100 hover:border-[#5950b3]/30 hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl"
      )}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        <img
          src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
          alt={pkg.packageName || pkg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Featured/Popular Badge - Top Center */}
        {(pkg.isPopular || pkg.isTrending) && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <Badge className={cn(
              "rounded-t-none rounded-b-lg px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-lg",
              pkg.isPopular 
                ? "bg-[#5950b3] text-white" 
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            )}>
              {pkg.isPopular ? '🔥 Popular' : '⭐ Trending'}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-[#5950b3] transition-colors">
          {pkg.packageName || pkg.name}
        </h3>

        {/* Verified Bookings */}
        {verifiedBookings > 0 && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            <span>{verifiedBookings} Verified bookings</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Info List */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* Location */}
          {pkg.vendorCity && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
              <span className="truncate">{pkg.vendorCity}</span>
            </div>
          )}

          {/* Vendor/Category */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5950b3] flex-shrink-0" />
            <button
              onClick={handleVendorClick}
              className="hover:text-[#5950b3] hover:underline transition-colors text-left truncate"
            >
              {pkg.vendorName}
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-gray-900">
              ₹{(pkg.price || 0).toLocaleString('en-IN')}
              {pkg.type === 'package' && <span className="font-normal text-gray-500"> onwards</span>}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full h-10 sm:h-11 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] text-white shadow-md hover:shadow-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          View More →
        </Button>
      </CardContent>
    </Card>
  );
};
