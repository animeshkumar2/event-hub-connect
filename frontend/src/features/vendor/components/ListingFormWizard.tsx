import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';

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
  // Data props
  eventTypesData: any[];
  categoriesData: any[];
  items: any[];
  availableEventTypes: any[];
  coreCategories: any[];
  eventTypeCategories: any[];
  // Helper functions
  getCategoryName: (categoryId: string) => string;
  getAllDbCategoryIds: (coreCategoryId: string) => string[];
  toggleLinkedItem: (itemId: string) => void;
  // Draft state handlers
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
}

export const ListingFormWizard = React.memo(function ListingFormWizard(props: ListingFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Render counter for debugging
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  console.log('🎯 Wizard render #', renderCount.current);
  
  // Debug: Track what props are changing
  const prevCategorySpecificData = React.useRef(props.categorySpecificData);
  if (prevCategorySpecificData.current !== props.categorySpecificData) {
    console.log('⚠️ categorySpecificData reference changed in wizard');
    prevCategorySpecificData.current = props.categorySpecificData;
  }
  
  // Different total steps for packages vs items
  const totalSteps = props.listingType === 'PACKAGE' ? 5 : 4;

  const steps = props.listingType === 'PACKAGE' ? [
    { number: 1, title: 'Basic Info', description: 'Name & description' },
    { number: 2, title: 'Bundle Items', description: 'Select items to bundle' },
    { number: 3, title: 'Pricing', description: 'Set package price' },
    { number: 4, title: 'Anything Else', description: 'Additional notes' },
    { number: 5, title: 'Images', description: 'Upload photos' },
  ] : [
    { number: 1, title: 'Basic Info', description: 'Name, category & event types' },
    { number: 2, title: 'Details & Pricing', description: 'Pricing & inclusions' },
    { number: 3, title: 'Anything Else', description: 'Additional notes' },
    { number: 4, title: 'Images', description: 'Upload photos' },
  ];

  // Validation for each step - memoized to prevent re-renders
  const isStep1Valid = React.useMemo(() => {
    return !!(
      props.formData.name &&
      (props.listingType === 'ITEM' ? (
        props.formData.categoryId &&
        (props.formData.categoryId !== 'other' || props.formData.customCategoryName) &&
        props.formData.eventTypeIds.length > 0
      ) : true) // For packages, just name is required in step 1
    );
  }, [props.formData.name, props.formData.categoryId, props.formData.customCategoryName, props.formData.eventTypeIds, props.listingType]);

  const isStep2Valid = React.useMemo(() => {
    if (props.listingType === 'PACKAGE') {
      // For packages, step 2 is bundle items - need at least 2 items selected
      return props.formData.includedItemIds.length >= 2;
    }
    
    // For items, step 2 is details & pricing
    // Category is always required
    if (!props.formData.categoryId) {
      console.log('❌ Step 2 validation failed: No category selected');
      return false;
    }
    
    // Delivery time is mandatory for all listings
    if (!props.formData.deliveryTime || props.formData.deliveryTime.trim() === '') {
      console.log('❌ Step 2 validation failed: Delivery time required');
      return false;
    }
    
    // Minimum quantity is mandatory for ITEM type
    if (props.listingType === 'ITEM') {
      if (!props.formData.minimumQuantity || props.formData.minimumQuantity < 1) {
        console.log('❌ Step 2 validation failed: Minimum quantity required for items');
        return false;
      }
      if (!props.formData.unit || props.formData.unit.trim() === '') {
        console.log('❌ Step 2 validation failed: Unit required for items');
        return false;
      }
    }
    
    // Custom category name required for "Other"
    if (props.formData.categoryId === 'other') {
      if (!props.formData.customCategoryName) {
        console.log('❌ Step 2 validation failed: Custom category name required');
        return false;
      }
      // For "Other" category, check main price field
      if (!props.formData.price) {
        console.log('❌ Step 2 validation failed: Price required for Other category');
        return false;
      }
    } else {
      // For specific categories, check if ANY price field exists in category-specific data
      const categoryData = props.categorySpecificData;
      
      // Check for common price fields
      const hasPriceField = !!(
        categoryData.price ||
        categoryData.pricePerPlateVeg ||
        categoryData.bridalPrice ||
        categoryData.photographyPrice ||
        categoryData.videographyPrice
      );
      
      if (!hasPriceField) {
        console.log('❌ Step 2 validation failed: No price field found in category data', categoryData);
        return false;
      }
      
      console.log('✅ Step 2 validation passed with category data:', categoryData);
    }
    
    return true;
  }, [props.listingType, props.formData.includedItemIds, props.formData.categoryId, props.formData.customCategoryName, props.formData.price, props.formData.deliveryTime, props.formData.minimumQuantity, props.categorySpecificData]);

  const isStep3Valid = React.useMemo(() => {
    if (props.listingType === 'PACKAGE') {
      // For packages, step 3 is pricing - need package price
      return !!props.formData.price;
    }
    // For items, step 3 is "anything else" - always valid (optional)
    return true;
  }, [props.listingType, props.formData.price]);

  const isStep4Valid = React.useMemo(() => {
    if (props.listingType === 'PACKAGE') {
      // For packages, step 4 is "anything else" - always valid (optional)
      return true;
    }
    // For items, step 4 is images
    return props.formData.images.length > 0;
  }, [props.listingType, props.formData.images]);

  const isStep5Valid = React.useMemo(() => {
    // Only for packages - step 5 is images
    return props.formData.images.length > 0;
  }, [props.formData.images]);

  const canProceedToNext = () => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    if (currentStep === 4) return isStep4Valid;
    if (currentStep === 5) return isStep5Valid;
    return true;
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow going back to any previous step
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
    // Allow going forward only if current step is valid
    else if (stepNumber > currentStep && canProceedToNext()) {
      setCurrentStep(stepNumber);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6 w-full">{/* Removed overflow-x-hidden to prevent border clipping */}
      {/* Progress Bar */}
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators - Mobile Optimized */}
        <div className="space-y-2 overflow-hidden">
          {/* Mobile: Show only current step info */}
          <div className="sm:hidden">
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border-2 border-primary">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {currentStep}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  {steps[currentStep - 1].title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop: Show all steps - Compact */}
          <div className="hidden sm:grid sm:grid-cols-5 sm:gap-1">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isClickable = step.number < currentStep || (step.number === currentStep + 1 && canProceedToNext());
              
              return (
                <button
                  key={step.number}
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isClickable && step.number > currentStep}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary'
                      : isCompleted
                      ? 'bg-green-500/10 border border-green-500/30 cursor-pointer hover:bg-green-500/20'
                      : 'bg-muted/30 border border-border opacity-60'
                  } ${isClickable && !isActive ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                >
                  {/* Step Number/Icon */}
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.number}
                  </div>
                  
                  {/* Step Info */}
                  <div className="text-center w-full">
                    <p className={`text-[10px] font-semibold truncate ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-[9px] text-muted-foreground truncate">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] px-1">{/* Added horizontal padding to prevent border clipping */}
        {currentStep === 1 && <ListingFormStep1 {...props} />}
        
        {/* PACKAGE FLOW */}
        {props.listingType === 'PACKAGE' && (
          <>
            {currentStep === 2 && <ListingFormStep2BundleItems {...props} />}
            {currentStep === 3 && <ListingFormStep3PackagePricing {...props} />}
            {currentStep === 4 && <ListingFormStepAnythingElse {...props} />}
            {currentStep === 5 && <ListingFormStep3 {...props} />}
          </>
        )}
        
        {/* ITEM FLOW */}
        {props.listingType === 'ITEM' && (
          <>
            {currentStep === 2 && <ListingFormStep2 {...props} />}
            {currentStep === 3 && <ListingFormStepAnythingElse {...props} />}
            {currentStep === 4 && <ListingFormStep3 {...props} />}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-border space-y-3">
        {/* Step Navigation - Back/Next */}
        {currentStep < totalSteps ? (
          <div className="space-y-3">
            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Previous Step
              </Button>
            )}
            
            {/* Primary Actions Row - matching final step layout */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Save as Draft - only show for NEW listings, not when editing */}
              {!props.editingListing && (
                <Button
                  variant="outline"
                  onClick={props.onSaveAsDraft}
                  disabled={props.isSaving || props.isPublishing}
                  className="w-full sm:flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  {props.isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
              )}
              
              {/* Continue Button */}
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`${!props.editingListing ? 'w-full sm:flex-1' : 'w-full'} bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow`}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Final Step - Publish Actions */
          <div className="space-y-3">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Previous Step</span>
              <span className="sm:hidden">Back</span>
            </Button>

            {/* Validation Message */}
            {(!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid || (props.listingType === 'PACKAGE' && !isStep5Valid)) && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 text-center">
                  {!isStep1Valid
                    ? '⚠️ Complete basic info (Step 1)'
                    : !isStep2Valid
                    ? props.listingType === 'PACKAGE' 
                      ? '⚠️ Select at least 2 items (Step 2)'
                      : '⚠️ Complete details & pricing (Step 2)'
                    : !isStep3Valid
                    ? props.listingType === 'PACKAGE'
                      ? '⚠️ Set package price (Step 3)'
                      : '✓ Step 3 complete'
                    : !isStep4Valid
                    ? props.listingType === 'PACKAGE'
                      ? '✓ Step 4 complete'
                      : '⚠️ Add at least one image (Step 4)'
                    : props.listingType === 'PACKAGE' && !isStep5Valid
                    ? '⚠️ Add at least one image (Step 5)'
                    : '✓ Ready to publish'}
                </p>
              </div>
            )}

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Save as Draft - only for new listings */}
              {!props.editingListing && (
                <Button
                  variant="outline"
                  onClick={props.onSaveAsDraft}
                  disabled={props.isSaving || props.isPublishing}
                  className="w-full sm:flex-1 border-primary/50 text-primary hover:bg-primary/10"
                >
                  {props.isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
              )}
              
              {/* Publish Button */}
              <Button
                onClick={props.onSubmit}
                disabled={
                  !isStep1Valid || 
                  !isStep2Valid || 
                  !isStep3Valid || 
                  !isStep4Valid || 
                  (props.listingType === 'PACKAGE' && !isStep5Valid) ||
                  props.isPublishing || 
                  props.isSaving
                }
                className={`${!props.editingListing ? 'w-full sm:flex-1' : 'w-full'} bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow disabled:opacity-50`}
              >
                {props.isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {props.editingListing ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {props.editingListing ? 'Update Listing' : 'Publish Listing'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Cancel Button - Always at bottom */}
        <Button
          variant="ghost"
          onClick={props.onCancel}
          className="w-full text-muted-foreground hover:text-foreground text-sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
});
