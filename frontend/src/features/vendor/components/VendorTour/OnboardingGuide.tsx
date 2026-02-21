import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/components/ui/button';
import { X, ChevronRight, ArrowRight, Building2, MapPin, Briefcase, Navigation } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const ONBOARDING_GUIDE_KEY = 'vendor_onboarding_guide_seen';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  placement: 'bottom' | 'right' | 'top';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: 'onboarding-step-1',
    title: 'Start with your business name',
    description: 'This is how customers will find and recognize you. Pick something memorable!',
    placement: 'bottom',
  },
  {
    target: 'onboarding-step-2',
    title: 'Select your city',
    description: 'We\'ll show your services to customers in your area.',
    placement: 'bottom',
  },
  {
    target: 'onboarding-step-3',
    title: 'Choose your profession',
    description: 'This determines what types of listings you can create.',
    placement: 'bottom',
  },
  {
    target: 'onboarding-step-4',
    title: 'Set your service area',
    description: 'Pin your location so nearby customers can find you easily.',
    placement: 'bottom',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const OnboardingGuide = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_GUIDE_KEY);
    // Always show the guide on the onboarding form — only skip if vendor already has a profile
    // (vendor_id being set means they completed onboarding)
    const hasProfile = !!localStorage.getItem('vendor_id');
    if (seen !== 'true' || !hasProfile) {
      // Reset the seen flag if vendor hasn't completed onboarding yet
      if (!hasProfile) localStorage.removeItem(ONBOARDING_GUIDE_KEY);
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const rafRef = useRef(0);

  // Continuously track target via rAF so tooltip follows even during scroll
  const track = useCallback(() => {
    if (!isActive || showWelcome) {
      setTargetRect(null);
      return;
    }
    const step = ONBOARDING_STEPS[currentStep];
    if (!step) { rafRef.current = requestAnimationFrame(track); return; }
    const el = document.querySelector(`[data-onboarding="${step.target}"]`);
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
  }, [isActive, currentStep, showWelcome]);

  useEffect(() => {
    if (isActive && !showWelcome) {
      // Scroll target into view on step change
      const step = ONBOARDING_STEPS[currentStep];
      if (step) {
        const el = document.querySelector(`[data-onboarding="${step.target}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      rafRef.current = requestAnimationFrame(track);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, currentStep, showWelcome, track]);

  useEffect(() => {
    if (isActive && !showWelcome) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 250);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, showWelcome]);

  useEffect(() => {
    if (!isActive && !showWelcome) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (showWelcome) handleStartGuide();
        else handleNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, showWelcome, currentStep]);

  const handleStartGuide = () => {
    setShowWelcome(false);
    setIsActive(true);
    setCurrentStep(0);
  };

  const handleDismiss = () => {
    setShowWelcome(false);
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(ONBOARDING_GUIDE_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep >= ONBOARDING_STEPS.length - 1) handleDismiss();
    else setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // Elevate target element above the overlay so it stays interactive
  useEffect(() => {
    if (!isActive || showWelcome) return;
    const step = ONBOARDING_STEPS[currentStep];
    if (!step) return;

    // Clean up previous elevated element
    document.querySelectorAll('[data-onboarding-elevated]').forEach(el => {
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('position');
      el.removeAttribute('data-onboarding-elevated');
    });

    const el = document.querySelector(`[data-onboarding="${step.target}"]`);
    if (el) {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      if (computed.position === 'static') htmlEl.style.position = 'relative';
      htmlEl.style.zIndex = '10001';
      htmlEl.setAttribute('data-onboarding-elevated', 'true');
    }

    return () => {
      document.querySelectorAll('[data-onboarding-elevated]').forEach(el => {
        (el as HTMLElement).style.removeProperty('z-index');
        (el as HTMLElement).style.removeProperty('position');
        el.removeAttribute('data-onboarding-elevated');
      });
    };
  }, [isActive, currentStep, showWelcome]);

  if (!showWelcome && !isActive) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !step) return {};
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const isMobile = vw < 640;
    const TOOLTIP_W = isMobile ? Math.min(vw - 24, 240) : 240;
    const TOOLTIP_H = 130;
    const GAP = isMobile ? 10 : 14;

    let top = targetRect.top - GAP - TOOLTIP_H;
    let left = isMobile
      ? (vw - TOOLTIP_W) / 2
      : targetRect.left + targetRect.width / 2 - TOOLTIP_W / 2;

    if (top < 8) {
      top = targetRect.top + targetRect.height + GAP;
    }

    if (left < 8) left = 8;
    if (left + TOOLTIP_W > vw - 8) left = vw - 8 - TOOLTIP_W;
    if (top > vh - 160) top = vh - 160;

    return { top, left, width: TOOLTIP_W };
  };

  // Arrow position — sits between tooltip and target
  const getArrowStyle = () => {
    if (!targetRect) return { top: 0, left: 0, char: '▼' as string };
    const TOOLTIP_H = 130;
    const GAP = 14;
    const isAbove = (targetRect.top - GAP - TOOLTIP_H) >= 8;
    if (isAbove) {
      // Tooltip is above → arrow points down, just above the target
      return {
        top: targetRect.top - GAP + 2,
        left: targetRect.left + targetRect.width / 2 - 6,
        char: '▼',
      };
    }
    // Tooltip is below → arrow points up, just below the target
    return {
      top: targetRect.top + targetRect.height + 2,
      left: targetRect.left + targetRect.width / 2 - 6,
      char: '▲',
    };
  };

  const overlay = (
    <div className="fixed inset-0 z-[10000] pointer-events-none" role="dialog" aria-modal="true" aria-label="Onboarding guide">
      {showWelcome && (
        <>
          <style>{`
@keyframes ob-float-1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,-8px) rotate(5deg); } }
@keyframes ob-float-2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-5px,6px) rotate(-4deg); } }
@keyframes ob-float-3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(4px,5px); } }
@keyframes ob-pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.8); opacity: 0; } }
          `}</style>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] pointer-events-auto" onClick={handleDismiss} />
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className={cn(
              "bg-white dark:bg-card border border-border/40 rounded-2xl shadow-2xl max-w-[400px] w-full overflow-hidden pointer-events-auto",
              "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400"
            )}>
              <div className="relative bg-gradient-to-br from-[#5950b3] via-[#6c63c7] to-[#8b7fdf] px-6 pt-7 pb-8 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-white/[0.06]" style={{ animation: 'ob-float-1 4s ease-in-out infinite' }} />
                  <div className="absolute bottom-2 left-6 w-10 h-10 rounded-full bg-white/[0.08]" style={{ animation: 'ob-float-2 5s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 right-4 w-6 h-6 rounded-full bg-white/[0.05]" style={{ animation: 'ob-float-3 3.5s ease-in-out infinite' }} />
                </div>

                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3 mx-auto">
                    <div className="absolute inset-0 rounded-2xl bg-white/10" style={{ animation: 'ob-pulse-ring 2.5s ease-out infinite' }} />
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Set up your profile
                  </h2>
                  <p className="text-sm text-white/75 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                    Quick guided setup — takes under a minute
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, label: 'Business name', color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
                    { icon: MapPin, label: 'Your city', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
                    { icon: Briefcase, label: 'Profession', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                    { icon: Navigation, label: 'Service area', color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/30">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", item.color)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-foreground/80">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-0.5">
                  <Button
                    onClick={handleStartGuide}
                    className="w-full h-11 bg-[#5950b3] hover:bg-[#4a42a0] active:scale-[0.98] text-white font-semibold rounded-xl shadow-md shadow-[#5950b3]/20 transition-all duration-150"
                  >
                    Walk me through it
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[36px]"
                  >
                    Skip, I'll fill it out myself
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step-by-step tooltips — ProfileGuide style */}
      {isActive && !showWelcome && (
        <>
          {/* Boost z-index of any Radix portaled dropdowns so they appear above the overlay */}
          <style>{`[data-radix-popper-content-wrapper] { z-index: 10003 !important; }
