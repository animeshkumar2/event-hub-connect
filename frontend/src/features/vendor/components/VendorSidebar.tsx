import { useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import {
  LayoutDashboard,
  User,
  Calendar,
  MessageSquare,
  Package,
  Inbox,
  Wallet,
  BarChart3,
  Star,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ClipboardList,
  FileQuestion,
  Lock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor/dashboard', locked: false },
  { icon: User, label: 'Profile', path: '/vendor/profile', locked: false },
  { icon: Package, label: 'Listings', path: '/vendor/listings', locked: false },
  { icon: Calendar, label: 'Calendar', path: '/vendor/calendar', locked: false },
  { icon: Inbox, label: 'Leads', path: '/vendor/leads', locked: false },
  { icon: ClipboardList, label: 'Orders', path: '/vendor/orders', locked: false },
  { icon: MessageSquare, label: 'Chat', path: '/vendor/chat', locked: false },
  // PHASE 1: Wallet - Commented out for initial release
  // { icon: Wallet, label: 'Wallet', path: '/vendor/wallet', locked: !FEATURE_FLAGS.WALLET_ENABLED },
  { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics', locked: !FEATURE_FLAGS.ANALYTICS_ENABLED },
  { icon: Star, label: 'Reviews', path: '/vendor/reviews', locked: !FEATURE_FLAGS.REVIEW_REQUESTS_ENABLED },
  { icon: FileQuestion, label: 'FAQs', path: '/vendor/faqs', locked: false },
  { icon: Settings, label: 'Settings', path: '/vendor/settings', locked: false },
  { icon: HelpCircle, label: 'Help', path: '/vendor/help', locked: false },
];

export const VendorSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-200',
        'bg-card border-r border-border shadow-elegant',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-card">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-[#5046E5]">
            cartevent<span className="text-[#7C6BFF]">.</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
