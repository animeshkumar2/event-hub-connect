import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';

// Extra charge from extraChargesJson
interface ExtraCharge {
  name: string;
  price: number;
}

// Generic listing/package type that works with real data
interface ListingData {
  id: string;
  name: string;
  price: number;
  type?: string;
  unit?: string;
  minimumQuantity?: number;
  extraChargesJson?: string;
  extraCharges?: string[];
  addOns?: { id: string; title: string; description?: string; price: number }[];
  vendorId?: string;
}

interface PackageCustomizationProps {
  pkg: ListingData;
  onCustomize: (selectedExtras: ExtraCharge[], quantity: number, totalPrice: number) => void;
  onAddToCart?: () => void;
}

export const PackageCustomization = ({
  pkg,
  onCustomize,
  onAddToCart,
}: PackageCustomizationProps) => {
  const [selectedExtras, setSelectedExtras] = useState<ExtraCharge[]>([]);
  const [quantity, setQuantity] = useState(pkg.minimumQuantity || 1);

  // Parse extra charges from JSON or legacy text format
  const extraCharges = useMemo(() => {
    const charges: ExtraCharge[] = [];
    
    // Try parsing extraChargesJson first (preferred format)
    if (pkg.extraChargesJson) {
      try {
        const parsed = JSON.parse(pkg.extraChargesJson);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item.name && typeof item.price === 'number') {
              charges.push({ name: item.name, price: item.price });
            }
          });
        }
      } catch (e) {
        console.warn('Failed to parse extraChargesJson:', e);
      }
    }
    
    // Fallback to legacy extraCharges (text array) - try to parse prices
    if (charges.length === 0 && pkg.extraCharges && Array.isArray(pkg.extraCharges)) {
      pkg.extraCharges.forEach((charge, index) => {
        // Try to extract price from text like "Additional lighting: ₹10000" or "Extra setup - Rs 5000"
        const priceMatch = charge.match(/[₹Rs\.]*\s*(\d+(?:,\d+)*)/i);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
        const name = charge.replace(/[₹Rs\.]*\s*\d+(?:,\d+)*/gi, '').replace(/[-:]/g, '').trim() || charge;
        charges.push({ name, price });
      });
    }

    // Also include addOns if they exist
    if (pkg.addOns && Array.isArray(pkg.addOns)) {
      pkg.addOns.forEach(addon => {
        charges.push({ name: addon.title, price: addon.price });
      });
    }
    
    return charges;
  }, [pkg.extraChargesJson, pkg.extraCharges, pkg.addOns]);

  const toggleExtra = (extra: ExtraCharge) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.name === extra.name);
      if (exists) {
        return prev.filter(e => e.name !== extra.name);
      }
      return [...prev, extra];
    });
  };

  const isItem = pkg.type === 'item' || pkg.type === 'ITEM';
  const minQty = pkg.minimumQuantity || 1;

  const calculateTotal = () => {
    const basePrice = pkg.price * quantity;
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return basePrice + extrasTotal;
  };

  const handleApply = () => {
    onCustomize(selectedExtras, quantity, calculateTotal());
  };

  const hasCustomizations = extraCharges.length > 0 || isItem;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Customize Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Package/Item */}
        <div>
          <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            {isItem ? 'Service Details' : 'Base Package'}
          </h4>
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{pkg.name}</span>
                {pkg.unit && (
                  <span className="text-sm text-muted-foreground ml-2">({pkg.unit})</span>
                )}
              </div>
              <span className="font-bold text-lg">₹{pkg.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quantity Selector for Items */}
        {isItem && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Quantity
            </h4>
            <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/30">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                disabled={quantity <= minQty}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold">{quantity}</span>
                {pkg.unit && (
                  <span className="text-sm text-muted-foreground ml-2">{pkg.unit}</span>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="text-right min-w-[100px]">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="font-bold">₹{(pkg.price * quantity).toLocaleString()}</div>
              </div>
            </div>
            {minQty > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                Minimum order: {minQty} {pkg.unit || 'units'}
              </p>
            )}
          </div>
        )}

        {/* Extra Charges / Add-ons */}
        {extraCharges.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              Optional Add-ons
            </h4>
            <div className="space-y-2">
              {extraCharges.map((extra, index) => (
                <div
                  key={`${extra.name}-${index}`}
                  className={`flex items-center gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                    selectedExtras.some(e => e.name === extra.name)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleExtra(extra)}
                >
                  <Checkbox
                    id={`extra-${index}`}
                    checked={selectedExtras.some(e => e.name === extra.name)}
                    onCheckedChange={() => toggleExtra(extra)}
                  />
                  <Label htmlFor={`extra-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{extra.name}</span>
                  </Label>
                  <Badge variant={selectedExtras.some(e => e.name === extra.name) ? 'default' : 'outline'}>
                    +₹{extra.price.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Customizations Available */}
        {!hasCustomizations && (
          <div className="text-center py-6 text-muted-foreground">
            <p>This {isItem ? 'service' : 'package'} is ready to book as-is.</p>
            <p className="text-sm mt-1">No additional options available.</p>
          </div>
        )}

        {/* Price Summary */}
        <div className="border-t pt-4 space-y-2">
          {isItem && quantity > 1 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Base ({quantity} × ₹{pkg.price.toLocaleString()})</span>
              <span>₹{(pkg.price * quantity).toLocaleString()}</span>
            </div>
          )}
          {selectedExtras.map((extra, i) => (
            <div key={i} className="flex justify-between text-sm text-muted-foreground">
              <span>{extra.name}</span>
              <span>+₹{extra.price.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-lg font-bold pt-2">
            <span>Total</span>
            <span className="text-primary text-xl">₹{calculateTotal().toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleApply} className="w-full" size="lg">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          {onAddToCart && (
            <Button variant="outline" onClick={onAddToCart} className="w-full">
              Skip Customization
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
