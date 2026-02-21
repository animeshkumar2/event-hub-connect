import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { X, ArrowRight, Sparkles, Camera, Palette, UtensilsCrossed, Building2, Music, Lightbulb } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const LISTING_GUIDE_KEY = 'vendor_listing_guide_seen';
export const LISTING_GUIDE_TRIGGER = 'vendor_listing_guide_trigger';
const LISTING_GUIDE_PHASE = 'vendor_listing_guide_phase';

/**
 * Phases of the listing creation guide:
 *
 * transition      → "Profile done! Let's create a listing" modal
 * click-add       → Highlight "Add Single Service" button
 * template-choice → "Use a Template" hint in modal
 * pick-category   → Pick your category
 * pick-template   → Select a template
 * pick-events     → Select event types
 * edit-photos     → On ListingPreview, highlight Photos section
 * edit-name       → Highlight Name field
 * edit-pricing    → Highlight Category Details / Pricing section
 * edit-more       → Point at collapsible sections — edit other details
 * save-draft      → Point at Save Draft button
 * publish         → Highlight publish button
 * done            → Completed
 */
type Phase =
  | 'transition'
  | 'click-add'
  | 'template-choice'
  | 'pick-category'
  | 'pick-template'
  | 'pick-events'
  | 'edit-photos'
  | 'edit-name'
  | 'edit-pricing'
  | 'edit-more'
  | 'save-draft'
  | 'publish'
  | 'done';

// Category-specific tips
const CATEGORY_TIPS: Record<string, { icon: any; tip: string }> = {
  'photo-video': { icon: Camera, tip: 'Start with your most popular package — like "Wedding Day Photography".' },
  'decorator': { icon: Palette, tip: 'List your signature décor setup — stage, entrance, or full venue.' },
  'caterer': { icon: UtensilsCrossed, tip: 'Start with your best-selling menu — veg buffet or live counters.' },
  'venue': { icon: Building2, tip: 'List your venue with capacity, amenities, and rental details.' },
  'mua': { icon: Sparkles, tip: 'Lead with your bridal package — most searched by customers.' },
  'dj-entertainment': { icon: Music, tip: 'List your most booked gig — wedding sangeet or club night.' },
  'sound-lights': { icon: Lightbulb, tip: 'Start with a complete sound & light package.' },
  'artists': { icon: Music, tip: 'Showcase your best performance type — solo or band.' },
  'event-planner': { icon: Sparkles, tip: 'You have all categories! Start with your strongest service.' },
};

// Phase hint configs
// selector: CSS selector for the target element to highlight (ProfileGuide-style spotlight)
// tip: tooltip placement relative to target
const PHASE_HINTS: Record<string, {
  title: string;
  desc: string;
  selector?: string;
  tip?: 'below' | 'right' | 'above';
}> = {
  'click-add': {
    title: 'Tap "Add Single Service"',
    desc: 'This opens the template picker. Templates save you time — just add photos and customize.',
    selector: '[data-listing-guide="listing-add-service"]',
    tip: 'below',
  },
  'template-choice': {
    title: 'Use a Template',
    desc: 'Templates come pre-filled with descriptions, highlights, and pricing. Just pick one and customize!',
  },
  'pick-category': {
    title: 'Pick your category',
    desc: 'Select the type of service you want to list. Each category has ready-made templates.',
  },
  'pick-template': {
    title: 'Choose a template',
    desc: 'Pick the one closest to what you offer. You can edit everything later.',
  },
  'pick-events': {
    title: 'Select event types & create',
    desc: 'Choose which events this service is for, then tap the create button at the bottom.',
  },
  'edit-photos': {
    title: 'Add your photos',
    desc: 'Upload at least 1 photo to showcase your service. Great photos get more bookings!',
    selector: '[data-listing-guide="preview-photos"]',
    tip: 'below',
  },
  'edit-name': {
    title: 'Rename your service',
    desc: 'Give it a unique name that describes what you offer. Customers search by name.',
    selector: '[data-listing-guide="preview-name"]',
    tip: 'below',
  },
  'edit-pricing': {
    title: 'Set your pricing',
    desc: 'Fill in your rates. This is what customers see first — make it competitive!',
    selector: '[data-listing-guide="preview-pricing"] input',
    tip: 'right',
  },
  'edit-more': {
    title: 'Customize your listing',
    desc: 'Your entire listing is now editable. Scroll through to update service details, event types, inclusions, and notes — everything is open for you.',
  },
  'save-draft': {
    title: 'Save your draft',
    desc: 'Make sure all required fields are filled, then hit Save Draft in the top bar.',
  },
  'publish': {
    title: 'Ready to go live!',
    desc: 'All requirements met. Hit Publish to make your listing visible to customers.',
    selector: '[data-listing-guide="preview-publish"]',
    tip: 'below',
  },
};

