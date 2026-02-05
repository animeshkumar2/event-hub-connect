import { useState, useEffect, useMemo, useCallback } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Loader2, X, Ban, Check, Eye, Clock,
  Sun, Sunset, Moon, CalendarDays, Filter, List, Grid3X3, ExternalLink
} from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { toast } from 'sonner';
import { useMyVendorAvailability, useVendorUpcomingOrders, useMyVendorListings, useVendorProfile, useCategories } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isToday, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useVendorProfile as useVendorProfileCompletion } from '@/shared/hooks/useVendorProfile';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
import { CalendarWeekView } from '@/features/vendor/components/CalendarWeekView';
import { CalendarListView } from '@/features/vendor/components/CalendarListView';
import { CalendarBulkActions } from '@/features/vendor/components/CalendarBulkActions';

// Types
type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BUSY' | 'BLOCKED';
type TimeSlotType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
type ViewMode = 'month' | 'week' | 'list';

interface AvailabilitySlot {
  id: string;
  date: string;
  timeSlot: string;
  status: SlotStatus;
  categoryId?: string;
  listingId?: string;
  orderId?: string;
  notes?: string;
  timeSlotType?: TimeSlotType;
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: AvailabilitySlot[];
  bookingsByCategory: Record<string, number>;
  blocksByCategory?: Record<string, number>;
  status: 'available' | 'partial' | 'blocked';
  orders: any[];
}

interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

