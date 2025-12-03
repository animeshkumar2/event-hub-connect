import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { AvailabilitySlot } from '@/shared/constants/mockData';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

interface AvailabilityCalendarProps {
  availability: AvailabilitySlot[];
  onSlotSelect?: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export const AvailabilityCalendar = ({
  availability,
  onSlotSelect,
  selectedDate,
  selectedTime,
}: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'booked':
        return <XCircle className="h-4 w-4" />;
      case 'busy':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'booked':
        return 'Booked';
      case 'busy':
        return 'Busy';
      default:
        return status;
    }
  };

  const selectedDaySlots = availability.find((slot) =>
    isSameDay(parseISO(slot.date), currentDate)
  );

  const isDateAvailable = (date: Date) => {
    const slot = availability.find((s) => isSameDay(parseISO(s.date), date));
    return slot?.slots.some((s) => s.status === 'available') || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && setCurrentDate(date)}
            disabled={(date) => {
              const slot = availability.find((s) => isSameDay(parseISO(s.date), date));
              return !slot || !slot.slots.some((s) => s.status === 'available');
            }}
            className="rounded-md border"
          />
        </div>

        {selectedDaySlots && (
          <div>
            <h4 className="font-semibold mb-3">
              Time Slots for {format(currentDate, 'MMMM d, yyyy')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedDaySlots.slots.map((slot, index) => (
                <Button
                  key={index}
                  variant={
                    selectedDate === selectedDaySlots.date && selectedTime === slot.time
                      ? 'default'
                      : 'outline'
                  }
                  disabled={slot.status !== 'available'}
                  onClick={() =>
                    slot.status === 'available' &&
                    onSlotSelect?.(selectedDaySlots.date, slot.time)
                  }
                  className="justify-start"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(slot.status)}
                    <span>{slot.time}</span>
                    <Badge
                      variant="outline"
                      className={`ml-auto ${getStatusColor(slot.status)}`}
                    >
                      {getStatusLabel(slot.status)}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Selected: {format(parseISO(selectedDate), 'MMM d, yyyy')} at {selectedTime}
            </p>
          </div>
        )}

        <div className="flex gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-600" />
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>Booked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


