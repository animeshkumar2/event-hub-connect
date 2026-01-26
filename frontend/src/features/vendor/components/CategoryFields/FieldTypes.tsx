import React, { useState } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { FieldSchema } from './categoryFieldConfigs';

interface FieldInputProps {
  field: FieldSchema;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

// Text Input - Compact
export const TextFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={`h-7 text-xs ${error ? 'border-red-500' : ''}`}
      />
      {field.helpText && (
        <p className="text-[9px] text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};

// Textarea Input - Compact
export const TextAreaFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Textarea
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        className={`text-xs ${error ? 'border-red-500' : ''}`}
      />
      {field.helpText && (
        <p className="text-[9px] text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};

// Number Input - Compact
export const NumberFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const isCurrency = field.unit === '₹';
  const unitPosition = isCurrency ? 'left' : 'right';
  const displayValue = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : '');
  
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        {field.unit && unitPosition === 'left' && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
            {field.unit}
          </span>
        )}
        <Input
          id={field.name}
          type="number"
          value={displayValue}
          onChange={(e) => onChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
          min={field.min !== undefined ? field.min : 0}
          max={field.max}
          className={`h-7 text-xs ${field.unit && unitPosition === 'left' ? 'pl-6' : ''} ${field.unit && unitPosition === 'right' ? 'pr-12' : ''} ${error ? 'border-red-500' : ''}`}
        />
        {field.unit && unitPosition === 'right' && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
            {field.unit}
          </span>
        )}
      </div>
      {field.helpText && (
        <p className="text-[9px] text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};

// Select Input - Compact
export const SelectFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name} className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger className={`h-7 text-xs ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option} className="text-xs">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-[9px] text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};

// Multi-Select Input - Compact
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
    <div className="space-y-1.5">
      <Label className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 p-1.5 bg-muted/30 rounded border">
          {selectedValues.map((val) => (
            <Badge key={val} variant="secondary" className="pl-1.5 pr-0.5 py-0 gap-0.5 text-[9px] h-5 bg-primary/10 text-primary">
              {val}
              <button type="button" onClick={() => removeOption(val)} className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1">
        {field.options?.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`px-2 py-1 text-[10px] rounded border transition-all text-left ${isSelected 
                ? 'bg-primary/10 border-primary text-primary font-medium' 
                : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="pt-1 border-t border-border">
        {showCustomInput ? (
          <div className="flex items-center gap-1">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCustomOption(); }
                else if (e.key === 'Escape') { e.preventDefault(); setCustomValue(''); setShowCustomInput(false); }
              }}
              placeholder={field.placeholder || "Custom option"}
              className="flex-1 h-6 text-[10px]"
              autoFocus
            />
            <Button type="button" size="sm" variant="ghost" onClick={addCustomOption} disabled={!customValue.trim()} className="h-6 w-6 p-0 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setCustomValue(''); setShowCustomInput(false); }} className="h-6 w-6 p-0 text-red-500">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => setShowCustomInput(true)} className="w-full border-dashed h-6 text-[9px]">
            <Plus className="h-2.5 w-2.5 mr-1" /> Add Custom
          </Button>
        )}
      </div>

      {field.helpText && <p className="text-[9px] text-muted-foreground">{field.helpText}</p>}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};

// Checkbox Input - Compact
export const CheckboxFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const displayValue = value !== undefined ? value : (field.defaultValue || false);

  return (
    <div 
      className="flex items-center space-x-2 p-2 rounded border bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onChange(field.name, !displayValue)}
    >
      <Checkbox
        id={field.name}
        checked={displayValue}
        onCheckedChange={(checked) => onChange(field.name, checked)}
        className="flex-shrink-0 h-3.5 w-3.5"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex-1 space-y-0.5">
        <Label htmlFor={field.name} className="text-[10px] font-medium cursor-pointer leading-none">
          {field.label}
        </Label>
        {field.helpText && <p className="text-[9px] text-muted-foreground">{field.helpText}</p>}
        {error && <p className="text-[9px] text-red-500">{error}</p>}
      </div>
    </div>
  );
};

// Radio Input - Compact
export const RadioFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  const displayValue = value !== undefined ? value : (field.defaultValue || '');

  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <RadioGroup value={displayValue} onValueChange={(v) => onChange(field.name, v)} className="flex gap-3">
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-1.5">
            <RadioGroupItem value={option} id={`${field.name}-${option}`} className="h-3 w-3" />
            <Label htmlFor={`${field.name}-${option}`} className="text-[10px] font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {field.helpText && <p className="text-[9px] text-muted-foreground">{field.helpText}</p>}
      {error && <p className="text-[9px] text-red-500">{error}</p>}
    </div>
  );
};
