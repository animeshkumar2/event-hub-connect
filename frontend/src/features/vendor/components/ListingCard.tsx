import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  Package,
  Box,
  MoreVertical,
  X,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Palette,
  UtensilsCrossed,
  MapPin,
  Sparkles,
  Music,
  Lightbulb,
  Tag
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';

interface ListingCardProps {
  listing: any;
  isDraft?: boolean;
  onEdit: (listing: any) => void;
  onDelete: (listing: any) => void;
  onToggleActive?: (listing: any) => void;
  isDeleting?: boolean;
  getCategoryName?: (categoryId: string) => string;
}

// Category icon mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('photo') || name.includes('video')) return Camera;
  if (name.includes('décor') || name.includes('decor')) return Palette;
  if (name.includes('catering') || name.includes('food')) return UtensilsCrossed;
  if (name.includes('venue')) return MapPin;
  if (name.includes('makeup') || name.includes('styling')) return Sparkles;
  if (name.includes('dj') || name.includes('entertainment')) return Music;
  if (name.includes('sound') || name.includes('light')) return Lightbulb;
  return Tag;
};

export function ListingCard({ 
  listing, 
  isDraft = false, 
  onEdit, 
  onDelete, 
  onToggleActive,
  isDeleting = false,
  getCategoryName 
}: ListingCardProps) {
  console.log('🔥 NEW ListingCard loaded - v2.0');
  
  if (isDraft) {
    return (
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 overflow-hidden hover:border-yellow-500/50 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-yellow-500/20">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-700 text-xs font-medium">Draft</Badge>
            </div>
            <Badge variant="outline" className="text-xs bg-background">
              {listing.type === 'PACKAGE' ? <Package className="h-3 w-3 mr-1" /> : <Box className="h-3 w-3 mr-1" />}
              {listing.type === 'PACKAGE' ? 'Package' : 'Item'}
            </Badge>
          </div>
          <h3 className="text-foreground font-semibold text-sm mb-2 line-clamp-1">{listing.name || 'Untitled'}</h3>
          <div className="space-y-1 mb-3">
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              {listing.price && listing.price > 0.01 ? (
                <><CheckCircle2 className="h-3 w-3 text-green-500" /> Price set</>
              ) : (
                <><X className="h-3 w-3 text-red-400" /> No price</>
              )}
            </p>
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              {listing.images?.length > 0 ? (
                <><CheckCircle2 className="h-3 w-3 text-green-500" /> {listing.images.length} image(s)</>
              ) : (
                <><X className="h-3 w-3 text-red-400" /> No images</>
              )}
            </p>
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              {listing.description ? (
                <><CheckCircle2 className="h-3 w-3 text-green-500" /> Has description</>
              ) : (
                <><X className="h-3 w-3 text-red-400" /> No description</>
              )}
            </p>
          </div>
          
          {/* Category & Event Types Section */}
          <div className="space-y-2 pt-3 pb-3 border-t border-yellow-500/20">
            {/* Category with icon */}
            <div className="flex items-center gap-1.5">
              {(() => {
                const categoryName = getCategoryName ? getCategoryName(listing.listingCategory?.id || listing.categoryId || '') : 'Other';
                const CategoryIcon = getCategoryIcon(categoryName);
                return (
                  <>
                    <CategoryIcon className="h-3.5 w-3.5 text-yellow-600/70" />
                    <span className="text-xs text-muted-foreground font-medium">{categoryName}</span>
                  </>
                );
              })()}
            </div>
            
            {/* Event Types as chips */}
            {listing.eventTypes && listing.eventTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {listing.eventTypes.slice(0, 3).map((eventType: any, index: number) => {
                  // Handle both object and string formats
                  const displayText = typeof eventType === 'string' 
                    ? eventType 
                    : (eventType?.displayName || eventType?.name || 'Event');
                  
                  return (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0 h-5 bg-yellow-500/15 text-yellow-700 border-yellow-500/30"
                    >
                      {displayText}
                    </Badge>
                  );
                })}
                {listing.eventTypes.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
                  >
                    +{listing.eventTypes.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"
              onClick={() => onEdit(listing)}
            >
              <Edit className="h-3 w-3 mr-1" /> Complete
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDelete(listing)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active listing card
  return (
    <Card 
      className="border-border overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-[16/10]">
        {listing.images && listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[0]}
              alt={listing.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            {listing.type === 'PACKAGE' ? (
              <Package className="h-12 w-12 text-primary/30" />
            ) : (
              <Box className="h-12 w-12 text-primary/30" />
            )}
          </div>
        )}
        {/* Status & Actions Row */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <Badge className={`text-xs font-medium ${listing.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {listing.isActive ? '● Live' : '○ Inactive'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 backdrop-blur-sm hover:bg-black/60">
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border" align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/vendor/listings/preview/${listing.id}`); }}>
                <Eye className="mr-2 h-4 w-4" /> Preview as Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(listing);
              }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {onToggleActive && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(listing); }}>
                  {listing.isActive ? '○ Deactivate' : '● Activate'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(listing); }} 
                className="text-red-600 focus:text-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Price Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-white text-foreground font-bold text-base px-3 py-1.5 shadow-lg">
            ₹{Number(listing.price).toLocaleString('en-IN')}
          </Badge>
        </div>
        {/* Image count indicator */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white text-xs backdrop-blur-sm">
              📷 {listing.images.length}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-foreground font-semibold text-base line-clamp-1 flex-1">{listing.name}</h3>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[2.5rem]">{listing.description || 'No description'}</p>
        
        {/* Redesigned Category & Event Types Section */}
        <div className="space-y-2 pt-3 border-t border-border/50">
          {/* Category with icon */}
          <div className="flex items-center gap-1.5">
            {(() => {
              const categoryName = getCategoryName ? getCategoryName(listing.listingCategory?.id || listing.categoryId || '') : 'Other';
              const CategoryIcon = getCategoryIcon(categoryName);
              return (
                <>
                  <CategoryIcon className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-xs text-muted-foreground font-medium">{categoryName}</span>
                </>
              );
            })()}
          </div>
          
          {/* Event Types as chips */}
          {listing.eventTypes && listing.eventTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.eventTypes.slice(0, 3).map((eventType: any, index: number) => {
                // Handle both object and string formats
                const displayText = typeof eventType === 'string' 
                  ? eventType 
                  : (eventType?.displayName || eventType?.name || 'Event');
                
                return (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20"
                  >
                    {displayText}
                  </Badge>
                );
              })}
              {listing.eventTypes.length > 3 && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
                >
                  +{listing.eventTypes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
