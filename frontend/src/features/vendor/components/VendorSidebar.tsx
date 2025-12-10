import { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor/dashboard' },
  { icon: User, label: 'Profile', path: '/vendor/profile' },
  { icon: Package, label: 'Listings', path: '/vendor/listings' },
  { icon: Calendar, label: 'Calendar', path: '/vendor/calendar' },
  { icon: Inbox, label: 'Leads', path: '/vendor/leads' },
  { icon: ClipboardList, label: 'Orders', path: '/vendor/orders' },
  { icon: MessageSquare, label: 'Chat', path: '/vendor/chat' },
  { icon: Wallet, label: 'Wallet', path: '/vendor/wallet' },
  { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics' },
  { icon: Star, label: 'Reviews', path: '/vendor/reviews' },
  { icon: FileQuestion, label: 'FAQs', path: '/vendor/faqs' },
  { icon: Settings, label: 'Settings', path: '/vendor/settings' },
  { icon: HelpCircle, label: 'Help', path: '/vendor/help' },
];

export const VendorSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
                  'text-sm font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Exit to Home</span>}
        </NavLink>
      </div>
    </aside>
  );
};
