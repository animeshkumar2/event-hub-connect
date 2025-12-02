import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  { icon: Settings, label: 'Settings', path: '/vendor/settings' },
  { icon: HelpCircle, label: 'Help', path: '/vendor/help' },
];

export const VendorSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-vendor-sidebar backdrop-blur-xl border-r border-white/10',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!collapsed && (
          <span className="font-display text-xl font-bold text-white">
            Eventory
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10"
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'group relative',
                isActive
                  ? 'bg-gradient-to-r from-vendor-gold/20 to-vendor-purple/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-vendor-gold rounded-r-full" />
              )}
              <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-vendor-gold')} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Exit to Home</span>}
        </NavLink>
      </div>
    </aside>
  );
};
