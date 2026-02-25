import { useState, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { 
  CalendarIcon, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface AddOnItem {
  id: string;
  title: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  maxQuantity?: number;
}

interface BookingWidgetProps {
  listing: {
    id: string;
    name: string;
    price: number;
    type: 'PACKAGE' | 'ITEM';
    unit?: string;
    minimumQuantity?: number;
    vendorId: string;
    vendorName: string;
    addOns?: AddOnItem[];
  };
  isVendorPreview?: boolean;
}

// Horizontal scroll helper for add-on tabs and cards
function ScrollableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };
  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/90 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={scrollRef} className={cn("flex overflow-x-auto scrollbar-hide gap-2 px-1", className)}>
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/90 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// Add-on card component (partyone-style)
function AddOnCard({
  addOn,
  quantity,
  onQuantityChange,
}: {
  addOn: AddOnItem;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}) {
  const maxQty = addOn.maxQuantity || 10;
  return (
    <div className="flex-shrink-0 w-[160px] rounded-lg border bg-card overflow-hidden">
      {addOn.imageUrl ? (
        <div className="relative aspect-square bg-muted">
          <img
            src={addOn.imageUrl}
            alt={addOn.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-1 right-1 text-white/80">
            <Eye className="h-3.5 w-3.5" />
          </div>
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
      )}
      <div className="p-2 space-y-1.5">
        <p className="text-[11px] font-medium text-center leading-tight line-clamp-2">{addOn.title}</p>
        {addOn.description && (
          <p className="text-[9px] text-muted-foreground line-clamp-1 text-center">{addOn.description}</p>
        )}
        {quantity > 0 && (
          <div className="text-center">
            <span className="text-[9px] text-green-600 font-medium">✓ Added</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-primary">₹{addOn.price.toLocaleString('en-IN')}</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors text-xs"
              aria-label={`Decrease ${addOn.title} quantity`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="text"
              value={quantity || ''}
              readOnly
              className="w-7 h-6 text-center text-[11px] font-mono border rounded bg-background"
              aria-label={`${addOn.title} quantity`}
            />
            <button
              onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
              className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors text-xs disabled:opacity-40"
              aria-label={`Increase ${addOn.title} quantity`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabbed add-on section (partyone-style)
function AddOnsSection({
  addOns,
  quantities,
  onQuantityChange,
}: {
  addOns: AddOnItem[];
  quantities: Record<string, number>;
  onQuantityChange: (id: string, qty: number) => void;
}) {
  // Group add-ons by category
  const categories = useMemo(() => {
    const grouped: Record<string, AddOnItem[]> = {};
    addOns.forEach(a => {
      const cat = a.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(a);
    });
    return Object.entries(grouped);
  }, [addOns]);

  const [activeTab, setActiveTab] = useState(categories[0]?.[0] || '');

  if (categories.length === 0) return null;

  const activeAddOns = categories.find(([cat]) => cat === activeTab)?.[1] || [];

  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-medium">Add-Ons</Label>
      {/* Category tabs - horizontal scroll */}
      <ScrollableRow className="pb-1">
        {categories.map(([cat]) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap",
              activeTab === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {cat}
          </button>
        ))}
      </ScrollableRow>
      {/* Add-on cards - horizontal scroll */}
      <ScrollableRow className="py-1">
        {activeAddOns.map(addOn => (
          <AddOnCard
            key={addOn.id}
            addOn={addOn}
            quantity={quantities[addOn.id] || 0}
            onQuantityChange={(qty) => onQuantityChange(addOn.id, qty)}
          />
        ))}
      </ScrollableRow>
    </div>
  );
}

export const BookingWidget = ({ listing, isVendorPreview = false }: BookingWidgetProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [quantity, setQuantity] = useState(listing.minimumQuantity || 1);
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});

  const isPackage = listing.type === 'PACKAGE';
  const isItem = listing.type === 'ITEM';

  const handleAddOnQuantityChange = useCallback((id: string, qty: number) => {
    setAddOnQuantities(prev => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }, []);

  // Calculate totals
  const addOnsTotal = useMemo(() => {
    if (!listing.addOns) return 0;
    return listing.addOns.reduce((sum, addOn) => {
      const qty = addOnQuantities[addOn.id] || 0;
      return sum + addOn.price * qty;
    }, 0);
  }, [listing.addOns, addOnQuantities]);

  const subtotal = listing.price * quantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + addOnsTotal + serviceFee;

  const handleAddToCart = () => {
    if (!selectedDate) {
      toast({
        title: 'Date Required',
        description: 'Please select an event date before adding to cart',
        variant: 'destructive',
      });
      return;
    }

    const selectedAddOnsList = listing.addOns?.filter(a => (addOnQuantities[a.id] || 0) > 0) || [];

    addToCart({
      vendorId: listing.vendorId,
      vendorName: listing.vendorName,
      packageId: listing.id,
      packageName: listing.name,
      price: total,
      basePrice: listing.price,
      addOns: selectedAddOnsList.map(a => ({
        id: a.id,
        packageId: listing.id,
        title: a.title,
        price: a.price * (addOnQuantities[a.id] || 1),
      })),
      quantity,
      eventDate: format(selectedDate, 'yyyy-MM-dd'),
    });

    toast({
      title: 'Added to Cart!',
      description: `${listing.name} has been added to your cart`,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const minQty = listing.minimumQuantity || 1;
    if (newQuantity >= minQty && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  // Vendor preview mode
  if (isVendorPreview) {
    return (
      <Card className="sticky top-16 border shadow-lg opacity-75">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xl font-bold text-foreground">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                {isItem && listing.unit && (
                  <span className="text-[10px] text-muted-foreground">/{listing.unit}</span>
                )}
              </div>
              {isPackage && (
                <p className="text-[10px] text-muted-foreground">Fixed price package</p>
              )}
            </div>
            {listing.type === 'PACKAGE' && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1">
                Package
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div className="bg-muted/50 border border-border rounded-lg p-3 text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground">Preview Mode</p>
            <p className="text-[9px] text-muted-foreground">Booking disabled for your own listing</p>
          </div>
          <Button disabled className="w-full h-8 text-xs">
            <ShoppingCart className="mr-1.5 h-3 w-3" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-lg">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xl font-bold text-foreground">
                ₹{listing.price.toLocaleString('en-IN')}
              </span>
              {isItem && listing.unit && (
                <span className="text-[10px] text-muted-foreground">/{listing.unit}</span>
              )}
            </div>
            {isPackage && (
              <p className="text-[10px] text-muted-foreground">Fixed price package</p>
            )}
          </div>
          {listing.type === 'PACKAGE' && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 px-1">
              Package
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3 pt-0">
        {/* Date Selection */}
        <div className="space-y-1">
          <Label className="text-[10px] font-medium">
            Event Date <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs",
                  !selectedDate && "text-muted-foreground border-destructive/50"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Quantity Selector (for items) */}
        {isItem && (
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">
              Quantity {listing.minimumQuantity && `(Min: ${listing.minimumQuantity})`}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (listing.minimumQuantity || 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || listing.minimumQuantity || 1;
                  if (val >= (listing.minimumQuantity || 1) && val <= 100) {
                    setQuantity(val);
                  }
                }}
                className="w-14 h-7 text-xs text-center"
                min={listing.minimumQuantity || 1}
                max={100}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 100}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Add-ons (partyone-style tabbed cards with quantity) */}
        {listing.addOns && listing.addOns.length > 0 && (
          <AddOnsSection
            addOns={listing.addOns}
            quantities={addOnQuantities}
            onQuantityChange={handleAddOnQuantityChange}
          />
        )}

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isItem ? `${quantity} × ₹${listing.price.toLocaleString('en-IN')}` : 'Base'}
            </span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {addOnsTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Add-ons</span>
              <span>₹{addOnsTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>₹{serviceFee.toLocaleString('en-IN')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-xs">
            <span>Total</span>
            <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-medium h-9 text-xs"
          onClick={handleAddToCart}
          disabled={!selectedDate}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>

        {/* Important Info */}
        <div className="pt-2 border-t space-y-1">
          <div className="flex items-start gap-1.5 text-[9px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Free cancellation before event</span>
          </div>
          <div className="flex items-start gap-1.5 text-[9px] text-muted-foreground">
            <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>Pay after booking confirmed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
