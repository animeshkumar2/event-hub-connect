import { useState, useEffect, useMemo, useCallback } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import { 
  ChevronLeft, ChevronRight, RefreshCw, Loader2, X, Ban, Check, Eye, Clock,
  Sun, Sunset, Moon, CalendarDays
} from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { toast } from 'sonner';
import { useMyVendorAvailability, useVendorUpcomingOrders, useMyVendorListings, useVendorProfile, useCategories } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isToday, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useVendorProfile as useVendorProfileCompletion } from '@/shared/hooks/useVendorProfile';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';
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
  const [openPopoverIdx, setOpenPopoverIdx] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customTimeCategory, setCustomTimeCategory] = useState<string | null>(null);
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
    // Open the active category filter, or first category if "All Services"
    const activeCat = categoryFilters.length > 0 && !categoryFilters.every(f => f.active)
      ? categoryFilters.find(f => f.active)
      : null;
    if (activeCat) {
      setExpandedCategory(activeCat.id);
    } else {
      const cats = categoryFilters.length > 0 ? categoryFilters : [{ id: '', name: 'All Services', icon: '📦', active: true }];
      setExpandedCategory(cats[0]?.id ?? '');
    }
  }, [categoryFilters]);

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
    
    // Validate from < to
    if (customTimeData.fromTime >= customTimeData.toTime) {
      toast.error('Start time must be before end time');
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
      setCustomTimeCategory(null);
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

  // Check if a date is in the past (before today)
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
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
        <div className="p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">My Calendar</h1>
              <p className="text-muted-foreground text-xs mt-0.5 hidden sm:block">Manage your availability and bookings</p>
            </div>
            <div className="flex items-center gap-1">
              <CalendarBulkActions categoryFilters={categoryFilters} onRefresh={refetchAvailability} />
              <Button variant="ghost" size="icon" onClick={() => { refetchAvailability(); toast.success('Calendar refreshed'); }} disabled={availabilityLoading} className="h-8 w-8">
                <RefreshCw className={cn("h-3.5 w-3.5", availabilityLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Category Filters - horizontal scroll chips */}
          {categoryFilters.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-2 px-2">
              <button 
                className={cn(
                  "h-7 px-2.5 text-[11px] font-medium rounded-full transition-all whitespace-nowrap shrink-0",
                  categoryFilters.every(f => f.active) 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setCategoryFilters(prev => prev.map(f => ({ ...f, active: true })))}
              >
                All
              </button>
              {categoryFilters.map(filter => (
                <button 
                  key={filter.id} 
                  className={cn(
                    "h-7 px-2.5 text-[11px] font-medium rounded-full transition-all flex items-center gap-1 whitespace-nowrap shrink-0",
                    filter.active && !categoryFilters.every(f => f.active)
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => toggleCategoryFilter(filter.id)}
                >
                  <span className="text-xs">{filter.icon}</span>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation - clean and minimal */}
          <div className="flex items-center justify-between">
            <button onClick={() => { setOpenPopoverIdx(null); setCurrentMonth(viewMode === 'week' ? subWeeks(currentMonth, 1) : subMonths(currentMonth, 1)); }} disabled={availabilityLoading} className="p-1.5 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {availabilityLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span className="text-sm sm:text-base font-semibold">
                {viewMode === 'week' ? format(startOfWeek(currentMonth), 'MMM d, yyyy') : <>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</>}
              </span>
              <button className="text-[10px] text-primary font-medium hover:underline" onClick={() => setCurrentMonth(new Date())}>Today</button>
            </div>
            <button onClick={() => { setOpenPopoverIdx(null); setCurrentMonth(viewMode === 'week' ? addWeeks(currentMonth, 1) : addMonths(currentMonth, 1)); }} disabled={availabilityLoading} className="p-1.5 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Legend - inline, subtle */}
          <div className="hidden sm:flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500/50 inline-block" />Available</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500/50 inline-block" />Partial</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400/50 inline-block" />Blocked</span>
          </div>

          {/* Calendar Grid - Month View */}
          {viewMode === 'month' && (
            <div className="relative rounded-lg sm:border sm:bg-card sm:shadow-sm overflow-hidden">
              {availabilityLoading && <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 rounded-lg" />}
              <div className="sm:p-3 md:p-4">
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center text-[11px] font-medium text-muted-foreground py-1.5">
                    <span className="sm:hidden">{d}</span>
                    <span className="hidden sm:inline">{days[i]}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-[3px] sm:gap-1">
                {filteredCalendarData.map((day, idx) => (
                  <Popover key={idx} open={openPopoverIdx === idx} onOpenChange={(open) => setOpenPopoverIdx(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (!day.isCurrentMonth || isPastDate(day.date)) return;
                          if (window.innerWidth < 640) {
                            handleDayClick(day);
                          } else {
                            setOpenPopoverIdx(openPopoverIdx === idx ? null : idx);
                          }
                        }} 
                        disabled={!day.isCurrentMonth || isPastDate(day.date)}
                        className={cn(
                          "relative aspect-square sm:aspect-auto sm:h-16 md:h-20 rounded-md sm:rounded-lg border transition-all duration-100 flex flex-col items-center justify-center sm:justify-start sm:pt-2",
                          !day.isCurrentMonth && "opacity-20",
                          day.isCurrentMonth && isPastDate(day.date) && "opacity-30 bg-muted/30 border-transparent",
                          day.isCurrentMonth && !isPastDate(day.date) && "cursor-pointer active:scale-[0.92] hover:ring-2 hover:ring-primary/40",
                          day.isCurrentMonth && !isPastDate(day.date) && day.status === 'available' && "bg-green-50/80 dark:bg-green-950/20 border-green-200/60 dark:border-green-800/40",
                          day.isCurrentMonth && !isPastDate(day.date) && day.status === 'partial' && "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40",
                          day.isCurrentMonth && !isPastDate(day.date) && day.status === 'blocked' && "bg-gray-100/80 dark:bg-gray-800/30 border-gray-300/60 dark:border-gray-700/40",
                          selectedDay?.dateStr === day.dateStr && "ring-2 ring-primary shadow-sm"
                        )}>
                        <span className={cn(
                          "text-xs sm:text-sm font-medium leading-none",
                          day.isToday && "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-sm"
                        )}>
                          {day.date.getDate()}
                        </span>
                        
                        {/* Status indicator */}
                        {day.isCurrentMonth && !isPastDate(day.date) && day.status !== 'available' && (
                          <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-1">
                            {day.status === 'blocked' && <><span className="sm:hidden block h-1.5 w-1.5 rounded-full bg-gray-400" /><Ban className="hidden sm:block h-3 w-3 text-gray-400" /></>}
                            {day.status === 'partial' && <><span className="sm:hidden block h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="hidden sm:inline text-[10px]">◐</span></>}
                          </div>
                        )}
                        {day.isCurrentMonth && (
                          <div className="hidden sm:contents">{renderCategoryBadges(day)}</div>
                        )}
                        {day.orders.length > 0 && (
                          <Badge variant="secondary" className="absolute -top-0.5 -right-0.5 sm:top-0.5 sm:right-0.5 h-3.5 sm:h-4 min-w-3.5 sm:min-w-4 px-0.5 sm:px-1 text-[8px] sm:text-[9px] bg-primary text-primary-foreground shadow-sm">{day.orders.length}</Badge>
                        )}
                      </button>
                    </PopoverTrigger>
                      {day.isCurrentMonth && !isPastDate(day.date) && (
                        <PopoverContent className="w-56 p-0 overflow-hidden rounded-lg shadow-lg" sideOffset={5}>
                          <div className="px-3 py-2 bg-primary text-primary-foreground flex items-center justify-between">
                            <span className="font-medium text-xs">{format(day.date, 'EEE, MMM d')}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                              day.status === 'available' && "bg-green-400/30",
                              day.status === 'partial' && "bg-yellow-400/30",
                              day.status === 'blocked' && "bg-white/20"
                            )}>{day.status}</span>
                          </div>
                          
                          <div className="p-2 space-y-1.5">
                            {/* Only show blocked slots */}
                            {(() => {
                              const blockedSlots = day.slots.filter(s => s.status === 'BLOCKED' || s.status === 'BOOKED');
                              if (blockedSlots.length === 0) return (
                                <p className="text-[11px] text-muted-foreground text-center py-1">No blocked slots</p>
                              );
                              
                              // Group by category
                              const grouped: Record<string, string[]> = {};
                              blockedSlots.forEach(slot => {
                                const catId = slot.categoryId || 'all';
                                const cat = categoriesMap.get(catId);
                                const filter = categoryFilters.find(f => f.id === catId);
                                const name = catId === 'all' ? 'All' : (cat?.name || filter?.name || catId);
                                const icon = catId === 'all' ? '🚫' : (isValidIcon(cat?.icon) ? cat!.icon : getCategoryIcon(catId, name));
                                const key = `${icon} ${name}`;
                                if (!grouped[key]) grouped[key] = [];
                                const timeLabel = (slot.timeSlot && slot.timeSlot.includes('-') && !['MORNING','AFTERNOON','EVENING','FULL_DAY'].includes(slot.timeSlot))
                                  ? slot.timeSlot.replace('-', ' – ')
                                  : (TIME_SLOT_INFO[slot.timeSlotType as TimeSlotType]?.label || slot.timeSlotType);
                                grouped[key].push(timeLabel);
                              });
                              
                              return Object.entries(grouped).map(([catLabel, times]) => (
                                <div key={catLabel} className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{catLabel}</span>
                                  <span className="text-gray-400 dark:text-gray-500 shrink-0">{times.join(', ')}</span>
                                </div>
                              ));
                            })()}
                            
                            {/* Actions */}
                            <div className="flex gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                              {!isPastDate(day.date) && (
                                (() => {
                                  const activeCat = categoryFilters.length > 0 && !categoryFilters.every(f => f.active)
                                    ? categoryFilters.find(f => f.active) : null;
                                  return (
                                    <>
                                      {day.slots.some(s => s.status === 'BLOCKED') && (
                                        <button onClick={async (e) => { 
                                          e.stopPropagation(); 
                                          // Unblock standard slots
                                          await handleUnblockDay(day.dateStr, activeCat?.id);
                                          // Also delete any custom blocked slots
                                          const customSlots = day.slots.filter(s => 
                                            (s.status === 'BLOCKED' || s.status === 'BOOKED') &&
                                            s.timeSlot && s.timeSlot.includes('-') && 
                                            !['MORNING','AFTERNOON','EVENING','FULL_DAY'].includes(s.timeSlot) &&
                                            (!activeCat || s.categoryId === activeCat.id || !s.categoryId)
                                          );
                                          for (const slot of customSlots) {
                                            try { await vendorApi.deleteSlot(slot.id); } catch {}
                                          }
                                          if (customSlots.length > 0) refetchAvailability();
                                        }}
                                          disabled={isSubmitting}
                                          className="flex-1 flex items-center justify-center gap-1 h-7 rounded text-[11px] font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20">
                                          <Check className="h-3 w-3" />Unblock
                                        </button>
                                      )}
                                      {day.status !== 'blocked' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleBlockDay(day.dateStr, activeCat?.id); }}
                                          disabled={isSubmitting}
                                          className="flex-1 flex items-center justify-center gap-1 h-7 rounded text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                                          <Ban className="h-3 w-3" />Block
                                        </button>
                                      )}
                                    </>
                                  );
                                })()
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setOpenPopoverIdx(null); handleDayClick(day); }}
                                className="flex-1 flex items-center justify-center gap-1 h-7 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                                <Eye className="h-3 w-3" />Manage
                              </button>
                            </div>
                          </div>
                        </PopoverContent>
                      )}
                  </Popover>
                  ))}
              </div>
              </div>
            </div>
          )}

          {/* Week View - Temporarily Disabled */}
          {/* {viewMode === 'week' && <CalendarWeekView currentDate={currentMonth} calendarData={filteredCalendarData} onDayClick={handleDayClick} categoryFilters={categoryFilters} />} */}

          {/* List View - Temporarily Disabled */}
          {/* {viewMode === 'list' && <CalendarListView calendarData={filteredCalendarData} onDayClick={handleDayClick} onBlockDay={handleBlockDay} onUnblockDay={handleUnblockDay} isSubmitting={isSubmitting} />} */}

          {/* Slide-Out Panel */}
          <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
            <SheetContent side="right" className="w-full sm:max-w-sm p-0 overflow-hidden border-l-0 shadow-2xl [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:opacity-100">
              {selectedDay && (
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/15">
                      <span className="text-white text-lg font-bold leading-none">{selectedDay.date.getDate()}</span>
                      <span className="text-white/60 text-[9px] uppercase">{format(selectedDay.date, 'MMM')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-semibold">{format(selectedDay.date, 'EEEE')}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                          selectedDay.status === 'available' && "bg-green-400/30 text-green-100",
                          selectedDay.status === 'partial' && "bg-yellow-400/30 text-yellow-100",
                          selectedDay.status === 'blocked' && "bg-white/20 text-white/70"
                        )}>{selectedDay.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gray-50 dark:bg-gray-950">
                    {/* Category Sections */}
                    {(categoryFilters.length > 0 ? categoryFilters : [{ id: '', name: 'All Services', icon: '📦', active: true }]).map((category, catIdx) => {
                        const categoryBlockedSlots = selectedDay.slots.filter(s => 
                          (s.categoryId === category.id || (!s.categoryId && !category.id)) && 
                          (s.status === 'BLOCKED' || s.status === 'BOOKED')
                        ).length;
                        const allSlotsBlocked = categoryBlockedSlots >= DEFAULT_TIME_SLOTS.length;
                        const availableCount = DEFAULT_TIME_SLOTS.length - categoryBlockedSlots;
                        
                        return (
                        <div key={category.id || 'all'} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                          {/* Category Header - clickable to expand/collapse */}
                          <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => setExpandedCategory(prev => prev === (category.id || '') ? null : (category.id || ''))}>
                            <div className="flex items-center gap-2">
                              <ChevronRight className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandedCategory === (category.id || '') && "rotate-90")} />
                              <span className="text-sm">{category.icon}</span>
                              <span className="font-medium text-xs">{category.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {allSlotsBlocked ? '(blocked)' : `${availableCount}/${DEFAULT_TIME_SLOTS.length}`}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); allSlotsBlocked 
                                ? handleUnblockDay(selectedDay.dateStr, category.id || undefined)
                                : handleBlockDay(selectedDay.dateStr, category.id || undefined);
                              }}
                              disabled={isSubmitting || isPastDate(selectedDay.date)}
                              className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                                allSlotsBlocked 
                                  ? "text-green-600 hover:bg-green-50 dark:text-green-400"
                                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400"
                              )}
                            >
                              {isSubmitting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : allSlotsBlocked ? (
                                <><Check className="h-2.5 w-2.5" />Unblock All</>
                              ) : (
                                <><Ban className="h-2.5 w-2.5" />Block All</>
                              )}
                            </button>
                          </div>
                          
                          {/* Collapsible Time Slots */}
                          {expandedCategory === (category.id || '') && (
                          <>
                          <div className="border-t border-gray-100 dark:border-gray-800">
                            {DEFAULT_TIME_SLOTS.map((slotType) => {
                              const slotInfo = TIME_SLOT_INFO[slotType];
                              const { status } = getSlotStatus(selectedDay, slotType, category.id || undefined);
                              const slotKey = `${selectedDay.dateStr}-${slotType}-${category.id || 'all'}`;
                              const isLoading = slotActionLoading === slotKey;
                              const isBlocked = status === 'BLOCKED' || status === 'BOOKED';
                              
                              return (
                                <div key={slotType} className={cn(
                                  "flex items-center justify-between px-3 py-1.5 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0",
                                  isBlocked && "bg-gray-50/50 dark:bg-gray-800/20"
                                )}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn("text-xs", isBlocked ? "text-gray-300" : "text-green-500")}>
                                      {slotInfo.icon}
                                    </div>
                                    <span className={cn("text-xs", isBlocked ? "text-gray-400 line-through" : "font-medium")}>{slotInfo.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{slotInfo.time}</span>
                                  </div>
                                  <button
                                    onClick={() => handleSlotAction(selectedDay.dateStr, slotType, category.id || undefined, isBlocked ? 'unblock' : 'block')}
                                    disabled={isLoading || isPastDate(selectedDay.date)}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                                      isBlocked ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
                                    )}
                                  >
                                    {isLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : isBlocked ? (
                                      <><Check className="h-2.5 w-2.5" />Unblock</>
                                    ) : (
                                      <><Ban className="h-2.5 w-2.5" />Block</>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Custom Blocked Slots */}
                          {(() => {
                            const customSlots = selectedDay.slots.filter(s => {
                              const matchesCat = s.categoryId === category.id || (!s.categoryId && !category.id);
                              const isCustom = s.timeSlot && s.timeSlot.includes('-') && !['MORNING','AFTERNOON','EVENING','FULL_DAY'].includes(s.timeSlot);
                              return matchesCat && isCustom && (s.status === 'BLOCKED' || s.status === 'BOOKED');
                            });
                            if (customSlots.length === 0) return null;
                            return (
                              <div className="border-t border-gray-100 dark:border-gray-800">
                                {customSlots.map((slot) => (
                                  <div key={slot.id} className="flex items-center justify-between px-3 py-1.5 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 bg-red-50/30 dark:bg-red-900/10">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-red-400" />
                                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">{slot.timeSlot.replace('-', ' – ')}</span>
                                      <span className="text-[9px] text-muted-foreground">Custom</span>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        try {
                                          setSlotActionLoading(slot.id);
                                          await vendorApi.deleteSlot(slot.id);
                                          toast.success('Custom slot unblocked');
                                          refetchAvailability();
                                          const response = await vendorApi.getDayDetails(selectedDay.dateStr);
                                          if (response.success && response.data) {
                                            setSelectedDay(prev => prev ? { ...prev, slots: response.data } : null);
                                          }
                                        } catch (err: any) {
                                          toast.error(err.message || 'Failed to unblock');
                                        } finally {
                                          setSlotActionLoading(null);
                                        }
                                      }}
                                      disabled={slotActionLoading === slot.id || isPastDate(selectedDay.date)}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-green-600 hover:bg-green-50"
                                    >
                                      {slotActionLoading === slot.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <><Check className="h-2.5 w-2.5" />Unblock</>}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                          
                          {/* Inline Custom Time */}
                          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800">
                            {customTimeCategory === (category.id || '') ? (
                              <div className="flex items-center gap-1.5">
                                <Input
                                  type="time"
                                  value={customTimeData.fromTime}
                                  onChange={(e) => setCustomTimeData(prev => ({ ...prev, fromTime: e.target.value }))}
                                  className="h-7 text-[11px] flex-1 px-2"
                                />
                                <span className="text-[10px] text-gray-400">to</span>
                                <Input
                                  type="time"
                                  value={customTimeData.toTime}
                                  onChange={(e) => setCustomTimeData(prev => ({ ...prev, toTime: e.target.value }))}
                                  className="h-7 text-[11px] flex-1 px-2"
                                />
                                <button
                                  onClick={async () => {
                                    if (selectedDay && customTimeData.fromTime && customTimeData.toTime) {
                                      // Validate from < to
                                      if (customTimeData.fromTime >= customTimeData.toTime) {
                                        toast.error('Start time must be before end time');
                                        return;
                                      }
                                      setCustomTimeData(prev => ({ ...prev, categoryId: category.id || '' }));
                                      // Call block directly with current data
                                      setIsSubmitting(true);
                                      try {
                                        await vendorApi.blockCustomTime(
                                          selectedDay.dateStr,
                                          customTimeData.fromTime,
                                          customTimeData.toTime,
                                          category.id || undefined,
                                          undefined
                                        );
                                        toast.success(`${customTimeData.fromTime} – ${customTimeData.toTime} blocked`);
                                        setCustomTimeCategory(null);
                                        setCustomTimeData({ fromTime: '', toTime: '', categoryId: '', notes: '' });
                                        refetchAvailability();
                                        const response = await vendorApi.getDayDetails(selectedDay.dateStr);
                                        if (response.success && response.data) {
                                          setSelectedDay(prev => prev ? { ...prev, slots: response.data } : null);
                                        }
                                      } catch (error: any) {
                                        toast.error(error.message || 'Failed to block custom time');
                                      } finally {
                                        setIsSubmitting(false);
                                      }
                                    }
                                  }}
                                  disabled={isSubmitting || !customTimeData.fromTime || !customTimeData.toTime}
                                  className="flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 shrink-0"
                                >
                                  {isSubmitting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Ban className="h-2.5 w-2.5" />}
                                  Block
                                </button>
                                <button
                                  onClick={() => { setCustomTimeCategory(null); setCustomTimeData({ fromTime: '', toTime: '', categoryId: '', notes: '' }); }}
                                  className="p-1 rounded text-gray-400 hover:text-gray-600 shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setCustomTimeCategory(category.id || ''); setCustomTimeData({ fromTime: '', toTime: '', categoryId: category.id || '', notes: '' }); }}
                                className="w-full flex items-center justify-center gap-1.5 py-1 rounded border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary hover:text-primary transition-colors text-[10px]"
                              >
                                <Clock className="h-3 w-3" />Custom Time
                              </button>
                            )}
                          </div>
                          </>
                          )}
                        </div>
                        );
                      })}
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
