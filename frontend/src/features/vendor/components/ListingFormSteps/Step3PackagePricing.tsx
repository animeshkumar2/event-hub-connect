import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Package, TrendingDown, TrendingUp, Minus, IndianRupee } from 'lucide-react';

interface Step3PackagePricingProps {
  formData: any;
  setFormData: (data: any) => void;
  items: any[];
}

export function ListingFormStep3PackagePricing({
  formData,
  setFormData,
  items,
}: Step3PackagePricingProps) {
  // Get selected items
  const selectedItems = items.filter((item: any) => 
    formData.includedItemIds.includes(item.id)
  );

  // Calculate base price
  const basePrice = selectedItems.reduce((sum: number, item: any) => 
    sum + Number(item.price || 0), 0
  );

  // Calculate discount/markup
  const packagePrice = Number(formData.price || 0);
  const difference = packagePrice - basePrice;
  const percentage = basePrice > 0 ? ((difference / basePrice) * 100) : 0;
  
  const isDiscount = difference < 0;
  const isMarkup = difference > 0;
  const isEqual = difference === 0;

  return (
    <div className="space-y-6">
      {/* Bundled Items Summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <Label className="text-foreground font-semibold text-base sm:text-lg">Bundled Items</Label>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-background">
          {selectedItems.map((item: any, index: number) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="text-muted-foreground font-mono text-xs sm:text-sm flex-shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</p>
                  {item.unit && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.unit}</p>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground flex-shrink-0">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
          
          {/* Base Price Total */}
          <div className="flex items-center justify-between p-3 bg-muted/30 border-t-2 border-border">
            <p className="text-sm font-bold text-foreground">Base Price Total</p>
            <p className="text-base sm:text-lg font-bold text-foreground">
              ₹{basePrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Package Price Input */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold text-base sm:text-lg flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Your Package Price *
        </Label>
        <p className="text-xs text-muted-foreground">
          Set your final package price. You can offer a discount or add a markup.
        </p>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base sm:text-lg">
            ₹
          </div>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="bg-background border-2 border-primary/30 text-foreground text-base sm:text-lg font-semibold pl-8 h-12 sm:h-14"
            placeholder="Enter package price"
          />
        </div>

        {/* Price Comparison */}
        {packagePrice > 0 && (
          <div className="space-y-2">
            {/* Discount Badge */}
            {isDiscount && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <TrendingDown className="h-4 w-4 text-green-600 flex-shrink-0" />
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    {Math.abs(percentage).toFixed(1)}% Discount
                  </span>
                  <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    Save ₹{Math.abs(difference).toLocaleString('en-IN')}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Markup Badge */}
            {isMarkup && (
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <TrendingUp className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {percentage.toFixed(1)}% Markup
                  </span>
                  <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                    +₹{difference.toLocaleString('en-IN')}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Equal Price */}
            {isEqual && (
              <Alert className="border-gray-500/50 bg-gray-500/10">
                <Minus className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <AlertDescription>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    No Discount or Markup
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Price Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-3 border border-border rounded-lg bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground">Base Price</p>
                <p className="text-sm font-semibold text-foreground">
                  ₹{basePrice.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Package Price</p>
                <p className="text-sm font-semibold text-primary">
                  ₹{packagePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
