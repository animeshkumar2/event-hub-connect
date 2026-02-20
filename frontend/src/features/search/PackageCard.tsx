import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
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

  const handleCardClick = () => navigate(`/listing/${pkg.packageId || pkg.id}`);

  const categoryName = (pkg as any).customCategoryName
    || (pkg as any).categoryName
    || (categories as any[])?.find((c: any) => c.id === pkg.category)?.name
    || '';

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
            alt={pkg.packageName || pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* Wave separator */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 500 50" preserveAspectRatio="none" className="w-full h-5">
            <path d="M0,50 L0,25 Q125,50 250,25 T500,25 L500,50 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 pt-1 space-y-1.5">
        {/* Category badge */}
        {categoryName && (
          <div className="inline-block">
            <span className="text-[10px] font-semibold text-[#5950b3] bg-[#5950b3]/10 px-2.5 py-1 rounded-md">
              {categoryName}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
          {pkg.packageName || pkg.name}
        </h3>

        {/* Location */}
        {pkg.vendorCity && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-[#5950b3] flex-shrink-0" />
            <span className="truncate">{pkg.vendorCity}</span>
          </div>
        )}

        {/* Price */}
        {(pkg.price || 0) > 0 && (
          <div className="flex items-center gap-1 text-sm font-bold text-gray-900 pt-0.5">
            <span>₹{(pkg.price || 0).toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-normal text-gray-400">onwards</span>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-1.5">
          <button
            className="w-full h-9 rounded-full font-semibold text-xs bg-[#5950b3] hover:bg-[#4a42a0] text-white transition-all flex items-center justify-center gap-1.5"
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          >
            View More
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
