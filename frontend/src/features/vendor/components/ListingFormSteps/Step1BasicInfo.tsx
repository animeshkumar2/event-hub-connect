import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Package, Box, LucideIcon } from 'lucide-react';

interface CoreCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
  listingType: 'PACKAGE' | 'ITEM';
  setListingType: (type: 'PACKAGE' | 'ITEM') => void;
  availableEventTypes: any[];
  items: any[];
  toggleLinkedItem: (itemId: string) => void;
  getCategoryName: (categoryId: string) => string;
  coreCategories: CoreCategory[];
  eventTypesData: any[];
  eventTypeCategories: any[];
  getAllDbCategoryIds: (coreCategoryId: string) => string[];
  editingListing?: any; // Add this prop
}

export function ListingFormStep1({
  formData,
  setFormData,
  listingType,
  setListingType,
  availableEventTypes,
  items,
  toggleLinkedItem,
  getCategoryName,
  coreCategories,
  eventTypesData,
  eventTypeCategories,
  getAllDbCategoryIds,
  editingListing, // Add this
}: Step1Props) {
  const isEditing = !!editingListing;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-foreground">Listing Type *</Label>
        <Select 
          value={listingType} 
          onValueChange={(value: 'PACKAGE' | 'ITEM') => setListingType(value)}
          disabled={true}
        >
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PACKAGE">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Package</span>
              </div>
            </SelectItem>
            <SelectItem value="ITEM">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                <span>Service</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {listingType === 'PACKAGE' 
            ? 'A package bundles 2 or more services together with custom pricing' 
            : 'A service is a single offering like Photography, Catering, etc.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-background border-border text-foreground"
          placeholder={listingType === 'PACKAGE' ? 'e.g., Complete Wedding Package' : 'e.g., Wedding Photography Package'}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-background border-border text-foreground min-h-[120px]"
          placeholder="Describe your listing in detail..."
        />
        <p className="text-xs text-muted-foreground">
          Tell customers what makes this listing special
        </p>
      </div>

      {/* Category Selection - ONLY FOR ITEMS */}
      {listingType === 'ITEM' && (
        <>
          <div className="space-y-2">
            <Label className="text-foreground">Category *</Label>
            <Select
              value={formData.categoryId}
              disabled={isEditing} // Disable when editing
              onValueChange={(value) => {
                // When category changes, filter event types and clear invalid selections
                let newEventTypeIds = formData.eventTypeIds;
                
                if (value && value !== 'other' && eventTypeCategories.length > 0) {
                  // Get valid event type IDs for this category
                  const validEventTypeIds = new Set<number>();
                  const dbCategoryIds = getAllDbCategoryIds(value);
                  
                  eventTypeCategories.forEach((etc: any) => {
                    const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
                    const etcCategoryId = etc.categoryId || etc.category?.id;
                    if (dbCategoryIds.includes(etcCategoryId) && etcEventTypeId) {
                      validEventTypeIds.add(etcEventTypeId);
                    }
                  });
                  
                  // Add Corporate to DJ
                  if (value === 'dj-entertainment') {
                    const corporateEventType = eventTypesData?.find((et: any) => 
                      et.name === 'Corporate' || et.name === 'Corporate Event' || et.displayName === 'Corporate Event'
                    );
                    if (corporateEventType) {
                      validEventTypeIds.add(corporateEventType.id);
                    }
                  }
                  
                  // Remove invalid event types
                  newEventTypeIds = formData.eventTypeIds.filter((id: number) => validEventTypeIds.has(id));
                }
                
                setFormData({ 
                  ...formData, 
                  categoryId: value,
                  eventTypeIds: newEventTypeIds,
                  customCategoryName: value !== 'other' ? '' : formData.customCategoryName
                });
              }}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {coreCategories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${cat.iconColor}`} />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {isEditing ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Category cannot be changed when editing. To change category, create a new listing.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select your category - this determines available event types and pricing fields
              </p>
            )}
            
            {/* Custom Category Name Input */}
            {formData.categoryId === 'other' && (
              <div className="mt-2">
                <Input
                  value={formData.customCategoryName}
                  onChange={(e) => setFormData({ ...formData, customCategoryName: e.target.value })}
                  placeholder="e.g., Balloon Artist, Event Planner"
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please specify your category name
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Event Types *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select which event types this listing is suitable for
            </p>
            {!formData.categoryId ? (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  ⚠️ Please select a category first to see available event types
                </p>
              </div>
            ) : availableEventTypes && Array.isArray(availableEventTypes) && availableEventTypes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background max-h-60 overflow-y-auto">
                  {availableEventTypes.map((et: any) => {
                    const isChecked = formData.eventTypeIds.includes(et.id);
                    const isLastSelected = isChecked && formData.eventTypeIds.length === 1;
                    return (
                      <div key={et.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isLastSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, eventTypeIds: [...formData.eventTypeIds, et.id] });
                            } else {
                              // Prevent unchecking the last event type
                              if (formData.eventTypeIds.length > 1) {
                                setFormData({ ...formData, eventTypeIds: formData.eventTypeIds.filter((id: number) => id !== et.id) });
                              }
                            }
                          }}
                          className={`w-4 h-4 rounded border-border text-primary focus:ring-primary ${isLastSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
                          title={isLastSelected ? 'Select another event type first to deselect this one' : ''}
                        />
                        <Label className="text-sm font-normal text-foreground cursor-pointer">
                          {et.name || et.displayName}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {formData.eventTypeIds.length === 1 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    💡 At least one event type must be selected. Select another first to change your selection.
                  </p>
                )}
                {formData.eventTypeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.eventTypeIds.map((id: number) => {
                      const et = availableEventTypes.find((e: any) => e.id === id);
                      return et ? (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {et.name || et.displayName}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  No event types available for this category
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* For packages, show info about categories being auto-derived */}
      {listingType === 'PACKAGE' && (
        <div className="p-4 border border-primary/30 rounded-lg bg-primary/5">
          <p className="text-sm text-foreground">
            <strong>📦 Package Categories:</strong> Categories will be automatically derived from the items you bundle in the next step.
          </p>
        </div>
      )}
    </div>
  );
}
