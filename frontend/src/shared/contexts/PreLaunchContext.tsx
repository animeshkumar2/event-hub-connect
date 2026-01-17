import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PreLaunchContextType {
  isPreLaunchMode: boolean;
  hasFullAccess: boolean;
  grantFullAccess: () => void;
  revokeFullAccess: () => void;
}

const PreLaunchContext = createContext<PreLaunchContextType | undefined>(undefined);

// Secret key for admin/tester access - change this to something secure
const ADMIN_ACCESS_KEY = 'cartevent2025';
const TESTER_ACCESS_KEY = 'testmode2025'; // URL param: ?tester=testmode2025
const STORAGE_KEY = 'cartevent_full_access';

// List of allowed admin emails
const ADMIN_EMAILS = [
  'admin@cartevent.com',
  'animesh@cartevent.com',
];

// List of tester emails - these users get full access for testing customer features
const TESTER_EMAILS = [
  // Add tester emails here - they can access everything while being customers
  'test@cartevent.com',
  'tester@example.com',
  'test@gmail.com',
  'test',
  'customer@gmail.com',
  'customer',
];

export function PreLaunchProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Initialize as false - no access by default
  const [hasFullAccess, setHasFullAccess] = useState(false);
  
  // Pre-launch mode is ENABLED by default
  // Set to false when you're ready to launch publicly
  const isPreLaunchMode = true;

  useEffect(() => {
    // Check if user is admin or tester using auth context (primary) or localStorage (fallback)
    let isAdmin = false;
    let isTester = false;
    
    // Primary check: Use auth context
    if (isAuthenticated && user) {
      const userEmail = user.email?.toLowerCase();
      if (user.role === 'ADMIN' || ADMIN_EMAILS.includes(userEmail)) {
        isAdmin = true;
      }
      if (TESTER_EMAILS.includes(userEmail)) {
        isTester = true;
      }
    }
    
    // Fallback: Check localStorage for edge cases (e.g., page reload before auth loads)
    if (!isAdmin && !isTester) {
      const userData = localStorage.getItem('user_data');
      const userRole = localStorage.getItem('user_role');
      
      if (userRole === 'ADMIN') {
        isAdmin = true;
      }
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const parsedEmail = parsedUser.email?.toLowerCase();
          if (parsedUser.role === 'ADMIN' || ADMIN_EMAILS.includes(parsedEmail)) {
            isAdmin = true;
          }
          if (TESTER_EMAILS.includes(parsedEmail)) {
            isTester = true;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    // Check URL for tester access key - works for any logged in user
    const testerKey = searchParams.get('tester');
    if (testerKey === TESTER_ACCESS_KEY && isAuthenticated) {
      isTester = true;
      // Store tester mode in session storage (cleared on browser close)
      sessionStorage.setItem('tester_mode', 'true');
      // Clean up URL (remove tester param)
      const url = new URL(window.location.href);
      url.searchParams.delete('tester');
      window.history.replaceState({}, '', url.toString());
    }
    
    // Check if tester mode was previously activated in this session
    if (sessionStorage.getItem('tester_mode') === 'true' && isAuthenticated) {
      isTester = true;
    }

    // Check URL for admin access key - ONLY works if user is already logged in as admin
    const accessKey = searchParams.get('access');
    if (accessKey === ADMIN_ACCESS_KEY && isAdmin) {
      // Only grant access if user is admin AND uses access key
      setHasFullAccess(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      // Clean up URL (remove access param)
      const url = new URL(window.location.href);
      url.searchParams.delete('access');
      window.history.replaceState({}, '', url.toString());
      return; // Exit early after granting access via key
    }

    // Grant full access if user is admin OR tester
    if (isAdmin || isTester) {
      setHasFullAccess(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      // For non-admin/non-tester users or users not logged in, explicitly deny access
      setHasFullAccess(false);
      // Make sure stored access is cleared
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams, location.pathname, user, isAuthenticated]); // React to auth changes

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
export function LaunchingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        {/* Additional floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Logo with glow effect */}
        <a href="/" className="inline-block mb-6 group">
          <span className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            cartevent<span className="text-purple-400">.</span>
          </span>
        </a>

        {/* Enhanced Rocket Icon */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
          </div>
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce border border-purple-400/30" style={{ animationDuration: '2s' }}>
            <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Main Message with gradient */}
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white mb-3 drop-shadow-lg">
          Launching Soon!
        </h1>
        
        <p className="text-gray-300 mb-6 text-sm leading-relaxed drop-shadow-md">
          We're putting the final touches on something amazing.<br />
          Our customer platform is launching soon!
        </p>

        {/* Enhanced Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 mb-5 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
          {/* Enhanced Early Bird Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3 shadow-lg shadow-orange-500/30 animate-pulse">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Early Bird Offer</span>
          </div>
          
          <h2 className="text-lg font-semibold text-white mb-2 drop-shadow-md">
            Are you a vendor?
          </h2>
          
          <p className="text-gray-300 mb-4 text-sm leading-relaxed">
            Pre-onboard now and get <strong className="text-purple-300 font-bold">FREE lifetime access</strong> as one of our first 100 vendors!
          </p>

          {/* Enhanced CTA Button */}
          <div className="space-y-2.5">
            <a 
              href="/join-vendors"
              className="group flex items-center justify-center w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 border border-purple-400/30"
            >
              Pre-Onboard as Vendor
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Enhanced Quick Links */}
        <div className="flex items-center justify-center gap-4 text-sm backdrop-blur-sm bg-white/5 rounded-full px-4 py-2 border border-white/10">
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <span className="text-gray-600">|</span>
          <a 
            href="/login" 
            className="text-gray-400 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          >
            Sign In
          </a>
          <span className="text-gray-600">|</span>
          <a 
            href="/login?type=vendor" 
            className="text-purple-400 hover:text-purple-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          >
            Vendor Login
          </a>
        </div>

        {/* Enhanced Footer */}
        <p className="text-xs text-gray-500 mt-6 backdrop-blur-sm bg-white/5 rounded-lg px-4 py-2 border border-white/10">
          Questions? Contact us at{' '}
          <a href="mailto:cartevent.welcome@gmail.com" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            cartevent.welcome@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