@keyframes onboarding-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>

          {/* Dim overlay — pointer-events:none so elevated target stays interactive */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-none"
            style={{ zIndex: 1 }}
          />

          {/* Bouncing arrow pointing at target */}
          {targetRect && (
            <div
              className="fixed pointer-events-none text-[#5950b3] text-sm font-bold"
              style={{
                top: getArrowStyle().top,
                left: getArrowStyle().left,
                zIndex: 10004,
                animation: 'onboarding-bounce 0.8s ease-in-out infinite',
              }}
            >
              {getArrowStyle().char}
            </div>
          )}

          {/* Compact tooltip — matches ProfileGuide style */}
          {targetRect && (
            <div
              ref={tooltipRef}
              className={cn(
                "fixed bg-white dark:bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden pointer-events-auto",
                "transition-opacity duration-150",
                isAnimating ? "opacity-0" : "opacity-100"
              )}
              style={{ ...getTooltipStyle(), zIndex: 10002 }}
            >
              <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{currentStep + 1}/{ONBOARDING_STEPS.length}</p>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">{step.title}</h3>
                  </div>
                  <button onClick={handleDismiss} className="p-1 rounded hover:bg-muted text-muted-foreground min-h-[24px] min-w-[24px] flex items-center justify-center" aria-label="Close guide"><X className="h-3.5 w-3.5" /></button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex gap-[3px]">
                    {ONBOARDING_STEPS.map((_, i) => (
                      <div key={i} className={cn("h-[2px] rounded-full", i === currentStep ? "w-2.5 bg-[#5950b3]" : i < currentStep ? "w-1 bg-[#5950b3]/40" : "w-1 bg-border")} />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {currentStep > 0 && <button onClick={handlePrev} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted min-h-[28px] min-w-[36px]">Back</button>}
                    <button onClick={handleNext} className="text-[11px] font-medium text-white bg-[#5950b3] hover:bg-[#4a42a0] px-3 py-1.5 rounded-md flex items-center gap-0.5 min-h-[28px]">
                      {currentStep >= ONBOARDING_STEPS.length - 1 ? 'Done' : 'Next'}{currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
};
