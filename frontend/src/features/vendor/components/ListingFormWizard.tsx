import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save, X, ChevronDown, ChevronUp, Tag, IndianRupee, Sparkles, Camera, FileText, Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Import step components
import { ListingFormStep1 } from './ListingFormSteps/Step1BasicInfo';
import { ListingFormStep2 } from './ListingFormSteps/Step2Details';
import { ListingFormStep2BundleItems } from './ListingFormSteps/Step2BundleItems';
import { ListingFormStep3PackagePricing } from './ListingFormSteps/Step3PackagePricing';
import { ListingFormStepAnythingElse } from './ListingFormSteps/StepAnythingElse';
import { ListingFormStep3 } from './ListingFormSteps/Step3Images';

interface ListingFormWizardProps {
  formData: any;
  setFormData: (data: any) => void;
  listingType: 'PACKAGE' | 'ITEM';
  setListingType: (type: 'PACKAGE' | 'ITEM') => void;
  categorySpecificData: Record<string, any>;
  setCategorySpecificData: (data: Record<string, any>) => void;
  editingListing: any;
  onSubmit: () => Promise<void>;
  onSaveAsDraft: () => Promise<void>;
  onCancel: () => void;
  isPublishing: boolean;
  isSaving: boolean;
  eventTypesData: any[];
  categoriesData: any[];
  items: any[];
  availableEventTypes: any[];
  coreCategories: any[];
  eventTypeCategories: any[];
  getCategoryName: (categoryId: string) => string;
  getAllDbCategoryIds: (coreCategoryId: string) => string[];
  toggleLinkedItem: (itemId: string) => void;
  draftIncludedItem: string;
  setDraftIncludedItem: (value: string) => void;
  showIncludedItemInput: boolean;
  setShowIncludedItemInput: (value: boolean) => void;
  saveIncludedItem: () => void;
  cancelIncludedItem: () => void;
  removeIncludedItem: (index: number) => void;
  draftExcludedItem: string;
  setDraftExcludedItem: (value: string) => void;
  showExcludedItemInput: boolean;
  setShowExcludedItemInput: (value: boolean) => void;
  saveExcludedItem: () => void;
  cancelExcludedItem: () => void;
  removeExcludedItem: (index: number) => void;
  draftExtraCharge: { name: string; price: string };
  setDraftExtraCharge: (value: { name: string; price: string }) => void;
  showExtraChargeInput: boolean;
  setShowExtraChargeInput: (value: boolean) => void;
  saveExtraCharge: () => void;
  cancelExtraCharge: () => void;
  removeExtraCharge: (index: number) => void;
  draftHighlight: string;
  setDraftHighlight: (value: string) => void;
  showHighlightInput: boolean;
  setShowHighlightInput: (value: boolean) => void;
  saveHighlight: () => void;
  cancelHighlight: () => void;
  removeHighlight: (index: number) => void;
  handleImagesChange: (images: string[]) => void;
  handlePendingImageDeletes: (urls: string[]) => void;
  handlePendingImageChanges?: (changes: { filesToUpload: File[]; urlsToDelete: string[]; finalOrder: (string | File)[]; }) => void;
  pendingImagesCount?: number;
}

interface Section {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isRequired: boolean;
}

