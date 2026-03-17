import { useState, useCallback, useEffect, useRef } from 'react';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { 
  X, ChevronDown, CheckCircle2, Loader2, Save,
  Camera, Sparkles, Tag, IndianRupee, FileText, ArrowRight, ArrowLeft, Plus,
  Play, LayoutGrid, Check, Circle, AlertCircle, ChevronsDown
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ImageUpload, PendingImageChanges } from '@/shared/components/ImageUpload';
import { CategoryFieldRenderer } from '@/features/vendor/components/CategoryFields';

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isRequired: boolean;
}

const SECTIONS: Section[] = [
  { id: 'photos', title: 'Add Photos', subtitle: 'Show off your best work', icon: Camera, isRequired: true },
  { id: 'basic', title: 'Name & Description', subtitle: 'Tell your story', icon: Tag, isRequired: true },
  { id: 'highlights', title: 'Key Highlights', subtitle: 'What makes you special', icon: Sparkles, isRequired: false },
  { id: 'pricing', title: 'Pricing & Details', subtitle: 'Set your rates', icon: IndianRupee, isRequired: true },
  { id: 'extras', title: 'Additional Notes', subtitle: 'Anything else to share', icon: FileText, isRequired: false },
];

// Scrollable content wrapper with scroll indicator
const ScrollableContent: React.FC<{ children: React.ReactNode; maxHeight: number }> = ({ children, maxHeight }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    setCanScrollUp(scrollTop > 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    // Also check on resize
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Top fade when scrolled */}
      {canScrollUp && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      )}
      
      <div 
        ref={scrollRef} 
        className="overflow-y-auto pr-1" 
        style={{ maxHeight }}
      >
        {children}
      </div>
      
      {/* Bottom scroll indicator */}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="h-12 bg-gradient-to-t from-white via-white/90 to-transparent" />
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium shadow-sm transition-colors"
          >
            <ChevronsDown className="h-3.5 w-3.5 animate-bounce" />
            Scroll for more
          </button>
        </div>
      )}
    </div>
  );
};

// Light themed scrollable content for play mode
const PlayModeScrollableContent: React.FC<{ children: React.ReactNode; maxHeight: string }> = ({ children, maxHeight }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    setCanScrollUp(scrollTop > 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {canScrollUp && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      )}
      
      <div 
        ref={scrollRef} 
        className="wizard-scroll overflow-y-auto" 
        style={{ maxHeight }}
      >
        {children}
      </div>
      
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="h-12 bg-gradient-to-t from-white via-white/90 to-transparent" />
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium shadow-sm transition-colors"
          >
            <ChevronsDown className="h-3.5 w-3.5 animate-bounce" />
            Scroll for more
          </button>
        </div>
      )}
    </div>
  );
};

// Play mode content wrapper with scroll indicator
const PlayModeContent: React.FC<{ 
  children: React.ReactNode; 
  isTransitioning: boolean; 
  slideDirection: 'left' | 'right';
}> = ({ children, isTransitioning, slideDirection }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [needsScroll, setNeedsScroll] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const hasScroll = scrollHeight > clientHeight + 20;
    setNeedsScroll(hasScroll);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 20);
    setScrollProgress(maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 100);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Small delay to let content render
    const timer = setTimeout(checkScroll, 100);
    el.addEventListener('scroll', checkScroll);
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll, children]);

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 flex-1 overflow-hidden flex flex-col">
      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 scroll-smooth",
          // Center content vertically when no scroll needed
          !needsScroll && "flex flex-col justify-center",
          isTransitioning && "opacity-0",
          !isTransitioning && "opacity-100"
        )}
      >
        <div ref={contentRef}>
          {children}
        </div>
        {/* Bottom padding for scroll indicator */}
        {needsScroll && <div className="h-16 flex-shrink-0" />}
      </div>
      
      {/* Scroll indicator overlay */}
      {canScrollDown && (
        <>
          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-100 via-indigo-100/80 to-transparent pointer-events-none z-10" />
          
          {/* Scroll button */}
          <button
            onClick={scrollDown}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-indigo-200 shadow-lg hover:shadow-xl hover:bg-white transition-all group"
          >
            <ChevronsDown className="h-4 w-4 text-indigo-600 animate-bounce" />
            <span className="text-sm font-medium text-slate-700">More below</span>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{scrollProgress}%</span>
          </button>
        </>
      )}
    </div>
  );
};

