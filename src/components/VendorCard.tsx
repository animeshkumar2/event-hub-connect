import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { Vendor } from "@/data/mockData";

interface VendorCardProps {
  vendor: Vendor;
}

export const VendorCard = ({ vendor }: VendorCardProps) => {
  return (
    <Link to={`/vendor/${vendor.id}?tab=packages`}>
      <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={vendor.coverImage}
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
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3 w-3" />
                <span>{vendor.city}</span>
              </div>
            </div>
            <Badge variant="secondary" className="capitalize">
              {vendor.category}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="font-semibold text-sm">{vendor.rating}</span>
              <span className="text-muted-foreground text-sm">({vendor.reviewCount})</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Starting at</div>
              <div className="font-bold text-primary">₹{vendor.startingPrice.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
