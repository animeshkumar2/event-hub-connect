import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

type SlotStatus = 'available' | 'booked' | 'blocked' | 'tentative';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  status: SlotStatus;
  booking?: { client: string; event: string };
}

export default function VendorCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock calendar data
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

    // Current month days
    const bookedDates = [5, 12, 15, 22, 28];
    const blockedDates = [8, 9, 10];
    const tentativeDates = [18, 25];

    for (let i = 1; i <= daysInMonth; i++) {
      let status: SlotStatus = 'available';
      let booking;
      
      if (bookedDates.includes(i)) {
        status = 'booked';
        booking = { client: 'Sharma Family', event: 'Wedding' };
      } else if (blockedDates.includes(i)) {
        status = 'blocked';
      } else if (tentativeDates.includes(i)) {
        status = 'tentative';
      }

      calendar.push({ date: i, month, year, status, booking });
    }

    // Next month days to fill grid
    const remaining = 42 - calendar.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      calendar.push({ date: i, month: nextMonth, year: nextYear, status: 'available' });
    }

    return calendar;
  };

  const calendarData = getCalendarData(currentMonth.getMonth(), currentMonth.getFullYear());

  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
      case 'booked': return 'bg-red-500/20 text-red-400';
      case 'blocked': return 'bg-gray-500/20 text-gray-400';
      case 'tentative': return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const handleBlockDate = () => {
    toast.success('Date blocked successfully');
    setSelectedDate(null);
  };

  const handleUnblockDate = () => {
    toast.success('Date unblocked');
    setSelectedDate(null);
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar & Availability</h1>
            <p className="text-foreground/60">Manage your schedule and block dates</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-white/20 text-foreground hover:bg-white/10"
              onClick={() => setShowSyncModal(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Sync Google Calendar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-secondary text-secondary-foreground">
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
                    <Input type="date" className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Start Time</Label>
                      <Input type="time" className="bg-muted/50 border-border text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">End Time</Label>
                      <Input type="time" className="bg-muted/50 border-border text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Repeat</Label>
                    <Select>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Does not repeat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Does not repeat</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-secondary text-secondary-foreground">Create Slot</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'available', label: 'Available', color: 'bg-green-500' },
            { status: 'booked', label: 'Booked', color: 'bg-red-500' },
            { status: 'blocked', label: 'Blocked', color: 'bg-gray-500' },
            { status: 'tentative', label: 'Tentative', color: 'bg-yellow-500' },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-foreground/60">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 3-Month Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
            const monthData = getCalendarData(monthDate.getMonth(), monthDate.getFullYear());

            return (
              <Card key={offset} className="border-border shadow-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                  <CardTitle className="text-foreground text-lg flex-1 text-center">
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
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => (
                      <div key={day} className="text-center text-xs text-foreground/40 py-2">
                        {day}
                      </div>
                    ))}
                    {monthData.map((day, i) => {
                      const isCurrentMonth = day.month === monthDate.getMonth();
                      return (
                        <button
                          key={i}
                          onClick={() => isCurrentMonth && setSelectedDate(day)}
                          disabled={!isCurrentMonth}
                          className={`
                            aspect-square rounded-lg text-sm flex items-center justify-center transition-all
                            ${isCurrentMonth ? getStatusColor(day.status) : 'text-foreground/20'}
                            ${isCurrentMonth && day.status === 'available' ? 'cursor-pointer' : ''}
                          `}
                        >
                          {day.date}
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
                  <Button onClick={handleBlockDate} variant="outline" className="border-white/20 text-foreground hover:bg-white/10">
                    Block This Date
                  </Button>
                )}
                {selectedDate.status === 'blocked' && (
                  <Button onClick={handleUnblockDate} className="bg-green-500 hover:bg-green-600 text-foreground">
                    Unblock Date
                  </Button>
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