interface ListingEditWizardProps {
  listing: any;
  editForm: any;
  setEditForm: (fn: (prev: any) => any) => void;
  categorySpecificData: Record<string, any>;
  setCategorySpecificData: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  canPublish: boolean;
  publishRequirements: { id: string; label: string; met: boolean }[];
  pendingImageChanges: PendingImageChanges | null;
  setPendingImageChanges: (changes: PendingImageChanges | null) => void;
  highlights: string[];
  onAddHighlight: (text: string) => void;
  onRemoveHighlight: (index: number) => void;
  onEditHighlight: (index: number, text: string) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

export const ListingEditWizard: React.FC<ListingEditWizardProps> = ({
  listing,
  editForm,
  setEditForm,
  categorySpecificData,
  setCategorySpecificData,
  onSave,
  onCancel,
  isSaving,
  canPublish,
  publishRequirements,
  pendingImageChanges,
  setPendingImageChanges,
  onAddHighlight,
  onRemoveHighlight,
  onPublish,
  isPublishing,
}) => {
  const isDraft = listing?.isDraft ?? true;
  const isActive = listing?.isActive ?? false;
  const [isPlayMode, setIsPlayMode] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['photos']));
  const [draftHighlight, setDraftHighlight] = useState('');
  const [showHighlightInput, setShowHighlightInput] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const currentSection = SECTIONS[currentSectionIndex];

  const isSectionComplete = useCallback((sectionId: string): boolean => {
    switch (sectionId) {
      case 'photos': {
        let imageCount = editForm?.images?.length || 0;
        if (pendingImageChanges) {
          imageCount = pendingImageChanges.finalOrder.filter((item: any) => typeof item === 'string').length + pendingImageChanges.filesToUpload.length;
        }
        return imageCount > 0;
      }
      case 'basic': return !!(editForm?.name?.trim() && editForm?.description?.trim());
      case 'highlights': return (editForm?.highlights?.length || 0) > 0;
      case 'pricing': {
        const catId = listing?.categoryId;
        if (catId === 'caterer') return !!(categorySpecificData?.pricePerPlate && parseFloat(categorySpecificData.pricePerPlate) > 0 || categorySpecificData?.pricePerPlateVeg && parseFloat(categorySpecificData.pricePerPlateVeg) > 0);
        if (catId === 'mua') return !!(categorySpecificData?.bridalPrice && parseFloat(categorySpecificData.bridalPrice) > 0);
        return !!(categorySpecificData?.price && parseFloat(categorySpecificData.price) > 0);
      }
      case 'extras': return true;
      default: return false;
    }
  }, [editForm, pendingImageChanges, categorySpecificData, listing?.categoryId]);

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= SECTIONS.length || index === currentSectionIndex) return;
    setSlideDirection(index > currentSectionIndex ? 'right' : 'left');
    setIsTransitioning(true);
    setTimeout(() => { setCurrentSectionIndex(index); setIsTransitioning(false); }, 150);
  }, [currentSectionIndex]);

  const goNext = useCallback(() => { if (currentSectionIndex < SECTIONS.length - 1) goToSection(currentSectionIndex + 1); }, [currentSectionIndex, goToSection]);
  const goPrev = useCallback(() => { if (currentSectionIndex > 0) goToSection(currentSectionIndex - 1); }, [currentSectionIndex, goToSection]);

  useEffect(() => {
    if (!isPlayMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'Escape') setIsPlayMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayMode, goNext, goPrev]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set<string>();
      // If clicking on already expanded section, close it (empty set)
      // Otherwise, open only this section (accordion behavior)
      if (!prev.has(sectionId)) {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleAddHighlight = () => {
    if (draftHighlight.trim()) { onAddHighlight(draftHighlight.trim()); setDraftHighlight(''); setShowHighlightInput(false); }
  };

  // Light theme styles for play mode - matches overview mode
  const lightStyles = `
    .wizard-scroll::-webkit-scrollbar { width: 4px; }
    .wizard-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
    .wizard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
    .wizard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `;

  // Render content for PLAY MODE (Light theme)
  const renderPlayContent = (section: Section) => {
    const Icon = section.icon;
    
    switch (section.id) {
      case 'photos':
        return (
          <div className="wizard-upload">
            <ImageUpload
              images={editForm?.images || []}
              onChange={(images) => setEditForm((p: any) => ({ ...p, images }))}
              onPendingChanges={setPendingImageChanges}
              maxImages={20}
            />
          </div>
        );
      
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Service Name</Label>
              <Input
                value={editForm?.name || ''}
                onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Premium Wedding Photography"
                className="h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                value={editForm?.description || ''}
                onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))}
                placeholder="Describe what makes your service amazing..."
                rows={5}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none focus:border-indigo-400 focus:ring-indigo-100"
              />
            </div>
          </div>
        );
      
      case 'highlights':
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">Add key features that make customers choose you</p>
            
            {(editForm?.highlights?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {(editForm?.highlights || []).map((highlight: string, index: number) => (
                  <div key={index} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-sm text-slate-700">{highlight}</span>
                    <button onClick={() => onRemoveHighlight(index)} className="p-0.5 rounded hover:bg-indigo-100 opacity-60 hover:opacity-100">
                      <X className="h-3 w-3 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {showHighlightInput ? (
              <div className="flex gap-2">
                <Input
                  value={draftHighlight}
                  onChange={(e) => setDraftHighlight(e.target.value)}
                  placeholder="e.g., 500+ events completed"
                  className="flex-1 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight()}
                  autoFocus
                />
                <Button onClick={handleAddHighlight} size="sm" className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowHighlightInput(false); setDraftHighlight(''); }} className="h-10 text-slate-500 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHighlightInput(true)}
                className="border-dashed border-slate-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add highlight
              </Button>
            )}
          </div>
        );
      
      case 'pricing':
        return (
          <div className="wizard-form">
            <CategoryFieldRenderer
              categoryId={listing?.categoryId || 'other'}
              values={categorySpecificData}
              onChange={setCategorySpecificData}
              hidePackageDetails={true}
            />
          </div>
        );
      
      case 'extras':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Additional Notes</Label>
            <Textarea
              value={editForm?.customNotes || ''}
              onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))}
              placeholder="Share any additional details..."
              rows={5}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none focus:border-indigo-400 focus:ring-indigo-100"
            />
          </div>
        );
      
      default: return null;
    }
  };

  // ============ PLAY MODE (Rich Light Theme) ============
  if (isPlayMode) {
    const Icon = currentSection.icon;
    const completedCount = SECTIONS.filter(s => isSectionComplete(s.id)).length;
    const progressPercent = Math.round(((currentSectionIndex + 1) / SECTIONS.length) * 100);
    
    return (
      <>
        <style>{lightStyles}</style>
        
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 flex flex-col">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-300/40 to-purple-300/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300/40 to-violet-300/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

          {/* Header - Compact */}
          <div className="relative z-10 flex items-center justify-between px-4 py-2 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => setIsPlayMode(false)} 
              className="text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2 rounded-lg"
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Overview</span>
            </Button>
            
            {/* Progress indicator - compact */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full shadow-sm border border-indigo-100">
              <div className="flex gap-0.5">
                {SECTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goToSection(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all hover:scale-110",
                      i === currentSectionIndex ? "w-6 bg-gradient-to-r from-indigo-500 to-violet-500" : 
                      isSectionComplete(s.id) ? "w-1.5 bg-emerald-400" : "w-1.5 bg-slate-300"
                    )} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold text-indigo-600">{progressPercent}%</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={onCancel} 
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main content - Flexible height with scroll indicator */}
          <PlayModeContent isTransitioning={isTransitioning} slideDirection={slideDirection}>
            <div className="max-w-2xl mx-auto">
              {/* Section header - Inline compact */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  {isSectionComplete(currentSection.id) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow border-2 border-white">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-slate-800">{currentSection.title}</h1>
                  <p className="text-sm text-slate-500">{currentSection.subtitle}</p>
                </div>
                {/* Status badge inline */}
                {isSectionComplete(currentSection.id) ? (
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    Complete
                  </span>
                ) : currentSection.isRequired ? (
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    Required
                  </span>
                ) : null}
              </div>

              {/* Content card - Full width */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-indigo-200/20 p-4 ring-1 ring-indigo-100/50">
                {renderPlayContent(currentSection)}
              </div>
            </div>
          </PlayModeContent>

          {/* Footer navigation - Compact */}
          <div className="relative z-10 px-4 py-3 bg-white/70 backdrop-blur-xl border-t border-white/50 flex-shrink-0">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={goPrev}
                disabled={currentSectionIndex === 0}
                className={cn(
                  "h-10 px-4 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl font-medium",
                  currentSectionIndex === 0 && "opacity-0 pointer-events-none"
                )}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>

              {currentSectionIndex < SECTIONS.length - 1 ? (
                <Button onClick={goNext} className="h-10 px-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-300/50 transition-all rounded-xl font-medium">
                  Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {isDraft && (
                    <Button
                      onClick={onSave}
                      disabled={isSaving}
                      variant="outline"
                      className="h-10 px-4 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Save Draft
                    </Button>
                  )}
                  {isDraft ? (
                    <Button
                      onClick={onPublish}
                      disabled={isPublishing || !canPublish}
                      className={cn(
                        "h-10 px-6 shadow-lg transition-all rounded-xl font-medium",
                        canPublish 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-300/50" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      )}
                    >
                      {isPublishing ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Publishing...</> : <>Publish Listing</>}
                    </Button>
                  ) : (
                    <Button
                      onClick={onSave}
                      disabled={isSaving}
                      className="h-10 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-300/50 transition-all rounded-xl font-medium"
                    >
                      {isSaving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-1.5" /> Update Listing</>}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============ OVERVIEW MODE ============
  const completedCount = SECTIONS.filter(s => isSectionComplete(s.id)).length;
  const progressPercent = Math.round((completedCount / SECTIONS.length) * 100);
  const requiredCount = SECTIONS.filter(s => s.isRequired).length;
  const requiredComplete = SECTIONS.filter(s => s.isRequired && isSectionComplete(s.id)).length;

  // Helper to render section content
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'photos':
        return <ImageUpload images={editForm?.images || []} onChange={(images) => setEditForm((p: any) => ({ ...p, images }))} onPendingChanges={setPendingImageChanges} maxImages={20} />;
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Service Name</Label>
              <Input value={editForm?.name || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g., Premium Wedding Photography" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea value={editForm?.description || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} placeholder="Describe your service..." rows={3} className="resize-none" />
            </div>
          </div>
        );
      case 'highlights':
        return (
          <div className="space-y-3">
            {(editForm?.highlights?.length || 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(editForm?.highlights || []).map((h: string, i: number) => (
                  <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm border border-indigo-100">
                    <span>{h}</span>
                    <button onClick={() => onRemoveHighlight(i)} className="text-indigo-400 hover:text-indigo-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No highlights added yet</p>
            )}
            {showHighlightInput ? (
              <div className="flex gap-2">
                <Input value={draftHighlight} onChange={(e) => setDraftHighlight(e.target.value)} placeholder="e.g., 10+ years experience" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight()} autoFocus />
                <Button size="sm" onClick={handleAddHighlight} className="bg-indigo-600 hover:bg-indigo-700"><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowHighlightInput(false); setDraftHighlight(''); }}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowHighlightInput(true)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"><Plus className="h-4 w-4 mr-1" /> Add highlight</Button>
            )}
          </div>
        );
      case 'pricing':
        return <CategoryFieldRenderer categoryId={listing?.categoryId || 'other'} values={categorySpecificData} onChange={setCategorySpecificData} hidePackageDetails={true} />;
      case 'extras':
        return (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Additional Notes</Label>
            <Textarea value={editForm?.customNotes || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, customNotes: e.target.value }))} placeholder="Any additional information..." rows={3} className="resize-none" />
          </div>
        );
      default:
        return null;
    }
  };

  // Render a section card
  const renderSectionCard = (section: Section, index: number) => {
    const isExpanded = expandedSections.has(section.id);
    const isComplete = isSectionComplete(section.id);
    const Icon = section.icon;
    
    return (
      <div 
        key={section.id} 
        className={cn(
          "bg-white rounded-xl border overflow-hidden transition-all shadow-sm",
          isExpanded ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
        )}
      >
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              isComplete ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white" : "bg-slate-100 text-slate-500"
            )}>
              {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-800 text-sm truncate">{section.title}</span>
                {section.isRequired && !isComplete && (
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-rose-100 text-rose-600 rounded">Required</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">{section.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentSectionIndex(index); setIsPlayMode(true); }}
              className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
              title="Focus edit"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
          </div>
        </button>
        <div className={cn("grid transition-all duration-200", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50/50">
              {renderSectionContent(section.id)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-500 hover:text-slate-900 -ml-2 rounded-full w-8 h-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-slate-900">{editForm?.name || 'Edit Listing'}</h1>
              <p className="text-xs text-slate-500">{isDraft ? 'Draft' : isActive ? 'Live' : 'Inactive'} • {completedCount}/{SECTIONS.length} sections</p>
            </div>
          </div>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" />{isDraft ? 'Save Draft' : 'Update Listing'}</>}
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-sm font-semibold text-indigo-600 min-w-[45px]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
        {SECTIONS.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const isComplete = isSectionComplete(section.id);
          const Icon = section.icon;
          
          return (
            <div 
              key={section.id} 
              className={cn(
                "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200",
                isExpanded ? "border-indigo-300 shadow-indigo-100/50" : "border-slate-200/80"
              )}
            >
              <div className="px-4 py-3 flex items-center gap-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex-1 flex items-center gap-4 text-left"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                    isComplete 
                      ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{section.title}</span>
                      {section.isRequired && !isComplete && (
                        <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{section.subtitle}</p>
                  </div>
                </button>
                
                {/* Expand icon - click opens focus mode on mobile hint */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setCurrentSectionIndex(index); setIsPlayMode(true); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="Open fullscreen editor"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => toggleSection(section.id)} 
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")} />
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <div className="pt-4">
                    {renderSectionContent(section.id)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Next action button */}
        <div className="pt-4 space-y-3">
          <Button 
            onClick={() => { 
              const firstIncomplete = SECTIONS.findIndex(s => !isSectionComplete(s.id));
              setCurrentSectionIndex(firstIncomplete >= 0 ? firstIncomplete : 0); 
              setIsPlayMode(true); 
            }} 
            variant="outline"
            className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl text-sm font-medium group"
          >
            <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
            {completedCount === SECTIONS.length 
              ? "Review All Sections" 
              : `Complete ${SECTIONS.find(s => !isSectionComplete(s.id))?.title || 'Next Section'}`
            }
          </Button>

          {isDraft ? (
            <>
              <Button
                onClick={onPublish}
                disabled={isPublishing || !canPublish}
                className={cn(
                  "w-full h-14 shadow-lg transition-all rounded-2xl text-base font-medium",
                  canPublish 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-200/50" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                {isPublishing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Publishing...</> : 'Publish Listing'}
              </Button>
              {!canPublish && (
                <p className="text-xs text-center text-slate-400">Complete all required sections to publish</p>
              )}
            </>
          ) : (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl shadow-indigo-200/50 transition-all rounded-2xl text-base font-medium"
            >
              {isSaving ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</> : <><Save className="h-5 w-5 mr-2" /> Update Listing</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
