import React, { useState } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { FieldSchema } from './categoryFieldConfigs';
import { cn } from '@/shared/lib/utils';

interface FieldInputProps {
  field: FieldSchema;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

// Text Input
export const TextFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name} className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <Input
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={`h-10 bg-white border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 rounded-lg transition-all ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''}`}
      />
      {field.helpText && (
        <p className="text-[11px] text-slate-400">{field.helpText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Textarea Input
export const TextAreaFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name} className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <Textarea
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={`bg-white border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 rounded-lg transition-all resize-none ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''}`}
      />
      {field.helpText && (
        <p className="text-[11px] text-slate-400">{field.helpText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Number Input
export const NumberFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const isCurrency = field.unit === '₹';
  const unitPosition = isCurrency ? 'left' : 'right';
  const displayValue = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : '');
  
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name} className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        {field.unit && unitPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
            {field.unit}
          </span>
        )}
        <Input
          id={field.name}
          type="number"
          value={displayValue}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onChange(field.name, e.target.value === '' ? '' : (isNaN(num) || num < 0 ? '' : num));
          }}
          min={field.min !== undefined ? field.min : 0}
          max={field.max}
          className={`h-10 bg-white border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 rounded-lg transition-all ${field.unit && unitPosition === 'left' ? 'pl-8' : ''} ${field.unit && unitPosition === 'right' ? 'pr-14' : ''} ${error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''}`}
        />
        {field.unit && unitPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {field.unit}
          </span>
        )}
      </div>
      {field.helpText && (
        <p className="text-[11px] text-slate-400">{field.helpText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Select Input
export const SelectFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name} className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger className={`h-10 bg-white border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 rounded-lg transition-all ${error ? 'border-rose-400' : ''}`}>
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-slate-200 shadow-lg">
          {field.options?.map((option) => (
            <SelectItem key={option} value={option} className="rounded-md">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-[11px] text-slate-400">{field.helpText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Multi-Select Input
export const MultiSelectFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const selectedValues = Array.isArray(value) ? value : [];
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(field.name, selectedValues.filter(v => v !== option));
    } else {
      onChange(field.name, [...selectedValues, option]);
    }
  };

  const addCustomOption = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      onChange(field.name, [...selectedValues, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const removeOption = (option: string) => {
    onChange(field.name, selectedValues.filter(v => v !== option));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      
      {/* Selected items */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
          {selectedValues.map((val) => (
            <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-medium">
              {val}
              <button type="button" onClick={() => removeOption(val)} className="hover:bg-white/20 rounded p-0.5 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {field.options?.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 text-xs rounded-lg border transition-all text-left font-medium ${isSelected 
                ? 'bg-slate-100 border-slate-400 text-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Add custom */}
      <div className="pt-1">
        {showCustomInput ? (
          <div className="flex items-center gap-2">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCustomOption(); }
                else if (e.key === 'Escape') { e.preventDefault(); setCustomValue(''); setShowCustomInput(false); }
              }}
              placeholder={field.placeholder || "Add custom option"}
              className="flex-1 h-9 bg-white border-slate-200 rounded-lg"
              autoFocus
            />
            <Button type="button" size="sm" onClick={addCustomOption} disabled={!customValue.trim()} className="h-9 bg-slate-800 hover:bg-slate-700 rounded-lg">
              <Check className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setCustomValue(''); setShowCustomInput(false); }} className="h-9 rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => setShowCustomInput(true)} className="w-full border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Custom
          </Button>
        )}
      </div>

      {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Checkbox Input
export const CheckboxFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const displayValue = value !== undefined ? value : (field.defaultValue || false);

  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
      displayValue 
        ? 'bg-slate-50 border-slate-300' 
        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}>
      <Checkbox
        id={field.name}
        checked={displayValue}
        onCheckedChange={(checked) => onChange(field.name, checked)}
        className="mt-0.5 h-5 w-5 rounded border-2 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
      />
      <div className="flex-1 space-y-0.5">
        <span className="text-xs font-medium text-slate-700">{field.label}</span>
        {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
        {error && <p className="text-[11px] text-rose-500">{error}</p>}
      </div>
    </label>
  );
};

// Radio Input
export const RadioFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const displayValue = value !== undefined ? value : (field.defaultValue || '');

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <RadioGroup value={displayValue} onValueChange={(v) => onChange(field.name, v)} className="flex flex-wrap gap-2">
        {field.options?.map((option) => {
          const isSelected = displayValue === option;
          return (
            <label 
              key={option} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-slate-50 border-slate-300' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <RadioGroupItem value={option} id={`${field.name}-${option}`} className="h-4 w-4" />
              <span className="text-xs font-medium text-slate-700">{option}</span>
            </label>
          );
        })}
      </RadioGroup>
      {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Time Picker Input
export const TimeFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const parseTime = (timeStr: string | undefined) => {
    if (!timeStr) return { hour: '', period: 'AM' };
    const match = timeStr.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
    if (match) {
      return { hour: match[1], period: match[2].toUpperCase() };
    }
    return { hour: '', period: 'AM' };
  };

  const { hour, period } = parseTime(value);

  const handleHourChange = (newHour: string) => {
    if (newHour) {
      onChange(field.name, `${newHour}:00 ${period}`);
    } else {
      onChange(field.name, '');
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (hour) {
      onChange(field.name, `${hour}:00 ${newPeriod}`);
    }
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <div className="flex gap-2">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className={`h-10 flex-1 bg-white border-slate-200 focus:border-slate-400 rounded-lg ${error ? 'border-rose-400' : ''}`}>
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h} className="rounded-md">{h}:00</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={handlePeriodChange} disabled={!hour}>
          <SelectTrigger className={`h-10 w-24 bg-white border-slate-200 focus:border-slate-400 rounded-lg ${error ? 'border-rose-400' : ''}`}>
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="AM" className="rounded-md">AM</SelectItem>
            <SelectItem value="PM" className="rounded-md">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};

// Delivery Time Input — "After/Before X (-Y) Days/Weeks" with optional range toggle
export const DeliveryTimeFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const parseInitial = (val: string | undefined) => {
    if (!val) return { prefix: 'After', from: '', to: '', unit: 'Days', isRange: false };
    const rangeMatch = val.match(/^(After|Before)\s+(\d+)\s*-\s*(\d+)\s+(Hours|Days|Weeks|Months)$/i);
    if (rangeMatch) return { prefix: rangeMatch[1], from: rangeMatch[2], to: rangeMatch[3], unit: rangeMatch[4], isRange: true };
    const partialRange = val.match(/^(After|Before)\s+(\d+)\s*-\s*(Hours|Days|Weeks|Months)$/i);
    if (partialRange) return { prefix: partialRange[1], from: partialRange[2], to: '', unit: partialRange[3], isRange: true };
    const singleMatch = val.match(/^(After|Before)\s+(\d+)\s+(Hours|Days|Weeks|Months)$/i);
    if (singleMatch) return { prefix: singleMatch[1], from: singleMatch[2], to: '', unit: singleMatch[3], isRange: false };
    return { prefix: 'After', from: '', to: '', unit: 'Days', isRange: false };
  };

  const [state, setState] = useState(() => parseInitial(value));

  const buildAndEmit = (next: typeof state) => {
    setState(next);
    const { prefix: p, from: f, to: t, unit: u, isRange: r } = next;
    if (!f) { onChange(field.name, ''); return; }
    if (r && t) { onChange(field.name, `${p} ${f}-${t} ${u}`); return; }
    if (r && !t) { onChange(field.name, `${p} ${f}- ${u}`); return; }
    onChange(field.name, `${p} ${f} ${u}`);
  };

  const rangeError = state.isRange && state.from && state.to && Number(state.to) <= Number(state.from);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        {field.label}
        {field.required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <button type="button" onClick={() => buildAndEmit({ ...state, isRange: !state.isRange, from: '', to: '' })} className="flex items-center gap-2 cursor-pointer select-none">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            state.isRange ? 'border-slate-900 bg-slate-900' : 'border-slate-300 bg-white'
          }`}>
            {state.isRange && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm text-slate-600">Specify a range (e.g., 2-3 weeks)</span>
        </button>

        <div className="flex items-center gap-2">
          <Select value={state.prefix} onValueChange={(p) => buildAndEmit({ ...state, prefix: p })}>
            <SelectTrigger className="h-9 w-[82px] bg-white border-slate-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="After" className="rounded-md">After</SelectItem>
              <SelectItem value="Before" className="rounded-md">Before</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            min={1}
            value={state.from}
            onChange={(e) => buildAndEmit({ ...state, from: e.target.value.replace(/[^0-9]/g, '') })}
            placeholder="0"
            className="h-9 w-16 text-center bg-white border-slate-200 rounded-lg text-sm"
          />

          {state.isRange && (
            <>
              <span className="text-slate-400 text-sm">–</span>
              <Input
                type="number"
                min={1}
                value={state.to}
                onChange={(e) => buildAndEmit({ ...state, to: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="0"
                className={`h-9 w-16 text-center bg-white rounded-lg text-sm ${rangeError ? 'border-rose-400 border-2' : 'border-slate-200'}`}
              />
            </>
          )}

          <Select value={state.unit} onValueChange={(u) => buildAndEmit({ ...state, unit: u })}>
            <SelectTrigger className="h-9 w-[90px] bg-white border-slate-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="Hours" className="rounded-md">Hours</SelectItem>
              <SelectItem value="Days" className="rounded-md">Days</SelectItem>
              <SelectItem value="Weeks" className="rounded-md">Weeks</SelectItem>
              <SelectItem value="Months" className="rounded-md">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rangeError && (
          <p className="text-xs text-rose-500">End value must be greater than start value</p>
        )}
      </div>
      {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};


// Structured Menu Builder — course-by-course menu composition
const MENU_COURSES: { key: string; suggestions: string[] }[] = [
  { key: 'Welcome Drinks', suggestions: ['Mango Delight', 'Green Ice', 'Lemon Mint Cooler', 'Blue Lagoon', 'Mango Tango', 'Jaljeera', 'Thandai', 'Rose Sharbat'] },
  { key: 'Appetizers', suggestions: ['Paneer Tikka', 'Spring Rolls', 'Samosa', 'Pakora', 'Corn Balls', 'Cheese Nuggets', 'Hara Bhara Kebab', 'Veg Shanghai Rolls', 'Chicken Tikka', 'Fish Fry', 'Seekh Kebab'] },
  { key: 'Soup', suggestions: ['Tomato Soup', 'Manchow Soup', 'Sweet Corn Soup', 'Hot & Sour Soup', 'Cream of Mushroom'] },
  { key: 'Main Course', suggestions: ['Paneer Butter Masala', 'Dal Makhani', 'Mix Veg', 'Veg Kofta Curry', 'Dum Aloo', 'Chana Masala', 'Yellow Dal', 'Palak Paneer', 'Butter Chicken', 'Mutton Curry', 'Fish Curry', 'Egg Curry'] },
  { key: 'Rice & Breads', suggestions: ['Jeera Rice', 'Veg Pulao', 'Veg Biryani', 'Chicken Biryani', 'Butter Naan', 'Masala Kulcha', 'Roti', 'Paratha', 'Garlic Naan'] },
  { key: 'Accompaniments', suggestions: ['Salad', 'Raita', 'Papad', 'Pickles', 'Chutneys'] },
  { key: 'Desserts', suggestions: ['Gulab Jamun', 'Rasmalai', 'Ice Cream', 'Kheer', 'Hot Brownie', 'Jalebi', 'Fruit Salad', 'Pastry'] },
  { key: 'Live Counters', suggestions: ['Chaat Counter', 'Dosa Counter', 'Pasta Counter', 'Chinese Counter', 'Grill Counter', 'Tandoor Counter', 'Pizza Counter', 'Dessert Counter'] },
];

type CourseData = { count: number; items: string[] };
type MenuData = Record<string, CourseData>;

const parseMenuValue = (value: any): MenuData => {
  if (!value) return {};
  let raw: any = value;
  if (typeof value === 'string') {
    try { raw = JSON.parse(value); } catch { return {}; }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return {};
  // Normalize: support both old string[] format and new {count, items} format
  const result: MenuData = {};
  Object.entries(raw).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      // Legacy format — count defaults to items length (all served)
      result[k] = { count: v.length, items: v };
    } else if (v && typeof v === 'object' && Array.isArray((v as any).items)) {
      const obj = v as any;
      result[k] = { count: obj.count ?? obj.items.length, items: obj.items };
    }
  });
  return result;
};

const serializeMenu = (data: MenuData): string => {
  const clean: MenuData = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v && v.items.length > 0) clean[k] = { count: v.count, items: v.items };
  });
  return JSON.stringify(clean);
};

export const MenuItemsFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const menuData = React.useMemo(() => parseMenuValue(value), [value]);

  const emitMenu = (updated: MenuData) => {
    onChange(field.name, serializeMenu(updated));
  };

  const toggleItem = (course: string, item: string) => {
    const current = menuData[course] || { count: 0, items: [] };
    const hasItem = current.items.includes(item);
    const newItems = hasItem
      ? current.items.filter(i => i !== item)
      : [...current.items, item];
    // Keep count as-is when adding/removing. Only clamp if count exceeds new length.
    const newCount = current.count > 0
      ? Math.min(current.count, newItems.length)
      : newItems.length;
    emitMenu({ ...menuData, [course]: { count: newCount || newItems.length, items: newItems } });
  };

  const addCustomItem = (course: string) => {
    const text = (drafts[course] || '').trim();
    if (!text) return;
    const current = menuData[course] || { count: 0, items: [] };
    if (!current.items.includes(text)) {
      const newItems = [...current.items, text];
      const newCount = current.count > 0 ? current.count : newItems.length;
      emitMenu({ ...menuData, [course]: { count: newCount, items: newItems } });
    }
    setDrafts(prev => ({ ...prev, [course]: '' }));
  };

  const removeItem = (course: string, item: string) => {
    const current = menuData[course] || { count: 0, items: [] };
    const newItems = current.items.filter(i => i !== item);
    const newCount = Math.min(current.count, newItems.length) || newItems.length;
    emitMenu({ ...menuData, [course]: { count: newCount, items: newItems } });
  };

  const updateCount = (course: string, newCount: number) => {
    const current = menuData[course] || { count: 0, items: [] };
    const clamped = Math.max(1, Math.min(newCount, 99));
    emitMenu({ ...menuData, [course]: { ...current, count: clamped } });
  };

  const totalItems = Object.values(menuData).reduce((sum, c) => sum + (c?.items?.length || 0), 0);
  const filledCourses = MENU_COURSES.filter(c => (menuData[c.key]?.items?.length || 0) > 0).length;

  return (
    <div className="space-y-1">
      <div className="space-y-1">
        {MENU_COURSES.map((course) => {
          const courseData = menuData[course.key] || { count: 0, items: [] };
          const items = courseData.items;
          const isExpanded = expandedCourse === course.key;
          const count = items.length;
          const servedCount = courseData.count || count;

          return (
            <div key={course.key} className={cn(
              "rounded-lg border transition-all",
              isExpanded ? "border-slate-300" : "border-slate-200"
            )}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setExpandedCourse(isExpanded ? null : course.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-[13px] font-medium text-slate-700 flex-1">{course.key}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[11px]",
                    servedCount > count ? "text-rose-500 font-medium" : "text-slate-400"
                  )}>
                    {servedCount > count ? `${servedCount}/${count} ⚠` : servedCount < count ? `${servedCount}/${count}` : count}
                  </span>
                )}
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 text-slate-300 transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>

              {/* Collapsed preview */}
              {!isExpanded && count > 0 && (
                <div className="px-3 pb-2.5 -mt-0.5">
                  <div className="flex flex-wrap gap-1">
                    {items.slice(0, 6).map((item) => (
                      <span key={item} className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                        {item}
                      </span>
                    ))}
                    {count > 6 && (
                      <span className="text-[11px] text-slate-300 px-1 py-0.5">+{count - 6}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Expanded */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">

                  {/* Count selector */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500">Items per plate</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => updateCount(course.key, n)}
                          className={cn(
                            "h-7 w-7 rounded text-[11px] font-medium transition-all flex items-center justify-center",
                            servedCount === n
                              ? "bg-slate-800 text-white"
                              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                      {servedCount > 10 && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateCount(course.key, servedCount - 1)}
                            className="h-7 w-7 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center text-[11px]"
                          >
                            −
                          </button>
                          <span className="h-7 min-w-[1.75rem] px-1.5 rounded bg-slate-800 text-white flex items-center justify-center text-[11px] font-medium">
                            {servedCount}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => updateCount(course.key, Math.max(servedCount, 10) + 1)}
                        className="h-7 w-7 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center text-[11px]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {count > 0 && servedCount < count && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-100 text-[11px] text-slate-600">
                        <span className="font-semibold">{servedCount}/{count}</span>
                        <span>items will be served — guest chooses from {count} options</span>
                      </div>
                    )}
                    {servedCount > count && count > 0 && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-600">
                        You've set {servedCount} per plate but only added {count} option{count !== 1 ? 's' : ''} — add more or reduce the count
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {course.suggestions.map((suggestion) => {
                        const isAdded = items.includes(suggestion);
                        return (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => toggleItem(course.key, suggestion)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition-all",
                              isAdded
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            )}
                          >
                            {isAdded ? <X className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                            {suggestion}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom items */}
                    {items.filter(i => !course.suggestions.includes(i)).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {items.filter(i => !course.suggestions.includes(i)).map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-white rounded text-[11px]">
                            {item}
                            <button type="button" onClick={() => removeItem(course.key, item)} className="text-white/50 hover:text-white">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <Input
                        value={drafts[course.key] || ''}
                        onChange={(e) => setDrafts(prev => ({ ...prev, [course.key]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomItem(course.key);
                          }
                        }}
                        placeholder={`Add custom...`}
                        className="h-8 bg-slate-50 border-slate-200 rounded-lg text-xs flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addCustomItem(course.key)}
                        disabled={!(drafts[course.key] || '').trim()}
                        className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-300 rounded-lg"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
};


