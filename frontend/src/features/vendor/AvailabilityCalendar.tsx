import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { CheckCircle2, XCircle, Calendar as CalendarIcon, Info } from 'lucide-react';
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

type DayStatus = 'available' | 'booked' | 'none';

export const AvailabilityCalendar = ({
  availability,
  onSlotSelect,
  selectedDate,
}: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Normalize status to lowercase - only available or booked
  const normalizeStatus = (status: string | undefined): 'available' | 'booked' => {
    if (!status) return 'booked';
    const normalized = status.toLowerCase();
    if (normalized === 'available') return 'available';
    // Everything else (booked, blocked, busy) is treated as booked
    return 'booked';
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
    
    // If no data for this date, default to 'available'
    if (!slot || !slot.slots || slot.slots.length === 0) {
      return 'available';
    }
    
    // Determine day status based on slots
    const statuses = slot.slots.map(s => normalizeStatus(s.status));
    
    // If any slot is booked, day is booked
    if (statuses.some(s => s === 'booked')) {
      return 'booked';
    }
    
    // Otherwise, day is available (default)
    return 'available';
  };

  // Check if a date is selectable (only available, not booked or past)
  const isDateSelectable = (date: Date): boolean => {
    // Disable past dates (except today)
    if (isPast(startOfDay(date)) && !isToday(date)) {
      return false;
    }
    
    const status = getDayStatus(date);
    
    // Allow only available days
    if (status === 'available') {
      return true;
    }
    
    // All available days are selectable
    return status === 'available';
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
      
      // Only allow selection of available days
      if (status === 'available' && onSlotSelect) {
        onSlotSelect(dateStr);
      }
    }
  };

  const hasAvailabilityData = availability && availability.length > 0;
  const selectedDayStatus = selectedDate ? getDayStatus(parseISO(selectedDate)) : null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarIcon className="h-4 w-4" />
            Check Availability
          </CardTitle>
        </div>
        {hasAvailabilityData && availableDatesCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {availableDatesCount} available date{availableDatesCount !== 1 ? 's' : ''} in the next 30 days
          </p>
        )}
        {!hasAvailabilityData && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Select a date to check availability
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="border rounded-lg p-2 bg-background">
          <Calendar
            mode="single"
            selected={selectedDate ? parseISO(selectedDate) : currentDate}
            onSelect={handleDateSelect}
            disabled={(date) => !isDateSelectable(date)}
            className="w-full"
            modifiers={{
              available: (date) => getDayStatus(date) === 'available',
              booked: (date) => getDayStatus(date) === 'booked',
            }}
            modifiersClassNames={{
              available: 'rdp-day_available',
              booked: 'rdp-day_booked',
            }}
            fromDate={new Date()}
            toDate={addDays(new Date(), 90)}
          />
        </div>

        {selectedDate && selectedDayStatus && (
          <div className={cn(
            "pt-3 border-t rounded-lg p-3 bg-muted/30",
          )}>
            <div className="flex items-start gap-2.5">
              {selectedDayStatus === 'available' && (
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              {selectedDayStatus === 'booked' && (
                <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDayStatus === 'available' && 'Available for booking'}
                  {selectedDayStatus === 'booked' && 'Not available'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasAvailabilityData && (
          <div className="text-center py-3 border rounded-lg bg-muted/30">
            <Info className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
            <p className="text-xs text-foreground font-medium">No availability schedule loaded</p>
            <p className="text-xs text-muted-foreground mt-0.5">You can still select a date to proceed with booking</p>
          </div>
        )}

        <div className="pt-2 border-t">
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
        </div>
      </CardContent>
    </Card>
  );
};
