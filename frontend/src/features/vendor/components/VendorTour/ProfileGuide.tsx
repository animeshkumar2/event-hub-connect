import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ArrowRight, CheckCircle2, Camera, Image, PenLine, Images } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { LISTING_GUIDE_TRIGGER } from './ListingGuide';

const GUIDE_KEY = 'vendor_profile_guide_seen';
const GUIDE_TRIGGER = 'vendor_profile_guide_trigger';

interface Step {
  attr: 'data-profile-guide';
  target: string;
  title: string;
  desc: string;
  tip: 'below' | 'right' | 'above';
}

const STEPS: Step[] = [
  { attr: 'data-profile-guide', target: 'profile-cover', title: 'Add a cover image', desc: 'A good cover photo makes your profile stand out.', tip: 'below' },
  { attr: 'data-profile-guide', target: 'profile-photo', title: 'Upload your profile photo', desc: 'Profiles with photos get more inquiries.', tip: 'right' },
  { attr: 'data-profile-guide', target: 'profile-about', title: 'Write about your business', desc: 'Tell customers what you do and what makes you different.', tip: 'above' },
  { attr: 'data-profile-guide', target: 'profile-gallery', title: 'Add your best work', desc: 'Upload photos of past events. This is your portfolio.', tip: 'above' },
];

interface Rect { top: number; left: number; width: number; height: number; }

