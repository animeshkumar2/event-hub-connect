import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Package, Box, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Step2BundleItemsProps {
  formData: any;
  items: any[];
  toggleLinkedItem: (itemId: string) => void;
  getCategoryName: (categoryId: string) => string;
}

export function ListingFormStep2BundleItems({
  formData,
  items,
  toggleLinkedItem,
  getCategoryName,
}: Step2BundleItemsProps) {
  const selectedCount = formData.includedItemIds.length;
  const hasMinimumItems = items.length >= 2;
  const hasAnyItems = items.length > 0;
  
  // Get unique categories from selected items
  const selectedCategories = new Set<string>();
  items.forEach((item: any) => {
    if (formData.includedItemIds.includes(item.id)) {
      const categoryId = item.listingCategory?.id || item.categoryId || '';
      if (categoryId) {
        selectedCategories.add(getCategoryName(categoryId));
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Prerequisite Check */}
      {!hasMinimumItems && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm text-orange-700 dark:text-orange-300">
            You need at least 2 services to create a package. Please create some services first!
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Label className="text-foreground font-semibold text-base sm:text-lg">Bundle Your Services *</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Select 2 or more services to create a package
              </p>
            </div>
          </div>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1 self-start sm:self-auto">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        {/* Selected Categories */}
        {selectedCategories.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Categories:</span>
            {Array.from(selectedCategories).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {selectedCount < 2 && hasMinimumItems && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
            Please select at least 2 services to create a package
          </AlertDescription>
        </Alert>
      )}

      {selectedCount >= 2 && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700 dark:text-green-300">
            Great! You've selected {selectedCount} services for this package
          </AlertDescription>
        </Alert>
      )}

      {/* Items Grid */}
      {hasAnyItems ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {items.map((item: any) => {
              const isSelected = formData.includedItemIds.includes(item.id);
              const categoryName = getCategoryName(item.listingCategory?.id || item.categoryId || '');
              
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-all hover:bg-muted/50 border-b border-border last:border-b-0 ${
                    isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => toggleLinkedItem(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary flex-shrink-0 cursor-pointer"
                  />
                  
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                      <Box className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryName}
                      </Badge>
                      {item.unit && (
                        <span className="text-xs text-muted-foreground">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm sm:text-base font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 text-center">
          <Box className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No items available</p>
          <p className="text-xs text-muted-foreground">
            Create at least 2 items before creating a package
          </p>
        </div>
      )}
    </div>
  );
}
