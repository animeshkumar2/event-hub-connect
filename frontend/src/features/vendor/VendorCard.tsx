import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    category?: string;
    categoryId?: string;
    categoryName?: string;
    city?: string;
    cityName?: string;
    rating?: number | string;
    reviewCount?: number;
    startingPrice?: number | string;
    coverImage?: string;
    isVerified?: boolean;
  };
}

export const VendorCard = ({ vendor }: VendorCardProps) => {
  const rating = typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating || '0');
  const price = typeof vendor.startingPrice === 'number' ? vendor.startingPrice : parseFloat(vendor.startingPrice || '0');
  const category = vendor.categoryName || vendor.category || vendor.categoryId || '';
  const city = vendor.cityName || vendor.city || '';

  return (
    <Link to={`/vendor/${vendor.id}?tab=packages`}>
      <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border">
        {/* Compact Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={vendor.coverImage || 'https://via.placeholder.com/400x300'}
            alt={vendor.businessName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Verified Badge */}
          {vendor.isVerified && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white border-none shadow-sm text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Category Badge - Compact */}
          {category && (
            <div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium capitalize">
                {category}
              </Badge>
            </div>
          )}

          {/* Vendor Name - Prominent */}
          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight">
            {vendor.businessName}
          </h3>

          {/* Location - Compact */}
          {city && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{city}</span>
            </div>
          )}

          {/* Rating & Price Row */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-xs text-foreground">{rating.toFixed(1)}</span>
                {vendor.reviewCount !== undefined && vendor.reviewCount !== null && (
                  <span className="text-[10px] text-muted-foreground">({vendor.reviewCount})</span>
                )}
              </div>
            )}
            {price > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">From</div>
                <div className="font-bold text-primary text-sm">₹{price.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