// Time slot display info
const TIME_SLOT_INFO: Record<TimeSlotType, { label: string; icon: React.ReactNode; time: string; color: string }> = {
  MORNING: { label: 'Morning', icon: <Sun className="h-4 w-4" />, time: '6AM - 12PM', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  AFTERNOON: { label: 'Afternoon', icon: <Sunset className="h-4 w-4" />, time: '12PM - 5PM', color: 'bg-orange-500/20 text-orange-600 border-orange-500/30' },
  EVENING: { label: 'Evening', icon: <Moon className="h-4 w-4" />, time: '5PM - 11PM', color: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30' },
  FULL_DAY: { label: 'Full Day', icon: <CalendarDays className="h-4 w-4" />, time: 'All Day', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
};

// Category icons mapping - by ID and name for flexible lookup
const CATEGORY_ICONS: Record<string, string> = {
  // By slug ID
  'photo-video': '📷', 'decorator': '🎨', 'caterer': '🍽️', 'venue': '🏛️', 'mua': '💄',
  'dj-entertainment': '🎧', 'sound-lights': '💡', 'artists': '🎭', 'event-planner': '📋', 'other': '📦',
  'catering': '🍽️', 'photography': '📷', 'videography': '🎬', 'dj': '🎧', 'entertainment': '🎤',
  // By numeric ID (common database IDs)
  '1': '📷', '2': '🎨', '3': '🍽️', '4': '🏛️', '5': '💄', '6': '🎧', '7': '💡', '8': '🎭', '9': '📋', '10': '📦',
};

// Category name to icon mapping for fallback
const CATEGORY_NAME_ICONS: Record<string, string> = {
  'photography': '📷', 'videography': '🎬', 'photography & videography': '📸',
  'catering': '🍽️', 'caterer': '🍽️', 'food': '🍽️',
  'decorator': '🎨', 'décor': '🎨', 'decor': '🎨', 'decoration': '🎨',
  'venue': '🏛️', 'venues': '🏛️', 'banquet': '🏛️', 'hall': '🏛️',
  'makeup': '💄', 'makeup & styling': '💄', 'mua': '💄', 'makeup artist': '💄',
  'dj': '🎧', 'dj & entertainment': '🎧', 'music': '🎵', 'entertainment': '🎤',
  'sound': '💡', 'sound & lights': '💡', 'lighting': '💡', 'lights': '💡',
  'artists': '🎭', 'artists & performers': '🎭', 'performer': '🎭', 'performers': '🎭',
  'event planner': '📋', 'planner': '📋', 'planning': '📋', 'coordinator': '📋',
  'other': '📦', 'miscellaneous': '📦', 'misc': '📦',
};

// Helper to check if icon is valid (not corrupted or placeholder)
const isValidIcon = (icon?: string): boolean => {
  if (!icon || icon.length === 0) return false;
  // Check for common invalid/corrupted icon patterns
  if (icon === '?' || icon === '❓' || icon === '�' || icon.includes('�')) return false;
  // Check if it's a reasonable emoji (1-4 chars for emoji with modifiers)
  if (icon.length > 8) return false;
  return true;
};

// Helper to get icon by ID or name
const getCategoryIcon = (id?: string, name?: string): string => {
  if (id && CATEGORY_ICONS[id]) return CATEGORY_ICONS[id];
  if (name) {
    const lowerName = name.toLowerCase();
    if (CATEGORY_NAME_ICONS[lowerName]) return CATEGORY_NAME_ICONS[lowerName];
    // Partial match
    for (const [key, icon] of Object.entries(CATEGORY_NAME_ICONS)) {
      if (lowerName.includes(key) || key.includes(lowerName)) return icon;
    }
  }
  return '📦';
};

const DEFAULT_TIME_SLOTS: TimeSlotType[] = ['MORNING', 'AFTERNOON', 'EVENING'];

export default function VendorCalendarEnhanced() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotActionLoading, setSlotActionLoading] = useState<string | null>(null);
  const [showCustomTimeDialog, setShowCustomTimeDialog] = useState(false);
  const [customTimeData, setCustomTimeData] = useState({ fromTime: '', toTime: '', categoryId: '', notes: '' });

  // Fetch data
  const startDate = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(addMonths(currentMonth, 2)), 'yyyy-MM-dd');
  const { data: availabilityData, loading: availabilityLoading, refetch: refetchAvailability } = useMyVendorAvailability(startDate, endDate);
  const { data: upcomingOrders } = useVendorUpcomingOrders();
  const { data: listings } = useMyVendorListings();
  const { data: vendorProfile } = useVendorProfile();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfileCompletion();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Memoize category IDs from listings to prevent infinite loops
  const listingCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    if (listings && Array.isArray(listings) && listings.length > 0) {
      listings.forEach((listing: any) => {
        const isListed = listing.isActive === true && listing.isDraft !== true;
        if (isListed) {
          const categoryId = listing.categoryId || 
                            listing.listingCategoryId || 
                            (listing.listingCategory?.id) ||
                            (typeof listing.listingCategory === 'string' ? listing.listingCategory : null);
          if (categoryId) ids.add(categoryId);
        }
      });
    }
    return Array.from(ids);
  }, [listings]);

  // Memoize categories map for efficient lookup
  const categoriesMap = useMemo(() => {
    const map = new Map<string, any>();
    if (categories && Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        if (cat?.id) map.set(cat.id, cat);
      });
    }
    return map;
  }, [categories]);

  // Initialize category filters based on vendor's LISTED listings only
  useEffect(() => {
    const uniqueCategories = new Set<string>(listingCategoryIds);
    
    // Add vendor's main category if they have one (as fallback)
    const vendorCategoryId = vendorProfile?.vendorCategoryId;
    if (vendorCategoryId) {
      uniqueCategories.add(vendorCategoryId);
    }

    // Map to filter objects with proper names and icons from API
    const filters: CategoryFilter[] = Array.from(uniqueCategories)
      .map(catId => {
        const cat = categoriesMap.get(catId);
        const catName = cat?.name || cat?.displayName || catId;
        return { 
          id: catId, 
          name: catName, 
          icon: isValidIcon(cat?.icon) ? cat.icon : getCategoryIcon(catId, catName), 
          active: true 
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Only update if filters actually changed (prevent infinite loop)
    setCategoryFilters(prev => {
      const prevIds = prev.map(f => f.id).sort().join(',');
      const newIds = filters.map(f => f.id).sort().join(',');
      return prevIds === newIds ? prev : filters;
    });
  }, [listingCategoryIds, vendorProfile?.vendorCategoryId, categoriesMap]);

  // Build calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = startOfWeek(firstDay);
    const endDay = endOfWeek(lastDay);
    
    const calendar: CalendarDay[] = [];
    let current = startDay;
    
    // Build availability map
    const availabilityMap = new Map<string, AvailabilitySlot[]>();
    if (availabilityData && Array.isArray(availabilityData)) {
      availabilityData.forEach((slot: any) => {
        const dateStr = typeof slot.date === 'string' ? slot.date.split('T')[0] : format(new Date(slot.date), 'yyyy-MM-dd');
        if (!availabilityMap.has(dateStr)) availabilityMap.set(dateStr, []);
        availabilityMap.get(dateStr)!.push({
          id: slot.id, date: dateStr, timeSlot: slot.timeSlot, status: slot.status,
          categoryId: slot.categoryId, listingId: slot.listingId, orderId: slot.orderId,
          notes: slot.notes, timeSlotType: slot.timeSlotType || 'FULL_DAY',
        });
      });
    }
    
    // Build orders map
    const ordersMap = new Map<string, any[]>();
    if (upcomingOrders && Array.isArray(upcomingOrders)) {
      upcomingOrders.forEach((order: any) => {
        if (order.eventDate) {
          const dateStr = order.eventDate.split('T')[0];
          if (!ordersMap.has(dateStr)) ordersMap.set(dateStr, []);
          ordersMap.get(dateStr)!.push(order);
        }
      });
    }
    
    while (current <= endDay) {
      const dateStr = format(current, 'yyyy-MM-dd');
      const slots = availabilityMap.get(dateStr) || [];
      const orders = ordersMap.get(dateStr) || [];
      
      // Calculate bookings and blocks by category
      const bookingsByCategory: Record<string, number> = {};
      const blocksByCategory: Record<string, number> = {};
      
      // Count booked slots by category
      slots.forEach(slot => {
        const catId = slot.categoryId || 'all';
        if (slot.status === 'BOOKED') {
          bookingsByCategory[catId] = (bookingsByCategory[catId] || 0) + 1;
        } else if (slot.status === 'BLOCKED') {
          blocksByCategory[catId] = (blocksByCategory[catId] || 0) + 1;
        }
      });
      
      // Count orders by category - check all possible category fields
      orders.forEach(order => {
        const catId = order.listingCategoryId || 
                     order.categoryId || 
                     order.listing?.categoryId ||
                     order.listing?.listingCategoryId ||
                     (order.listingCategory?.id) ||
                     (typeof order.listingCategory === 'string' ? order.listingCategory : null) ||
                     order.category?.id ||
                     order.category ||
                     'all';
        bookingsByCategory[catId] = (bookingsByCategory[catId] || 0) + 1;
      });
      
      // Determine day status based on slots
      // Blocked = unavailable/booked (vendor manually blocks when unavailable)
      let status: 'available' | 'partial' | 'blocked' = 'available';
      const blockedSlots = slots.filter(s => s.status === 'BLOCKED' || s.status === 'BOOKED').length;
      const totalSlots = slots.length;
      
      // Priority: blocked > partial > available
      if (totalSlots > 0) {
        // If all slots are blocked, day is fully blocked/unavailable
        if (blockedSlots === totalSlots) {
          status = 'blocked';
        }
        // If some slots are blocked (but not all), day is partial
        else if (blockedSlots > 0) {
          status = 'partial';
        }
        // Otherwise available
        else {
          status = 'available';
        }
      } else {
        status = 'available';
      }
      
      calendar.push({
        date: new Date(current), dateStr, isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current), slots, bookingsByCategory, blocksByCategory, status, orders,
      });
      current = addDays(current, 1);
    }
    return calendar;
  }, [currentMonth, availabilityData, upcomingOrders]);

  // Filter calendar data based on active category filters and recalculate status
  const filteredCalendarData = useMemo(() => {
    if (categoryFilters.length === 0 || categoryFilters.every(f => f.active)) return calendarData;
    const activeCategories = categoryFilters.filter(f => f.active).map(f => f.id);
    const isSpecificCategorySelected = activeCategories.length < categoryFilters.length;
    
    return calendarData.map(day => {
      // Filter slots by active categories
      // When specific category is selected, ONLY include slots for that category (not generic ones)
      const filteredSlots = day.slots.filter(slot => {
        if (isSpecificCategorySelected) {
          // Only include slots that explicitly match the selected category
          return slot.categoryId && activeCategories.includes(slot.categoryId);
        }
        // When all categories active, include everything
        return !slot.categoryId || activeCategories.includes(slot.categoryId);
      });
      
      // Filter orders by active categories
      const filteredOrders = day.orders.filter(order => {
        // Check multiple possible category ID fields
        const orderCategoryId = order.listingCategoryId || 
                               order.categoryId || 
                               (order.listingCategory?.id) ||
                               (typeof order.listingCategory === 'string' ? order.listingCategory : null);
        if (isSpecificCategorySelected) {
          return orderCategoryId && activeCategories.includes(orderCategoryId);
        }
        return !orderCategoryId || activeCategories.includes(orderCategoryId);
      });
      
      // Filter bookings and blocks by category
      const filteredBookings: Record<string, number> = {};
      const filteredBlocks: Record<string, number> = {};
      Object.entries(day.bookingsByCategory).forEach(([catId, count]) => {
        if (catId === 'all' || activeCategories.includes(catId)) filteredBookings[catId] = count;
      });
      Object.entries(day.blocksByCategory || {}).forEach(([catId, count]) => {
        if (catId === 'all' || activeCategories.includes(catId)) filteredBlocks[catId] = count;
      });
      
      // Recalculate status based on filtered slots
      // When a specific category is selected, check if ALL time slots for that category are blocked
      let status: 'available' | 'partial' | 'blocked' = 'available';
      const blockedSlots = filteredSlots.filter(s => s.status === 'BLOCKED' || s.status === 'BOOKED').length;
      const totalSlots = filteredSlots.length;
      
      // For specific category filter, also consider if there are no slots yet (means available)
      // But if we know all 3 time slots should exist and all matching ones are blocked, it's blocked
      if (isSpecificCategorySelected && blockedSlots > 0) {
        // Count blocked time slot types for the active categories
        const blockedTimeSlotTypes = new Set(
          filteredSlots
            .filter(s => s.status === 'BLOCKED' || s.status === 'BOOKED')
            .map(s => s.timeSlotType)
        );
        // If all 3 time slots are blocked for the selected category, it's fully blocked
        if (blockedTimeSlotTypes.size >= 3) {
          status = 'blocked';
        } else if (blockedSlots > 0) {
          status = 'partial';
        }
      } else if (totalSlots > 0) {
        if (blockedSlots === totalSlots && blockedSlots >= 3) {
          status = 'blocked';
        } else if (blockedSlots > 0) {
          status = 'partial';
        } else {
          status = 'available';
        }
      }
      
      return { 
        ...day, 
        slots: filteredSlots, 
        orders: filteredOrders,
        bookingsByCategory: filteredBookings,
        blocksByCategory: filteredBlocks,
        status 
      };
    });
  }, [calendarData, categoryFilters]);

  // Handle day click
  const handleDayClick = useCallback((day: CalendarDay) => {
    setSelectedDay(day);
    setIsPanelOpen(true);
  }, []);

  // Toggle category filter - when clicking a category, show only that category
  const toggleCategoryFilter = useCallback((categoryId: string) => {
    setCategoryFilters(prev => {
      const clickedFilter = prev.find(f => f.id === categoryId);
      if (!clickedFilter) return prev;
      
      // If clicking an already active filter and there are multiple active, deactivate all others (show only this one)
      if (clickedFilter.active && prev.filter(f => f.active).length > 1) {
        return prev.map(f => ({ ...f, active: f.id === categoryId }));
      }
      // If clicking an inactive filter, activate only this one
      else if (!clickedFilter.active) {
        return prev.map(f => ({ ...f, active: f.id === categoryId }));
      }
      // If clicking the only active filter, activate all (show all services)
      else {
        return prev.map(f => ({ ...f, active: true }));
      }
    });
  }, []);

  // Block/Unblock specific time slot for a category
  const handleSlotAction = async (date: string, timeSlotType: TimeSlotType, categoryId: string | undefined, action: 'block' | 'unblock') => {
    const slotKey = `${date}-${timeSlotType}-${categoryId || 'all'}`;
    setSlotActionLoading(slotKey);
    try {
      if (action === 'block') {
        await vendorApi.blockTimeSlot(date, timeSlotType, categoryId);
      } else {
        await vendorApi.unblockTimeSlot(date, timeSlotType, categoryId);
      }
      toast.success(`Slot ${action === 'block' ? 'blocked' : 'unblocked'} successfully`);
      refetchAvailability();
      // Refresh selected day
      if (selectedDay && selectedDay.dateStr === date) {
        const response = await vendorApi.getDayDetails(date);
        if (response.success && response.data) {
          setSelectedDay(prev => prev ? { ...prev, slots: response.data } : null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} slot`);
    } finally {
      setSlotActionLoading(null);
    }
  };

  // Block/Unblock entire day
  const handleBlockDay = async (date: string, categoryId?: string) => {
    setIsSubmitting(true);
    try {
      // Ensure date is in correct format (yyyy-MM-dd)
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      
      await vendorApi.blockDay(dateStr, categoryId);
      toast.success('Day blocked successfully');
      refetchAvailability();
      if (selectedDay && selectedDay.dateStr === dateStr) {
        const response = await vendorApi.getDayDetails(dateStr);
        if (response.success && response.data) {
          setSelectedDay(prev => prev ? { ...prev, slots: response.data, status: 'blocked' } : null);
        }
      }
    } catch (error: any) {
      console.error('Error blocking day:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to block day';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockDay = async (date: string, categoryId?: string) => {
    setIsSubmitting(true);
    try {
      // Ensure date is in correct format (yyyy-MM-dd)
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      
      await vendorApi.unblockDay(dateStr, categoryId);
      toast.success('Day unblocked successfully');
      refetchAvailability();
      if (selectedDay && selectedDay.dateStr === dateStr) {
        const response = await vendorApi.getDayDetails(dateStr);
        if (response.success && response.data) {
          setSelectedDay(prev => prev ? { ...prev, slots: response.data, status: 'available' } : null);
        }
      }
    } catch (error: any) {
      console.error('Error unblocking day:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unblock day';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle custom time slot blocking
  const handleBlockCustomTime = async () => {
    if (!selectedDay || !customTimeData.fromTime || !customTimeData.toTime) {
      toast.error('Please provide both from and to times');
      return;
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(customTimeData.fromTime) || !timeRegex.test(customTimeData.toTime)) {
      toast.error('Please use valid time format (HH:MM, e.g., 09:00)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await vendorApi.blockCustomTime(
        selectedDay.dateStr,
        customTimeData.fromTime,
        customTimeData.toTime,
        customTimeData.categoryId || undefined,
        customTimeData.notes || undefined
      );
      toast.success(`Time slot ${customTimeData.fromTime} - ${customTimeData.toTime} blocked successfully`);
      setShowCustomTimeDialog(false);
      setCustomTimeData({ fromTime: '', toTime: '', categoryId: '', notes: '' });
      refetchAvailability();
      if (selectedDay) {
        const response = await vendorApi.getDayDetails(selectedDay.dateStr);
        if (response.success && response.data) {
          setSelectedDay(prev => prev ? { ...prev, slots: response.data } : null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to block custom time slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400';
      case 'partial': return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400';
      case 'blocked': return 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400';
      default: return 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400';
    }
  };

  // Render category badges for blocked slots - shows which categories are blocked on this day
  const renderCategoryBadges = (day: CalendarDay) => {
    const allCategoriesActive = categoryFilters.length === 0 || categoryFilters.every(f => f.active);
    
    // Only show badges when "All Services" is selected
    if (!allCategoriesActive) return null;
    
    // Get category info from categoriesMap or categoryFilters
    const getBadgeCategoryIcon = (catId: string): string => {
      if (catId === 'all') return '🚫';
      const cat = categoriesMap.get(catId);
      if (isValidIcon(cat?.icon)) return cat!.icon;
      const filter = categoryFilters.find(f => f.id === catId);
      if (isValidIcon(filter?.icon)) return filter!.icon;
      return getCategoryIcon(catId, cat?.name || filter?.name);
    };
    
    const getCategoryName = (catId: string): string => {
      if (catId === 'all') return 'All Services';
      const cat = categoriesMap.get(catId);
      if (cat?.name) return cat.name;
      const filter = categoryFilters.find(f => f.id === catId);
      if (filter?.name) return filter.name;
      return catId;
    };
    
    // Only show BLOCKED categories (vendor manually blocks)
    const blockedData: Array<{ catId: string; count: number; icon: string; name: string }> = [];
    
    // Get blocked slots by category
    if (day.blocksByCategory) {
      Object.entries(day.blocksByCategory).forEach(([catId, count]) => {
        if (count > 0) {
          blockedData.push({
            catId,
            count,
            icon: getBadgeCategoryIcon(catId),
            name: getCategoryName(catId)
          });
        }
      });
    }
    
    if (blockedData.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-0.5 mt-1 justify-center items-center">
        {blockedData.slice(0, 3).map(({ catId, count, icon, name }) => (
          <div 
            key={catId} 
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm",
              "transition-all duration-200 hover:scale-105 cursor-default",
              "bg-gray-700 text-white dark:bg-gray-600"
            )}
            title={`${name}: ${count} slot${count > 1 ? 's' : ''} blocked`}
          >
            <span className="text-[11px] opacity-90">{icon}</span>
            {count > 1 && <span className="text-[9px] font-bold">{count}</span>}
          </div>
        ))}
        {blockedData.length > 3 && (
          <div 
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gray-500 text-white shadow-sm"
            title={`+${blockedData.length - 3} more categories blocked`}
          >
            +{blockedData.length - 3}
          </div>
        )}
      </div>
    );
  };

  // Get slot status for a specific time slot and category
  const getSlotStatus = (day: CalendarDay, timeSlotType: TimeSlotType, categoryId?: string): { status: SlotStatus; slot?: AvailabilitySlot; order?: any } => {
    // Check if there's an order for this slot
    const order = day.orders.find(o => {
      if (categoryId && o.listingCategoryId !== categoryId) return false;
      // Match time slot based on event time
      if (o.eventTime) {
        const hour = parseInt(o.eventTime.split(':')[0]);
        if (timeSlotType === 'MORNING' && hour >= 6 && hour < 12) return true;
        if (timeSlotType === 'AFTERNOON' && hour >= 12 && hour < 17) return true;
        if (timeSlotType === 'EVENING' && hour >= 17) return true;
      }
      return timeSlotType === 'FULL_DAY';
    });
    if (order) return { status: 'BOOKED', order };

    // Check availability slots
    const slot = day.slots.find(s => {
      const matchesCategory = !categoryId || s.categoryId === categoryId || !s.categoryId;
      const matchesTimeSlot = s.timeSlotType === timeSlotType || s.timeSlot === timeSlotType || 
                              (s.timeSlotType === 'FULL_DAY' && !s.timeSlotType);
      return matchesCategory && matchesTimeSlot;
    });
    
    if (slot) return { status: slot.status, slot };
    return { status: 'AVAILABLE' };
  };

  // Loading state - wait for profile check to complete
  if (profileLoading || !vendorProfile) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Loading calendar..." />
        </div>
      </VendorLayout>
    );
  }
  
  // Only show profile completion prompt after loading is complete
  if (!profileLoading && !profileComplete) {
    return (
      <VendorLayout>
        <CompleteProfilePrompt 
          title="Complete Your Profile to Manage Availability"
          description="You need to set up your vendor profile before you can manage your calendar and availability."
          featureName="calendar"
        />
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <TooltipProvider delayDuration={200}>
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Calendar</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your availability and bookings</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle - Week and List temporarily disabled */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="hidden md:block">
                <TabsList className="h-9">
                  <TabsTrigger value="month" className="h-8 px-3 text-xs"><Grid3X3 className="h-4 w-4 mr-1.5" />Month</TabsTrigger>
                  {/* <TabsTrigger value="week" className="h-8 px-3 text-xs"><CalendarDays className="h-4 w-4 mr-1.5" />Week</TabsTrigger> */}
                  {/* <TabsTrigger value="list" className="h-8 px-3 text-xs"><List className="h-4 w-4 mr-1.5" />List</TabsTrigger> */}
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={() => { refetchAvailability(); toast.success('Calendar refreshed'); }} disabled={availabilityLoading} className="h-9 px-3">
                <RefreshCw className={cn("h-4 w-4", availabilityLoading && "animate-spin")} />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Category Filters - Enhanced UI */}
          {categoryFilters.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Filter className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Filter by Service</span>
                </div>
                {!categoryFilters.every(f => f.active) && (
                  <button 
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={() => setCategoryFilters(prev => prev.map(f => ({ ...f, active: true })))}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button 
                  className={cn(
                    "h-8 px-3 text-xs font-semibold rounded-lg transition-all duration-150",
                    categoryFilters.every(f => f.active) 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCategoryFilters(prev => prev.map(f => ({ ...f, active: true })));
                  }}
                >
                  All Services
                </button>
                {categoryFilters.map(filter => (
                  <button 
                    key={filter.id} 
                    className={cn(
                      "h-8 px-3 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5",
                      filter.active && !categoryFilters.every(f => f.active)
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCategoryFilter(filter.id);
                    }}
                  >
                    <span className="text-sm">{filter.icon}</span>
                    <span>{filter.name}</span>
                    {filter.active && !categoryFilters.every(f => f.active) && (
                      <X className="h-3 w-3 ml-0.5 opacity-70" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <CalendarBulkActions categoryFilters={categoryFilters} onRefresh={refetchAvailability} />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(viewMode === 'week' ? subWeeks(currentMonth, 1) : subMonths(currentMonth, 1))} disabled={availabilityLoading} className="h-8">
              <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline ml-1">Prev</span>
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold flex items-center gap-2 justify-center">
                {availabilityLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {viewMode === 'week' ? <>Week of {format(startOfWeek(currentMonth), 'MMM d, yyyy')}</> : <>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</>}
              </h2>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(viewMode === 'week' ? addWeeks(currentMonth, 1) : addMonths(currentMonth, 1))} disabled={availabilityLoading} className="h-8">
              <span className="hidden sm:inline mr-1">Next</span><ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 md:gap-6 text-xs flex-wrap">
            <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded bg-green-500/20 border border-green-500/40" /><span className="text-muted-foreground">Available</span></div>
            <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded bg-yellow-500/20 border border-yellow-500/40" /><span className="text-muted-foreground">Partial</span></div>
            <div className="flex items-center gap-1.5"><div className="h-4 w-4 rounded bg-gray-500/20 border border-gray-500/40" /><span className="text-muted-foreground">Blocked</span></div>
          </div>

          {/* Calendar Grid - Month View */}
          {viewMode === 'month' && (
            <Card className="relative overflow-hidden">
              {availabilityLoading && <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10" />}
              <CardContent className="p-2 md:p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {days.map(day => (<div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {filteredCalendarData.map((day, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <button onClick={() => day.isCurrentMonth && handleDayClick(day)} disabled={!day.isCurrentMonth}
                          className={cn(
                            "relative h-16 md:h-20 rounded-lg border transition-all duration-150 flex flex-col items-center justify-start pt-1 md:pt-2",
                            !day.isCurrentMonth && "opacity-30 cursor-not-allowed",
                            day.isCurrentMonth && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                            day.isCurrentMonth && getStatusColor(day.status),
                            day.isToday && "ring-2 ring-primary ring-offset-1",
                            selectedDay?.dateStr === day.dateStr && "ring-2 ring-primary"
                          )}>
                          <span className={cn("text-sm font-medium", day.isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center")}>
                            {day.date.getDate()}
                          </span>
                          {day.isCurrentMonth && renderCategoryBadges(day)}
                          {day.isCurrentMonth && day.status !== 'available' && (
                            <div className="absolute bottom-1 right-1">
                              {day.status === 'blocked' && <Ban className="h-3 w-3 text-gray-500" />}
                              {day.status === 'partial' && <span className="text-[10px]">◐</span>}
                            </div>
                          )}
                          {day.orders.length > 0 && (
                            <Badge variant="secondary" className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 text-[9px] bg-primary text-primary-foreground">{day.orders.length}</Badge>
                          )}
                        </button>
                      </TooltipTrigger>
                      {day.isCurrentMonth && (
                        <TooltipContent side="right" className="w-80 p-0 overflow-hidden" sideOffset={5}>
                          {/* Header with date */}
                          <div className="bg-gradient-to-r from-primary/90 to-primary px-4 py-3 text-primary-foreground">
                            <div className="font-bold text-sm">{format(day.date, 'EEEE')}</div>
                            <div className="text-xs opacity-90">{format(day.date, 'MMMM d, yyyy')}</div>
                          </div>
                          
                          <div className="p-3 space-y-3">
                            {/* Blocked Slots Section */}
                            {day.slots.filter(s => s.status === 'BLOCKED').length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  <Ban className="h-3.5 w-3.5" />
                                  <span>Blocked Slots</span>
                                </div>
                                <div className="space-y-1.5">
                                  {(() => {
                                    // Group blocked slots by category
                                    const blockedByCategory: Record<string, string[]> = {};
                                    day.slots.filter(s => s.status === 'BLOCKED').forEach(slot => {
                                      const catId = slot.categoryId || 'all';
                                      const catName = catId === 'all' ? 'All Services' : 
                                        (categoriesMap.get(catId)?.name || categoryFilters.find(f => f.id === catId)?.name || catId);
                                      const timeLabel = TIME_SLOT_INFO[slot.timeSlotType]?.label || slot.timeSlotType;
                                      if (!blockedByCategory[catName]) blockedByCategory[catName] = [];
                                      blockedByCategory[catName].push(timeLabel);
                                    });
                                    
                                    return Object.entries(blockedByCategory).map(([catName, times], i) => {
                                      const catId = catName === 'All Services' ? 'all' : 
                                        (categoryFilters.find(f => f.name === catName)?.id || 'all');
                                      const catData = categoriesMap.get(catId);
                                      const filterData = categoryFilters.find(f => f.id === catId);
                                      const icon = catId === 'all' ? '🚫' : 
                                        (isValidIcon(catData?.icon) ? catData!.icon : 
                                         isValidIcon(filterData?.icon) ? filterData!.icon : 
                                         getCategoryIcon(catId, catName));
                                      
                                      return (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                          <span className="text-base mt-0.5">{icon}</span>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs text-gray-800 dark:text-gray-200">{catName}</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {times.map((time, j) => (
                                                <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                  <Clock className="h-2.5 w-2.5" />
                                                  {time}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                              {/* Block/Unblock Entire Day */}
                              {day.status === 'blocked' ? (
                                <Button 
                                  size="sm" 
                                  className="w-full h-8 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnblockDay(day.dateStr);
                                  }}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                                  Unblock Entire Day
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="w-full h-8 text-xs font-medium bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockDay(day.dateStr);
                                  }}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Ban className="h-3.5 w-3.5 mr-1.5" />}
                                  Block Entire Day
                                </Button>
                              )}
                              
                              {/* View & Manage */}
                              <Button 
                                size="sm" 
                                className="w-full h-8 text-xs font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayClick(day);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View & Manage Slots
                              </Button>
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Week View - Temporarily Disabled */}
          {/* {viewMode === 'week' && <CalendarWeekView currentDate={currentMonth} calendarData={filteredCalendarData} onDayClick={handleDayClick} categoryFilters={categoryFilters} />} */}

          {/* List View - Temporarily Disabled */}
          {/* {viewMode === 'list' && <CalendarListView calendarData={filteredCalendarData} onDayClick={handleDayClick} onBlockDay={handleBlockDay} onUnblockDay={handleUnblockDay} isSubmitting={isSubmitting} />} */}

          {/* Slide-Out Panel - Enhanced UI */}
          <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
            <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden border-l-0 shadow-2xl">
              {selectedDay && (
                <div className="h-full flex flex-col">
                  {/* Beautiful Header with Gradient */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-600" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <div className="relative px-6 py-8">
                      <button 
                        onClick={() => setIsPanelOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                      
                      <div className="space-y-1">
                        <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                          {format(selectedDay.date, 'EEEE')}
                        </p>
                        <h2 className="text-white text-3xl font-bold">
                          {format(selectedDay.date, 'MMMM d')}
                        </h2>
                        <p className="text-white/60 text-sm">{format(selectedDay.date, 'yyyy')}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                        {selectedDay.status === 'available' && <Check className="h-4 w-4 text-green-300" />}
                        {selectedDay.status === 'partial' && <Clock className="h-4 w-4 text-yellow-300" />}
                        {selectedDay.status === 'blocked' && <Ban className="h-4 w-4 text-gray-300" />}
                        <span className="text-white font-medium capitalize">{selectedDay.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                    {/* Time Slot Management */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-1 rounded-full bg-primary" />
                        <h3 className="font-bold text-lg">Manage Time Slots</h3>
                      </div>
                      
                      {/* Category Sections */}
                      {(categoryFilters.length > 0 ? categoryFilters : [{ id: '', name: 'All Services', icon: '📦', active: true }]).map((category, catIdx) => {
                        const categoryBlockedSlots = selectedDay.slots.filter(s => 
                          (s.categoryId === category.id || (!s.categoryId && !category.id)) && 
                          (s.status === 'BLOCKED' || s.status === 'BOOKED')
                        ).length;
                        const allSlotsBlocked = categoryBlockedSlots >= DEFAULT_TIME_SLOTS.length;
                        
                        return (
                        <div key={category.id || 'all'} className="space-y-3">
                          {/* Category Header with Block Day Button */}
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <span className="text-xl">{category.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{category.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {DEFAULT_TIME_SLOTS.length - categoryBlockedSlots} slots available
                                </p>
                              </div>
                            </div>
                            {/* Block/Unblock Day for this Category */}
                            <button
                              onClick={() => allSlotsBlocked 
                                ? handleUnblockDay(selectedDay.dateStr, category.id || undefined)
                                : handleBlockDay(selectedDay.dateStr, category.id || undefined)
                              }
                              disabled={isSubmitting}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                allSlotsBlocked 
                                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              )}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : allSlotsBlocked ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Unblock Day</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="h-3 w-3" />
                                  <span>Block Day</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* Time Slots Grid */}
                          <div className="grid gap-2">
                            {DEFAULT_TIME_SLOTS.map((slotType, slotIdx) => {
                              const slotInfo = TIME_SLOT_INFO[slotType];
                              const { status, slot, order } = getSlotStatus(selectedDay, slotType, category.id || undefined);
                              const slotKey = `${selectedDay.dateStr}-${slotType}-${category.id || 'all'}`;
                              const isLoading = slotActionLoading === slotKey;
                              const isBlocked = status === 'BLOCKED' || status === 'BOOKED';
                              
                              return (
                                <div 
                                  key={slotType} 
                                  className={cn(
                                    "group relative overflow-hidden rounded-xl border-2 transition-all duration-300",
                                    isBlocked && "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",
                                    !isBlocked && "border-green-300 bg-white dark:border-green-800 dark:bg-gray-900 hover:border-green-400 hover:shadow-md"
                                  )}
                                  style={{ animationDelay: `${(catIdx * 3 + slotIdx) * 50}ms` }}
                                >
                                  <div className="flex items-center justify-between p-4">
                                    {/* Left: Time Info */}
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "flex items-center justify-center w-12 h-12 rounded-xl",
                                        isBlocked && "bg-gray-200 dark:bg-gray-700",
                                        !isBlocked && "bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/20"
                                      )}>
                                        <div className={cn(
                                          "text-lg",
                                          isBlocked && "text-gray-500",
                                          !isBlocked && "text-green-600"
                                        )}>
                                          {slotInfo.icon}
                                        </div>
                                      </div>
                                      <div>
                                        <p className={cn(
                                          "font-semibold",
                                          isBlocked && "text-gray-600 dark:text-gray-400",
                                          !isBlocked && "text-gray-900 dark:text-white"
                                        )}>
                                          {slotInfo.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{slotInfo.time}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Right: Status & Action */}
                                    <div className="flex items-center gap-2">
                                      {isBlocked ? (
                                        <button
                                          onClick={() => handleSlotAction(selectedDay.dateStr, slotType, category.id || undefined, 'unblock')}
                                          disabled={isLoading}
                                          className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                            "bg-white border-2 border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700",
                                            "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                                          )}
                                        >
                                          {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <>
                                              <Check className="h-4 w-4" />
                                              <span>Unblock</span>
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleSlotAction(selectedDay.dateStr, slotType, category.id || undefined, 'block')}
                                          disabled={isLoading}
                                          className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                            "bg-gray-100 border-2 border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-800",
                                            "dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                          )}
                                        >
                                          {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <>
                                              <Ban className="h-4 w-4" />
                                              <span>Block</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Blocked Overlay Pattern */}
                                  {isBlocked && (
                                    <div className="absolute inset-0 pointer-events-none opacity-5">
                                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,currentColor_10px,currentColor_11px)]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Custom Time Slot Option */}
                          <Dialog open={showCustomTimeDialog} onOpenChange={setShowCustomTimeDialog}>
                            <DialogTrigger asChild>
                              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium text-sm">Block Custom Time</span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Block Custom Time Slot</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fromTime">From Time</Label>
                                  <Input
                                    id="fromTime"
                                    type="time"
                                    value={customTimeData.fromTime}
                                    onChange={(e) => setCustomTimeData(prev => ({ ...prev, fromTime: e.target.value }))}
                                    placeholder="09:00"
                                  />
                                  <p className="text-xs text-muted-foreground">Start time (24-hour format)</p>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="toTime">To Time</Label>
                                  <Input
                                    id="toTime"
                                    type="time"
                                    value={customTimeData.toTime}
                                    onChange={(e) => setCustomTimeData(prev => ({ ...prev, toTime: e.target.value }))}
                                    placeholder="17:00"
                                  />
                                  <p className="text-xs text-muted-foreground">End time (24-hour format)</p>
                                </div>
                                {categoryFilters.length > 0 && (
                                  <div className="space-y-2">
                                    <Label htmlFor="category">Category (Optional)</Label>
                                    <select
                                      id="category"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      value={customTimeData.categoryId}
                                      onChange={(e) => setCustomTimeData(prev => ({ ...prev, categoryId: e.target.value }))}
                                    >
                                      <option value="">All Services</option>
                                      {categoryFilters.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Input
                                    id="notes"
                                    value={customTimeData.notes}
                                    onChange={(e) => setCustomTimeData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Reason for blocking..."
                                  />
                                </div>
                                <div className="flex gap-3 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setShowCustomTimeDialog(false);
                                      setCustomTimeData({ fromTime: '', toTime: '', categoryId: '', notes: '' });
                                    }}
                                    className="flex-1 h-11"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleBlockCustomTime}
                                    disabled={isSubmitting || !customTimeData.fromTime || !customTimeData.toTime}
                                    className="flex-1 h-11 bg-primary hover:bg-primary/90"
                                  >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                                    Block Time
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </TooltipProvider>
    </VendorLayout>
  );
}
