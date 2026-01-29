import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import {
  LayoutDashboard,
  User,
  Calendar,
  MessageSquare,
  Package,
  Inbox,
  BarChart3,
  Star,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ClipboardList,
  FileQuestion,
  Lock,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useAuth } from '@/shared/contexts/AuthContext';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor/dashboard', locked: false },
  { icon: User, label: 'Profile', path: '/vendor/profile', locked: false },
  { icon: Package, label: 'Listings', path: '/vendor/listings', locked: false },
  { icon: Calendar, label: 'Calendar', path: '/vendor/calendar', locked: false },
  { icon: Inbox, label: 'Leads', path: '/vendor/leads', locked: false },
  { icon: ClipboardList, label: 'Bookings', path: '/vendor/bookings', locked: false },
  { icon: MessageSquare, label: 'Chat', path: '/vendor/chat', locked: false },
  // PHASE 1: Wallet - Completely hidden for initial release
  // { icon: Wallet, label: 'Wallet', path: '/vendor/wallet', locked: !FEATURE_FLAGS.WALLET_ENABLED },
  { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics', locked: !FEATURE_FLAGS.ANALYTICS_ENABLED },
  { icon: Star, label: 'Reviews', path: '/vendor/reviews', locked: !FEATURE_FLAGS.REVIEW_REQUESTS_ENABLED },
  { icon: FileQuestion, label: 'FAQs', path: '/vendor/faqs', locked: false },
  // PHASE 1: Settings - Removed (not needed for initial release)
  // { icon: Settings, label: 'Settings', path: '/vendor/settings', locked: false },
  { icon: HelpCircle, label: 'Help', path: '/vendor/help', locked: false },
];

export const VendorSidebar = ({ isOpen = false, onClose }: VendorSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isOpen) {
      onClose?.();
    }
  }, [location.pathname]);

  // Check if content is scrollable and show hint on mobile
  useEffect(() => {
    const checkScrollable = () => {
      const nav = document.getElementById('sidebar-nav');
      if (nav && window.innerWidth < 768) {
        const isScrollable = nav.scrollHeight > nav.clientHeight;
        setShowScrollHint(isScrollable);
      } else {
        setShowScrollHint(false);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [isOpen]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const sidebarWidth = collapsed ? 'md:w-16 w-64' : 'w-64';

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
          'bg-card border-r border-border shadow-elegant flex flex-col',
          // Prevent overscroll bounce
          'overscroll-none',
          sidebarWidth,
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Background extension for iOS overscroll - only visible during rubber-band effect */}
        <div className="absolute inset-0 bg-card -top-96 -bottom-96 -z-10 md:hidden" />
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-card flex-shrink-0">
          {!collapsed && (
            <Link to="/vendor/dashboard" className="text-xl font-bold text-[#5046E5]">
              cartevent<span className="text-[#7C6BFF]">.</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden md:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation - with scroll indicator */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <nav 
            id="sidebar-nav"
            className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overscroll-contain"
            onScroll={() => setShowScrollHint(false)}
          >
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                    'group relative',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive && 'text-primary'
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      'text-sm font-medium flex-1',
                      isActive && 'font-semibold'
                    )}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.locked && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  )}
                </NavLink>
              );
            })}
            
            {/* Logout button inside nav for mobile - always visible at end of list */}
            <div className="md:hidden pt-4 mt-4 border-t border-border">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </nav>
          
          {/* Scroll hint indicator - only on mobile when content is scrollable */}
          {showScrollHint && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 pointer-events-none md:hidden">
              <div className="flex flex-col items-center text-muted-foreground/60 animate-bounce">
                <ChevronDown className="h-4 w-4" />
                <span className="text-[10px]">scroll</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout - Fixed at bottom (desktop only) */}
        <div className="hidden md:block p-2 border-t border-border bg-card flex-shrink-0">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card border-border max-w-md w-[calc(100%-2rem)] mx-auto rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70 text-sm sm:text-base">
              Are you sure you want to logout? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted w-full sm:w-auto rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto rounded-xl"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
