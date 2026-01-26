import { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { 
  CalendarIcon, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
    addOns?: Array<{
      id: string;
      title: string;
      price: number;
      description?: string;
    }>;
  };
  isVendorPreview?: boolean; // When vendor is viewing their own listing
}

export const BookingWidget = ({ listing, isVendorPreview = false }: BookingWidgetProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [quantity, setQuantity] = useState(listing.minimumQuantity || 1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const isPackage = listing.type === 'PACKAGE';
  const isItem = listing.type === 'ITEM';

  // Calculate totals
  const addOnsTotal = useMemo(() => {
    if (!listing.addOns) return 0;
    return listing.addOns
      .filter(addOn => selectedAddOns.has(addOn.id))
      .reduce((sum, addOn) => sum + addOn.price, 0);
  }, [listing.addOns, selectedAddOns]);

  const subtotal = listing.price * quantity;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + addOnsTotal + serviceFee;

  const handleAddOnToggle = (addOnId: string) => {
    const newSet = new Set(selectedAddOns);
    if (newSet.has(addOnId)) {
      newSet.delete(addOnId);
    } else {
      newSet.add(addOnId);
    }
    setSelectedAddOns(newSet);
  };

  const handleAddToCart = () => {
    // Require date selection before adding to cart
    if (!selectedDate) {
      toast({
        title: 'Date Required',
        description: 'Please select an event date before adding to cart',
        variant: 'destructive',
      });
      return;
    }

    const selectedAddOnsList = listing.addOns?.filter(addOn => 
      selectedAddOns.has(addOn.id)
    ) || [];

    addToCart({
      vendorId: listing.vendorId,
      vendorName: listing.vendorName,
      packageId: listing.id,
      packageName: listing.name,
      price: total,
      basePrice: listing.price,
      addOns: selectedAddOnsList.map(a => ({
        id: a.id,
        title: a.title,
        price: a.price,
      })),
      quantity,
      eventDate: format(selectedDate, 'yyyy-MM-dd'),
      date: selectedDate,
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

  // Vendor preview mode - show disabled state - Compact
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
            <p className="text-[10px] font-medium text-muted-foreground">
              Preview Mode
            </p>
            <p className="text-[9px] text-muted-foreground">
              Booking disabled for your own listing
            </p>
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
        {/* Date Selection - Required */}
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

        {/* Add-ons (for packages) - Compact */}
        {isPackage && listing.addOns && listing.addOns.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium">Add-ons</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {listing.addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-start gap-2 p-2 rounded border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={addOn.id}
                    checked={selectedAddOns.has(addOn.id)}
                    onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    className="mt-0.5 h-3 w-3"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={addOn.id}
                      className="text-[10px] font-medium cursor-pointer"
                    >
                      {addOn.title}
                    </Label>
                    {addOn.description && (
                      <p className="text-[9px] text-muted-foreground line-clamp-1">
                        {addOn.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-primary">
                    +₹{addOn.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Price Breakdown - Compact */}
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

        {/* Add to Cart Button - Compact */}
        <Button
          className="w-full bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-medium h-9 text-xs"
          onClick={handleAddToCart}
          disabled={!selectedDate}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>

        {/* Important Info - Compact */}
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

