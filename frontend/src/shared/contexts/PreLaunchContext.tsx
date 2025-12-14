import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PreLaunchContextType {
  isPreLaunchMode: boolean;
  hasFullAccess: boolean;
  grantFullAccess: () => void;
  revokeFullAccess: () => void;
}

const PreLaunchContext = createContext<PreLaunchContextType | undefined>(undefined);

// Secret key for admin access - change this to something secure
const ADMIN_ACCESS_KEY = 'cartevent2025';
const STORAGE_KEY = 'cartevent_full_access';

// List of allowed admin emails (optional additional check)
const ADMIN_EMAILS = [
  'admin@cartevent.com',
  'animesh@cartevent.com',
  // Add more admin emails here
];

export function PreLaunchProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const [hasFullAccess, setHasFullAccess] = useState(false);
  
  // Pre-launch mode is ENABLED by default
  // Set to false when you're ready to launch publicly
  const isPreLaunchMode = true;

  useEffect(() => {
    // Check localStorage for existing access
    const storedAccess = localStorage.getItem(STORAGE_KEY);
    if (storedAccess === 'true') {
      setHasFullAccess(true);
    }

    // Check URL for admin access key
    const accessKey = searchParams.get('access');
    if (accessKey === ADMIN_ACCESS_KEY) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setHasFullAccess(true);
      // Clean up URL (remove access param)
      const url = new URL(window.location.href);
      url.searchParams.delete('access');
      window.history.replaceState({}, '', url.toString());
    }

    // Check if user email is in admin list
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
          setHasFullAccess(true);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [searchParams]);

  const grantFullAccess = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasFullAccess(true);
  };

  const revokeFullAccess = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasFullAccess(false);
  };

  return (
    <PreLaunchContext.Provider value={{ 
      isPreLaunchMode, 
      hasFullAccess, 
      grantFullAccess,
      revokeFullAccess 
    }}>
      {children}
    </PreLaunchContext.Provider>
  );
}

export function usePreLaunch() {
  const context = useContext(PreLaunchContext);
  if (context === undefined) {
    throw new Error('usePreLaunch must be used within a PreLaunchProvider');
  }
  return context;
}

// Route guard component
export function PreLaunchGuard({ children }: { children: ReactNode }) {
  const { isPreLaunchMode, hasFullAccess } = usePreLaunch();

  // If pre-launch mode is off OR user has full access, show content
  if (!isPreLaunchMode || hasFullAccess) {
    return <>{children}</>;
  }

  // Otherwise, show launching soon page
  return <LaunchingSoonPage />;
}

// Launching Soon Page Component
function LaunchingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Logo */}
        <a href="/" className="inline-block mb-6 group">
          <span className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
            cartevent<span className="text-purple-400">.</span>
          </span>
        </a>

        {/* Rocket Icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Launching Soon!
        </h1>
        
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          We're putting the final touches on something amazing.<br />
          Our customer platform is launching soon!
        </p>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 mb-5">
          {/* Early Bird Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span>Early Bird Offer</span>
          </div>
          
          <h2 className="text-lg font-semibold text-white mb-2">
            Are you a vendor?
          </h2>
          
          <p className="text-gray-300 mb-4 text-sm">
            Pre-register now and get <strong className="text-purple-300">FREE lifetime access</strong> as one of our first 100 vendors!
          </p>

          {/* CTA Buttons */}
          <div className="space-y-2.5">
            <a 
              href="/for-vendors"
              className="flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] text-sm shadow-lg shadow-purple-500/25"
            >
              Pre-Register as Vendor
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a 
              href="/signup"
              className="flex items-center justify-center w-full bg-white/10 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm"
            >
              Sign Up as Customer
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <span className="text-gray-600">|</span>
          <a 
            href="/login" 
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </a>
          <span className="text-gray-600">|</span>
          <a 
            href="/login?type=vendor" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Vendor Login
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:support@cartevent.com" className="text-purple-400 hover:underline">
            support@cartevent.com
          </a>
        </p>
      </div>
    </div>
  );
}

