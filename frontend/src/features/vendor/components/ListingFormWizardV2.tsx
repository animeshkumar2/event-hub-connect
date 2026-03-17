import { useState, useRef } from 'react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
  Tag,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Section configuration
interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isRequired: boolean;
  isComplete: (formData: any, categoryData: any) => boolean;
}

const ITEM_SECTIONS: Section[] = [
  {
    id: 'basic',
    title: 'Basic Info',
    subtitle: 'Name & category',
    icon: Tag,
    isRequired: true,
    isComplete: (formData) => !!(formData.name?.trim() && formData.categoryId && formData.eventTypeIds?.length > 0),
  },
  {
    id: 'pricing',
    title: 'Pricing',
    subtitle: 'Set your price',
    icon: IndianRupee,
    isRequired: true,
    isComplete: (formData, categoryData) => {
      if (formData.categoryId === 'other') return !!formData.price;
      return !!(categoryData?.price || categoryData?.pricePerPlate || categoryData?.pricePerPlateVeg || categoryData?.bridalPrice || categoryData?.photographyPrice);
    },
  },
  {
    id: 'highlights',
    title: 'Key Highlights',
    subtitle: 'What makes you special',
    icon: Sparkles,
    isRequired: false,
    isComplete: (formData) => formData.highlights?.length > 0,
  },
  {
    id: 'photos',
    title: 'Photos',
    subtitle: 'Showcase your work',
    icon: Camera,
    isRequired: true,
    isComplete: (formData) => formData.images?.length > 0,
  },
  {
    id: 'extras',
    title: 'Anything Else',
    subtitle: 'Additional notes',
    icon: FileText,
    isRequired: false,
    isComplete: (formData) => !!formData.customNotes?.trim(),
  },
];

interface ListingFormWizardV2Props {
  formData: any;
  setFormData: (data: any) => void;
  listingType: 'PACKAGE' | 'ITEM';
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
  availableEventTypes: any[];
  coreCategories: any[];
  renderBasicSection: () => React.ReactNode;
  renderPricingSection: () => React.ReactNode;
  renderHighlightsSection: () => React.ReactNode;
  renderPhotosSection: () => React.ReactNode;
  renderExtrasSection: () => React.ReactNode;
}

export const ListingFormWizardV2 = React.memo(function ListingFormWizardV2(props: ListingFormWizardV2Props) {
  const [activeSection, setActiveSection] = useState<string | null>('basic');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sections = ITEM_SECTIONS;

  const completionStatus = React.useMemo(() => {
    const status: Record<string, boolean> = {};
    sections.forEach(section => {
      status[section.id] = section.isComplete(props.formData, props.categorySpecificData);
    });
    return status;
  }, [props.formData, props.categorySpecificData, sections]);

  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const requiredSections = sections.filter(s => s.isRequired);
  const requiredComplete = requiredSections.every(s => completionStatus[s.id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
    setActiveSection(sectionId);
  };

  const goToNextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    for (let i = currentIndex + 1; i < sections.length; i++) {
      if (!completionStatus[sections[i].id]) {
        setActiveSection(sections[i].id);
        setExpandedSections(prev => new Set([...prev, sections[i].id]));
        setTimeout(() => {
          sectionRefs.current[sections[i].id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'basic': return props.renderBasicSection();
      case 'pricing': return props.renderPricingSection();
      case 'highlights': return props.renderHighlightsSection();
      case 'photos': return props.renderPhotosSection();
      case 'extras': return props.renderExtrasSection();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={props.onCancel} className="gap-2 text-slate-600 hover:text-slate-900">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setExpandedSections(prev => new Set([...prev, section.id]));
                    }}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all",
                      completionStatus[section.id] ? "bg-emerald-500" : activeSection === section.id ? "bg-primary ring-4 ring-primary/20" : "bg-slate-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">{completedCount}/{sections.length}</span>
            </div>

            {!props.editingListing && (
              <Button variant="ghost" size="sm" onClick={props.onSaveAsDraft} disabled={props.isSaving} className="gap-2 text-slate-600">
                {props.isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {props.editingListing ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-sm text-slate-500">Complete each section to publish your listing</p>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => {
            const isExpanded = expandedSections.has(section.id);
            const isComplete = completionStatus[section.id];
            const isActive = activeSection === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                className={cn(
                  "rounded-2xl border-2 overflow-hidden transition-all duration-300",
                  isActive && isExpanded ? "border-primary/50 shadow-lg shadow-primary/10 bg-white" : isComplete ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isComplete ? "bg-emerald-100" : isActive ? "bg-primary/10" : "bg-slate-100"
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-500")} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-semibold", isComplete ? "text-emerald-700" : "text-slate-900")}>
                        {section.title}
                      </h3>
                      {section.isRequired && !isComplete && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-300 text-amber-600">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{section.subtitle}</p>
                  </div>

                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isExpanded ? "bg-primary/10" : "bg-slate-100")}>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>

                {/* Collapsible Content */}
                <div className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                      {renderSectionContent(section.id)}
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={goToNextSection} className="gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
                          {index === sections.length - 1 ? 'Review' : 'Continue'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(completedCount / sections.length) * 125.6} 125.6`} className="text-primary transition-all duration-500" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                  {Math.round((completedCount / sections.length) * 100)}%
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{requiredComplete ? 'Ready to publish!' : 'Complete required sections'}</p>
                <p className="text-xs text-slate-500">{completedCount} of {sections.length} sections complete</p>
              </div>
            </div>

            <Button
              onClick={props.onSubmit}
              disabled={!requiredComplete || props.isPublishing}
              className={cn(
                "gap-2 px-6 h-11 text-base font-semibold transition-all",
                requiredComplete ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25" : "bg-slate-300"
              )}
            >
              {props.isPublishing ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Publishing...</>
              ) : (
                <><CheckCircle2 className="h-5 w-5" />{props.editingListing ? 'Update' : 'Publish'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
