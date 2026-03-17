import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { 
  Loader2, ArrowRight, ArrowLeft, Camera, Utensils, Building2, 
  Palette, Sparkles, Music, Speaker, MoreHorizontal, PenLine,
  CheckCircle2, Plus, LayoutTemplate, Lock, X
} from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { 
  CATEGORY_TEMPLATES, 
  ListingTemplate,
} from '@/shared/constants/listingTemplates';
import { getAllowedCategoriesForVendor, getVendorPermissionInfo } from '@/shared/constants/vendorCategoryPermissions';

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartBlank: () => void;
  onRefetch: () => void;
  vendorCategoryId?: string;
  eventTypesData?: any[]; // Add event types data
  eventTypeCategories?: any[]; // Event type to category mappings
}

type Step = 'choice' | 'category' | 'templates' | 'eventTypes';

// Category icons mapping
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'photography-videography':
    case 'photographer':
      return Camera;
    case 'caterer':
      return Utensils;
    case 'venue':
      return Building2;
    case 'decorator':
      return Palette;
    case 'mua':
      return Sparkles;
    case 'dj-entertainment':
    case 'dj':
      return Music;
    case 'sound-lights':
      return Speaker;
    case 'event-planner':
      return MoreHorizontal;
    case 'artists':
      return Music;
    default:
      return MoreHorizontal;
  }
};

// All available categories for template selection
const TEMPLATE_CATEGORIES = [
  { id: 'photography-videography', name: 'Photography & Videography', icon: Camera, color: 'bg-blue-500' },
  { id: 'decorator', name: 'Decoration', icon: Palette, color: 'bg-pink-500' },
  { id: 'caterer', name: 'Catering', icon: Utensils, color: 'bg-orange-500' },
  { id: 'venue', name: 'Venue', icon: Building2, color: 'bg-purple-500' },
  { id: 'mua', name: 'Makeup & Styling', icon: Sparkles, color: 'bg-rose-500' },
  { id: 'dj-entertainment', name: 'DJ & Entertainment', icon: Music, color: 'bg-indigo-500' },
  { id: 'sound-lights', name: 'Sound & Lights', icon: Speaker, color: 'bg-amber-500' },
  { id: 'artists', name: 'Artists & Performers', icon: Music, color: 'bg-teal-500' },
];