export const ProfileGuide = () => {
  const [showTransition, setShowTransition] = useState(false);
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [fade, setFade] = useState(false);
  const rafRef = useRef(0);
  const activateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryActivate = useCallback(() => {
    if (active || showTransition || activateTimerRef.current) return;
    if (localStorage.getItem(GUIDE_TRIGGER) === 'true' && localStorage.getItem(GUIDE_KEY) !== 'true') {
      activateTimerRef.current = setTimeout(() => {
        activateTimerRef.current = null;
        localStorage.removeItem(GUIDE_TRIGGER);
        setShowTransition(true);
      }, 1200);
    }
  }, [active, showTransition]);

  const handleStartGuide = () => {
    setShowTransition(false);
    setActive(true);
    setIdx(0);
  };

  const handleSkipTransition = () => {
    setShowTransition(false);
    localStorage.setItem(GUIDE_KEY, 'true');
    localStorage.setItem('vendor_tour_completed', 'true');
  };

  useEffect(() => {
    tryActivate();

    // Also listen for a custom event so the guide can be triggered after navigation
    const handler = () => { tryActivate(); };
    window.addEventListener('profile-guide-trigger', handler);

    // Poll localStorage as a fallback — catches triggers that arrive after mount
    // (e.g. page reload timing, React Query data loading delays)
    const pollInterval = setInterval(() => {
      if (!active && !activateTimerRef.current &&
          localStorage.getItem(GUIDE_TRIGGER) === 'true' &&
          localStorage.getItem(GUIDE_KEY) !== 'true') {
        tryActivate();
      }
    }, 2000);

    return () => {
      if (activateTimerRef.current) { clearTimeout(activateTimerRef.current); activateTimerRef.current = null; }
      window.removeEventListener('profile-guide-trigger', handler);
      clearInterval(pollInterval);
    };
  }, [tryActivate]);

  // Continuously track target position via rAF — scroll-proof
  const track = useCallback(() => {
    if (!active) return;
    const s = STEPS[idx];
    if (!s) return;
    const el = document.querySelector(`[${s.attr}="${s.target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(prev => {
        if (!prev || Math.abs(prev.top - r.top) > 0.5 || Math.abs(prev.left - r.left) > 0.5)
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        return prev;
      });
    } else {
      setRect(null);
    }
    rafRef.current = requestAnimationFrame(track);
  }, [active, idx]);

  useEffect(() => {
    if (active) {
      // Scroll target into view on step change
      const s = STEPS[idx];
      const el = s ? document.querySelector(`[${s.attr}="${s.target}"]`) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      rafRef.current = requestAnimationFrame(track);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, idx, track]);

  // Elevate target element above blur layer
  useEffect(() => {
    if (!active) return;
    const s = STEPS[idx];
    if (!s) return;

    // Clean up previous elevated element
    document.querySelectorAll('[data-guide-elevated]').forEach(el => {
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('position');
      el.removeAttribute('data-guide-elevated');
    });

    const el = document.querySelector(`[${s.attr}="${s.target}"]`);
    if (el) {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      if (computed.position === 'static') htmlEl.style.position = 'relative';
      htmlEl.style.zIndex = '52';
      htmlEl.setAttribute('data-guide-elevated', 'true');
    }

    return () => {
      document.querySelectorAll('[data-guide-elevated]').forEach(el => {
        (el as HTMLElement).style.removeProperty('z-index');
        (el as HTMLElement).style.removeProperty('position');
        el.removeAttribute('data-guide-elevated');
      });
    };
  }, [active, idx]);

  // Fade on step change
  useEffect(() => { if (active) { setFade(true); const t = setTimeout(() => setFade(false), 150); return () => clearTimeout(t); } }, [idx, active]);

  useEffect(() => {
    if (!active && !showTransition) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { showTransition ? handleSkipTransition() : dismiss(); }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { showTransition ? handleStartGuide() : next(); }
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, showTransition, idx]);

  const dismiss = () => {
    document.querySelectorAll('[data-guide-elevated]').forEach(el => {
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('position');
      el.removeAttribute('data-guide-elevated');
    });
    setActive(false); setIdx(0); localStorage.setItem(GUIDE_KEY, 'true'); localStorage.setItem('vendor_tour_completed', 'true');
    // Trigger the listing guide as the next step
    localStorage.setItem(LISTING_GUIDE_TRIGGER, 'true');
    // Dispatch event immediately and also after a short delay to ensure ListingGuide catches it
    window.dispatchEvent(new CustomEvent('listing-guide-trigger'));
    setTimeout(() => window.dispatchEvent(new CustomEvent('listing-guide-trigger')), 800);
  };
  const next = () => { if (idx >= STEPS.length - 1) dismiss(); else setIdx(i => i + 1); };
  const prev = () => { if (idx > 0) setIdx(i => i - 1); };

  // Transition modal — "Onboarding done, let's set up your profile"
  if (showTransition) {
    return createPortal(
      <>
        <style>{`
@keyframes pg-confetti-1 { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(30px,-60px) rotate(180deg); opacity: 0; } }
@keyframes pg-confetti-2 { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(-25px,-50px) rotate(-150deg); opacity: 0; } }
@keyframes pg-confetti-3 { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(20px,-45px) rotate(120deg); opacity: 0; } }
@keyframes pg-check-pop { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 50% { transform: scale(1.2) rotate(5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes pg-float-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(5px,-6px); } }
@keyframes pg-float-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-4px,5px); } }
        `}</style>
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[3px]" onClick={handleSkipTransition} />
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
          <div className={cn(
            "bg-white dark:bg-card border border-border/40 rounded-2xl shadow-2xl max-w-[400px] w-full overflow-hidden pointer-events-auto",
            "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400"
          )}>
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 pt-7 pb-8 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-10 w-14 h-14 rounded-full bg-white/[0.06]" style={{ animation: 'pg-float-1 4s ease-in-out infinite' }} />
                <div className="absolute bottom-3 left-8 w-8 h-8 rounded-full bg-white/[0.08]" style={{ animation: 'pg-float-2 5s ease-in-out infinite' }} />
              </div>

              <button
                onClick={handleSkipTransition}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-3 mx-auto" style={{ animation: 'pg-check-pop 0.6s ease-out both 0.3s' }}>
                  <CheckCircle2 className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-300" style={{ animation: 'pg-confetti-1 1s ease-out both 0.8s' }} />
                  <div className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-pink-300" style={{ animation: 'pg-confetti-2 1.1s ease-out both 0.9s' }} />
                  <div className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-blue-300" style={{ animation: 'pg-confetti-3 0.9s ease-out both 1s' }} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Onboarding complete!
                </h2>
                <p className="text-sm text-white/80 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                  Great start — now let's make your profile shine
                </p>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3.5">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                We'll walk you through 4 quick steps to complete your profile and start getting bookings.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Image, label: 'Cover image', color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
                  { icon: Camera, label: 'Profile photo', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
                  { icon: PenLine, label: 'About section', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                  { icon: Images, label: 'Work gallery', color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
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
                  Let's set up my profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <button
                  onClick={handleSkipTransition}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[36px]"
                >
                  Skip, I'll do it later
                </button>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }

  if (!active || !rect) return null;

  const s = STEPS[idx];
  const progress = ((idx + 1) / STEPS.length) * 100;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const isMobile = vw < 640;
  const TIP_W = isMobile ? Math.min(vw - 24, 240) : 240;
  const GAP = isMobile ? 10 : 14;

  // On mobile, always place below/above — screen is too narrow for right placement
  const tipDir = (isMobile && s.tip === 'right') ? 'below' : s.tip;

  // Compute tooltip position — never overlaps the target
  let tipTop = 0, tipLeft = 0;
  if (tipDir === 'right') {
    tipTop = rect.top + rect.height / 2 - 70;
    tipLeft = rect.left + rect.width + GAP;
    if (tipLeft + TIP_W > vw - 8) { tipLeft = rect.left - TIP_W - GAP; }
    if (tipLeft < 8) { tipTop = rect.top + rect.height + GAP; tipLeft = rect.left; }
  } else if (tipDir === 'below') {
    tipTop = rect.top + rect.height + GAP;
    tipLeft = rect.left + rect.width / 2 - TIP_W / 2;
  } else {
    tipTop = rect.top - GAP - 140;
    tipLeft = rect.left + rect.width / 2 - TIP_W / 2;
    if (tipTop < 8) { tipTop = rect.top + rect.height + GAP; }
  }
  // Clamp
  if (tipLeft < 8) tipLeft = 8;
  if (tipLeft + TIP_W > vw - 8) tipLeft = vw - 8 - TIP_W;
  if (tipTop < 8) tipTop = 8;
  if (tipTop > vh - 160) tipTop = vh - 160;

  // Arrow position pointing at target
  let arrowTop = 0, arrowLeft = 0, arrowChar = '▲';
  if (tipDir === 'right') {
    arrowTop = rect.top + rect.height / 2 - 8;
    arrowLeft = rect.left + rect.width + 3;
    arrowChar = '◀';
    if (rect.left + rect.width + GAP + TIP_W > vw - 8) { arrowLeft = rect.left - 14; arrowChar = '▶'; }
  } else if (tipDir === 'below') {
    arrowTop = rect.top + rect.height + 2;
    arrowLeft = rect.left + rect.width / 2 - 8;
    arrowChar = '▲';
  } else {
    arrowTop = rect.top - 18;
    arrowLeft = rect.left + rect.width / 2 - 8;
    arrowChar = '▼';
    if (rect.top - GAP - 140 < 8) { arrowTop = rect.top + rect.height + 2; arrowChar = '▲'; }
  }

  return createPortal(
    <>
      <style>{`@keyframes guide-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes guide-bounce-x { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }`}</style>

      {/* Tint layer — dims everything, target pops out above it */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none" style={{ zIndex: 50 }} />

      {/* Arrow pointing at target */}
      <div
        className="fixed pointer-events-none text-[#5950b3] text-sm font-bold"
        style={{
          top: arrowTop, left: arrowLeft, zIndex: 9999,
          animation: tipDir === 'right' ? 'guide-bounce-x 0.8s ease-in-out infinite' : 'guide-bounce 0.8s ease-in-out infinite',
        }}
      >
        {arrowChar}
      </div>

      {/* Tooltip — compact, responsive */}
      <div
        className={cn(
          "fixed bg-white dark:bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden",
          "transition-opacity duration-150",
          fade ? "opacity-0" : "opacity-100"
        )}
        style={{ top: tipTop, left: tipLeft, width: TIP_W, zIndex: 9999 }}
      >
        <div className="h-[2px] bg-muted"><div className="h-full bg-[#5950b3] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] text-muted-foreground">{idx + 1}/{STEPS.length}</p>
              <h3 className="font-semibold text-foreground text-xs leading-tight">{s.title}</h3>
            </div>
            <button onClick={dismiss} className="p-1 rounded hover:bg-muted text-muted-foreground min-h-[24px] min-w-[24px] flex items-center justify-center" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex gap-[3px]">
              {STEPS.map((_, i) => (
                <div key={i} className={cn("h-[2px] rounded-full", i === idx ? "w-2.5 bg-[#5950b3]" : i < idx ? "w-1 bg-[#5950b3]/40" : "w-1 bg-border")} />
              ))}
            </div>
            <div className="flex gap-1.5">
              {idx > 0 && <button onClick={prev} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted min-h-[28px] min-w-[36px]">Back</button>}
              <button onClick={next} className="text-[11px] font-medium text-white bg-[#5950b3] hover:bg-[#4a42a0] px-3 py-1.5 rounded-md flex items-center gap-0.5 min-h-[28px]">
                {idx >= STEPS.length - 1 ? 'Done' : 'Next'}{idx < STEPS.length - 1 && <ChevronRight className="h-2.5 w-2.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