const PHASE_ORDER: Phase[] = ['click-add', 'template-choice', 'pick-category', 'pick-template', 'pick-events', 'edit-photos', 'edit-name', 'edit-pricing', 'edit-more', 'save-draft', 'publish'];

interface Rect { top: number; left: number; width: number; height: number; }

interface ListingGuideProps {
  vendorCategoryId?: string;
}

export const ListingGuide = ({ vendorCategoryId: propCategoryId }: ListingGuideProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>(() => {
    const saved = localStorage.getItem(LISTING_GUIDE_PHASE);
    return (saved as Phase) || 'done';
  });
  const [showTransition, setShowTransition] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [stepFeedback, setStepFeedback] = useState('');
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [fade, setFade] = useState(false);
  const rafRef = useRef(0);

  const vendorCategoryId = propCategoryId || localStorage.getItem('vendor_category_id') || '';
  const catTip = CATEGORY_TIPS[vendorCategoryId] || CATEGORY_TIPS['event-planner'];
  const CatIcon = catTip.icon;

  // Persist phase
  useEffect(() => {
    if (phase === 'done') {
      localStorage.removeItem(LISTING_GUIDE_PHASE);
    } else {
      localStorage.setItem(LISTING_GUIDE_PHASE, phase);
    }
  }, [phase]);

  // Trigger path 1: from ProfileGuide completion (shows transition screen)
  const activateFromTrigger = useCallback(() => {
    if (localStorage.getItem(LISTING_GUIDE_TRIGGER) === 'true' && localStorage.getItem(LISTING_GUIDE_KEY) !== 'true') {
      localStorage.removeItem(LISTING_GUIDE_TRIGGER);
      setPhase('transition');
      setShowTransition(true);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(activateFromTrigger, 500);
    return () => clearTimeout(t);
  }, [activateFromTrigger]);

  useEffect(() => {
    const handler = () => setTimeout(activateFromTrigger, 600);
    window.addEventListener('listing-guide-trigger', handler);

    // Manual restart from "Take a tour" button — skip transition, go straight to step 1
    const restartHandler = () => {
      setShowTransition(false);
      setPhase('click-add');
      setHintVisible(true);
    };
    window.addEventListener('listing-guide-restart', restartHandler);

    // Poll localStorage as a fallback — catches triggers from ProfileGuide
    // even if the custom event was missed (e.g. timing issues, React re-renders)
    const pollInterval = setInterval(() => {
      if (localStorage.getItem(LISTING_GUIDE_TRIGGER) === 'true' && localStorage.getItem(LISTING_GUIDE_KEY) !== 'true') {
        activateFromTrigger();
      }
    }, 2000);

    return () => {
      window.removeEventListener('listing-guide-trigger', handler);
      window.removeEventListener('listing-guide-restart', restartHandler);
      clearInterval(pollInterval);
    };
  }, [activateFromTrigger]);

  // Trigger path 2: vendor visits Listings page directly for the first time
  // (no transition screen — just start guiding from click-add)
  // Uses MutationObserver to wait for the button to appear (handles slow data loads / refresh)
  useEffect(() => {
    // Skip if guide is already active or completed
    if (phase !== 'done') return;
    if (localStorage.getItem(LISTING_GUIDE_KEY) === 'true') return;
    // Skip if profile guide trigger is pending (path 1 will handle it)
    if (localStorage.getItem(LISTING_GUIDE_TRIGGER) === 'true') return;
    // Only on listings page (not preview subpages)
    if (location.pathname !== '/vendor/listings') return;

    let cancelled = false;

    const tryActivate = () => {
      if (cancelled) return false;
      // Re-check localStorage in case it changed between effect setup and observer firing
      if (localStorage.getItem(LISTING_GUIDE_KEY) === 'true') return false;
      // Skip if vendor already has listings (not a first-timer)
      const countEl = document.querySelector('[data-listing-count]');
      if (countEl) {
        const count = parseInt(countEl.getAttribute('data-listing-count') || '0', 10);
        if (count > 0) {
          localStorage.setItem(LISTING_GUIDE_KEY, 'true');
          return false;
        }
      }
      const addBtn = document.querySelector('[data-listing-guide="listing-add-service"]');
      if (addBtn) {
        setPhase('click-add');
        setHintVisible(true);
        return true;
      }
      return false;
    };

    // Try immediately in case button is already rendered
    if (tryActivate()) return;

    // Otherwise observe DOM for the button to appear (covers refresh / slow load)
    const observer = new MutationObserver(() => {
      if (tryActivate()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also poll every 2s as a fallback (some mutations may not trigger observer)
    const interval = setInterval(() => {
      if (tryActivate()) {
        observer.disconnect();
        clearInterval(interval);
      }
    }, 2000);

    // Safety timeout — stop watching after 20s
    const timeout = setTimeout(() => { observer.disconnect(); clearInterval(interval); }, 20000);

    return () => {
      cancelled = true;
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [location.pathname, phase]);

  // Resume on navigation (e.g. after template creates draft → preview page)
  useEffect(() => {
    if (phase === 'done' || phase === 'transition') return;
    if (localStorage.getItem(LISTING_GUIDE_KEY) === 'true') { setPhase('done'); return; }
    if (location.pathname.includes('/vendor/listings/preview/')) {
      if (!['edit-photos', 'edit-name', 'edit-pricing', 'edit-more', 'save-draft', 'publish'].includes(phase)) setPhase('edit-photos');
    }
    if (location.pathname === '/vendor/listings' && ['edit-photos', 'edit-name', 'edit-pricing', 'edit-more', 'save-draft', 'publish'].includes(phase)) {
      // Published and came back
      setPhase('done');
      localStorage.setItem(LISTING_GUIDE_KEY, 'true');
      setHintVisible(false);
    }
  }, [location.pathname]);

  // Fade on phase change
  useEffect(() => {
    if (hintVisible) { setFade(true); const t = setTimeout(() => setFade(false), 150); return () => clearTimeout(t); }
  }, [phase]);

  useEffect(() => {
    setStepFeedback('');
  }, [phase]);

  useEffect(() => {
    if (!location.pathname.includes('/vendor/listings/preview/')) return;
    if (phase !== 'edit-more' && phase !== 'save-draft') return;

    window.dispatchEvent(new CustomEvent('listing-guide:enter-edit-mode'));

    const expand = () => window.dispatchEvent(new CustomEvent('listing-guide:expand-all-details'));

    if (phase === 'edit-more') {
      const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      const t1 = setTimeout(() => { expand(); scrollTop(); }, 100);
      const t2 = setTimeout(expand, 500);
      const t3 = setTimeout(expand, 1000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    // save-draft: enter edit mode + expand, but don't scroll to top
    const t1 = setTimeout(expand, 100);
    const t2 = setTimeout(expand, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, location.pathname]);

  // Track target element for phases that have a selector (ProfileGuide-style rAF tracking)
  const track = useCallback(() => {
    const hint = PHASE_HINTS[phase];
    if (!hint?.selector || !hintVisible) { setTargetRect(null); return; }
    const el = document.querySelector(hint.selector);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect(prev => {
        if (!prev || Math.abs(prev.top - r.top) > 0.5 || Math.abs(prev.left - r.left) > 0.5)
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        return prev;
      });
    } else {
      setTargetRect(null);
    }
    rafRef.current = requestAnimationFrame(track);
  }, [phase, hintVisible]);

  useEffect(() => {
    if (hintVisible && PHASE_HINTS[phase]?.selector) {
      rafRef.current = requestAnimationFrame(track);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [hintVisible, phase, track]);

  // Elevate target element above tint layer (same as ProfileGuide)
  useEffect(() => {
    // Clean up previous
    document.querySelectorAll('[data-listing-elevated]').forEach(el => {
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('position');
      el.removeAttribute('data-listing-elevated');
    });
    if (!hintVisible || phase === 'done' || phase === 'transition') return;
    const hint = PHASE_HINTS[phase];
    if (!hint?.selector) return;
    const el = document.querySelector(hint.selector);
    if (el) {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      if (computed.position === 'static') htmlEl.style.position = 'relative';
      htmlEl.style.zIndex = '52';
      htmlEl.setAttribute('data-listing-elevated', 'true');
    }
    return () => {
      document.querySelectorAll('[data-listing-elevated]').forEach(el => {
        (el as HTMLElement).style.removeProperty('z-index');
        (el as HTMLElement).style.removeProperty('position');
        el.removeAttribute('data-listing-elevated');
      });
    };
  }, [hintVisible, phase]);

  // Auto-advance phases by watching DOM
  useEffect(() => {
    if (phase === 'done' || phase === 'transition') return;

    const checkPhase = () => {
      if (location.pathname === '/vendor/listings') {
        // Collect text from ALL headings inside the dialog (sr-only DialogTitle + visible h2s)
        const dialogHeadings = document.querySelectorAll('[role="dialog"] h2, [role="dialog"] [class*="DialogTitle"]');
        let dialogText = '';
        dialogHeadings.forEach(el => { dialogText += ' ' + (el.textContent?.toLowerCase() || ''); });
        const hasDialog = dialogHeadings.length > 0;

        if (phase === 'click-add') {
          if (document.querySelector('[data-listing-guide="listing-add-service"]')) setHintVisible(true);
          if (hasDialog) { setPhase('template-choice'); setHintVisible(true); }
        }
        if (phase === 'template-choice') {
          if (dialogText.includes('create new service') || dialogText.includes('how would you like')) setHintVisible(true);
          if (dialogText.includes('select category')) { setPhase('pick-category'); setHintVisible(true); }
          // Detect "Start from Scratch" — blank form wizard opens
          const blankFormDesc = document.querySelector('[role="dialog"] [class*="DialogDescription"]');
          const blankText = blankFormDesc?.textContent?.toLowerCase() || '';
          if (blankText.includes('add details about your service') || blankText.includes('bundle your services')) {
            setPhase('edit-photos'); setHintVisible(true);
          }
        }
        if (phase === 'pick-category') {
          if (dialogText.includes('select category')) setHintVisible(true);
          if (dialogText.includes('choose a template') ||
              (hasDialog && !dialogText.includes('select category') && !dialogText.includes('create new') && !dialogText.includes('select event'))) {
            const templateBtns = document.querySelectorAll('[role="dialog"] button[class*="rounded-xl"]');
            if (templateBtns.length > 2) { setPhase('pick-template'); setHintVisible(true); }
          }
        }
        if (phase === 'pick-template') {
          setHintVisible(true);
          if (dialogText.includes('select event')) { setPhase('pick-events'); setHintVisible(true); }
        }
        if (phase === 'pick-events') {
          if (dialogText.includes('select event')) setHintVisible(true);
          if (!hasDialog) setHintVisible(false);
        }
      }
      if (location.pathname.includes('/vendor/listings/preview/')) {
        if (['pick-events', 'pick-template', 'pick-category', 'template-choice'].includes(phase)) setPhase('edit-photos');
        if (['edit-photos', 'edit-name', 'edit-pricing', 'edit-more', 'save-draft'].includes(phase)) {
          setHintVisible(true);
        }
        if (phase === 'publish') {
          setHintVisible(true);
        }
      }
    };

    const interval = setInterval(checkPhase, 800);
    const observer = new MutationObserver(() => setTimeout(checkPhase, 200));
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(checkPhase, 500);
    return () => { clearInterval(interval); observer.disconnect(); };
  }, [phase, location.pathname]);

  // Auto-advance from save-draft → publish after successful save
  useEffect(() => {
    if (phase !== 'save-draft') return;
    const handler = () => {
      setPhase('publish');
      setHintVisible(true);
      setTimeout(() => {
        const publishBtn = document.querySelector('[data-listing-guide="preview-publish"]');
        if (publishBtn) publishBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };
    window.addEventListener('listing-guide:advance-to-publish', handler);
    return () => window.removeEventListener('listing-guide:advance-to-publish', handler);
  }, [phase]);

  // Keyboard
  useEffect(() => {
    if (phase === 'done' && !showTransition) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, showTransition]);

  const handleStartGuide = () => {
    setShowTransition(false);
    setPhase('click-add');
    navigate('/vendor/listings');
    setTimeout(() => setHintVisible(true), 1500);
  };

  const dismiss = () => {
    document.querySelectorAll('[data-listing-elevated]').forEach(el => {
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('position');
      el.removeAttribute('data-listing-elevated');
    });
    setPhase('done');
    setShowTransition(false);
    setHintVisible(false);
    localStorage.setItem(LISTING_GUIDE_KEY, 'true');
    localStorage.removeItem(LISTING_GUIDE_PHASE);
  };

  // Preview sub-step navigation (edit-photos → edit-name → edit-pricing → publish)
  const PREVIEW_PHASES: Phase[] = ['edit-photos', 'edit-name', 'edit-pricing', 'edit-more', 'save-draft', 'publish'];
  const isPreviewPhase = PREVIEW_PHASES.includes(phase);
  const previewIdx = PREVIEW_PHASES.indexOf(phase);
  const getPreviewBlockReason = useCallback(() => {
    if (phase === 'edit-name') {
      const nameInput = document.querySelector('[data-listing-guide="preview-name"] input') as HTMLInputElement | null;
      const originalTemplateName = nameInput?.getAttribute('data-template-original-name') || '';
      if (!nameInput) return 'Tap Edit first so you can rename this service.';
      if (!nameInput.value.trim()) return 'Add a service name before moving to the next step.';
      if (originalTemplateName && nameInput.value.trim() === originalTemplateName.trim()) {
        return 'Rename the service (different from template name) before continuing.';
      }
    }
    if (phase === 'edit-pricing') {
      const pricingCard = document.querySelector('[data-listing-guide="preview-pricing"]');
      if (!pricingCard) return 'Tap Edit first to set your pricing.';
      const allInputs = pricingCard.querySelectorAll('input');
      let hasPrice = false;
      allInputs.forEach(inp => {
        const el = inp as HTMLInputElement;
        if (el.type === 'number' || el.type === 'text') {
          const val = parseFloat(el.value);
          if (val > 0) hasPrice = true;
        }
      });
      if (!hasPrice) return 'Enter a price before moving to the next step.';
    }
    if (phase === 'edit-more' || phase === 'save-draft') {
      const venueWarningEl = document.querySelector('[data-listing-guide="venue-location-missing"]');
      if (venueWarningEl) {
        return 'Set the venue location first. Scroll to Service Details to add it.';
      }
    }
    return '';
  }, [phase]);

  const nextPreviewStep = () => {
    const blockReason = getPreviewBlockReason();
    if (blockReason) { setStepFeedback(blockReason); return; }
    setStepFeedback('');
    if (previewIdx >= PREVIEW_PHASES.length - 1) {
      // Last step — dismiss the guide
      dismiss();
    } else {
      const next = PREVIEW_PHASES[previewIdx + 1];
      setPhase(next);
      // Scroll next target into view
      const nextHint = PHASE_HINTS[next];
      if (nextHint?.selector) {
        const el = document.querySelector(nextHint.selector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const prevPreviewStep = () => {
    if (previewIdx > 0) {
      const prev = PREVIEW_PHASES[previewIdx - 1];
      setPhase(prev);
      const prevHint = PHASE_HINTS[prev];
      if (prevHint?.selector) {
        const el = document.querySelector(prevHint.selector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // === RENDER ===

  if (phase === 'done' && !showTransition) return null;

  // Transition screen
  if (showTransition || phase === 'transition') {
    return createPortal(
      <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Listing guide">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className={cn(
            "bg-card border border-border rounded-2xl shadow-xl max-w-[400px] w-full overflow-hidden",
            "animate-in fade-in slide-in-from-bottom-4 duration-300"
          )}>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-[#5950b3]" />
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Profile's looking good!</h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Now let's create your first listing so customers can find and book you.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <CatIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Tip for you</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{catTip.tip}</p>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Button onClick={handleStartGuide} className="w-full h-10 bg-[#5950b3] hover:bg-[#4a42a0] text-white font-medium rounded-xl">
                  Let's create a listing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                  I'll do it later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!hintVisible) return null;
  const hint = PHASE_HINTS[phase];
  if (!hint) return null;

  const currentIdx = PHASE_ORDER.indexOf(phase);
  const totalPhases = PHASE_ORDER.length;
  const previewBlockReason = isPreviewPhase ? getPreviewBlockReason() : '';
  const hasTarget = !!hint.selector && !!targetRect;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const isMobile = vw < 640;
  const TIP_W = isMobile ? Math.min(vw - 24, 240) : 240;
  const GAP = isMobile ? 10 : 14;

  // === TARGET MODE (like ProfileGuide) — tint + arrow + elevated target ===
  if (hasTarget && targetRect) {
    const rawTipDir = hint.tip || 'below';
    const tipDir = isMobile && rawTipDir === 'right' ? 'below' : rawTipDir;
    const effectiveHeight = Math.min(targetRect.height, 200);
    let tipTop = 0, tipLeft = 0;
    if (tipDir === 'right') {
      tipTop = targetRect.top + effectiveHeight / 2 - 70;
      tipLeft = targetRect.left + targetRect.width + GAP;
      if (tipLeft + TIP_W > vw - 8) { tipLeft = targetRect.left - TIP_W - GAP; }
      if (tipLeft < 8) { tipTop = targetRect.top + effectiveHeight + GAP; tipLeft = targetRect.left; }
    } else if (tipDir === 'below') {
      tipTop = targetRect.top + effectiveHeight + GAP;
      tipLeft = targetRect.left + targetRect.width / 2 - TIP_W / 2;
    } else {
      tipTop = targetRect.top - GAP - 140;
      tipLeft = targetRect.left + targetRect.width / 2 - TIP_W / 2;
      if (tipTop < 8) { tipTop = targetRect.top + effectiveHeight + GAP; }
    }
    if (tipLeft < 8) tipLeft = 8;
    if (tipLeft + TIP_W > vw - 8) tipLeft = vw - 8 - TIP_W;
    if (tipTop < 8) tipTop = 8;
    if (tipTop > vh - 160) tipTop = vh - 160;

    let arrowTop = 0, arrowLeft = 0, arrowChar = '▲';
    if (tipDir === 'right') {
      arrowTop = targetRect.top + effectiveHeight / 2 - 8;
      arrowLeft = targetRect.left + targetRect.width + 3;
      arrowChar = '◀';
      if (targetRect.left + targetRect.width + GAP + TIP_W > vw - 8) { arrowLeft = targetRect.left - 14; arrowChar = '▶'; }
    } else if (tipDir === 'below') {
      arrowTop = targetRect.top + effectiveHeight + 2;
      arrowLeft = targetRect.left + targetRect.width / 2 - 8;
      arrowChar = '▲';
    } else {
      arrowTop = targetRect.top - 18;
      arrowLeft = targetRect.left + targetRect.width / 2 - 8;
      arrowChar = '▼';
      if (targetRect.top - GAP - 140 < 8) { arrowTop = targetRect.top + effectiveHeight + 2; arrowChar = '▲'; }
    }

    return createPortal(
      <>
        <style>{`@keyframes lg-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes lg-bounce-x { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }`}</style>

        {/* Tint layer — blocks clicks on everything except elevated target */}
        <div className="fixed inset-0 bg-black/20" style={{ zIndex: 50 }} />

        {/* Bouncing arrow */}
        <div
          className="fixed pointer-events-none text-[#5950b3] text-sm font-bold"
          style={{
            top: arrowTop, left: arrowLeft, zIndex: 9999,
            animation: tipDir === 'right' ? 'lg-bounce-x 0.8s ease-in-out infinite' : 'lg-bounce 0.8s ease-in-out infinite',
          }}
        >{arrowChar}</div>

        {/* Tooltip — on mobile, render as a top bar instead of a positioned card */}
        {isMobile ? (
          <div
            className={cn(
              "fixed top-0 left-0 right-0",
              "transition-opacity duration-150",
              fade ? "opacity-0" : "opacity-100"
            )}
            style={{ zIndex: 9999 }}
          >
            <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${((currentIdx + 1) / totalPhases) * 100}%` }} /></div>
            <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border/40 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-medium text-[#5950b3] bg-[#5950b3]/10 px-1.5 py-0.5 rounded flex-shrink-0">{currentIdx + 1}/{totalPhases}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-xs leading-tight truncate">{hint.title}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{hint.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPreviewPhase ? (
                    <>
                      {previewIdx > 0 && <button onClick={prevPreviewStep} className="text-[10px] text-muted-foreground px-1.5 py-1 rounded hover:bg-muted min-h-[28px]">Back</button>}
                      <button
                        onClick={nextPreviewStep}
                        disabled={!!previewBlockReason}
                        className={cn(
                          "text-[10px] font-medium px-2.5 py-1 rounded-md min-h-[28px]",
                          previewBlockReason
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "text-white bg-[#5950b3] hover:bg-[#4a42a0]"
                        )}
                      >
                        {previewIdx >= PREVIEW_PHASES.length - 1 ? 'Done' : 'Next'}
                      </button>
                    </>
                  ) : null}
                  <button onClick={dismiss} className="p-1 rounded hover:bg-muted text-muted-foreground min-h-[28px] min-w-[28px] flex items-center justify-center" aria-label="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {isPreviewPhase && (previewBlockReason || stepFeedback) && (
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1">
                  {previewBlockReason || stepFeedback}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "fixed bg-white dark:bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden",
              "transition-opacity duration-150",
              fade ? "opacity-0" : "opacity-100"
            )}
            style={{ top: tipTop, left: tipLeft, width: TIP_W, zIndex: 9999 }}
          >
            <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${((currentIdx + 1) / totalPhases) * 100}%` }} /></div>
            <div className="p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-[10px] text-muted-foreground">{currentIdx + 1}/{totalPhases}</p>
                  <h3 className="font-semibold text-foreground text-xs leading-tight">{hint.title}</h3>
                </div>
                <button onClick={dismiss} className="p-1 rounded hover:bg-muted text-muted-foreground min-h-[24px] min-w-[24px] flex items-center justify-center" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{hint.desc}</p>
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex gap-[3px]">
                  {PHASE_ORDER.map((_, i) => (
                    <div key={i} className={cn("h-[2px] rounded-full", i === currentIdx ? "w-2.5 bg-[#5950b3]" : i < currentIdx ? "w-1 bg-[#5950b3]/40" : "w-1 bg-border")} />
                  ))}
                </div>
                {isPreviewPhase ? (
                  <div className="flex gap-1.5">
                    {previewIdx > 0 && <button onClick={prevPreviewStep} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted min-h-[28px] min-w-[36px]">Back</button>}
                    <button
                      onClick={nextPreviewStep}
                      disabled={!!previewBlockReason}
                      className={cn(
                        "text-[11px] font-medium px-3 py-1.5 rounded-md min-h-[28px]",
                        previewBlockReason
                          ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                          : "text-white bg-[#5950b3] hover:bg-[#4a42a0]"
                      )}
                    >
                      {previewIdx >= PREVIEW_PHASES.length - 1 ? 'Done' : 'Next'}
                    </button>
                  </div>
                ) : (
                  <button onClick={dismiss} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted min-h-[28px]">Skip</button>
                )}
              </div>
              {isPreviewPhase && (previewBlockReason || stepFeedback) && (
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                  {previewBlockReason || stepFeedback}
                </p>
              )}
            </div>
          </div>
        )}
      </>,
      document.body
    );
  }

  // === EDIT-MORE & SAVE-DRAFT: slim sticky bottom bar — no overlay, full page interactive ===
  if (phase === 'edit-more' || phase === 'save-draft') {
    const barBlock = getPreviewBlockReason();
    const barHintText = phase === 'save-draft'
      ? (barBlock || 'Hit Save Draft in the top bar')
      : (barBlock || 'Scroll up & edit, then tap Next');
    const isSaveDraft = phase === 'save-draft';

    return createPortal(
      <>
        <style>{`@keyframes edit-more-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
@keyframes edit-more-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>

        {/* Bouncing arrow / warning pill above the bar */}
        <div
          className="fixed left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
          style={{ bottom: 44, zIndex: 10000, animation: 'edit-more-bounce 1s ease-in-out infinite' }}
        >
          <div className={cn("text-lg font-bold leading-none mb-0.5", barBlock ? "text-amber-500" : isSaveDraft ? "text-green-600" : "text-[#5950b3]")}>▲</div>
          <div className={cn(
            "px-3 py-1 rounded-full text-white text-[10px] font-semibold shadow-lg text-center max-w-[calc(100vw-32px)]",
            barBlock ? "bg-amber-500" : isSaveDraft ? "bg-green-600" : "bg-[#5950b3]"
          )}
            style={{ animation: 'edit-more-pulse 2s ease-in-out infinite' }}
          >
            {barHintText}
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ zIndex: 9999 }}
        >
          <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${((currentIdx + 1) / totalPhases) * 100}%` }} /></div>
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border/40 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-medium text-[#5950b3] bg-[#5950b3]/10 px-1.5 py-0.5 rounded">{currentIdx + 1}/{totalPhases}</span>
                <span className="text-xs font-semibold text-foreground truncate">{hint.title}</span>
                <span className="hidden sm:inline text-[11px] text-muted-foreground truncate">
                  {isSaveDraft ? '— complete required fields, then save' : '— scroll through & edit anything'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isSaveDraft ? (
                  <button onClick={dismiss} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center" aria-label="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    {previewIdx > 0 && (
                      <button onClick={prevPreviewStep} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-muted transition-colors min-h-[28px]">Back</button>
                    )}
                    <button
                      onClick={nextPreviewStep}
                      disabled={!!barBlock}
                      className={cn(
                        "text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors min-h-[28px]",
                        barBlock
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "text-white bg-[#5950b3] hover:bg-[#4a42a0]"
                      )}
                    >
                      Next
                    </button>
                    <button onClick={dismiss} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center" aria-label="Close">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }

  // === FLOATING MODE ===

  // Mobile: slim top bar that doesn't conflict with bottom-sheet dialogs
  if (isMobile) {
    return createPortal(
      <div
        className={cn(
          "fixed top-0 left-0 right-0 animate-in fade-in slide-in-from-top-2 duration-200",
          "transition-opacity duration-150",
          fade ? "opacity-0" : "opacity-100"
        )}
        style={{ zIndex: 9999 }}
      >
        <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${((currentIdx + 1) / totalPhases) * 100}%` }} /></div>
        <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-medium text-[#5950b3] bg-[#5950b3]/10 px-1.5 py-0.5 rounded flex-shrink-0">{currentIdx + 1}/{totalPhases}</span>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-xs leading-tight truncate">{hint.title}</h3>
                <p className="text-[10px] text-muted-foreground truncate">{hint.desc}</p>
              </div>
            </div>
            <button onClick={dismiss} className="p-1.5 rounded hover:bg-muted text-muted-foreground min-h-[28px] min-w-[28px] flex items-center justify-center flex-shrink-0" aria-label="Close">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: card tooltip bottom-right
  const floatTop = vh - 150;
  const floatLeft = Math.min(vw - TIP_W - 16, vw - 260);

  return createPortal(
    <div
      className={cn(
        "fixed bg-white dark:bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        "transition-opacity duration-150",
        fade ? "opacity-0" : "opacity-100"
      )}
      style={{ top: floatTop, left: floatLeft, width: TIP_W, zIndex: 9999 }}
    >
      <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${((currentIdx + 1) / totalPhases) * 100}%` }} /></div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="text-[10px] text-muted-foreground">{currentIdx + 1}/{totalPhases}</p>
            <h3 className="font-semibold text-foreground text-xs leading-tight">{hint.title}</h3>
          </div>
          <button onClick={dismiss} className="p-1 rounded hover:bg-muted text-muted-foreground min-h-[24px] min-w-[24px] flex items-center justify-center" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{hint.desc}</p>
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex gap-[3px]">
            {PHASE_ORDER.map((_, i) => (
              <div key={i} className={cn("h-[2px] rounded-full", i === currentIdx ? "w-2.5 bg-[#5950b3]" : i < currentIdx ? "w-1 bg-[#5950b3]/40" : "w-1 bg-border")} />
            ))}
          </div>
          <button onClick={dismiss} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted min-h-[28px]">Skip</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
