import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Star, MapPin } from "lucide-react";

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
      <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={vendor.coverImage || 'https://via.placeholder.com/400x300'}
            alt={vendor.businessName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground line-clamp-1">
                {vendor.businessName}
              </h3>
              {city && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{city}</span>
                </div>
              )}
            </div>
            {category && (
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
                {vendor.reviewCount !== undefined && vendor.reviewCount !== null && (
                  <span className="text-muted-foreground text-sm">({vendor.reviewCount})</span>
                )}
              </div>
            )}
            {price > 0 && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Starting at</div>
                <div className="font-bold text-primary">₹{price.toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
