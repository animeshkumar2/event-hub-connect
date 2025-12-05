import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format, isSameDay, parseISO, isPast, startOfDay, addDays, isToday, isFuture } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface TimeSlot {
  time: string; // HH:MM format
  status: 'available' | 'booked' | 'busy' | 'AVAILABLE' | 'BOOKED' | 'BUSY' | 'BLOCKED';
}

interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

interface AvailabilityCalendarProps {
  availability: AvailabilitySlot[];
  onSlotSelect?: (date: string) => void; // Changed: only date, no time
  selectedDate?: string;
}

type DayStatus = 'available' | 'busy' | 'booked' | 'none';

export const AvailabilityCalendar = ({
  availability,
  onSlotSelect,
  selectedDate,
}: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Normalize status to lowercase
  const normalizeStatus = (status: string | undefined): 'available' | 'booked' | 'busy' => {
    if (!status) return 'busy';
    const normalized = status.toLowerCase();
    if (normalized === 'available') return 'available';
    if (normalized === 'booked' || normalized === 'blocked') return 'booked';
    return 'busy';
  };

  // Parse date string to Date object
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      if (dateStr.includes('T')) {
        return parseISO(dateStr);
      }
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parseISO(dateStr);
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  // Format date to YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // Get day-level status from availability data
  const getDayStatus = (date: Date): DayStatus => {
    const dateStr = formatDateString(date);
    
    // Find availability for this date
    let slot = availability.find((s) => s.date === dateStr);
    
    if (!slot) {
      slot = availability.find((s) => {
        const slotDate = parseDateString(s.date);
        if (!slotDate) return false;
        return isSameDay(slotDate, date);
      });
    }
    
    // If no data for this date, return 'none'
    if (!slot || !slot.slots || slot.slots.length === 0) {
      return 'none';
    }
    
    // Determine day status based on slots
    const statuses = slot.slots.map(s => normalizeStatus(s.status));
    
    // If any slot is available, day is available
    if (statuses.some(s => s === 'available')) {
      return 'available';
    }
    
    // If all slots are booked, day is booked
    if (statuses.every(s => s === 'booked')) {
      return 'booked';
    }
    
    // Otherwise, day is busy
    return 'busy';
  };

  // Check if a date is selectable (available or busy, but not booked or past)
  const isDateSelectable = (date: Date): boolean => {
    // Disable past dates (except today)
    if (isPast(startOfDay(date)) && !isToday(date)) {
      return false;
    }
    
    const status = getDayStatus(date);
    
    // Allow available and busy days, but not booked or none (if no data)
    if (status === 'available' || status === 'busy') {
      return true;
    }
    
    // If no data, allow future dates (vendor might be available)
    if (status === 'none' && (isFuture(startOfDay(date)) || isToday(date))) {
      return true;
    }
    
    return false;
  };

  // Get available dates count for the next 30 days
  const availableDatesCount = useMemo(() => {
    const today = startOfDay(new Date());
    const next30Days = Array.from({ length: 30 }, (_, i) => addDays(today, i));
    return next30Days.filter(date => getDayStatus(date) === 'available').length;
  }, [availability]);

  // Auto-select first available date if no date is selected
  useEffect(() => {
    if (availability && availability.length > 0 && !selectedDate) {
      const today = startOfDay(new Date());
      const next30Days = Array.from({ length: 30 }, (_, i) => addDays(today, i));
      const firstAvailable = next30Days.find(date => getDayStatus(date) === 'available');
      
      if (firstAvailable) {
        setCurrentDate(firstAvailable);
      }
    }
  }, [availability, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      const dateStr = formatDateString(date);
      const status = getDayStatus(date);
      
      // Only allow selection of available or busy days
      if ((status === 'available' || status === 'busy') && onSlotSelect) {
        onSlotSelect(dateStr);
      }
    }
  };

  const hasAvailabilityData = availability && availability.length > 0;
  const selectedDayStatus = selectedDate ? getDayStatus(parseISO(selectedDate)) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Check Availability
          </CardTitle>
        </div>
        {hasAvailabilityData && availableDatesCount > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {availableDatesCount} available date{availableDatesCount !== 1 ? 's' : ''} in the next 30 days
          </p>
        )}
        {!hasAvailabilityData && (
          <p className="text-sm text-muted-foreground mt-1">
            Select a date to check availability
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate ? parseISO(selectedDate) : currentDate}
            onSelect={handleDateSelect}
            disabled={(date) => !isDateSelectable(date)}
            className="rounded-md border"
            modifiers={{
              available: (date) => getDayStatus(date) === 'available',
              busy: (date) => getDayStatus(date) === 'busy',
              booked: (date) => getDayStatus(date) === 'booked',
            }}
            modifiersClassNames={{
              available: 'rdp-day_available',
              busy: 'rdp-day_busy',
              booked: 'rdp-day_booked',
            }}
            fromDate={new Date()}
            toDate={addDays(new Date(), 90)}
          />
        </div>

        {selectedDate && selectedDayStatus && (
          <div className={cn(
            "pt-4 border-t rounded-lg p-4",
            selectedDayStatus === 'available' && "bg-green-50 border-green-200",
            selectedDayStatus === 'busy' && "bg-yellow-50 border-yellow-200",
            selectedDayStatus === 'booked' && "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-3">
              {selectedDayStatus === 'available' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {selectedDayStatus === 'busy' && <Clock className="h-5 w-5 text-yellow-600" />}
              {selectedDayStatus === 'booked' && <XCircle className="h-5 w-5 text-red-600" />}
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  selectedDayStatus === 'available' && "text-green-900",
                  selectedDayStatus === 'busy' && "text-yellow-900",
                  selectedDayStatus === 'booked' && "text-red-900"
                )}>
                  {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className={cn(
                  "text-xs mt-0.5",
                  selectedDayStatus === 'available' && "text-green-700",
                  selectedDayStatus === 'busy' && "text-yellow-700",
                  selectedDayStatus === 'booked' && "text-red-700"
                )}>
                  {selectedDayStatus === 'available' && 'This date is available for booking'}
                  {selectedDayStatus === 'busy' && 'This date may have limited availability'}
                  {selectedDayStatus === 'booked' && 'This date is fully booked'}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold",
                  selectedDayStatus === 'available' && "bg-green-100 text-green-800 border-green-300",
                  selectedDayStatus === 'busy' && "bg-yellow-100 text-yellow-800 border-yellow-300",
                  selectedDayStatus === 'booked' && "bg-red-100 text-red-800 border-red-300"
                )}
              >
                {selectedDayStatus === 'available' && 'Available'}
                {selectedDayStatus === 'busy' && 'Busy'}
                {selectedDayStatus === 'booked' && 'Booked'}
              </Badge>
            </div>
          </div>
        )}

        {!hasAvailabilityData && (
          <div className="text-center py-4 border rounded-lg bg-blue-50">
            <Info className="h-5 w-5 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-900 font-medium">No availability schedule loaded</p>
            <p className="text-xs text-blue-700 mt-1">You can still select a date to proceed with booking</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-3">Legend</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
              <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className="text-xs font-medium text-green-900">Available</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 border border-yellow-200">
              <div className="h-4 w-4 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
              <span className="text-xs font-medium text-yellow-900">Busy</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200">
              <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-red-600"></div>
              <span className="text-xs font-medium text-red-900">Booked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
