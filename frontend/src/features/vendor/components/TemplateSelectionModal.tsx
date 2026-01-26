import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { 
  Loader2, ArrowRight, ArrowLeft, Camera, Utensils, Building2, 
  Palette, Sparkles, Music, Speaker, MoreHorizontal, Wand2, PenLine,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';
import { 
  CATEGORY_TEMPLATES, 
  ListingTemplate,
} from '@/shared/constants/listingTemplates';

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartBlank: () => void;
  onRefetch: () => void;
}

type Step = 'choice' | 'category' | 'templates';

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
];

export function TemplateSelectionModal({
  open,
  onOpenChange,
  onStartBlank,
  onRefetch
}: TemplateSelectionModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choice');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  
  // Get templates for selected category
  const categoryTemplates = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORY_TEMPLATES[selectedCategory];
  }, [selectedCategory]);

  // Filter categories that have templates
  const availableCategories = useMemo(() => {
    return TEMPLATE_CATEGORIES.filter(cat => CATEGORY_TEMPLATES[cat.id]);
  }, []);
  
  const formatPrice = (price: number, unit?: string) => {
    const formatted = price.toLocaleString('en-IN');
    return unit ? `₹${formatted}/${unit}` : `₹${formatted}`;
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep('choice');
      setSelectedCategory(null);
      setIsCreating(null);
    }
    onOpenChange(open);
  };

  // Create draft from template and redirect to preview
  const handleUseTemplate = async (template: ListingTemplate) => {
    setIsCreating(template.id);
    
    try {
      const categoryPrice = template.categorySpecificData?.price 
        || template.categorySpecificData?.pricePerPlateVeg 
        || template.categorySpecificData?.bridalPrice 
        || template.displayPrice 
        || 0;
      
      const payload = {
        name: template.name,
        description: template.description,
        price: categoryPrice,
        categoryId: template.dbCategoryId,
        eventTypeIds: template.eventTypeIds,
        images: [],
        highlights: template.highlights,
        includedItemsText: template.includedItemsText,
        excludedItemsText: template.excludedItemsText,
        deliveryTime: template.deliveryTime,
        unit: template.priceUnit || '',
        minimumQuantity: template.categorySpecificData?.minGuests || 1,
        categorySpecificData: template.categorySpecificData 
          ? JSON.stringify(template.categorySpecificData) 
          : undefined,
        serviceMode: 'BOTH',
        isActive: false,
        isDraft: true,
        customNotes: `__TEMPLATE__:${template.id}`,
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
    if (step === 'templates') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'category') {
      setStep('choice');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        {/* Step 1: Choice - Template or Scratch */}
        {step === 'choice' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Create New Service</h2>
              <p className="text-sm text-muted-foreground mt-1">How would you like to start?</p>
            </div>

            <div className="space-y-3">
              {/* Use Template Option */}
              <button
                onClick={() => setStep('category')}
                className="w-full p-4 rounded-xl border-2 border-primary/20 hover:border-primary/50 bg-gradient-to-r from-primary/5 to-violet-500/5 hover:from-primary/10 hover:to-violet-500/10 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Use a Template</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Recommended</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Start with pre-filled details, just add your photos
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              {/* Start from Scratch Option */}
              <button
                onClick={handleStartBlank}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-muted-foreground/10 flex items-center justify-center transition-colors">
                    <PenLine className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">Start from Scratch</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Create your own unique listing from blank
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 'category' && (
          <div>
            {/* Header with back button */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-semibold text-base">Select Category</h2>
                <p className="text-xs text-muted-foreground">Choose the type of service</p>
              </div>
            </div>

            {/* Category List - Vertical scrollable with visual hint */}
            <div className="relative">
              {/* Scroll hint gradient at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
              
              <div className="p-4 space-y-2 max-h-[55vh] overflow-y-auto pb-8">
                {availableCategories.map((category, index) => {
                  const Icon = category.icon;
                  const templates = CATEGORY_TEMPLATES[category.id];
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSelectCategory(category.id)}
                      className="w-full p-3 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left flex items-center gap-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                        category.color
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {templates?.items.length || 0} ready-to-use templates
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
              
              {/* Scroll indicator */}
              {availableCategories.length > 5 && (
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
          <div>
            {/* Header with back button */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
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
            <div className="p-3 space-y-2 max-h-[50vh] overflow-y-auto">
              {categoryTemplates.items.map((template, index) => {
                return (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template)}
                    disabled={isCreating !== null}
                    className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                        {isCreating === template.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground group-hover:text-primary">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-foreground">{template.name}</span>
                          <span className="font-bold text-sm text-emerald-600 flex-shrink-0">
                            {formatPrice(template.displayPrice, template.priceUnit)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.shortDescription}
                        </p>
                        {/* Highlights preview */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.highlights.slice(0, 3).map((highlight, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {highlight}
                            </span>
                          ))}
                          {template.highlights.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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

            {/* Footer hint */}
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs text-center text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                Templates are fully customizable after selection
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
