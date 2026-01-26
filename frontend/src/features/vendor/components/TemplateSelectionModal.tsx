import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2, ArrowRight, FileEdit, Camera, Utensils, Building2, Palette, Sparkles, Music, Speaker, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';
import { 
  CATEGORY_TEMPLATES, 
  ListingTemplate,
} from '@/shared/constants/listingTemplates';

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorCategoryId: string;
  onStartBlank: () => void;
  onRefetch: () => void;
}

// Category icons mapping (no emojis)
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

// Template type icons
const getTemplateIcon = (templateId: string) => {
  // Photography
  if (templateId.includes('wedding-day') || templateId.includes('bridal')) return Camera;
  if (templateId.includes('prewedding') || templateId.includes('engagement')) return Camera;
  if (templateId.includes('videography')) return Camera;
  
  // Catering
  if (templateId.includes('veg') || templateId.includes('buffet')) return Utensils;
  if (templateId.includes('nonveg')) return Utensils;
  if (templateId.includes('live-counter')) return Utensils;
  
  // Venue
  if (templateId.includes('banquet') || templateId.includes('hall')) return Building2;
  if (templateId.includes('lawn') || templateId.includes('garden')) return Building2;
  if (templateId.includes('farmhouse')) return Building2;
  
  // Decorator
  if (templateId.includes('stage')) return Palette;
  if (templateId.includes('entrance')) return Palette;
  if (templateId.includes('table')) return Palette;
  
  // MUA
  if (templateId.includes('mua') || templateId.includes('makeup')) return Sparkles;
  
  // DJ
  if (templateId.includes('dj') || templateId.includes('anchor')) return Music;
  
  // Sound & Lights
  if (templateId.includes('sound') || templateId.includes('light')) return Speaker;
  
  return FileEdit;
};

export function TemplateSelectionModal({
  open,
  onOpenChange,
  vendorCategoryId,
  onStartBlank,
  onRefetch
}: TemplateSelectionModalProps) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState<string | null>(null);
  
  const categoryTemplates = CATEGORY_TEMPLATES[vendorCategoryId];
  const CategoryIcon = getCategoryIcon(vendorCategoryId);
  
  const formatPrice = (price: number, unit?: string) => {
    const formatted = price.toLocaleString('en-IN');
    return unit ? `₹${formatted}/${unit}` : `₹${formatted}`;
  };

  // Create draft from template and redirect to preview
  const handleUseTemplate = async (template: ListingTemplate) => {
    setIsCreating(template.id);
    
    try {
      // Get price from categorySpecificData (category-specific pricing)
      const categoryPrice = template.categorySpecificData?.price 
        || template.categorySpecificData?.pricePerPlateVeg 
        || template.categorySpecificData?.bridalPrice 
        || template.displayPrice 
        || 0;
      
      // Debug: Log the template data being sent
      console.log('[TemplateModal] Creating from template:', template.id);
      console.log('[TemplateModal] categorySpecificData:', template.categorySpecificData);
      
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
        // Mark as template-based for validation
        customNotes: `__TEMPLATE__:${template.id}`,
      };
      
      console.log('[TemplateModal] Payload categorySpecificData:', payload.categorySpecificData);

      const response = await vendorApi.createItem(payload);
      
      if (response.success && response.data?.id) {
        toast.success('Template loaded! Add your photos and customize.');
        onOpenChange(false);
        onRefetch();
        // Redirect to preview page in edit mode
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
    onOpenChange(false);
  };

  if (!categoryTemplates) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Create Service</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <FileEdit className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Start with a blank form
            </p>
            <Button onClick={handleStartBlank} className="w-full">
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0" aria-describedby={undefined}>
        {/* Header */}
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CategoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-semibold text-base">New {categoryTemplates.categoryName} Service</DialogTitle>
              <p className="text-xs text-muted-foreground">Choose a template or start fresh</p>
            </div>
          </div>
        </DialogHeader>

        {/* Templates List */}
        <div className="p-3 space-y-1.5 max-h-[45vh] overflow-y-auto">
          {categoryTemplates.items.map((template) => {
            const TemplateIcon = getTemplateIcon(template.id);
            return (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                disabled={isCreating !== null}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all disabled:opacity-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <TemplateIcon className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-800">{template.name}</span>
                      {isCreating === template.id && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {template.shortDescription}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-sm text-emerald-600">
                      {formatPrice(template.displayPrice, template.priceUnit)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer - Start Blank */}
        <div className="p-3 border-t bg-slate-50/80">
          <button
            onClick={handleStartBlank}
            disabled={isCreating !== null}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 hover:bg-white transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-slate-200 flex items-center justify-center">
                <FileEdit className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <span className="font-medium text-sm text-slate-700">Start from scratch</span>
                <p className="text-xs text-slate-500">Create your own unique listing</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
