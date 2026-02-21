import { 
  LayoutDashboard, 
  User, 
  Package, 
  Calendar, 
  Inbox, 
  MessageSquare, 
  Star,
  Rocket,
  LucideIcon
} from 'lucide-react';

export interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  icon: LucideIcon;
  placement: 'right' | 'bottom' | 'left' | 'top';
  highlight?: boolean; // pulse animation on target
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'sidebar-dashboard',
    title: 'Your Command Center',
    description: 'This is your dashboard — a quick snapshot of bookings, leads, and how your business is doing. Everything starts here.',
    icon: LayoutDashboard,
    placement: 'right',
  },
  {
    target: 'sidebar-profile',
    title: 'Complete Your Profile',
    description: 'Customers check your profile before reaching out. Add a photo, bio, and portfolio to stand out and get more leads.',
    icon: User,
    placement: 'right',
  },
  {
    target: 'sidebar-listings',
    title: 'Create Your Listings',
    description: 'Add your services and packages here. This is what customers browse and book. More listings = more visibility.',
    icon: Package,
    placement: 'right',
  },
  {
    target: 'sidebar-calendar',
    title: 'Manage Availability',
    description: 'Set your available dates and block off busy ones. Customers can only book when you\'re free.',
    icon: Calendar,
    placement: 'right',
  },
  {
    target: 'sidebar-leads',
    title: 'Track Your Leads',
    description: 'When customers show interest, their inquiries land here. Respond quickly to win more bookings!',
    icon: Inbox,
    placement: 'right',
  },
  {
    target: 'sidebar-chat',
    title: 'Chat with Customers',
    description: 'Have direct conversations with interested customers. Quick responses build trust and close deals faster.',
    icon: MessageSquare,
    placement: 'right',
  },
];

export const TOUR_STORAGE_KEY = 'vendor_tour_completed';
export const TOUR_TRIGGER_KEY = 'vendor_tour_trigger';
