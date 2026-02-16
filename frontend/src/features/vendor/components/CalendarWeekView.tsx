import { useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Eye, Ban } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { categories } from '@/shared/constants/mockData';

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: any[];
  bookingsByCategory: Record<string, number>;
  status: 'available' | 'partial' | 'booked' | 'blocked';
  orders: any[];
}

interface CalendarWeekViewProps {
  currentDate: Date;
  calendarData: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
  categoryFilters: { id: string; name: string; icon: string; active: boolean }[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'photo-video': '📷',
  'decorator': '🎨',
  'caterer': '🍽️',
  'venue': '🏛️',
  'mua': '💄',
  'dj-entertainment': '🎧',
  'sound-lights': '💡',
  'artists': '🎭',
  'event-planner': '📋',
  'other': '📦',
};

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '6AM - 12PM', hours: [6, 7, 8, 9, 10, 11] },
  { id: 'afternoon', label: 'Afternoon', time: '12PM - 5PM', hours: [12, 13, 14, 15, 16] },
  { id: 'evening', label: 'Evening', time: '5PM - 11PM', hours: [17, 18, 19, 20, 21, 22] },
];

export function CalendarWeekView({ currentDate, calendarData, onDayClick, categoryFilters }: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      return calendarData.find(d => d.dateStr === dateStr) || {
        date,
        dateStr,
        isCurrentMonth: true,
        isToday: isToday(date),
        slots: [],
        bookingsByCategory: {},
        status: 'available' as const,
        orders: [],
      };
    });
  }, [weekStart, calendarData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 border-green-500/30';
      case 'partial': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'booked': return 'bg-red-500/10 border-red-500/30';
      case 'blocked': return 'bg-gray-500/10 border-gray-500/30';
      default: return 'bg-green-500/10 border-green-500/30';
    }
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 border-r bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Time</span>
            </div>
            {weekDays.map((day, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-3 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors",
                  day.isToday && "bg-primary/5"
                )}
                onClick={() => onDayClick(day)}
              >
                <div className="text-xs text-muted-foreground">
                  {format(day.date, 'EEE')}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  day.isToday && "text-primary"
                )}>
                  {format(day.date, 'd')}
                </div>
                {day.orders.length > 0 && (
                  <Badge variant="secondary" className="mt-1 text-[10px] h-4">
                    {day.orders.length} booking{day.orders.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map(slot => (
            <div key={slot.id} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 border-r bg-muted/30">
                <div className="text-xs font-medium">{slot.label}</div>
                <div className="text-[10px] text-muted-foreground">{slot.time}</div>
              </div>
              {weekDays.map((day, idx) => {
                // Find orders/bookings for this time slot
                const dayOrders = day.orders.filter(order => {
                  if (!order.eventTime) return slot.id === 'morning'; // Default to morning
                  const hour = parseInt(order.eventTime.split(':')[0]);
                  return slot.hours.includes(hour);
                });

                const daySlots = day.slots.filter(s => {
                  const slotType = s.timeSlotType?.toLowerCase() || 'full_day';
                  return slotType === slot.id || slotType === 'full_day';
                });

                const isBooked = daySlots.some(s => s.status === 'BOOKED') || dayOrders.length > 0;
                const isBlocked = daySlots.some(s => s.status === 'BLOCKED');

                return (
                  <div 
                    key={idx}
                    className={cn(
                      "p-2 border-r last:border-r-0 min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors",
                      isBooked && "bg-red-500/5",
                      isBlocked && "bg-gray-500/5",
                      day.isToday && "bg-primary/5"
                    )}
                    onClick={() => onDayClick(day)}
                  >
                    {dayOrders.map((order, orderIdx) => (
                      <div 
                        key={orderIdx}
                        className="mb-1 p-1.5 rounded bg-primary/10 border border-primary/20"
                      >
                        <div className="flex items-center gap-1 text-[10px]">
                          <span>{CATEGORY_ICONS[order.listingCategoryId] || '📦'}</span>
                          <span className="truncate font-medium">{order.customerName || 'Customer'}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate">
                          {order.eventType || 'Event'}
                        </div>
                      </div>
                    ))}
                    
                    {isBlocked && dayOrders.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <Badge variant="secondary" className="text-[10px]">
                          <Ban className="h-2.5 w-2.5 mr-1" />
                          Blocked
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Category Summary Row */}
          {categoryFilters.length > 1 && (
            <div className="grid grid-cols-8 bg-muted/20">
              <div className="p-3 border-r">
                <span className="text-xs font-medium text-muted-foreground">By Service</span>
              </div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="p-2 border-r last:border-r-0">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(day.bookingsByCategory).map(([catId, count]) => (
                      <Badge 
                        key={catId} 
                        variant="outline" 
                        className="text-[9px] h-4 px-1"
                      >
                        {CATEGORY_ICONS[catId] || '📦'} {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
