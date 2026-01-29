import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePreLaunch } from '@/shared/contexts/PreLaunchContext';
import { CustomerWaitlistForm } from './CustomerWaitlistForm';

export const SlidingButtons = () => {
  const navigate = useNavigate();
  const { hasFullAccess } = usePreLaunch();
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Description Text */}
      <div className="text-center mb-5 px-4">
        <p className="text-sm leading-relaxed text-white/70">
          List your services and grow your business.
          <br />
          Join India's fastest-growing event marketplace today!
        </p>
      </div>

      {/* Main CTAs */}
      <div className="px-4 space-y-3">
        {/* Vendor Signup */}
        <button
          onClick={() => navigate('/signup?type=vendor')}
          className={cn(
            "relative w-full px-5 py-4 rounded-2xl transition-all duration-300",
            "flex items-center justify-between gap-4",
            "bg-gradient-to-r from-primary to-primary-glow",
            "border border-white/20",
            "hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 cursor-pointer",
            "group"
          )}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">
              Join as Vendor
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Customer Waitlist */}
        <button
          onClick={() => hasFullAccess ? navigate('/search') : setShowWaitlist(true)}
          className={cn(
            "relative w-full px-5 py-3.5 rounded-2xl transition-all duration-300",
            "flex items-center justify-between gap-4",
            "bg-white/5 backdrop-blur-sm",
            "border border-white/10",
            "hover:bg-white/10 hover:border-white/20 cursor-pointer",
            "group"
          )}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white/90">
              Book Vendors
            </h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/20 text-amber-400 uppercase">
              Soon
            </span>
          </div>
          <Bell className="h-4 w-4 text-white/50 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>

      {/* Customer Waitlist Modal */}
      <CustomerWaitlistForm 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist} 
      />
    </div>
  );
};

// Export for backward compatibility
export const buttonOptions = [
  {
    id: 'join-vendor',
    label: 'Join as Vendor',
    subtitle: 'For Businesses',
    description: 'List your services and grow your business.',
    path: '/signup?type=vendor',
  },
];
