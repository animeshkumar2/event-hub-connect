import { useState, useEffect } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';

interface DeliveryTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  categoryId?: string;
  compact?: boolean;
}

export function DeliveryTimeInput({ value, onChange, categoryId, compact = false }: DeliveryTimeInputProps) {
  const parseValue = (val: string) => {
    if (!val) return { timing: 'after', min: '', max: '', unit: 'days', isRange: false };
    
    const timingMatch = val.match(/^(before|after):(.+)$/i);
    const timeString = timingMatch ? timingMatch[2] : val;
    const timing = timingMatch ? timingMatch[1].toLowerCase() : 'after';
    
    const rangeMatch = timeString.match(/^(\d+)-(\d+)\s*(hour|hours|day|days|week|weeks|month|months)$/i);
    if (rangeMatch) {
      return {
        timing,
        min: rangeMatch[1],
        max: rangeMatch[2],
        unit: rangeMatch[3].toLowerCase().replace(/s$/, '') + 's',
        isRange: true
      };
    }
    
    const singleMatch = timeString.match(/^(\d+)\s*(hour|hours|day|days|week|weeks|month|months)$/i);
    if (singleMatch) {
      return {
        timing,
        min: singleMatch[1],
        max: '',
        unit: singleMatch[2].toLowerCase().replace(/s$/, '') + 's',
        isRange: false
      };
    }
    
    return { timing: 'after', min: '', max: '', unit: 'days', isRange: false };
  };

  const [timing, setTiming] = useState('after');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [unit, setUnit] = useState('days');
  const [isRange, setIsRange] = useState(false);
  const [isInternalChange, setIsInternalChange] = useState(false);

  // Sync state from external value prop (only when value changes externally)
  useEffect(() => {
    if (isInternalChange) {
      setIsInternalChange(false);
      return;
    }
    const parsed = parseValue(value);
    setTiming(parsed.timing);
    setMinValue(parsed.min);
    setMaxValue(parsed.max);
    setUnit(parsed.unit);
    setIsRange(parsed.isRange);
  }, [value]);

  // Build and emit value when internal state changes
  const emitChange = (newTiming: string, newMin: string, newMax: string, newUnit: string, newIsRange: boolean) => {
    if (!newMin) {
      onChange('');
      return;
    }

    const timeString = newIsRange && newMax 
      ? `${newMin}-${newMax} ${newUnit}` 
      : `${newMin} ${newUnit}`;
    
    setIsInternalChange(true);
    onChange(`${newTiming}:${timeString}`);
  };

  const handleTimingChange = (val: string) => {
    setTiming(val);
    emitChange(val, minValue, maxValue, unit, isRange);
  };

  const handleMinChange = (val: string) => {
    setMinValue(val);
    emitChange(timing, val, maxValue, unit, isRange);
  };

  const handleMaxChange = (val: string) => {
    setMaxValue(val);
    emitChange(timing, minValue, val, unit, isRange);
  };

  const handleUnitChange = (val: string) => {
    setUnit(val);
    emitChange(timing, minValue, maxValue, val, isRange);
  };

  const handleRangeToggle = (checked: boolean) => {
    setIsRange(checked);
    const newMax = checked ? maxValue : '';
    setMaxValue(newMax);
    emitChange(timing, minValue, newMax, unit, checked);
  };

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Checkbox
            id="range-toggle"
            checked={isRange}
            onCheckedChange={(checked) => {
              setIsRange(checked as boolean);
              if (!checked) setMaxValue('');
            }}
            className="h-3 w-3"
          />
          <label htmlFor="range-toggle" className="text-[9px] text-slate-500 cursor-pointer">
            Range
          </label>
        </div>
        <div className="flex items-center gap-1">
          <Select value={timing} onValueChange={setTiming}>
            <SelectTrigger className="h-7 text-[10px] w-16 px-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before" className="text-[10px]">Before</SelectItem>
              <SelectItem value="after" className="text-[10px]">After</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            placeholder="2"
            className="h-7 text-[10px] w-12 px-1.5"
          />
          {isRange && (
            <>
              <span className="text-[10px] text-slate-400">-</span>
              <Input
                type="number"
                min="0"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="3"
                className="h-7 text-[10px] w-12 px-1.5"
              />
            </>
          )}
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-7 text-[10px] w-16 px-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours" className="text-[10px]">Hours</SelectItem>
              <SelectItem value="days" className="text-[10px]">Days</SelectItem>
              <SelectItem value="weeks" className="text-[10px]">Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-foreground">
        Delivery Time <span className="text-red-500">*</span>
      </Label>
      
      <div className="space-y-2 p-2 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="range-toggle"
            checked={isRange}
            onCheckedChange={(checked) => {
              setIsRange(checked as boolean);
              if (!checked) setMaxValue('');
            }}
            className="h-3 w-3"
          />
          <label htmlFor="range-toggle" className="text-[10px] cursor-pointer">
            Specify a range (e.g., 2-3 weeks)
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <Select value={timing} onValueChange={setTiming}>
            <SelectTrigger className="h-7 text-[10px] w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before" className="text-xs">Before</SelectItem>
              <SelectItem value="after" className="text-xs">After</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            placeholder="2"
            className="h-7 text-[10px] w-14"
          />

          {isRange && (
            <>
              <span className="text-[10px] text-muted-foreground">—</span>
              <Input
                type="number"
                min="0"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="3"
                className="h-7 text-[10px] w-14"
              />
            </>
          )}

          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="h-7 text-[10px] w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours" className="text-xs">Hours</SelectItem>
              <SelectItem value="days" className="text-xs">Days</SelectItem>
              <SelectItem value="weeks" className="text-xs">Weeks</SelectItem>
              <SelectItem value="months" className="text-xs">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {minValue && (
          <p className="text-[9px] text-muted-foreground pt-1 border-t border-border">
            Preview: <span className="font-medium text-foreground">
              {timing === 'before' ? 'Before: ' : 'After: '}
              {isRange && maxValue ? `${minValue}-${maxValue} ${unit}` : `${minValue} ${unit}`}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