export const ListingFormWizard = React.memo(function ListingFormWizard(props: ListingFormWizardProps) {
  const [expandedSection, setExpandedSection] = useState<string>('basic');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Define sections based on listing type
  const sections: Section[] = props.listingType === 'PACKAGE' ? [
    { id: 'basic', stepNumber: 1, title: 'Basic Info', subtitle: 'Name & description', icon: Tag, isRequired: true },
    { id: 'bundle', stepNumber: 2, title: 'Bundle Services', subtitle: 'Select services to bundle', icon: Package, isRequired: true },
    { id: 'pricing', stepNumber: 3, title: 'Pricing', subtitle: 'Set package price', icon: IndianRupee, isRequired: true },
    { id: 'extras', stepNumber: 4, title: 'Anything Else', subtitle: 'Additional notes', icon: FileText, isRequired: false },
    { id: 'photos', stepNumber: 5, title: 'Photos', subtitle: 'Upload photos', icon: Camera, isRequired: true },
  ] : [
    { id: 'basic', stepNumber: 1, title: 'Basic Info', subtitle: 'Name, category & event types', icon: Tag, isRequired: true },
    { id: 'pricing', stepNumber: 2, title: 'Details & Pricing', subtitle: 'Pricing & inclusions', icon: IndianRupee, isRequired: true },
    { id: 'extras', stepNumber: 3, title: 'Anything Else', subtitle: 'Additional notes', icon: FileText, isRequired: false },
    { id: 'photos', stepNumber: 4, title: 'Photos', subtitle: 'Upload photos', icon: Camera, isRequired: true },
  ];

  // Validation functions
  const getBasicErrors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (!props.formData.name?.trim()) errors.push('Name required');
    if (props.listingType === 'ITEM') {
      if (!props.formData.categoryId) errors.push('Category required');
      if (props.formData.categoryId === 'other' && !props.formData.customCategoryName?.trim()) errors.push('Custom category required');
      if (!props.formData.eventTypeIds?.length) errors.push('Event type required');
      if (props.formData.categoryId === 'venue' && (!props.formData.venueLatitude || !props.formData.venueLongitude)) errors.push('Venue location required');
    }
    return errors;
  }, [props.formData, props.listingType]);

  const getBundleErrors = React.useCallback((): string[] => {
    if (props.listingType !== 'PACKAGE') return [];
    return props.formData.includedItemIds?.length < 2 ? ['Select at least 2 items'] : [];
  }, [props.formData.includedItemIds, props.listingType]);

  const getPricingErrors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (props.listingType === 'PACKAGE') {
      if (!props.formData.price) errors.push('Price required');
    } else {
      if (props.formData.categoryId !== 'dj-entertainment' && props.formData.categoryId !== 'venue' && !props.formData.deliveryTime?.trim()) {
        errors.push('Delivery time required');
      }
      if (props.formData.categoryId === 'other') {
        if (!props.formData.price) errors.push('Price required');
      } else {
        const cd = props.categorySpecificData;
        if (!(cd?.price || cd?.pricePerPlate || cd?.pricePerPlateVeg || cd?.bridalPrice || cd?.photographyPrice || cd?.videographyPrice)) {
          errors.push('Price required');
        }
      }
    }
    return errors;
  }, [props.formData, props.categorySpecificData, props.listingType]);

  const getPhotosErrors = React.useCallback((): string[] => {
    const total = (props.formData.images?.length || 0) + (props.pendingImagesCount || 0);
    return total === 0 ? ['Add at least one image'] : [];
  }, [props.formData.images, props.pendingImagesCount]);

  // Check section completion
  const isSectionComplete = React.useCallback((sectionId: string): boolean => {
    switch (sectionId) {
      case 'basic': return getBasicErrors().length === 0;
      case 'bundle': return getBundleErrors().length === 0;
      case 'pricing': return getPricingErrors().length === 0;
      case 'photos': return getPhotosErrors().length === 0;
      case 'extras': return true; // Optional
      default: return false;
    }
  }, [getBasicErrors, getBundleErrors, getPricingErrors, getPhotosErrors]);

  const completedCount = sections.filter(s => isSectionComplete(s.id)).length;
  const requiredComplete = sections.filter(s => s.isRequired).every(s => isSectionComplete(s.id));

  // Navigate to next incomplete section
  const goToNext = (currentId: string) => {
    const currentIdx = sections.findIndex(s => s.id === currentId);
    for (let i = currentIdx + 1; i < sections.length; i++) {
      if (!isSectionComplete(sections[i].id) || i === sections.length - 1) {
        setExpandedSection(sections[i].id);
        setTimeout(() => sectionRefs.current[sections[i].id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        return;
      }
    }
  };

  // Render section content
  const renderContent = (sectionId: string) => {
    switch (sectionId) {
      case 'basic':
        return <ListingFormStep1 {...props} />;
      case 'bundle':
        return <ListingFormStep2BundleItems {...props} />;
      case 'pricing':
        return props.listingType === 'PACKAGE' ? <ListingFormStep3PackagePricing {...props} /> : <ListingFormStep2 {...props} />;
      case 'extras':
        return <ListingFormStepAnythingElse {...props} />;
      case 'photos':
        return <ListingFormStep3 {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setExpandedSection(s.id)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                isSectionComplete(s.id) ? "bg-emerald-500" : expandedSection === s.id ? "bg-primary ring-2 ring-primary/30" : "bg-slate-300"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">{completedCount}/{sections.length}</span>
        </div>
        {!props.editingListing && (
          <Button variant="ghost" size="sm" onClick={props.onSaveAsDraft} disabled={props.isSaving} className="h-8 text-xs">
            {props.isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save Draft
          </Button>
        )}
      </div>

      {/* Accordion Sections */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const isComplete = isSectionComplete(section.id);
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className={cn(
                "rounded-xl border-2 overflow-hidden transition-all duration-200",
                isExpanded ? "border-primary/40 shadow-md bg-card" : isComplete ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10" : "border-border bg-card/50"
              )}
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  isComplete ? "bg-emerald-100 dark:bg-emerald-900/30" : isExpanded ? "bg-primary/10" : "bg-muted"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className={cn("h-4.5 w-4.5", isExpanded ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium text-sm", isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}>
                      {section.title}
                    </span>
                    {section.isRequired && !isComplete && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 bg-amber-50">Required</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                </div>
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", isExpanded ? "bg-primary/10" : "bg-muted/50")}>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Collapsible Content */}
              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}>
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    {renderContent(section.id)}
                    
                    {/* Continue button */}
                    <div className="mt-5 flex justify-end">
                      <Button
                        onClick={() => goToNext(section.id)}
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                      >
                        Continue <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(completedCount / sections.length) * 100.5} 100.5`} className="text-primary transition-all duration-500" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{Math.round((completedCount / sections.length) * 100)}%</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium">{requiredComplete ? 'Ready!' : 'Complete required'}</p>
            <p className="text-[10px] text-muted-foreground">{completedCount}/{sections.length} done</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={props.onCancel} className="h-9 px-3">Cancel</Button>
          <Button
            onClick={props.onSubmit}
            disabled={!requiredComplete || props.isPublishing}
            size="sm"
            className={cn(
              "h-9 px-4 gap-1.5",
              requiredComplete ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700" : ""
            )}
          >
            {props.isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {props.editingListing ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
});
