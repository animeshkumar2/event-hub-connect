import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save, AlertCircle } from 'lucide-react';
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

  // Detailed validation with specific error messages
  const getStep1Errors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (!props.formData.name?.trim()) errors.push('Listing name is required');
    if (props.listingType === 'ITEM') {
      if (!props.formData.categoryId) errors.push('Category is required');
      if (props.formData.categoryId === 'other' && !props.formData.customCategoryName?.trim()) {
        errors.push('Custom category name is required');
      }
      if (!props.formData.eventTypeIds || props.formData.eventTypeIds.length === 0) {
        errors.push('Select at least one event type');
      }
    }
    return errors;
  }, [props.formData.name, props.formData.categoryId, props.formData.customCategoryName, props.formData.eventTypeIds, props.listingType]);

  const getStep2Errors = React.useCallback((): string[] => {
    const errors: string[] = [];
    
    if (props.listingType === 'PACKAGE') {
      if (props.formData.includedItemIds.length < 2) {
        errors.push('Select at least 2 items to bundle');
      }
      return errors;
    }
    
    // For ITEM type
    if (!props.formData.deliveryTime?.trim()) {
      errors.push('Delivery time is required');
    }
    
    // Price validation based on category
    if (props.formData.categoryId === 'other') {
      if (!props.formData.price) {
        errors.push('Price is required');
      }
    } else {
      const categoryData = props.categorySpecificData;
      const hasPriceField = !!(
        categoryData.price ||
        categoryData.pricePerPlateVeg ||
        categoryData.bridalPrice ||
        categoryData.photographyPrice ||
        categoryData.videographyPrice
      );
      
      if (!hasPriceField) {
        // Give category-specific price field name
        switch (props.formData.categoryId) {
          case 'caterer':
            errors.push('Vegetarian price per plate is required');
            break;
          case 'mua':
            errors.push('Bridal makeup price is required');
            break;
          case 'photographer':
          case 'photography-videography':
            errors.push('Service price is required');
            break;
          default:
            errors.push('Price is required');
        }
      }
    }
    
    return errors;
  }, [props.listingType, props.formData.includedItemIds, props.formData.categoryId, props.formData.price, props.formData.deliveryTime, props.categorySpecificData]);

  const getStep3Errors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (props.listingType === 'PACKAGE' && !props.formData.price) {
      errors.push('Package price is required');
    }
    return errors;
  }, [props.listingType, props.formData.price]);

  const getStep4Errors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (props.listingType === 'ITEM' && props.formData.images.length === 0) {
      errors.push('Add at least one image');
    }
    return errors;
  }, [props.listingType, props.formData.images]);

  const getStep5Errors = React.useCallback((): string[] => {
    const errors: string[] = [];
    if (props.listingType === 'PACKAGE' && props.formData.images.length === 0) {
      errors.push('Add at least one image');
    }
    return errors;
  }, [props.listingType, props.formData.images]);

  // Validation flags
  const isStep1Valid = getStep1Errors().length === 0;
  const isStep2Valid = getStep2Errors().length === 0;
  const isStep3Valid = getStep3Errors().length === 0;
  const isStep4Valid = getStep4Errors().length === 0;
  const isStep5Valid = getStep5Errors().length === 0;

  // Get all errors for display
  const getAllErrors = React.useCallback((): { step: number; errors: string[] }[] => {
    const allErrors: { step: number; errors: string[] }[] = [];
    const step1Errors = getStep1Errors();
    const step2Errors = getStep2Errors();
    const step3Errors = getStep3Errors();
    const step4Errors = getStep4Errors();
    const step5Errors = getStep5Errors();
    
    if (step1Errors.length > 0) allErrors.push({ step: 1, errors: step1Errors });
    if (step2Errors.length > 0) allErrors.push({ step: 2, errors: step2Errors });
    if (step3Errors.length > 0) allErrors.push({ step: 3, errors: step3Errors });
    if (step4Errors.length > 0) allErrors.push({ step: 4, errors: step4Errors });
    if (props.listingType === 'PACKAGE' && step5Errors.length > 0) allErrors.push({ step: 5, errors: step5Errors });
    
    return allErrors;
  }, [getStep1Errors, getStep2Errors, getStep3Errors, getStep4Errors, getStep5Errors, props.listingType]);

  const canProceedToNext = () => {
    // Must complete ALL previous steps before proceeding
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep1Valid && isStep2Valid;
    if (currentStep === 3) return isStep1Valid && isStep2Valid && isStep3Valid;
    if (currentStep === 4) return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
    if (currentStep === 5) return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && isStep5Valid;
    return true;
  };

  // Check if a specific step can be accessed
  const canAccessStep = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return isStep1Valid;
    if (stepNumber === 3) return isStep1Valid && isStep2Valid;
    if (stepNumber === 4) return isStep1Valid && isStep2Valid && isStep3Valid;
    if (stepNumber === 5) return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
    return false;
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
    // Allow going forward only if all previous steps are valid
    else if (stepNumber > currentStep && canAccessStep(stepNumber)) {
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
              const isAccessible = canAccessStep(step.number);
              const isClickable = step.number < currentStep || (step.number > currentStep && isAccessible);
              
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
                      : isAccessible
                      ? 'bg-muted/30 border border-border cursor-pointer hover:bg-muted/50'
                      : 'bg-muted/30 border border-border opacity-40 cursor-not-allowed'
                  }`}
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

            {/* Validation Message - Show detailed errors */}
            {getAllErrors().length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-3">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Please complete the following before publishing:
                </p>
                <div className="space-y-2">
                  {getAllErrors().map(({ step, errors }) => (
                    <div key={step} className="pl-6">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                        Step {step}: {steps[step - 1]?.title}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {errors.map((error, idx) => (
                          <li key={idx} className="text-xs text-red-600/80 dark:text-red-400/80">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const firstErrorStep = getAllErrors()[0]?.step;
                    if (firstErrorStep) setCurrentStep(firstErrorStep);
                  }}
                  className="w-full text-red-600 border-red-500/30 hover:bg-red-500/10"
                >
                  Go to first incomplete step
                </Button>
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
