import { useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Eye, Ban, Check, ChevronRight, Calendar, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
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

interface CalendarListViewProps {
  calendarData: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
  onBlockDay: (date: string, categoryId?: string) => void;
  onUnblockDay: (date: string, categoryId?: string) => void;
  isSubmitting: boolean;
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

export function CalendarListView({ 
  calendarData, 
  onDayClick, 
  onBlockDay, 
  onUnblockDay,
  isSubmitting 
}: CalendarListViewProps) {
  // Filter to show only days with bookings or blocked, plus next 14 days
  const relevantDays = useMemo(() => {
    const today = startOfDay(new Date());
    const twoWeeksLater = addDays(today, 14);
    
    return calendarData
      .filter(day => {
        const dayDate = startOfDay(day.date);
        // Show if has bookings, is blocked, or is within next 14 days
        return (
          day.orders.length > 0 || 
          day.status === 'blocked' || 
          day.status === 'booked' ||
          (dayDate >= today && dayDate <= twoWeeksLater)
        );
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [calendarData]);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">Available</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">Partial</Badge>;
      case 'booked':
        return <Badge variant="destructive">Booked</Badge>;
      case 'blocked':
        return <Badge variant="secondary">Blocked</Badge>;
      default:
        return <Badge variant="default">Available</Badge>;
    }
  };

  // Group by date sections
  const groupedDays = useMemo(() => {
    const groups: { label: string; days: CalendarDay[] }[] = [];
    let currentGroup: { label: string; days: CalendarDay[] } | null = null;
    
    relevantDays.forEach(day => {
      const monthYear = format(day.date, 'MMMM yyyy');
      
      if (!currentGroup || currentGroup.label !== monthYear) {
        currentGroup = { label: monthYear, days: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.days.push(day);
    });
    
    return groups;
  }, [relevantDays]);

  if (relevantDays.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No upcoming events</h3>
          <p className="text-sm text-muted-foreground">
            Your calendar is clear. Bookings will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {groupedDays.map((group, groupIdx) => (
        <div key={groupIdx}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.days.map((day, dayIdx) => (
              <Card 
                key={dayIdx}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  day.isToday && "ring-2 ring-primary"
                )}
                onClick={() => onDayClick(day)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "text-center min-w-[50px]",
                          day.isToday && "text-primary"
                        )}>
                          <div className="text-2xl font-bold">{format(day.date, 'd')}</div>
                          <div className="text-xs text-muted-foreground">{getDateLabel(day.date)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{format(day.date, 'EEEE, MMMM d')}</span>
                            {getStatusBadge(day.status)}
                          </div>
                          
                          {/* Orders/Bookings */}
                          {day.orders.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {day.orders.map((order, orderIdx) => (
                                <div 
                                  key={orderIdx}
                                  className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50"
                                >
                                  <span>{CATEGORY_ICONS[order.listingCategoryId] || '📦'}</span>
                                  <span className="font-medium">{order.customerName || 'Customer'}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground">{order.eventType || 'Event'}</span>
                                  {order.eventTime && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">{order.eventTime}</span>
                                    </>
                                  )}
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {order.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Category badges */}
                          {Object.keys(day.bookingsByCategory).length > 0 && day.orders.length === 0 && (
                            <div className="flex gap-1 mt-2">
                              {Object.entries(day.bookingsByCategory).map(([catId, count]) => (
                                <Badge key={catId} variant="outline" className="text-xs">
                                  {CATEGORY_ICONS[catId] || '📦'} {count}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Blocked indicator */}
                          {day.status === 'blocked' && day.orders.length === 0 && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Ban className="h-4 w-4" />
                              <span>Day is blocked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {day.status !== 'booked' && day.orders.length === 0 && (
                        day.status === 'blocked' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnblockDay(day.dateStr);
                            }}
                            disabled={isSubmitting}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBlockDay(day.dateStr);
                            }}
                            disabled={isSubmitting}
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Block
                          </Button>
                        )
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