export function TemplateSelectionModal({
  open,
  onOpenChange,
  onStartBlank,
  onRefetch,
  vendorCategoryId: propVendorCategoryId,
  eventTypesData = [],
  eventTypeCategories = []
}: TemplateSelectionModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choice');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ListingTemplate | null>(null);
  const [selectedEventTypeIds, setSelectedEventTypeIds] = useState<number[]>([]);
  const [customEventTypeNames, setCustomEventTypeNames] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  
  // Get vendor's allowed categories based on their profession
  const vendorCategoryId = propVendorCategoryId || '';
  const allowedCategories = useMemo(() => {
    if (!vendorCategoryId) return [];
    return getAllowedCategoriesForVendor(vendorCategoryId);
  }, [vendorCategoryId]);
  
  const vendorPermissionInfo = useMemo(() => {
    if (!vendorCategoryId) return null;
    return getVendorPermissionInfo(vendorCategoryId);
  }, [vendorCategoryId]);
  
  // Get templates for selected category
  const categoryTemplates = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORY_TEMPLATES[selectedCategory];
  }, [selectedCategory]);

  // Filter categories that have templates AND are allowed for this vendor
  const availableCategories = useMemo(() => {
    return TEMPLATE_CATEGORIES.filter(cat => {
      const hasTemplates = CATEGORY_TEMPLATES[cat.id];
      // Map template category IDs to permission category IDs
      const permissionCatId = cat.id === 'photography-videography' ? 'photo-video' : cat.id;
      const isAllowed = allowedCategories.length === 0 || allowedCategories.includes(permissionCatId);
      return hasTemplates && isAllowed;
    });
  }, [allowedCategories]);
  
  // Categories that exist but vendor can't access
  const lockedCategories = useMemo(() => {
    if (allowedCategories.length === 0) return [];
    return TEMPLATE_CATEGORIES.filter(cat => {
      const hasTemplates = CATEGORY_TEMPLATES[cat.id];
      const permissionCatId = cat.id === 'photography-videography' ? 'photo-video' : cat.id;
      const isAllowed = allowedCategories.includes(permissionCatId);
      return hasTemplates && !isAllowed;
    });
  }, [allowedCategories]);
  
  // Core category mapping for filtering event types
  const CORE_CATEGORY_MAP: Record<string, string[]> = {
    'photography-videography': ['photo-video'],
    'decorator': ['decorator'],
    'caterer': ['caterer'],
    'venue': ['venue'],
    'mua': ['mua'],
    'dj-entertainment': ['dj-entertainment'],
    'sound-lights': ['sound-lights'],
    'artists': ['artists'],
    'other': ['other'],
  };
  
  // Filter event types based on selected template's category
  const filteredEventTypes = useMemo(() => {
    if (!eventTypesData || !Array.isArray(eventTypesData)) return [];
    if (!selectedTemplate) return eventTypesData;
    
    // Get the template's category (dbCategoryId or categoryId)
    const templateCategoryId = selectedTemplate.dbCategoryId || selectedTemplate.categoryId;
    if (!templateCategoryId) return eventTypesData;
    
    // Map template category to core category for lookup
    let coreCategoryId = templateCategoryId;
    // Handle mapping from dbCategoryId to core category
    if (templateCategoryId === 'photo-video') {
      coreCategoryId = 'photography-videography';
    }
    
    // If no event type categories mapping, show all
    if (!eventTypeCategories || eventTypeCategories.length === 0) return eventTypesData;
    
    // Get all DB category IDs for the template's category
    const dbCategoryIds = CORE_CATEGORY_MAP[coreCategoryId] || [templateCategoryId];
    
    // Get valid event type IDs for this category
    const validEventTypeIds = new Set<number>();
    
    dbCategoryIds.forEach(dbCategoryId => {
      eventTypeCategories.forEach((etc: any) => {
        const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
        const etcCategoryId = etc.categoryId || etc.category?.id;
        
        if (etcCategoryId === dbCategoryId && etcEventTypeId) {
          validEventTypeIds.add(etcEventTypeId);
        }
      });
    });
    
    // Special case: Add Corporate to DJ & Entertainment category
    if (coreCategoryId === 'dj-entertainment') {
      const corporateEventType = eventTypesData.find((et: any) => 
        et.name === 'Corporate' || et.name === 'Corporate Event' || et.displayName === 'Corporate Event'
      );
      if (corporateEventType) {
        validEventTypeIds.add(corporateEventType.id);
      }
    }
    
    // Always include "Other" event type
    const otherEventType = eventTypesData.find((et: any) => 
      et.name === 'Other' || et.displayName === 'Other'
    );
    if (otherEventType) {
      validEventTypeIds.add(otherEventType.id);
    }
    
    // Filter event types to only include valid ones
    const filtered = eventTypesData.filter((et: any) => 
      validEventTypeIds.has(et.id)
    );
    
    // If no event types found, show all (fallback for categories without mappings)
    return filtered.length > 0 ? filtered : eventTypesData;
  }, [eventTypesData, eventTypeCategories, selectedTemplate]);
  
  const formatPrice = (price: number, unit?: string) => {
    if (price === 0) return 'Set your price';
    const formatted = price.toLocaleString('en-IN');
    return unit ? `₹${formatted}/${unit}` : `₹${formatted}`;
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep('choice');
      setSelectedCategory(null);
      setSelectedTemplate(null);
      setSelectedEventTypeIds([]);
      setCustomEventTypeNames([]);
      setIsCreating(null);
    }
    onOpenChange(open);
  };

  // Select template and go to event type selection
  const handleSelectTemplate = (template: ListingTemplate) => {
    setSelectedTemplate(template);
    
    // Filter template's event types to only include valid ones for this category
    const templateCategoryId = template.dbCategoryId || template.categoryId;
    let coreCategoryId = templateCategoryId;
    if (templateCategoryId === 'photo-video') {
      coreCategoryId = 'photography-videography';
    }
    
    // Get valid event type IDs for this category
    const validEventTypeIds = new Set<number>();
    const dbCategoryIds = CORE_CATEGORY_MAP[coreCategoryId] || [templateCategoryId];
    
    if (eventTypeCategories && eventTypeCategories.length > 0) {
      dbCategoryIds.forEach(dbCategoryId => {
        eventTypeCategories.forEach((etc: any) => {
          const etcEventTypeId = etc.eventTypeId || etc.eventType?.id;
          const etcCategoryId = etc.categoryId || etc.category?.id;
          
          if (etcCategoryId === dbCategoryId && etcEventTypeId) {
            validEventTypeIds.add(etcEventTypeId);
          }
        });
      });
    }
    
    // Filter template's event types to only include valid ones
    const templateEventTypes = template.eventTypeIds || [];
    const filteredTemplateEventTypes = validEventTypeIds.size > 0
      ? templateEventTypes.filter(id => validEventTypeIds.has(id))
      : templateEventTypes;
    
    // If no valid event types remain, use the first valid one or keep template's selection
    setSelectedEventTypeIds(filteredTemplateEventTypes.length > 0 ? filteredTemplateEventTypes : templateEventTypes);
    setCustomEventTypeNames([]);
    setStep('eventTypes');
  };

  // Toggle event type selection
  const toggleEventType = (id: number) => {
    setSelectedEventTypeIds(prev => {
      if (prev.includes(id)) {
        // Don't allow removing the last event type
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  // Create draft from template with selected event types
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    if (selectedEventTypeIds.length === 0) {
      toast.error('Please select at least one event type');
      return;
    }
    
    // Check if "Other" is selected by name (use filteredEventTypes for consistency)
    const otherEventType = filteredEventTypes.find((et: any) => 
      et.name === 'Other' || et.displayName === 'Other'
    );
    const isOtherSelected = otherEventType && selectedEventTypeIds.includes(otherEventType.id);
    
    // If "Other" is selected but no custom names provided
    if (isOtherSelected && customEventTypeNames.length === 0) {
      toast.error('Please add at least one custom event type');
      return;
    }
    
    setIsCreating(selectedTemplate.id);
    
    try {
      const categoryPrice = selectedTemplate.categorySpecificData?.price 
        || selectedTemplate.categorySpecificData?.pricePerPlate
        || selectedTemplate.categorySpecificData?.pricePerPlateVeg 
        || selectedTemplate.categorySpecificData?.bridalPrice 
        || selectedTemplate.displayPrice 
        || 1; // Minimum placeholder price for draft - vendor must set real price before publishing
      
      const payload = {
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        price: categoryPrice,
        categoryId: selectedTemplate.dbCategoryId,
        eventTypeIds: selectedEventTypeIds,
        customEventTypeName: isOtherSelected && customEventTypeNames.length > 0 
          ? JSON.stringify(customEventTypeNames) 
          : undefined,
        images: [],
        highlights: selectedTemplate.highlights,
        includedItemsText: selectedTemplate.includedItemsText,
        excludedItemsText: selectedTemplate.excludedItemsText,
        deliveryTime: selectedTemplate.deliveryTime,
        unit: selectedTemplate.priceUnit || '',
        minimumQuantity: selectedTemplate.categorySpecificData?.minGuests || 1,
        categorySpecificData: selectedTemplate.categorySpecificData 
          ? JSON.stringify(selectedTemplate.categorySpecificData) 
          : undefined,
        serviceMode: 'BOTH',
        isActive: false,
        isDraft: true,
        customNotes: `__TEMPLATE__:${selectedTemplate.id}`,
      };

      const response = await vendorApi.createItem(payload);
      
      if (response.success && response.data?.id) {
        toast.success('Template loaded! Add your photos and customize.');
        handleOpenChange(false);
        onRefetch();
        navigate(`/vendor/listings/preview/${response.data.id}?edit=true`);
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsCreating(null);
    }
  };

  const handleStartBlank = () => {
    onStartBlank();
    handleOpenChange(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('templates');
  };

  const handleBack = () => {
    if (step === 'eventTypes') {
      setStep('templates');
      setSelectedTemplate(null);
      setSelectedEventTypeIds([]);
      setCustomEventTypeNames([]);
    } else if (step === 'templates') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'category') {
      setStep('choice');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg !p-0 !gap-0 overflow-hidden !max-h-[90dvh] sm:!max-h-[85vh]" aria-describedby={undefined}>
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {step === 'choice' ? 'Create New Service' : step === 'category' ? 'Select Category' : `${categoryTemplates?.categoryName || 'Select'} Templates`}
        </DialogTitle>
        
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-0">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Step 1: Choice - Template or Scratch */}
        {step === 'choice' && (
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Create New Service</h2>
              <p className="text-sm text-muted-foreground mt-1">How would you like to start?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep('category')}
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-primary/20 hover:border-primary/50 bg-gradient-to-r from-primary/5 to-violet-500/5 hover:from-primary/10 hover:to-violet-500/10 transition-all group text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors flex-shrink-0">
                    <LayoutTemplate className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm sm:text-base">Use a Template</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Recommended</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Start with pre-filled details, just add your photos
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </div>
              </button>

              <button
                onClick={handleStartBlank}
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-border hover:border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 transition-all group text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted group-hover:bg-muted-foreground/10 flex items-center justify-center transition-colors flex-shrink-0">
                    <PenLine className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-sm sm:text-base">Start from Scratch</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Create your own unique listing from blank
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 'category' && (
          <div className="flex flex-col max-h-[85vh] max-h-[85dvh]">
            {/* Header with back button */}
            <div className="p-3 sm:p-4 border-b flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-base">Select Category</h2>
                <p className="text-xs text-muted-foreground">
                  {vendorPermissionInfo?.isAllAccess 
                    ? 'You have access to all categories' 
                    : `Based on your profession: ${vendorPermissionInfo?.vendorCategoryName || 'Vendor'}`
                  }
                </p>
              </div>
            </div>

            {/* Category List - Vertical scrollable with visual hint */}
            <div className="relative flex-1 min-h-0">
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
              
              <div className="p-3 sm:p-4 space-y-2 overflow-y-auto pb-8 h-full">
                {/* Available Categories */}
                {availableCategories.map((category, index) => {
                  const Icon = category.icon;
                  const templates = CATEGORY_TEMPLATES[category.id];
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSelectCategory(category.id)}
                      className="w-full p-2.5 sm:p-3 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left flex items-center gap-3 active:scale-[0.98] min-h-[48px]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn(
                        "w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                        category.color
                      )}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground">{category.name}</h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          {templates?.items.length || 0} templates
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    </button>
                  );
                })}
                
                {/* Locked Categories Section */}
                {lockedCategories.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-4 pb-2">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Not available for your profession</span>
                    </div>
                    {lockedCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div
                          key={category.id}
                          className="w-full p-3 rounded-xl border-2 border-dashed border-muted bg-muted/20 flex items-center gap-4 opacity-50 cursor-not-allowed"
                        >
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-muted-foreground">{category.name}</h3>
                            <p className="text-xs text-muted-foreground/70">
                              Upgrade to Event Planner for access
                            </p>
                          </div>
                          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              
              {/* Scroll indicator */}
              {(availableCategories.length + lockedCategories.length) > 5 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm">
                  <svg className="h-3 w-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>Scroll for more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 'templates' && categoryTemplates && (
          <div className="flex flex-col max-h-[85vh] max-h-[85dvh]">
            {/* Header with back button */}
            <div className="p-3 sm:p-4 border-b flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.color || 'bg-primary'
                )}>
                  {(() => {
                    const Icon = getCategoryIcon(selectedCategory || '');
                    return <Icon className="h-4 w-4 text-white" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-semibold text-base">{categoryTemplates.categoryName}</h2>
                  <p className="text-xs text-muted-foreground">Choose a template to start</p>
                </div>
              </div>
            </div>

            {/* Templates List */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 min-h-0">
              {categoryTemplates.items.map((template, index) => {
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={isCreating !== null}
                    className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50 group active:scale-[0.98] min-h-[48px]"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                        {isCreating === template.id ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                        ) : (
                          <span className="text-base sm:text-lg font-bold text-muted-foreground group-hover:text-primary">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-semibold text-sm text-foreground leading-tight">{template.name}</span>
                          <span className={`font-bold text-xs sm:text-sm flex-shrink-0 ${template.displayPrice === 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {formatPrice(template.displayPrice, template.priceUnit)}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2">
                          {template.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                          {template.highlights.slice(0, 3).map((highlight, i) => (
                            <span key={i} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {highlight}
                            </span>
                          ))}
                          {template.highlights.length > 3 && (
                            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              +{template.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t bg-muted/30 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <p className="text-xs text-center text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                Select a template, then choose event types
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Event Type Selection */}
        {step === 'eventTypes' && selectedTemplate && (
          <div className="flex flex-col max-h-[85vh] max-h-[85dvh]">
            {/* Header with back button */}
            <div className="p-3 sm:p-4 border-b flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-base">Select Event Types</h2>
                <p className="text-xs text-muted-foreground">Which events is this service for?</p>
              </div>
            </div>

            {/* Selected Template Summary */}
            <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2">
              <div className="p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{selectedTemplate.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">{selectedTemplate.shortDescription}</p>
              </div>
            </div>

            {/* Event Types Grid */}
            <div className="p-3 sm:p-4 space-y-3 overflow-y-auto max-h-[calc(85vh-220px)] max-h-[calc(85dvh-220px)]">
              <Label className="text-sm font-medium">Event Types *</Label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {filteredEventTypes.map((et: any) => {
                  const isSelected = selectedEventTypeIds.includes(et.id);
                  const isLastSelected = isSelected && selectedEventTypeIds.length === 1;
                  const eventIcons: Record<string, string> = {
                    'Wedding': '💒', 'Birthday': '🎂', 'Anniversary': '💝', 
                    'Corporate': '🏢', 'Corporate Event': '🏢',
                    'Engagement': '💍', 'Baby Shower': '👶', 
                    'Nightlife': '🌙', 'Nightlife & Parties': '🌙',
                    'Concert': '🎵', 'Concerts & Live Shows': '🎵',
                    'Other': '✨'
                  };
                  const icon = eventIcons[et.name] || eventIcons[et.displayName] || '📅';
                  return (
                    <button
                      key={et.id}
                      onClick={() => toggleEventType(et.id)}
                      disabled={isLastSelected}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 text-left transition-all min-h-[40px]",
                        isSelected
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-background border-border hover:border-primary/30 text-muted-foreground hover:text-foreground",
                        isLastSelected && "opacity-60 cursor-not-allowed"
                      )}
                      title={isLastSelected ? 'At least one event type required' : ''}
                    >
                      <span className="text-base sm:text-lg flex-shrink-0">{icon}</span>
                      <span className="text-xs sm:text-sm font-medium truncate">{et.displayName || et.name}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary ml-auto flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Event Type Input - shown when "Other" is selected */}
              {(() => {
                const otherEventType = filteredEventTypes.find((et: any) => 
                  et.name === 'Other' || et.displayName === 'Other'
                );
                const isOtherSelected = otherEventType && selectedEventTypeIds.includes(otherEventType.id);
                
                if (!isOtherSelected) return null;
                
                return (
                  <div className="mt-3 p-3 border border-amber-200 rounded-lg bg-amber-50/50">
                    <Label className="text-sm font-medium text-amber-800">
                      What type of events? *
                    </Label>
                    <p className="text-xs text-amber-600 mb-2">
                      Add the event types you're targeting (press Enter to add)
                    </p>
                    
                    {/* Display existing custom event types as tags */}
                    {customEventTypeNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {customEventTypeNames.map((type, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800"
                          >
                            <span className="text-xs font-medium">{type}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomEventTypeNames(prev => prev.filter((_, i) => i !== idx));
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
                          if (value && !customEventTypeNames.includes(value)) {
                            setCustomEventTypeNames(prev => [...prev, value]);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <p className="text-[10px] text-amber-500 mt-1">
                      💡 Examples: Haldi, Mehendi, Sangeet, Reception, House Warming, Puja, Retirement Party
                    </p>
                  </div>
                );
              })()}

              {selectedEventTypeIds.length === 1 && (
                <p className="text-xs text-amber-600">
                  💡 At least one event type must be selected
                </p>
              )}
            </div>

            {/* Create Button */}
            <div className="p-3 sm:p-4 border-t bg-muted/30 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button
                onClick={handleCreateFromTemplate}
                disabled={isCreating !== null || selectedEventTypeIds.length === 0}
                className="w-full min-h-[44px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create & Customize
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
