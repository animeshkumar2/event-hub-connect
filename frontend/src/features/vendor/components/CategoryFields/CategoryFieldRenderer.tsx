import React, { useMemo, useState } from 'react';
import { getCategoryConfig, FieldSchema } from './categoryFieldConfigs';
import {
  TextFieldInput,
  TextAreaFieldInput,
  NumberFieldInput,
  SelectFieldInput,
  MultiSelectFieldInput,
  CheckboxFieldInput,
  RadioFieldInput
} from './FieldTypes';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Plus, X, CheckCircle2, ChevronDown } from 'lucide-react';

interface CategoryFieldRendererProps {
  categoryId: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
  // Package details props (for inclusions/exclusions)
  listingType?: 'PACKAGE' | 'ITEM';
  // Inclusions
  includedItems?: string[];
  draftIncludedItem?: string;
  showIncludedItemInput?: boolean;
  onAddIncludedItem?: () => void;
  onSaveIncludedItem?: () => void;
  onCancelIncludedItem?: () => void;
  onRemoveIncludedItem?: (index: number) => void;
  onDraftIncludedItemChange?: (value: string) => void;
  // Exclusions
  excludedItems?: string[];
  draftExcludedItem?: string;
  showExcludedItemInput?: boolean;
  onAddExcludedItem?: () => void;
  onSaveExcludedItem?: () => void;
  onCancelExcludedItem?: () => void;
  onRemoveExcludedItem?: (index: number) => void;
  onDraftExcludedItemChange?: (value: string) => void;
  // Extra charges
  extraCharges?: Array<{ name: string; price: string }>;
  draftExtraCharge?: { name: string; price: string };
  showExtraChargeInput?: boolean;
  onAddExtraCharge?: () => void;
  onSaveExtraCharge?: () => void;
  onCancelExtraCharge?: () => void;
  onRemoveExtraCharge?: (index: number) => void;
  onDraftExtraChargeChange?: (value: { name: string; price: string }) => void;
}

