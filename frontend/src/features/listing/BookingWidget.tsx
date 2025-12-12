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

  // Vendor preview mode - show disabled state
  if (isVendorPreview) {
    return (
      <Card className="sticky top-24 border-2 shadow-xl opacity-75">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-black text-foreground">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                {isItem && listing.unit && (
                  <span className="text-sm text-muted-foreground">/{listing.unit}</span>
                )}
              </div>
              {isPackage && (
                <p className="text-xs text-muted-foreground">Fixed price package</p>
              )}
            </div>
            {listing.type === 'PACKAGE' && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Package
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Preview Mode
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Booking is disabled while viewing your own listing
            </p>
          </div>
          <Button disabled className="w-full" size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24 border-2 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-black text-foreground">
                ₹{listing.price.toLocaleString('en-IN')}
              </span>
              {isItem && listing.unit && (
                <span className="text-sm text-muted-foreground">/{listing.unit}</span>
              )}
            </div>
            {isPackage && (
              <p className="text-xs text-muted-foreground">Fixed price package</p>
            )}
          </div>
          {listing.type === 'PACKAGE' && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Package
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date Selection - Required */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Select Event Date <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground border-destructive/50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date (required)"}
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
          {!selectedDate && (
            <p className="text-xs text-destructive">Please select an event date to continue</p>
          )}
        </div>

        {/* Quantity Selector (for items) */}
        {isItem && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Quantity {listing.minimumQuantity && `(Min: ${listing.minimumQuantity})`}
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (listing.minimumQuantity || 1)}
              >
                <Minus className="h-4 w-4" />
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
                className="w-20 text-center"
                min={listing.minimumQuantity || 1}
                max={100}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Add-ons (for packages) */}
        {isPackage && listing.addOns && listing.addOns.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Add-ons (Optional)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {listing.addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={addOn.id}
                    checked={selectedAddOns.has(addOn.id)}
                    onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={addOn.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {addOn.title}
                    </Label>
                    {addOn.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {addOn.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    +₹{addOn.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isItem ? `${quantity} × ₹${listing.price.toLocaleString('en-IN')}` : 'Base price'}
            </span>
            <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {addOnsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Add-ons</span>
              <span className="font-medium">₹{addOnsTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span className="font-medium">₹{serviceFee.toLocaleString('en-IN')}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-white hover:from-primary-glow hover:to-primary font-semibold h-12"
            onClick={handleAddToCart}
            disabled={!selectedDate}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          {!selectedDate && (
            <p className="text-xs text-center text-muted-foreground">
              Select a date above to continue
            </p>
          )}
        </div>

        {/* Important Info */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
            <span>Free cancellation before event date</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-500" />
            <span>You won't be charged until booking is confirmed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

