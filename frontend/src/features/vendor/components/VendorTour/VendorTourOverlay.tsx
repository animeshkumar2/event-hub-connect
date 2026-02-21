import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useVendorTour } from './VendorTourContext';
import { TOUR_STEPS } from './tourSteps';
import { Button } from '@/shared/components/ui/button';
import { ChevronRight, ChevronLeft, X, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const VendorTourOverlay = () => {
  const { isActive, currentStep, totalSteps, nextStep, prevStep, skipTour, endTour } = useVendorTour();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const measureTarget = useCallback(() => {
    if (!isActive || showWelcome || showComplete) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStep];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive, currentStep, showWelcome, showComplete]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget]);

  useEffect(() => {
    if (isActive) {
      setShowWelcome(true);
      setShowComplete(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && !showWelcome) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 250);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, showWelcome]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (showWelcome) setShowWelcome(false);
        else if (showComplete) endTour();
        else handleNext();
      }
      if (e.key === 'ArrowLeft' && !showWelcome && !showComplete) prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, showWelcome, showComplete, skipTour, prevStep, endTour]);

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) setShowComplete(true);
    else nextStep();
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step?.icon;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !step) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const padding = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    const tooltipW = isMobile ? Math.min(vw - 24, 300) : 300;

    let top = 0, left = 0;

    if (isMobile) {
      top = targetRect.top + targetRect.height + padding;
      left = (vw - tooltipW) / 2;
      if (top + 180 > vh) {
        top = targetRect.top - padding - 180;
      }
      if (top < 8) top = 8;
    } else {
      switch (step.placement) {
        case 'right':
          top = targetRect.top + targetRect.height / 2 - 80;
          left = targetRect.left + targetRect.width + padding;
          if (left + tooltipW > vw - 12) { left = targetRect.left - tooltipW - padding; }
          break;
        case 'bottom':
          top = targetRect.top + targetRect.height + padding;
          left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - 80;
          left = targetRect.left - tooltipW - padding;
          if (left < 12) { left = targetRect.left + targetRect.width + padding; }
          break;
        case 'top':
          top = targetRect.top - padding - 180;
          left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
          if (top < 8) { top = targetRect.top + targetRect.height + padding; }
          break;
        default:
          top = targetRect.top + targetRect.height / 2 - 80;
          left = targetRect.left + targetRect.width + padding;
          break;
      }
    }

    if (left < 8) left = 8;
    if (left + tooltipW > vw - 8) left = vw - 8 - tooltipW;
    if (top < 8) top = 8;
    if (top > vh - 160) top = vh - 160;

    return { top, left, width: tooltipW };
  };

  const overlay = (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Vendor dashboard tour">
      {/* Welcome */}
      {showWelcome && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={cn(
              "bg-card border border-border rounded-2xl shadow-xl max-w-[380px] w-full overflow-hidden",
              "animate-in fade-in slide-in-from-bottom-4 duration-300"
            )}>
              <div className="h-1 bg-gradient-to-r from-[#5950b3] to-[#7867dc]" />
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Quick tour of your dashboard
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    We'll walk you through the key sections so you know where everything is. Takes about 30 seconds.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    onClick={() => setShowWelcome(false)}
                    className="w-full h-10 bg-[#5950b3] hover:bg-[#4a42a0] text-white font-medium rounded-xl"
                  >
                    Show me around
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={skipTour}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Skip, I'll explore on my own
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Completion */}
      {showComplete && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={cn(
              "bg-card border border-border rounded-2xl shadow-xl max-w-[380px] w-full overflow-hidden",
              "animate-in fade-in slide-in-from-bottom-4 duration-300"
            )}>
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">You're all set</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      You can replay this tour anytime from the Help page. Next up — complete your profile and create your first listing.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={endTour}
                  className="w-full h-10 bg-[#5950b3] hover:bg-[#4a42a0] text-white font-medium rounded-xl"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step tooltips */}
      {!showWelcome && !showComplete && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <mask id="tour-spotlight">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.left - 6}
                    y={targetRect.top - 6}
                    width={targetRect.width + 12}
                    height={targetRect.height + 12}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#tour-spotlight)" />
          </svg>

          {targetRect && (
            <div
              className="absolute rounded-xl border-2 border-[#5950b3]/40 pointer-events-none transition-all duration-300 ease-out"
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
                zIndex: 2,
              }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{ zIndex: 3 }}
            onClick={(e) => {
              if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                e.stopPropagation();
              }
            }}
          />

          <div
            ref={tooltipRef}
            className={cn(
              "absolute max-w-[calc(100vw-24px)] bg-card border border-border rounded-xl shadow-lg overflow-hidden",
              "transition-all duration-200 ease-out",
              isAnimating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            )}
            style={{ ...getTooltipStyle(), zIndex: 10 }}
          >
            <div className="h-0.5 bg-muted">
              <div
                className="h-full bg-[#5950b3] transition-all duration-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {StepIcon && (
                    <div className="w-7 h-7 rounded-lg bg-[#5950b3]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <StepIcon className="h-3.5 w-3.5 text-[#5950b3]" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-muted-foreground font-medium">{currentStep + 1} / {totalSteps}</p>
                    <h3 className="font-medium text-foreground text-sm leading-snug">{step?.title}</h3>
                  </div>
                </div>
                <button
                  onClick={skipTour}
                  className="p-1.5 -mr-1 -mt-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                  aria-label="Close tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {step?.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentStep ? "w-4 bg-[#5950b3]" : i < currentStep ? "w-1.5 bg-[#5950b3]/30" : "w-1.5 bg-border"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted transition-colors min-h-[32px] min-w-[40px]"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="text-xs font-medium text-white bg-[#5950b3] hover:bg-[#4a42a0] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 min-h-[32px]"
                  >
                    {currentStep >= totalSteps - 1 ? 'Finish' : 'Next'}
                    {currentStep < totalSteps - 1 && <ChevronRight className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
};