export const CategoryFieldRenderer: React.FC<CategoryFieldRendererProps> = React.memo(({
  categoryId,
  values,
  onChange,
  errors = {},
  listingType,
  includedItems = [],
  draftIncludedItem = '',
  showIncludedItemInput = false,
  onAddIncludedItem,
  onSaveIncludedItem,
  onCancelIncludedItem,
  onRemoveIncludedItem,
  onDraftIncludedItemChange,
  excludedItems = [],
  draftExcludedItem = '',
  showExcludedItemInput = false,
  onAddExcludedItem,
  onSaveExcludedItem,
  onCancelExcludedItem,
  onRemoveExcludedItem,
  onDraftExcludedItemChange,
  extraCharges = [],
  draftExtraCharge = { name: '', price: '' },
  showExtraChargeInput = false,
  onAddExtraCharge,
  onSaveExtraCharge,
  onCancelExtraCharge,
  onRemoveExtraCharge,
  onDraftExtraChargeChange,
}) => {
  const config = useMemo(() => getCategoryConfig(categoryId), [categoryId]);
  const [packageDetailsOpen, setPackageDetailsOpen] = useState<string>('package-details');

  const handleFieldChange = React.useCallback((fieldName: string, value: any) => {
    console.log(`🟡 CategoryFieldRenderer handleFieldChange: ${fieldName}`, value);
    onChange((prev: Record<string, any>) => ({
      ...prev,
      [fieldName]: value
    }));
  }, [onChange]);

  // Check if field should be visible based on dependencies
  const isFieldVisible = (field: FieldSchema): boolean => {
    if (!field.dependsOn) return true;
    return !!values[field.dependsOn];
  };

  const renderField = (field: FieldSchema) => {
    if (!isFieldVisible(field)) return null;

    const commonProps = {
      field,
      value: values[field.name],
      onChange: handleFieldChange,
      error: errors[field.name]
    };

    switch (field.type) {
      case 'text':
        return <TextFieldInput {...commonProps} />;
      case 'textarea':
        return <TextAreaFieldInput {...commonProps} />;
      case 'number':
        return <NumberFieldInput {...commonProps} />;
      case 'select':
        return <SelectFieldInput {...commonProps} />;
      case 'multiselect':
        return <MultiSelectFieldInput {...commonProps} />;
      case 'checkbox':
        return <CheckboxFieldInput {...commonProps} />;
      case 'radio':
        return <RadioFieldInput {...commonProps} />;
      default:
        return null;
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Category-specific fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render fields with proper grouping */}
        {config.fields.map((field) => {
          // Skip fields that are dependents (they'll be rendered with their parent)
          if (field.dependsOn) return null;

          // Find dependent fields
          const dependents = config.fields.filter(f => f.dependsOn === field.name);
          
          // If field has dependents or is marked as fullWidth, take full width
          const shouldSpanFull = field.fullWidth || dependents.length > 0;
          
          return (
            <div key={field.name} className={shouldSpanFull ? 'md:col-span-2' : ''}>
              {/* Parent field */}
              {renderField(field)}
              
              {/* Dependent fields - show below parent when parent is checked/filled */}
              {dependents.length > 0 && values[field.name] && (
                <div className="mt-3 pl-6 border-l-2 border-primary/30 space-y-3">
                  {dependents.map((depField) => (
                    <div key={depField.name}>
                      {renderField(depField)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Info Section - For both packages and items */}
      {config.showPackageDetails && (
        <Accordion 
          type="single" 
          collapsible 
          value={packageDetailsOpen}
          onValueChange={setPackageDetailsOpen}
          className="mt-6"
        >
          <AccordionItem value="package-details" className="border border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">
                  💡 Anything else to add? (Optional)
                </div>
                {(includedItems.length + excludedItems.length + extraCharges.length) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {includedItems.length + excludedItems.length + extraCharges.length} added
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <p className="text-xs text-muted-foreground mb-3">
                {listingType === 'PACKAGE' 
                  ? 'Add any additional inclusions, exclusions, or extra charges that weren\'t covered above'
                  : 'Specify what\'s included with this item, any exclusions, or optional add-ons'}
              </p>

              {/* What's Included */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <Label className="text-sm font-medium text-foreground">What's Included</Label>
                  {includedItems.length > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                      {includedItems.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-3 border border-green-500/20 rounded-lg bg-green-500/5">
                  {includedItems.length === 0 && !showIncludedItemInput ? (
                    <p className="text-xs text-muted-foreground italic text-center py-1">No inclusions added</p>
                  ) : (
                    <>
                      {includedItems.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-background border border-green-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          <span className="flex-1 text-xs text-foreground">{item}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onRemoveIncludedItem?.(i)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {showIncludedItemInput && (
                        <div className="flex items-center gap-2 p-2 rounded bg-background border-2 border-primary">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <Input 
                            value={draftIncludedItem} 
                            onChange={(e) => onDraftIncludedItemChange?.(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && draftIncludedItem.trim()) {
                                e.preventDefault();
                                onSaveIncludedItem?.();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                onCancelIncludedItem?.();
                              }
                            }}
                            className="flex-1 bg-transparent border-0 h-7 text-xs focus-visible:ring-0 focus-visible:ring-offset-0" 
                            placeholder="e.g., Flower arrangements"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onSaveIncludedItem}
                            disabled={!draftIncludedItem.trim()}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onCancelIncludedItem}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showIncludedItemInput && (
                    <Button size="sm" variant="outline" onClick={onAddIncludedItem} className="w-full border-dashed h-8 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Inclusion
                    </Button>
                  )}
                </div>
              </div>

              {/* What's Not Included */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  <Label className="text-sm font-medium text-foreground">What's Not Included</Label>
                  {excludedItems.length > 0 && (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-500/30">
                      {excludedItems.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-3 border border-red-500/20 rounded-lg bg-red-500/5">
                  {excludedItems.length === 0 && !showExcludedItemInput ? (
                    <p className="text-xs text-muted-foreground italic text-center py-1">No exclusions added</p>
                  ) : (
                    <>
                      {excludedItems.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-background border border-red-500/30">
                          <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          <span className="flex-1 text-xs text-foreground">{item}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onRemoveExcludedItem?.(i)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {showExcludedItemInput && (
                        <div className="flex items-center gap-2 p-2 rounded bg-background border-2 border-primary">
                          <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <Input 
                            value={draftExcludedItem} 
                            onChange={(e) => onDraftExcludedItemChange?.(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && draftExcludedItem.trim()) {
                                e.preventDefault();
                                onSaveExcludedItem?.();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                onCancelExcludedItem?.();
                              }
                            }}
                            className="flex-1 bg-transparent border-0 h-7 text-xs focus-visible:ring-0 focus-visible:ring-offset-0" 
                            placeholder="e.g., Transportation"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onSaveExcludedItem}
                            disabled={!draftExcludedItem.trim()}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onCancelExcludedItem}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showExcludedItemInput && (
                    <Button size="sm" variant="outline" onClick={onAddExcludedItem} className="w-full border-dashed h-8 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Exclusion
                    </Button>
                  )}
                </div>
              </div>

              {/* Extra Charges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-orange-500" />
                  <Label className="text-sm font-medium text-foreground">Extra Charges</Label>
                  {extraCharges.length > 0 && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-500/30">
                      {extraCharges.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-3 border border-border rounded-lg bg-orange-500/5">
                  {extraCharges.length === 0 && !showExtraChargeInput ? (
                    <p className="text-xs text-muted-foreground italic text-center py-1">No extra charges added</p>
                  ) : (
                    <>
                      {extraCharges.map((charge: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-orange-500/30">
                          <span className="text-orange-500 font-bold text-xs">+</span>
                          <span className="flex-1 text-xs text-foreground">{charge.name}</span>
                          <span className="text-xs font-semibold text-foreground">₹{Number(charge.price).toLocaleString('en-IN')}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onRemoveExtraCharge?.(i)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {showExtraChargeInput && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-background border-2 border-primary">
                          <span className="text-muted-foreground font-bold text-xs">+</span>
                          <Input 
                            value={draftExtraCharge.name} 
                            onChange={(e) => onDraftExtraChargeChange?.({ ...draftExtraCharge, name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const priceInput = e.currentTarget.parentElement?.querySelector('input[type="number"]');
                                if (priceInput) (priceInput as HTMLInputElement).focus();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                onCancelExtraCharge?.();
                              }
                            }}
                            className="flex-1 bg-transparent border-0 h-7 text-xs focus-visible:ring-0 focus-visible:ring-offset-0" 
                            placeholder="e.g., Additional lighting"
                            autoFocus
                          />
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                            <span className="text-muted-foreground text-xs">₹</span>
                            <Input 
                              type="number"
                              value={draftExtraCharge.price} 
                              onChange={(e) => onDraftExtraChargeChange?.({ ...draftExtraCharge, price: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && draftExtraCharge.name.trim() && draftExtraCharge.price) {
                                  e.preventDefault();
                                  onSaveExtraCharge?.();
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  onCancelExtraCharge?.();
                                }
                              }}
                              className="w-20 bg-transparent border-0 h-6 p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 text-right font-medium" 
                              placeholder="5000"
                            />
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onSaveExtraCharge}
                            disabled={!draftExtraCharge.name.trim() || !draftExtraCharge.price}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={onCancelExtraCharge}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showExtraChargeInput && (
                    <Button size="sm" variant="outline" onClick={onAddExtraCharge} className="w-full border-dashed h-8 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Extra Charge
                    </Button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
});
