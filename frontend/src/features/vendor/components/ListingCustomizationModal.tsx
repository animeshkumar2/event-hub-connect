import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { IndianRupee, Plus, Minus, Package, Loader2 } from 'lucide-react';

interface ListingData {
  id: string;
  name: string;
  price: number;
  type?: 'package' | 'item' | 'PACKAGE' | 'ITEM';
  unit?: string;
  minimumQuantity?: number;
  addOns?: Array<{
    id: string;
    title: string;
    price: number;
    description?: string;
  }>;
}

interface ListingCustomizationModalProps {
  listing: ListingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomize: (customization: {
    quantity?: number;
    selectedAddOns?: string[];
    customizedPrice: number;
    customization: string; // JSON string
  }) => void;
  loading?: boolean;
}

export const ListingCustomizationModal = ({
  listing,
  open,
  onOpenChange,
  onCustomize,
  loading = false,
}: ListingCustomizationModalProps) => {
  if (!listing) return null;

  const listingType = listing.type?.toLowerCase() || '';
  const isPackage = listingType === 'package' || listing.type === 'PACKAGE';
  const isItem = listingType === 'item' || listing.type === 'ITEM' || (!isPackage && listingType !== 'package');

  const [quantity, setQuantity] = useState(listing.minimumQuantity || 1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  // Calculate customized price
  const customizedPrice = useMemo(() => {
    if (!listing) return 0;
    
    let basePrice = listing.price;
    
    // For items, multiply by quantity
    if (isItem) {
      basePrice = listing.price * quantity;
    }
    
    // Add add-ons for packages
    if (isPackage && listing.addOns) {
      const addOnsTotal = listing.addOns
        .filter(addOn => selectedAddOns.has(addOn.id))
        .reduce((sum, addOn) => sum + addOn.price, 0);
      basePrice = basePrice + addOnsTotal;
    }
    
    return basePrice;
  }, [listing, quantity, selectedAddOns, isItem, isPackage]);

  const addOnsTotal = useMemo(() => {
    if (!listing?.addOns) return 0;
    return listing.addOns
      .filter(addOn => selectedAddOns.has(addOn.id))
      .reduce((sum, addOn) => sum + addOn.price, 0);
  }, [listing?.addOns, selectedAddOns]);

  const handleQuantityChange = (newQuantity: number) => {
    const minQty = listing?.minimumQuantity || 1;
    if (newQuantity >= minQty && newQuantity <= 10000) {
      setQuantity(newQuantity);
    }
  };

  const handleAddOnToggle = (addOnId: string) => {
    const newSet = new Set(selectedAddOns);
    if (newSet.has(addOnId)) {
      newSet.delete(addOnId);
    } else {
      newSet.add(addOnId);
    }
    setSelectedAddOns(newSet);
  };

  // Customization is optional - allow proceeding even without changes
  const hasCustomization = (isItem && quantity !== (listing.minimumQuantity || 1)) || 
                           (isPackage && selectedAddOns.size > 0);

  const handleContinue = () => {
    if (!listing) return;

    // Always proceed, even if no customization was made
    // If no customization, use original price
    const finalPrice = customizedPrice > 0 ? customizedPrice : listing.price;

    const customization = {
      quantity: isItem ? quantity : undefined,
      selectedAddOns: isPackage && selectedAddOns.size > 0 ? Array.from(selectedAddOns) : undefined,
      customizedPrice: finalPrice,
      customization: JSON.stringify({
        quantity: isItem ? quantity : undefined,
        addOns: isPackage && selectedAddOns.size > 0 ? Array.from(selectedAddOns) : undefined,
        unit: listing.unit,
        originalQuantity: listing.minimumQuantity || 1,
        hasCustomization,
      }),
    };

    console.log('🎯 [ListingCustomizationModal] Proceeding with customization', {
      customization,
      hasCustomization,
      finalPrice,
      listingPrice: listing.price,
    });

    onCustomize(customization);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 !grid grid-rows-[auto_1fr_auto]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Customize Listing
          </DialogTitle>
          <DialogDescription>
            Customize the listing to match your requirements, then make an offer
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto overflow-x-hidden px-6 py-4 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-6">
          {/* Listing Info */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold text-lg mb-1">{listing.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Original Price</span>
              <span className="text-lg font-bold text-primary flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {listing.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quantity Customization (for Items) */}
          {isItem && listing.unit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quantity" className="text-base font-semibold">
                  Quantity ({listing.unit})
                </Label>
                {listing.minimumQuantity && (
                  <span className="text-xs text-muted-foreground">
                    Min: {listing.minimumQuantity}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= (listing.minimumQuantity || 1)}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || listing.minimumQuantity || 1;
                    handleQuantityChange(val);
                  }}
                  className="text-center text-lg font-semibold h-10 max-w-32"
                  min={listing.minimumQuantity || 1}
                  max={10000}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10000}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {quantity !== (listing.minimumQuantity || 1) && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Original: {listing.minimumQuantity || 1} {listing.unit}
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      Customized: {quantity} {listing.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add-ons (for Packages) */}
          {isPackage && listing.addOns && listing.addOns.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Add-ons (Optional)</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                    <span className="text-sm font-semibold text-primary flex items-center gap-0.5">
                      +<IndianRupee className="h-3 w-3" />
                      {addOn.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Price Summary</Label>
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="font-medium">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
              </div>
              {isItem && quantity !== (listing.minimumQuantity || 1) && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {listing.minimumQuantity || 1} → {quantity} {listing.unit}
                  </span>
                  <span className="font-medium">
                    ₹{(listing.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {isPackage && addOnsTotal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">
                    +₹{addOnsTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Customized Price</span>
                <span className="text-xl font-bold text-primary flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {customizedPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t bg-background flex-shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Offer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

