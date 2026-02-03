import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Package, Box, LucideIcon, MapPin, X } from 'lucide-react';
import { LocationAutocomplete, LocationDTO } from '@/shared/components/LocationAutocomplete';

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

          {/* Venue Location - Only for venue category */}
          {formData.categoryId === 'venue' && (
            <div className="space-y-4 p-4 border border-primary/30 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Label className="text-foreground font-medium">Venue Location *</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Enter the exact location of this venue. This helps customers find venues near them.
              </p>
              
              <LocationAutocomplete
                value={formData.venueLatitude && formData.venueLongitude ? {
                  name: formData.venueAddress || '',
                  latitude: formData.venueLatitude,
                  longitude: formData.venueLongitude,
                } : null}
                onChange={(location: LocationDTO | null) => {
                  if (location) {
                    // Extract city from the location name (usually last part before country)
                    const parts = location.name.split(',').map(p => p.trim());
                    const city = parts.length > 1 ? parts[parts.length - 1] : parts[0];
                    
                    setFormData({
                      ...formData,
                      venueAddress: location.name,
                      venueCity: city,
                      venueLatitude: location.latitude,
                      venueLongitude: location.longitude,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      venueAddress: '',
                      venueCity: '',
                      venueLatitude: null,
                      venueLongitude: null,
                    });
                  }
                }}
                placeholder="Search venue address..."
                required
                bangaloreOnly={true}
              />
              
              {formData.venueAddress && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✓ Location set: {formData.venueAddress}
                  </p>
                </div>
              )}
            </div>
          )}

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
                
                {/* Custom Event Type Input - shown when "Other" is selected */}
                {(() => {
                  const otherEventType = availableEventTypes.find((et: any) => 
                    et.name === 'Other' || et.displayName === 'Other'
                  );
                  const isOtherSelected = otherEventType && formData.eventTypeIds.includes(otherEventType.id);
                  
                  if (!isOtherSelected) return null;
                  
                  // Parse custom event types - handle both array and legacy string format
                  const customTypes: string[] = (() => {
                    const val = formData.customEventTypeName;
                    if (!val) return [];
                    if (Array.isArray(val)) return val;
                    // Try parsing as JSON array
                    try {
                      const parsed = JSON.parse(val);
                      if (Array.isArray(parsed)) return parsed;
                    } catch {}
                    // Legacy: single string or comma-separated
                    return val.split(',').map((s: string) => s.trim()).filter(Boolean);
                  })();
                  
                  return (
                    <div className="mt-3 p-3 border border-amber-200 rounded-lg bg-amber-50/50">
                      <Label className="text-sm font-medium text-amber-800">
                        What type of events? *
                      </Label>
                      <p className="text-xs text-amber-600 mb-2">
                        Add the event types you're targeting (press Enter to add)
                      </p>
                      
                      {/* Display existing custom event types as tags */}
                      {customTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {customTypes.map((type, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800"
                            >
                              <span className="text-xs font-medium">{type}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newTypes = customTypes.filter((_, i) => i !== idx);
                                  setFormData({ 
                                    ...formData, 
                                    customEventTypeName: newTypes.length > 0 ? newTypes : '' 
                                  });
                                }}
                                className="p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Input for adding new custom event types */}
                      <Input
                        placeholder="Type event name and press Enter..."
                        className="bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && !customTypes.includes(value)) {
                              const newTypes = [...customTypes, value];
                              setFormData({ 
                                ...formData, 
                                customEventTypeName: newTypes 
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <p className="text-[10px] text-amber-500 mt-1">
                        💡 Common examples: Haldi, Mehendi, Sangeet, Reception, House Warming, Puja, Retirement Party, Farewell, Graduation
                      </p>
                    </div>
                  );
                })()}
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
