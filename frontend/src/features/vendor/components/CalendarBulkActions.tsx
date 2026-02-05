import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { 
  CalendarDays, 
  Ban, 
  Check, 
  RefreshCw,
  Loader2,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  AlertCircle,
  CalendarRange
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, eachDayOfInterval, getDay, differenceInDays, parseISO, isValid } from 'date-fns';
import { toast } from 'sonner';
import { vendorApi } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';

interface CalendarBulkActionsProps {
  categoryFilters: { id: string; name: string; icon: string; active: boolean }[];
  onRefresh: () => void;
}

export function CalendarBulkActions({ categoryFilters, onRefresh }: CalendarBulkActionsProps) {
  const [isBlockRangeOpen, setIsBlockRangeOpen] = useState(false);
  const [isWeeklyPatternOpen, setIsWeeklyPatternOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Block range state
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockCategory, setBlockCategory] = useState<string>('all');
  const [blockNotes, setBlockNotes] = useState('');
  
  // Weekly pattern state
  const [patternWeeks, setPatternWeeks] = useState('4');
  const [patternDays, setPatternDays] = useState<number[]>([]);
  const [patternCategory, setPatternCategory] = useState<string>('all');
  const [patternAction, setPatternAction] = useState<'block' | 'unblock'>('block');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleBlockRange = async () => {
    if (!blockStartDate || !blockEndDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await vendorApi.bulkUpdateAvailability(
        blockStartDate, 
        blockEndDate, 
        'BLOCKED',
        blockCategory === 'all' ? undefined : blockCategory,
        blockNotes || undefined
      );
      toast.success('Date range blocked successfully');
      setIsBlockRangeOpen(false);
      setBlockStartDate('');
      setBlockEndDate('');
      setBlockNotes('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to block date range');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeeklyPattern = async () => {
    if (patternDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const weeks = parseInt(patternWeeks);
      const today = new Date();
      let successCount = 0;
      
      // Generate dates for the pattern
      for (let week = 0; week < weeks; week++) {
        const weekStart = addWeeks(startOfWeek(today), week);
        const weekEnd = endOfWeek(weekStart);
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        for (const day of daysInWeek) {
          if (patternDays.includes(getDay(day))) {
            const dateStr = format(day, 'yyyy-MM-dd');
            try {
              if (patternAction === 'block') {
                await vendorApi.blockDay(
                  dateStr,
                  patternCategory === 'all' ? undefined : patternCategory
                );
              } else {
                await vendorApi.unblockDay(
                  dateStr,
                  patternCategory === 'all' ? undefined : patternCategory
                );
              }
              successCount++;
            } catch (e) {
              // Continue with other dates
            }
          }
        }
      }
      
      toast.success(`${successCount} dates ${patternAction === 'block' ? 'blocked' : 'unblocked'} successfully`);
      setIsWeeklyPatternOpen(false);
      setPatternDays([]);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply weekly pattern');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePatternDay = (day: number) => {
    setPatternDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Quick Actions:</span>
          
          {/* Block Date Range - Enhanced UI */}
          <Dialog open={isBlockRangeOpen} onOpenChange={setIsBlockRangeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                Block Date Range
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
              {/* Beautiful Header */}
              <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 px-6 py-5 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                    <CalendarRange className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Block Date Range</h2>
                    <p className="text-sm text-white/70">Mark multiple days as unavailable</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Date Range Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Select Date Range
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1.5">
                      <span className="text-xs text-muted-foreground font-medium">From</span>
                      <Input 
                        type="date" 
                        value={blockStartDate}
                        onChange={(e) => setBlockStartDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="h-11 text-center font-medium border-2 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mt-5">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <span className="text-xs text-muted-foreground font-medium">To</span>
                      <Input 
                        type="date" 
                        value={blockEndDate}
                        onChange={(e) => setBlockEndDate(e.target.value)}
                        min={blockStartDate || format(new Date(), 'yyyy-MM-dd')}
                        className="h-11 text-center font-medium border-2 focus:border-primary focus:ring-0"
                      />
                    </div>
                  </div>
                  
                  {/* Duration Preview */}
                  {blockStartDate && blockEndDate && isValid(parseISO(blockStartDate)) && isValid(parseISO(blockEndDate)) && (
                    <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary/5 border border-primary/20">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {differenceInDays(parseISO(blockEndDate), parseISO(blockStartDate)) + 1} days will be blocked
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Service Category */}
                {categoryFilters.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Service Category
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setBlockCategory('all')}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                          blockCategory === 'all' 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <span className="text-lg">📦</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">All Services</div>
                        </div>
                        {blockCategory === 'all' && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                      {categoryFilters.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setBlockCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                            blockCategory === cat.id 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{cat.name}</div>
                          </div>
                          {blockCategory === cat.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Notes (optional)</Label>
                  <Input 
                    placeholder="e.g., Personal vacation, Wedding booking..."
                    value={blockNotes}
                    onChange={(e) => setBlockNotes(e.target.value)}
                    className="h-11"
                  />
                </div>
                
                {/* Info Note */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Maximum 28 days can be blocked at once. Blocked dates won't accept new bookings but existing bookings remain valid.
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsBlockRangeOpen(false);
                    setBlockStartDate('');
                    setBlockEndDate('');
                    setBlockNotes('');
                    setBlockCategory('all');
                  }}
                  className="h-10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBlockRange} 
                  disabled={isSubmitting || !blockStartDate || !blockEndDate}
                  className="h-10 bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Block Range
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Set Weekly Pattern */}
          <Dialog open={isWeeklyPatternOpen} onOpenChange={setIsWeeklyPatternOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Set Weekly Pattern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Weekly Pattern</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={patternAction} onValueChange={(v) => setPatternAction(v as 'block' | 'unblock')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block selected days</SelectItem>
                      <SelectItem value="unblock">Unblock selected days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {dayNames.map((name, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          id={`day-${idx}`}
                          checked={patternDays.includes(idx)}
                          onCheckedChange={() => togglePatternDay(idx)}
                        />
                        <label 
                          htmlFor={`day-${idx}`}
                          className="text-sm cursor-pointer"
                        >
                          {name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Number of Weeks</Label>
                  <Select value={patternWeeks} onValueChange={setPatternWeeks}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 weeks</SelectItem>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks (3 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {categoryFilters.length > 1 && (
                  <div className="space-y-2">
                    <Label>Service Category</Label>
                    <Select value={patternCategory} onValueChange={setPatternCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {categoryFilters.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Example: "Block every Sunday for next 3 months"
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWeeklyPatternOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWeeklyPattern} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Apply Pattern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
