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
  onChange: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  errors?: Record<string, string>;
  // Package details props (for inclusions/exclusions)
  listingType?: 'PACKAGE' | 'ITEM';
  // Hide the package details section (Included/Excluded/Extra Charges)
  hidePackageDetails?: boolean;
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

export const CategoryFieldRenderer: React.FC<CategoryFieldRendererProps> = ({
  categoryId,
  values,
  onChange,
  errors = {},
  listingType,
  hidePackageDetails = false,
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

  // Debug: Log values received
  console.log('🎨 CategoryFieldRenderer values:', { categoryId, values, config: config?.categoryId });

  const handleFieldChange = React.useCallback((fieldName: string, value: any) => {
    onChange((prev: Record<string, any>) => ({
      ...prev,
      [fieldName]: value
    }));
  }, [onChange]);

  // Check if field should be visible based on dependencies
  const isFieldVisible = (field: FieldSchema): boolean => {
    if (!field.dependsOn) return true;
    
    const dependsOnValue = values[field.dependsOn];
    
    // If dependsOnValue is specified, check for specific value match
    if (field.dependsOnValue) {
      if (Array.isArray(field.dependsOnValue)) {
        return field.dependsOnValue.includes(dependsOnValue);
      }
      return dependsOnValue === field.dependsOnValue;
    }
    
    // Otherwise, just check for truthy value
    return !!dependsOnValue;
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
    <div className="space-y-3">
      {/* Category-specific fields - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {config.fields.map((field) => {
          if (field.dependsOn) return null;
          const dependents = config.fields.filter(f => f.dependsOn === field.name);
          const shouldSpanFull = field.fullWidth || dependents.length > 0;
          
          return (
            <div key={field.name} className={shouldSpanFull ? 'md:col-span-2' : ''}>
              {renderField(field)}
              {dependents.length > 0 && values[field.name] && (
                <div className="mt-2 pl-4 border-l-2 border-primary/30 space-y-2">
                  {dependents.map((depField) => (
                    <div key={depField.name}>{renderField(depField)}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Info Section - Compact */}
      {config.showPackageDetails && !hidePackageDetails && (
        <Accordion 
          type="single" 
          collapsible 
          value={packageDetailsOpen}
          onValueChange={setPackageDetailsOpen}
          className="mt-3"
        >
          <AccordionItem value="package-details" className="border border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-medium text-muted-foreground">
                  💡 Anything else? (Optional)
                </div>
                {(includedItems.length + excludedItems.length + extraCharges.length) > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-4 px-1">
                    {includedItems.length + excludedItems.length + extraCharges.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 space-y-3">
              {/* What's Included - Compact */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <Label className="text-[10px] font-medium">Included</Label>
                  {includedItems.length > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 text-green-600 border-green-500/30">{includedItems.length}</Badge>}
                </div>
                <div className="space-y-1 p-2 border border-green-500/20 rounded bg-green-500/5">
                  {includedItems.length === 0 && !showIncludedItemInput ? (
                    <p className="text-[9px] text-muted-foreground italic text-center">None added</p>
                  ) : (
                    <>
                      {includedItems.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 p-1 rounded bg-background border border-green-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                          <span className="flex-1 text-[9px]">{item}</span>
                          <Button size="sm" variant="ghost" onClick={() => onRemoveIncludedItem?.(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      ))}
                      {showIncludedItemInput && (
                        <div className="flex items-center gap-1 p-1 rounded bg-background border-2 border-primary">
                          <Input value={draftIncludedItem} onChange={(e) => onDraftIncludedItemChange?.(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && draftIncludedItem.trim()) { e.preventDefault(); onSaveIncludedItem?.(); } else if (e.key === 'Escape') { e.preventDefault(); onCancelIncludedItem?.(); } }} className="flex-1 bg-transparent border-0 h-5 text-[9px] focus-visible:ring-0" placeholder="Add..." autoFocus />
                          <Button size="sm" variant="ghost" onClick={onSaveIncludedItem} disabled={!draftIncludedItem.trim()} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={onCancelIncludedItem} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showIncludedItemInput && <Button size="sm" variant="outline" onClick={onAddIncludedItem} className="w-full border-dashed h-5 text-[9px]"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                </div>
              </div>

              {/* What's Not Included - Compact */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <X className="h-3 w-3 text-red-500" />
                  <Label className="text-[10px] font-medium">Not Included</Label>
                  {excludedItems.length > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 text-red-600 border-red-500/30">{excludedItems.length}</Badge>}
                </div>
                <div className="space-y-1 p-2 border border-red-500/20 rounded bg-red-500/5">
                  {excludedItems.length === 0 && !showExcludedItemInput ? (
                    <p className="text-[9px] text-muted-foreground italic text-center">None added</p>
                  ) : (
                    <>
                      {excludedItems.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 p-1 rounded bg-background border border-red-500/30">
                          <X className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />
                          <span className="flex-1 text-[9px]">{item}</span>
                          <Button size="sm" variant="ghost" onClick={() => onRemoveExcludedItem?.(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      ))}
                      {showExcludedItemInput && (
                        <div className="flex items-center gap-1 p-1 rounded bg-background border-2 border-primary">
                          <Input value={draftExcludedItem} onChange={(e) => onDraftExcludedItemChange?.(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && draftExcludedItem.trim()) { e.preventDefault(); onSaveExcludedItem?.(); } else if (e.key === 'Escape') { e.preventDefault(); onCancelExcludedItem?.(); } }} className="flex-1 bg-transparent border-0 h-5 text-[9px] focus-visible:ring-0" placeholder="Add..." autoFocus />
                          <Button size="sm" variant="ghost" onClick={onSaveExcludedItem} disabled={!draftExcludedItem.trim()} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={onCancelExcludedItem} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showExcludedItemInput && <Button size="sm" variant="outline" onClick={onAddExcludedItem} className="w-full border-dashed h-5 text-[9px]"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                </div>
              </div>

              {/* Extra Charges - Compact */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Plus className="h-3 w-3 text-orange-500" />
                  <Label className="text-[10px] font-medium">Extra Charges</Label>
                  {extraCharges.length > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 text-orange-600 border-orange-500/30">{extraCharges.length}</Badge>}
                </div>
                <div className="space-y-1 p-2 border border-border rounded bg-orange-500/5">
                  {extraCharges.length === 0 && !showExtraChargeInput ? (
                    <p className="text-[9px] text-muted-foreground italic text-center">None added</p>
                  ) : (
                    <>
                      {extraCharges.map((charge: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 p-1 rounded bg-background border border-orange-500/30">
                          <span className="text-orange-500 font-bold text-[9px]">+</span>
                          <span className="flex-1 text-[9px]">{charge.name}</span>
                          <span className="text-[9px] font-medium">₹{Number(charge.price).toLocaleString('en-IN')}</span>
                          <Button size="sm" variant="ghost" onClick={() => onRemoveExtraCharge?.(i)} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      ))}
                      {showExtraChargeInput && (
                        <div className="flex items-center gap-1 p-1 rounded bg-background border-2 border-primary">
                          <Input value={draftExtraCharge.name} onChange={(e) => onDraftExtraChargeChange?.({ ...draftExtraCharge, name: e.target.value })} className="flex-1 bg-transparent border-0 h-5 text-[9px] focus-visible:ring-0" placeholder="Name" autoFocus />
                          <div className="flex items-center bg-muted rounded px-1"><span className="text-[9px]">₹</span><Input type="number" value={draftExtraCharge.price} onChange={(e) => onDraftExtraChargeChange?.({ ...draftExtraCharge, price: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter' && draftExtraCharge.name.trim() && draftExtraCharge.price) { e.preventDefault(); onSaveExtraCharge?.(); } }} className="w-12 bg-transparent border-0 h-5 p-0 text-[9px] focus-visible:ring-0 text-right" /></div>
                          <Button size="sm" variant="ghost" onClick={onSaveExtraCharge} disabled={!draftExtraCharge.name.trim() || !draftExtraCharge.price} className="h-4 w-4 p-0 text-green-600"><CheckCircle2 className="h-2.5 w-2.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={onCancelExtraCharge} className="h-4 w-4 p-0 text-red-500"><X className="h-2.5 w-2.5" /></Button>
                        </div>
                      )}
                    </>
                  )}
                  {!showExtraChargeInput && <Button size="sm" variant="outline" onClick={onAddExtraCharge} className="w-full border-dashed h-5 text-[9px]"><Plus className="h-2 w-2 mr-0.5" />Add</Button>}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};
