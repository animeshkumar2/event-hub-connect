import { useState, useEffect } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';

interface DeliveryTimeInputProps {
  value: string; // Stored as string like "before:2-3 weeks" or "after:30 days"
  onChange: (value: string) => void;
  categoryId?: string;
}

export function DeliveryTimeInput({ value, onChange, categoryId }: DeliveryTimeInputProps) {
  // Parse existing value
  const parseValue = (val: string) => {
    if (!val) return { timing: 'after', min: '', max: '', unit: 'days', isRange: false };
    
    // Try to parse with timing prefix: "before:2-3 weeks" or "after:30 days"
    const timingMatch = val.match(/^(before|after):(.+)$/i);
    const timeString = timingMatch ? timingMatch[2] : val;
    const timing = timingMatch ? timingMatch[1].toLowerCase() : 'after'; // Default to 'after' for backward compatibility
    
    // Try to parse range format: "2-3 weeks" or "4-6 hours"
    const rangeMatch = timeString.match(/^(\d+)-(\d+)\s*(hour|hours|day|days|week|weeks|month|months)$/i);
    if (rangeMatch) {
      return {
        timing,
        min: rangeMatch[1],
        max: rangeMatch[2],
        unit: rangeMatch[3].toLowerCase().replace(/s$/, '') + 's', // Normalize to plural
        isRange: true
      };
    }
    
    // Try to parse single value: "30 days" or "2 weeks" or "4 hours"
    const singleMatch = timeString.match(/^(\d+)\s*(hour|hours|day|days|week|weeks|month|months)$/i);
    if (singleMatch) {
      return {
        timing,
        min: singleMatch[1],
        max: '',
        unit: singleMatch[2].toLowerCase().replace(/s$/, '') + 's', // Normalize to plural
        isRange: false
      };
    }
    
    // Fallback for free-form text
    return { timing: 'after', min: '', max: '', unit: 'days', isRange: false };
  };

  const parsed = parseValue(value);
  const [timing, setTiming] = useState(parsed.timing);
  const [minValue, setMinValue] = useState(parsed.min);
  const [maxValue, setMaxValue] = useState(parsed.max);
  const [unit, setUnit] = useState(parsed.unit);
  const [isRange, setIsRange] = useState(parsed.isRange);

  // Update parent when values change
  useEffect(() => {
    if (!minValue) {
      onChange('');
      return;
    }

    const timeString = isRange && maxValue 
      ? `${minValue}-${maxValue} ${unit}` 
      : `${minValue} ${unit}`;
    
    onChange(`${timing}:${timeString}`);
  }, [timing, minValue, maxValue, unit, isRange, onChange]);

  // Get default unit based on category
  const getDefaultUnit = () => {
    if (categoryId === 'photography-videography' || categoryId === 'photographer') {
      return 'days';
    }
    return 'days';
  };

  return (
    <div className="space-y-3">
      <Label className="text-foreground">Delivery / Service Time *</Label>
      <p className="text-xs text-muted-foreground">
        How long before/after the event do you need, or when will you deliver?
      </p>
      
      <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
        {/* Range Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="range-toggle"
            checked={isRange}
            onCheckedChange={(checked) => {
              setIsRange(checked as boolean);
              if (!checked) setMaxValue('');
            }}
          />
          <label
            htmlFor="range-toggle"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Specify a range (e.g., 2-3 weeks)
          </label>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr_1fr] gap-2 items-end">
          {/* Before/After Dropdown */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">When</Label>
            <Select value={timing} onValueChange={setTiming}>
              <SelectTrigger className="bg-background border-border text-foreground w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Value */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {isRange ? 'From' : 'Duration'}
            </Label>
            <Input
              type="number"
              min="1"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder="2"
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Dash (only for range) */}
          {isRange && (
            <div className="pb-2 text-muted-foreground font-bold">—</div>
          )}

          {/* Max Value (only for range) */}
          {isRange && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="number"
                min={minValue || '1'}
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="3"
                className="bg-background border-border text-foreground"
              />
            </div>
          )}

          {/* Unit Dropdown */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        {minValue && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Preview: <span className="font-medium text-foreground">
                {timing === 'before' ? 'Before event: ' : 'After event: '}
                {isRange && maxValue ? `${minValue}-${maxValue} ${unit}` : `${minValue} ${unit}`}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
