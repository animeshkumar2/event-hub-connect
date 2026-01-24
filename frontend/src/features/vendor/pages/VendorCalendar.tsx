import { useState, useEffect, useMemo } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { BrandedLoader } from '@/shared/components/BrandedLoader';
import { toast } from 'sonner';
import { useMyVendorAvailability, useVendorUpcomingOrders } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, parseISO, isToday } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useVendorProfile as useVendorProfileCompletion } from '@/shared/hooks/useVendorProfile';
import CompleteProfilePrompt from '@/shared/components/CompleteProfilePrompt';

type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BUSY' | 'BLOCKED';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  status: 'available' | 'booked' | 'busy' | 'blocked' | 'none';
  booking?: { client: string; event: string };
  dateObj: Date;
}

export default function VendorCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [rangeStart, setRangeStart] = useState<CalendarDay | null>(null);
  const [rangeEnd, setRangeEnd] = useState<CalendarDay | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotStatus, setNewSlotStatus] = useState<SlotStatus>('AVAILABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<'BOOKED' | 'AVAILABLE' | null>(null);
  
  // Maximum range limit (28 days / 4 weeks) - only applies when marking as BOOKED
  const MAX_RANGE_DAYS = 28;

  // Fetch real availability data
  const startDate = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');
  const { data: availabilityData, loading: availabilityLoading, refetch: refetchAvailability } = useMyVendorAvailability(startDate, endDate);
  const { data: upcomingOrders } = useVendorUpcomingOrders();
  
  // Check if vendor profile is complete (MUST be after all other hooks)
  const { isComplete: profileComplete, isLoading: profileLoading } = useVendorProfileCompletion();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Transform availability data to day-level status
  const availabilityMap = useMemo(() => {
    const map = new Map<string, { status: 'available' | 'booked' | 'busy' | 'blocked', orders: any[] }>();
    
    if (availabilityData && Array.isArray(availabilityData)) {
      availabilityData.forEach((slot: any) => {
        let dateStr = '';
        if (slot.date) {
          if (typeof slot.date === 'string') {
            // Try to parse if it's a date string
            try {
              dateStr = format(parseISO(slot.date), 'yyyy-MM-dd');
            } catch {
              dateStr = slot.date; // Use as-is if parsing fails
            }
          } else {
            dateStr = format(new Date(slot.date), 'yyyy-MM-dd');
          }
        }
        if (!dateStr) return;
        
        const status = slot.status?.toUpperCase() || 'AVAILABLE';
        // Only handle booked status from availability slots
        // Available is the default, so we only need to mark booked
        const normalizedStatus = status === 'BOOKED' ? 'booked' : 'available';
        
        if (!map.has(dateStr)) {
          map.set(dateStr, { status: normalizedStatus, orders: [] });
        } else {
          const existing = map.get(dateStr)!;
          // If any slot is booked, day is booked
          if (normalizedStatus === 'booked') {
            existing.status = 'booked';
          }
        }
      });
    }
    
    // Add orders to map - orders mark days as booked
    if (upcomingOrders && Array.isArray(upcomingOrders)) {
      upcomingOrders.forEach((order: any) => {
        if (order.eventDate) {
          let dateStr = '';
          try {
            dateStr = format(parseISO(order.eventDate), 'yyyy-MM-dd');
          } catch {
            dateStr = format(new Date(order.eventDate), 'yyyy-MM-dd');
          }
          if (map.has(dateStr)) {
            const existing = map.get(dateStr)!;
            existing.orders.push(order);
            existing.status = 'booked'; // Mark as booked if there's an order
          } else {
            map.set(dateStr, { status: 'booked', orders: [order] });
          }
        }
      });
    }
    
    return map;
  }, [availabilityData, upcomingOrders]);

  // Get calendar data with real availability
  const getCalendarData = (month: number, year: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar: CalendarDay[] = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const dateObj = new Date(prevYear, prevMonth, daysInPrevMonth - i);
      calendar.push({ date: daysInPrevMonth - i, month: prevMonth, year: prevYear, status: 'available', dateObj });
    }

    // Current month days with real availability data
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const availability = availabilityMap.get(dateStr);
      
      let status: 'available' | 'booked' | 'busy' | 'blocked' | 'none' = 'available'; // Default to available
      let booking;
      
      if (availability) {
        // If there are orders, day is booked
        if (availability.orders && availability.orders.length > 0) {
          status = 'booked';
          const order = availability.orders[0];
          booking = {
            client: order.customerName || 'Customer',
            event: order.eventType || 'Event'
          };
        } else {
          // Use availability status if no orders
          status = availability.status === 'booked' ? 'booked' : 'available';
        }
      }

      calendar.push({ date: i, month, year, status, booking, dateObj });
    }

    // Next month days to fill grid
    const remaining = 42 - calendar.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(nextYear, nextMonth, i);
      calendar.push({ date: i, month: nextMonth, year: nextYear, status: 'available', dateObj });
    }

    return calendar;
  };

  const calendarData = getCalendarData(currentMonth.getMonth(), currentMonth.getFullYear());

  // Check if a date is in the selected range
  const isInRange = (day: CalendarDay) => {
    if (!rangeStart || !rangeEnd || !day.dateObj) return false;
    const dayTime = day.dateObj.getTime();
    const startTime = rangeStart.dateObj.getTime();
    const endTime = rangeEnd.dateObj.getTime();
    return dayTime >= startTime && dayTime <= endTime;
  };

  // Check status of all dates in the selected range
  const getRangeStatus = () => {
    if (!rangeStart || !rangeEnd) return { allBooked: false, allAvailable: false, mixed: false, bookedCount: 0, availableCount: 0, totalCount: 0 };
    
    // Get all dates in the range
    const dates: Date[] = [];
    const current = new Date(rangeStart.dateObj);
    const end = new Date(rangeEnd.dateObj);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Check status of each date
    let bookedCount = 0;
    let availableCount = 0;
    
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const availability = availabilityMap.get(dateStr);
      
      if (availability && availability.status === 'booked') {
        bookedCount++;
      } else {
        availableCount++;
      }
    });
    
    const totalCount = dates.length;
    
    return {
      allBooked: bookedCount === totalCount && totalCount > 0,
      allAvailable: availableCount === totalCount && totalCount > 0,
      mixed: bookedCount > 0 && availableCount > 0,
      bookedCount,
      availableCount,
      totalCount
    };
  };

  // Handle date click for range selection
  const handleDateClick = (day: CalendarDay) => {
    if (!isRangeMode) {
      // Single date mode - allow clicking any date
      setSelectedDate(day);
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    // Range mode - allow any date
    if (!rangeStart) {
      // First click - set start date
      setRangeStart(day);
      setRangeEnd(null);
      setSelectedDate(null);
    } else if (!rangeEnd) {
      // Second click - set end date
      let start = rangeStart;
      let end = day;
      
      // If clicked date is before start, swap them
      if (day.dateObj.getTime() < rangeStart.dateObj.getTime()) {
        start = day;
        end = rangeStart;
      }
      
      setRangeStart(start);
      setRangeEnd(end);
    } else {
      // Third click - reset and start new range
      setRangeStart(day);
      setRangeEnd(null);
    }
  };

  // Toggle between single date and range mode
  const toggleRangeMode = () => {
    setIsRangeMode(!isRangeMode);
    setRangeStart(null);
    setRangeEnd(null);
    setSelectedDate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
      case 'booked': return 'bg-red-500/20 text-red-400';
      default: return 'bg-green-500/20 text-green-400 hover:bg-green-500/30'; // Default to available
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlotDate || !newSlotTime) {
      toast.error('Please select date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const timeSlots = [{
        time: newSlotTime,  // Changed from timeSlot to time
        status: newSlotStatus
      }];
      
      await vendorApi.createAvailabilitySlots(newSlotDate, timeSlots);
      toast.success('Availability slot created');
      setShowCreateSlot(false);
      setNewSlotDate('');
      setNewSlotTime('');
      refetchAvailability();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSlot = async (status: 'AVAILABLE' | 'BOOKED' | 'BUSY' | 'BLOCKED') => {
    if (!selectedDate && !rangeStart) return;
    
    // Check range limit (28 days for both BOOKED and AVAILABLE)
    if (isRangeMode && rangeStart && rangeEnd) {
      const daysDiff = Math.ceil((rangeEnd.dateObj.getTime() - rangeStart.dateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (daysDiff > MAX_RANGE_DAYS) {
        toast.error(`Cannot update more than ${MAX_RANGE_DAYS} days at once. Selected: ${daysDiff} days. Please select a smaller range.`);
        return;
      }
    }
    
    setIsSubmitting(true);
    setSubmittingAction(status === 'BOOKED' ? 'BOOKED' : 'AVAILABLE');
    try {
      if (isRangeMode && rangeStart && rangeEnd) {
        // Handle date range with single bulk API call
        const startDateStr = format(rangeStart.dateObj, 'yyyy-MM-dd');
        const endDateStr = format(rangeEnd.dateObj, 'yyyy-MM-dd');
        
        const response = await vendorApi.bulkUpdateAvailability(startDateStr, endDateStr, status);
        
        // response.data contains the count of updated dates
        const updatedCount = response.data;
        const totalDays = Math.ceil((rangeEnd.dateObj.getTime() - rangeStart.dateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const skippedCount = totalDays - updatedCount;
        
        if (updatedCount > 0) {
          if (skippedCount > 0) {
            toast.success(`${updatedCount} dates marked as ${status.toLowerCase()} (${skippedCount} already ${status.toLowerCase()})`);
          } else {
            toast.success(`${updatedCount} dates marked as ${status.toLowerCase()}`);
          }
        } else if (skippedCount > 0) {
          toast.info(`All ${skippedCount} dates already ${status.toLowerCase()}`);
        }
        
        setRangeStart(null);
        setRangeEnd(null);
      } else if (selectedDate) {
        // Handle single date - use bulk API with same start and end date
        const dateStr = format(selectedDate.dateObj, 'yyyy-MM-dd');
        await vendorApi.bulkUpdateAvailability(dateStr, dateStr, status);
        toast.success('Availability updated');
        setSelectedDate(null);
      }
      
      refetchAvailability();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };

  // Show profile completion prompt if profile is not complete
  if (profileLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <BrandedLoader fullScreen={false} message="Syncing your schedule..." />
        </div>
      </VendorLayout>
    );
  }
  
  if (!profileComplete) {
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
      <div className="p-3 md:p-6 space-y-3 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Calendar & Availability</h1>
            <p className="text-foreground/60 text-xs md:text-sm">Manage your schedule and block dates</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {/* Mode Toggle - Segmented Control */}
            <div className="inline-flex rounded-lg border-2 border-border bg-muted/30 p-1">
              <button
                onClick={() => isRangeMode && toggleRangeMode()}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs md:text-sm font-medium transition-all",
                  !isRangeMode 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                Single Date
              </button>
              <button
                onClick={() => !isRangeMode && toggleRangeMode()}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs md:text-sm font-medium transition-all",
                  isRangeMode 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                Range Mode
              </button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-foreground hover:bg-muted text-xs md:text-sm"
              onClick={() => {
                refetchAvailability();
                toast.success('Calendar refreshed');
              }}
              disabled={availabilityLoading}
            >
              <RefreshCw className={`mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 ${availabilityLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            {/* Create Slot feature - commented out for single date availability
            <Dialog open={showCreateSlot} onOpenChange={setShowCreateSlot}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-secondary text-secondary-foreground">
                  <Plus className="mr-2 h-4 w-4" /> Create Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Availability Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Date</Label>
                    <Input 
                      type="date" 
                      className="bg-muted/50 border-border text-foreground" 
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Time</Label>
                    <Input 
                      type="time" 
                      className="bg-muted/50 border-border text-foreground" 
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Status</Label>
                    <Select value={newSlotStatus} onValueChange={(v) => setNewSlotStatus(v as SlotStatus)}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                        <SelectItem value="BUSY">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full bg-secondary text-secondary-foreground" 
                    onClick={handleCreateSlot}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Slot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            */}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-6 w-6 md:h-8 md:w-8 rounded-md bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
              <span className="text-[10px] md:text-xs font-medium text-green-600 dark:text-green-400">✓</span>
            </div>
            <span className="text-muted-foreground font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-6 w-6 md:h-8 md:w-8 rounded-md bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <span className="text-[10px] md:text-xs font-medium text-red-600 dark:text-red-400">✕</span>
            </div>
            <span className="text-muted-foreground font-medium">Booked</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="border-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary active:bg-primary/90 transition-colors font-medium h-8 md:h-9"
            disabled={availabilityLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <div className="text-center min-w-[160px] md:min-w-[200px]">
            <p className="text-base md:text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              {availabilityLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Showing 3 months
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="border-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary active:bg-primary/90 transition-colors font-medium h-8 md:h-9"
            disabled={availabilityLoading}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Range Mode Instructions */}
        {isRangeMode && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-2.5 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-foreground">Range Selection Mode Active</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {!rangeStart ? (
                      "Click on a date to select the start of your range"
                    ) : !rangeEnd ? (
                      "Click on another date to complete your range selection"
                    ) : (
                      "Range selected! Click 'Mark Range as Booked' below to confirm, or click another date to start a new selection"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3-Month Calendar View */}
        <div className="relative">
          {availabilityLoading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 rounded-lg cursor-wait" />
          )}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 transition-opacity duration-200",
            availabilityLoading && "opacity-50 pointer-events-none"
          )}>
          {[0, 1, 2].map((offset) => {
            const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
            const monthData = getCalendarData(monthDate.getMonth(), monthDate.getFullYear());

            return (
              <Card key={offset} className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-center pb-2 md:pb-3 px-3 md:px-6">
                  <CardTitle className="text-foreground text-sm md:text-base font-semibold text-center">
                    {months[monthDate.getMonth()]} {monthDate.getFullYear()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                    {days.map((day) => (
                      <div key={day} className="text-center text-[10px] md:text-xs text-muted-foreground font-medium py-1 md:py-2 uppercase tracking-wide">
                        {day}
                      </div>
                    ))}
                    {monthData.map((day, i) => {
                      const isCurrentMonth = day.month === monthDate.getMonth();
                      const isTodayDate = isToday(day.dateObj);
                      const isRangeStart = rangeStart && isSameDay(day.dateObj, rangeStart.dateObj);
                      const isRangeEnd = rangeEnd && isSameDay(day.dateObj, rangeEnd.dateObj);
                      const isInSelectedRange = isInRange(day);
                      const isSelected = selectedDate && isSameDay(day.dateObj, selectedDate.dateObj);
                      
                      return (
                        <button
                          key={i}
                          onClick={() => isCurrentMonth && handleDateClick(day)}
                          disabled={!isCurrentMonth}
                          className={cn(
                            "h-8 w-8 md:h-10 md:w-10 rounded-md text-xs md:text-sm flex items-center justify-center transition-all duration-150 relative font-medium",
                            !isCurrentMonth && "text-muted-foreground/30 cursor-not-allowed",
                            isCurrentMonth && day.status === 'available' && "text-green-700 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 cursor-pointer",
                            isCurrentMonth && day.status === 'booked' && "text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 cursor-pointer",
                            isTodayDate && isCurrentMonth && "ring-1 md:ring-2 ring-primary ring-offset-1 md:ring-offset-2",
                            isSelected && "!bg-primary !text-primary-foreground hover:!bg-primary !border-primary ring-1 md:ring-2 ring-primary ring-offset-1 md:ring-offset-2",
                            (isRangeStart || isRangeEnd) && "!bg-primary !text-primary-foreground hover:!bg-primary !border-primary ring-1 md:ring-2 ring-primary ring-offset-1 md:ring-offset-2",
                            isInSelectedRange && !isRangeStart && !isRangeEnd && "!bg-primary/30 !text-primary !border-primary/50"
                          )}
                        >
                          {isCurrentMonth && day.status === 'available' && (
                            <span className="absolute top-0 right-0 md:top-0.5 md:right-0.5 text-[8px] md:text-[10px] text-green-600 dark:text-green-400">✓</span>
                          )}
                          {isCurrentMonth && day.status === 'booked' && (
                            <span className="absolute top-0 right-0 md:top-0.5 md:right-0.5 text-[8px] md:text-[10px] text-red-600 dark:text-red-400">✕</span>
                          )}
                          <span className="relative z-10">{day.date}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>

        {/* Selected Date/Range Details */}
        {(selectedDate || (rangeStart && rangeEnd)) && (
          <Card className="border-border shadow-card border-border">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <CardTitle className="text-sm md:text-base text-foreground">
                {isRangeMode && rangeStart && rangeEnd ? (
                  <>
                    {rangeStart.date} {months[rangeStart.month]} - {rangeEnd.date} {months[rangeEnd.month]} {rangeEnd.year}
                    <span className="text-xs md:text-sm font-normal text-muted-foreground ml-2">
                      ({Math.ceil((rangeEnd.dateObj.getTime() - rangeStart.dateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                    </span>
                  </>
                ) : selectedDate ? (
                  `${selectedDate.date} ${months[selectedDate.month]} ${selectedDate.year}`
                ) : null}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedDate(null);
                  setRangeStart(null);
                  setRangeEnd(null);
                }} 
                className="text-foreground/60 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
              {isRangeMode && rangeStart && rangeEnd ? (
                <>
                  {(() => {
                    const dayCount = Math.ceil((rangeEnd.dateObj.getTime() - rangeStart.dateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const exceedsLimit = dayCount > MAX_RANGE_DAYS;
                    return (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-primary/20 text-primary text-xs">
                            Date Range Selected
                          </Badge>
                          {exceedsLimit ? (
                            <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 text-xs">
                              Too Large ({dayCount} days)
                            </Badge>
                          ) : dayCount > 14 && (
                            <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs">
                              {dayCount > 21 ? 'Large Range' : 'Medium Range'}
                            </Badge>
                          )}
                        </div>
                        <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                          <p className="text-sm md:text-base text-foreground font-medium">Mark this entire range?</p>
                          <p className="text-xs md:text-sm text-foreground/60">
                            This will affect all {dayCount} dates in the selected range.
                            {exceedsLimit && (
                              <span className="text-red-600 dark:text-red-400 font-medium block mt-2">
                                ⚠️ Range exceeds {MAX_RANGE_DAYS} day limit. Please select a smaller range to avoid performance issues.
                              </span>
                            )}
                            {!exceedsLimit && dayCount > 14 && <span className="text-yellow-600 dark:text-yellow-400 font-medium"> This may take a moment to process.</span>}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                  {(() => {
                    const rangeStatus = getRangeStatus();
                    const exceedsLimit = rangeEnd && rangeStart && Math.ceil((rangeEnd.dateObj.getTime() - rangeStart.dateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1 > MAX_RANGE_DAYS;
                    
                    return (
                      <>
                        {rangeStatus.mixed && (
                          <div className="p-2 md:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">
                              Mixed status: {rangeStatus.bookedCount} booked, {rangeStatus.availableCount} available
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                          {!rangeStatus.allBooked && (
                            <Button 
                              onClick={() => handleUpdateSlot('BOOKED')} 
                              variant="default"
                              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm w-full sm:w-auto"
                              disabled={isSubmitting || exceedsLimit}
                            >
                              {isSubmitting && submittingAction === 'BOOKED' ? <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> : null}
                              Mark Range as Booked
                            </Button>
                          )}
                          {!rangeStatus.allAvailable && (
                            <Button 
                              onClick={() => handleUpdateSlot('AVAILABLE')} 
                              variant="outline"
                              className="border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm w-full sm:w-auto"
                              disabled={isSubmitting || exceedsLimit}
                            >
                              {isSubmitting && submittingAction === 'AVAILABLE' ? <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> : null}
                              Mark Range as Available
                            </Button>
                          )}
                          {rangeStatus.allBooked && (
                            <div className="p-2 md:p-3 rounded-lg bg-muted/50 flex items-center gap-2 w-full sm:w-auto">
                              <Badge className="bg-red-500/20 text-red-400 text-xs">All dates already booked</Badge>
                            </div>
                          )}
                          {rangeStatus.allAvailable && (
                            <div className="p-2 md:p-3 rounded-lg bg-muted/50 flex items-center gap-2 w-full sm:w-auto">
                              <Badge className="bg-green-500/20 text-green-400 text-xs">All dates already available</Badge>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                
                </>
              ) : selectedDate ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(getStatusColor(selectedDate.status), "text-xs")}>
                      {selectedDate.status.charAt(0).toUpperCase() + selectedDate.status.slice(1)}
                    </Badge>
                  </div>

                  {selectedDate.booking && (
                    <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                      <p className="text-sm md:text-base text-foreground font-medium">{selectedDate.booking.event}</p>
                      <p className="text-xs md:text-sm text-foreground/60">{selectedDate.booking.client}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    {selectedDate.status === 'available' && (
                      <Button 
                        onClick={() => handleUpdateSlot('BOOKED')} 
                        variant="default" 
                        className="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && submittingAction === 'BOOKED' ? <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> : null}
                        Mark as Booked
                      </Button>
                    )}
                    {selectedDate.status === 'booked' && (
                      <>
                        <Button 
                          onClick={() => handleUpdateSlot('AVAILABLE')} 
                          className="bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm w-full sm:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting && submittingAction === 'AVAILABLE' ? <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" /> : null}
                          Mark as Available
                        </Button>
                        {selectedDate.booking && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">This date has a booking</Badge>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Google Calendar Sync Modal - commented out as not needed
        <Dialog open={showSyncModal} onOpenChange={setShowSyncModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Sync with Google Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-foreground/60">Connect your Google Calendar to automatically sync your availability.</p>
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Import events as blocked dates</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Export bookings to Google Calendar</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Two-way sync</span>
                  <Switch />
                </div>
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90">
                <CalendarIcon className="mr-2 h-4 w-4" /> Connect Google Calendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        */}
      </div>
    </VendorLayout>
  );
}
