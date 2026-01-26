import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, X, CheckCircle2 } from 'lucide-react';
import { CategoryFieldRenderer } from '../CategoryFields';
import { DeliveryTimeInput } from '../DeliveryTimeInput';
import * as React from 'react';

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
  listingType: 'PACKAGE' | 'ITEM';
  categorySpecificData: Record<string, any>;
  setCategorySpecificData: (data: Record<string, any>) => void;
  coreCategories: any[];
  eventTypesData: any[];
  eventTypeCategories: any[];
  getAllDbCategoryIds: (coreCategoryId: string) => string[];
  getCategoryName: (categoryId: string) => string;
  // Highlights
  draftHighlight: string;
  setDraftHighlight: (value: string) => void;
  showHighlightInput: boolean;
  setShowHighlightInput: (value: boolean) => void;
  saveHighlight: () => void;
  cancelHighlight: () => void;
  removeHighlight: (index: number) => void;
  // Inclusions
  draftIncludedItem: string;
  setDraftIncludedItem: (value: string) => void;
  showIncludedItemInput: boolean;
  setShowIncludedItemInput: (value: boolean) => void;
  saveIncludedItem: () => void;
  cancelIncludedItem: () => void;
  removeIncludedItem: (index: number) => void;
  // Exclusions
  draftExcludedItem: string;
  setDraftExcludedItem: (value: string) => void;
  showExcludedItemInput: boolean;
  setShowExcludedItemInput: (value: boolean) => void;
  saveExcludedItem: () => void;
  cancelExcludedItem: () => void;
  removeExcludedItem: (index: number) => void;
  // Extra charges
  draftExtraCharge: { name: string; price: string };
  setDraftExtraCharge: (value: { name: string; price: string }) => void;
  showExtraChargeInput: boolean;
  setShowExtraChargeInput: (value: boolean) => void;
  saveExtraCharge: () => void;
  cancelExtraCharge: () => void;
  removeExtraCharge: (index: number) => void;
}

export const ListingFormStep2 = React.memo(function ListingFormStep2(props: Step2Props) {
  const {
    formData,
    setFormData,
    listingType,
    categorySpecificData,
    setCategorySpecificData,
    coreCategories,
    eventTypesData,
    eventTypeCategories,
    getAllDbCategoryIds,
    getCategoryName,
  } = props;

  return (
    <div className="space-y-4">
      {/* Show generic price input ONLY for "Other" category */}
      {formData.categoryId === 'other' && (
        <div className="space-y-2">
          <Label className="text-foreground">Price (₹) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="bg-background border-border text-foreground"
            placeholder="25000"
          />
          <p className="text-xs text-muted-foreground">
            Base price for this listing
          </p>
        </div>
      )}

      {/* Category-Specific Fields */}
      {formData.categoryId && formData.categoryId !== 'other' && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Category-Specific Details
              </span>
            </div>
          </div>

          <div className="space-y-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h3 className="font-semibold text-foreground">
                {getCategoryName(formData.categoryId)} Details
              </h3>
            </div>
            
            <CategoryFieldRenderer
              categoryId={formData.categoryId}
              values={categorySpecificData}
              onChange={setCategorySpecificData}
              listingType={listingType}
              // Inclusions
              includedItems={formData.includedItemsText}
              draftIncludedItem={props.draftIncludedItem}
              showIncludedItemInput={props.showIncludedItemInput}
              onAddIncludedItem={() => props.setShowIncludedItemInput(true)}
              onSaveIncludedItem={props.saveIncludedItem}
              onCancelIncludedItem={props.cancelIncludedItem}
              onRemoveIncludedItem={props.removeIncludedItem}
              onDraftIncludedItemChange={props.setDraftIncludedItem}
              // Exclusions
              excludedItems={formData.excludedItemsText}
              draftExcludedItem={props.draftExcludedItem}
              showExcludedItemInput={props.showExcludedItemInput}
              onAddExcludedItem={() => props.setShowExcludedItemInput(true)}
              onSaveExcludedItem={props.saveExcludedItem}
              onCancelExcludedItem={props.cancelExcludedItem}
              onRemoveExcludedItem={props.removeExcludedItem}
              onDraftExcludedItemChange={props.setDraftExcludedItem}
              // Extra charges
              extraCharges={formData.extraChargesDetailed}
              draftExtraCharge={props.draftExtraCharge}
              showExtraChargeInput={props.showExtraChargeInput}
              onAddExtraCharge={() => props.setShowExtraChargeInput(true)}
              onSaveExtraCharge={props.saveExtraCharge}
              onCancelExtraCharge={props.cancelExtraCharge}
              onRemoveExtraCharge={props.removeExtraCharge}
              onDraftExtraChargeChange={props.setDraftExtraCharge}
            />
          </div>
        </>
      )}

      {/* Listing Highlights */}
      <div className="space-y-2">
        <Label className="text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Listing Highlights
          {formData.highlights.length > 0 && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
              {formData.highlights.length}
            </Badge>
          )}
        </Label>
        <p className="text-xs text-muted-foreground">
          Key features shown at the top of your listing
        </p>
        <div className="space-y-2 p-3 border border-green-500/20 rounded-lg bg-green-500/5">
          {formData.highlights.length === 0 && !props.showHighlightInput ? (
            <p className="text-sm text-muted-foreground italic text-center py-2">No highlights added yet</p>
          ) : (
            <>
              {formData.highlights.map((highlight: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-background border border-green-500/30">
                  <span className="text-green-500 font-bold">•</span>
                  <span className="flex-1 text-sm text-foreground">{highlight}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => props.removeHighlight(i)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {props.showHighlightInput && (
                <div className="flex items-center gap-2 p-2 rounded bg-background border-2 border-primary">
                  <span className="text-muted-foreground font-bold">•</span>
                  <Input 
                    value={props.draftHighlight} 
                    onChange={(e) => props.setDraftHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && props.draftHighlight.trim()) {
                        e.preventDefault();
                        props.saveHighlight();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        props.cancelHighlight();
                      }
                    }}
                    className="flex-1 bg-transparent border-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0" 
                    placeholder="e.g., Mandap decoration"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={props.saveHighlight}
                    disabled={!props.draftHighlight.trim()}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={props.cancelHighlight}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
          {!props.showHighlightInput && (
            <Button size="sm" variant="outline" onClick={() => props.setShowHighlightInput(true)} className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Add Highlight
            </Button>
          )}
        </div>
      </div>

      {/* Delivery Time */}
      <DeliveryTimeInput
        value={formData.deliveryTime}
        onChange={(value) => setFormData({ ...formData, deliveryTime: value })}
        categoryId={formData.categoryId}
      />

      {/* Minimum Order - Only for Caterers */}
      {listingType === 'ITEM' && formData.categoryId === 'caterer' && (
        <div className="space-y-3 p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <div>
              <Label className="text-foreground font-medium">Minimum Order Requirement</Label>
              <p className="text-xs text-muted-foreground">
                Set the minimum number of plates customers must order (optional)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                value={formData.minimumQuantity || ''}
                onChange={(e) => setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 0 })}
                className="bg-background border-border text-foreground"
                placeholder="e.g., 50"
                min={0}
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">plates minimum</span>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            💡 Leave empty if you don't have a minimum order requirement
          </p>
        </div>
      )}
    </div>
  );
});
