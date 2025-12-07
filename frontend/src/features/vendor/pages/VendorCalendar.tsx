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
import { toast } from 'sonner';
import { useMyVendorAvailability, useVendorUpcomingOrders } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, parseISO, isToday } from 'date-fns';
import { cn } from '@/shared/lib/utils';

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
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotStatus, setNewSlotStatus] = useState<SlotStatus>('AVAILABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real availability data
  const startDate = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');
  const { data: availabilityData, loading: availabilityLoading, refetch: refetchAvailability } = useMyVendorAvailability(startDate, endDate);
  const { data: upcomingOrders } = useVendorUpcomingOrders();

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
      calendar.push({ date: daysInPrevMonth - i, month: prevMonth, year: prevYear, status: 'available' });
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
        timeSlot: newSlotTime,
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
    if (!selectedDate) return;
    
    // Find the slot for this date
    const dateStr = format(selectedDate.dateObj, 'yyyy-MM-dd');
    const slots = availabilityData?.filter((s: any) => {
      let slotDate = '';
      if (s.date) {
        try {
          slotDate = format(parseISO(s.date), 'yyyy-MM-dd');
        } catch {
          slotDate = format(new Date(s.date), 'yyyy-MM-dd');
        }
      }
      return slotDate === dateStr;
    });
    
    setIsSubmitting(true);
    try {
      if (!slots || slots.length === 0) {
        // Create a slot for this date if it doesn't exist
        // Create a default time slot (e.g., 09:00) for day-level availability
        const timeSlots = [{
          timeSlot: '09:00',
          status: status
        }];
        await vendorApi.createAvailabilitySlots(dateStr, timeSlots);
        toast.success('Availability updated');
      } else {
        // Update all slots for this date
        for (const slot of slots) {
          await vendorApi.updateSlot(slot.id, status);
        }
        toast.success('Availability updated');
      }
      setSelectedDate(null);
      refetchAvailability();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar & Availability</h1>
            <p className="text-foreground/60 text-sm">Manage your schedule and block dates</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-foreground hover:bg-muted"
              onClick={() => {
                refetchAvailability();
                toast.success('Calendar refreshed');
              }}
              disabled={availabilityLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${availabilityLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
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
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-foreground"></div>
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40 relative">
              <div className="absolute inset-0 border-t border-muted-foreground/50 rotate-45 top-1/2 left-0 right-0"></div>
            </div>
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>

        {availabilityLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* 3-Month Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
            const monthData = getCalendarData(monthDate.getMonth(), monthDate.getFullYear());

            return (
              <Card key={offset} className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  {offset === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="text-foreground/60 hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <CardTitle className="text-foreground text-base font-semibold flex-1 text-center">
                    {months[monthDate.getMonth()]} {monthDate.getFullYear()}
                  </CardTitle>
                  {offset === 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="text-foreground/60 hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  {offset !== 0 && offset !== 2 && <div className="w-9" />}
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => (
                      <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2 uppercase tracking-wide">
                        {day}
                      </div>
                    ))}
                    {monthData.map((day, i) => {
                      const isCurrentMonth = day.month === monthDate.getMonth();
                      const isToday = isSameDay(day.dateObj, new Date());
                      return (
                        <button
                          key={i}
                          onClick={() => isCurrentMonth && day.status === 'available' && setSelectedDate(day)}
                          disabled={!isCurrentMonth || day.status === 'booked'}
                          className={cn(
                            "h-10 w-10 rounded-md text-sm flex items-center justify-center transition-all duration-150",
                            !isCurrentMonth && "text-muted-foreground/30 cursor-not-allowed",
                            isCurrentMonth && day.status === 'available' && "text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            isCurrentMonth && day.status === 'booked' && "text-muted-foreground opacity-40 cursor-not-allowed relative",
                            isToday && isCurrentMonth && "border border-border font-semibold",
                            selectedDate && isSameDay(day.dateObj, selectedDate.dateObj) && "bg-primary text-primary-foreground hover:bg-primary font-medium"
                          )}
                        >
                          {day.status === 'booked' && isCurrentMonth && (
                            <div className="absolute inset-0 border-t border-muted-foreground/30 rotate-45 top-1/2 left-2 right-2"></div>
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

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="border-border shadow-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">
                {selectedDate.date} {months[selectedDate.month]} {selectedDate.year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="text-foreground/60">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedDate.status)}>
                  {selectedDate.status.charAt(0).toUpperCase() + selectedDate.status.slice(1)}
                </Badge>
              </div>

              {selectedDate.booking && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-foreground font-medium">{selectedDate.booking.event}</p>
                  <p className="text-foreground/60 text-sm">{selectedDate.booking.client}</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedDate.status === 'available' && (
                  <Button 
                    onClick={() => handleUpdateSlot('BOOKED')} 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-muted"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Mark as Booked
                  </Button>
                )}
                {selectedDate.status === 'booked' && (
                  <>
                    <Button 
                      onClick={() => handleUpdateSlot('AVAILABLE')} 
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Mark as Available
                    </Button>
                    {selectedDate.booking && (
                      <Badge className="bg-red-500/20 text-red-400">This date has a booking</Badge>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Google Calendar Sync Modal */}
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
      </div>
    </VendorLayout>
  );
}
