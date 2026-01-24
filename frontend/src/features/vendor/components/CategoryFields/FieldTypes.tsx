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

// Text Input
export const TextFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={error ? 'border-red-500' : ''}
      />
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Textarea Input
export const TextAreaFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={field.name}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={error ? 'border-red-500' : ''}
      />
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Number Input
export const NumberFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  // Determine if unit should be on left (currency) or right (measurements)
  const isCurrency = field.unit === '₹';
  const unitPosition = isCurrency ? 'left' : 'right';
  
  // Use value if it exists, otherwise use defaultValue, but don't call onChange
  // This prevents infinite loops from onChange being called during render
  const displayValue = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : '');
  
  console.log(`🔵 NumberFieldInput render: ${field.name}`, { value, defaultValue: field.defaultValue, displayValue });
  
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {field.unit && unitPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            {field.unit}
          </span>
        )}
        <Input
          id={field.name}
          type="number"
          value={displayValue}
          onChange={(e) => {
            console.log(`🟢 NumberFieldInput onChange: ${field.name}`, e.target.value);
            onChange(field.name, e.target.value ? parseFloat(e.target.value) : '');
          }}
          min={field.min !== undefined ? field.min : 0}
          max={field.max}
          className={`${field.unit && unitPosition === 'left' ? 'pl-10' : ''} ${field.unit && unitPosition === 'right' ? 'pr-16' : ''} ${error ? 'border-red-500' : ''}`}
        />
        {field.unit && unitPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            {field.unit}
          </span>
        )}
      </div>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Select Input
export const SelectFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value || ''} onValueChange={(v) => onChange(field.name, v)}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Multi-Select Input (with badges and custom entry support)
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
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {/* Selected badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border">
          {selectedValues.map((val) => (
            <Badge
              key={val}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20"
            >
              {val}
              <button
                type="button"
                onClick={() => removeOption(val)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-2">
        {field.options?.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`
                px-3 py-2 text-sm rounded-md border transition-all text-left
                ${isSelected 
                  ? 'bg-primary/10 border-primary text-primary font-medium' 
                  : 'bg-background border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Custom entry section */}
      <div className="pt-2 border-t border-border">
        {showCustomInput ? (
          <div className="flex items-center gap-2">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomOption();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setCustomValue('');
                  setShowCustomInput(false);
                }
              }}
              placeholder={field.placeholder || "Enter custom option"}
              className="flex-1 h-9"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addCustomOption}
              disabled={!customValue.trim()}
              className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
              title="Add (Enter)"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setCustomValue('');
                setShowCustomInput(false);
              }}
              className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Cancel (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Custom Option
          </Button>
        )}
      </div>

      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Checkbox Input
export const CheckboxFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  // Use value if it exists, otherwise use defaultValue, but don't call onChange
  // This prevents infinite loops from onChange being called during render
  const displayValue = value !== undefined ? value : (field.defaultValue || false);

  console.log(`🔵 CheckboxFieldInput render: ${field.name}`, { value, defaultValue: field.defaultValue, displayValue });

  return (
    <div 
      className="flex items-center space-x-3 p-3 rounded-md border bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => {
        console.log(`🟢 CheckboxFieldInput onClick: ${field.name}`, !displayValue);
        onChange(field.name, !displayValue);
      }}
    >
      <Checkbox
        id={field.name}
        checked={displayValue}
        onCheckedChange={(checked) => {
          console.log(`🟢 CheckboxFieldInput onCheckedChange: ${field.name}`, checked);
          onChange(field.name, checked);
        }}
        className="flex-shrink-0"
        onClick={(e) => e.stopPropagation()} // Prevent double toggle
      />
      <div className="flex-1 space-y-1">
        <Label 
          htmlFor={field.name} 
          className="text-sm font-medium cursor-pointer leading-none"
        >
          {field.label}
        </Label>
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};

// Radio Input
export const RadioFieldInput: React.FC<FieldInputProps> = ({
  field, value, onChange, error
}) => {
  // Use value if it exists, otherwise use defaultValue, but don't call onChange
  // This prevents infinite loops from onChange being called during render
  const displayValue = value !== undefined ? value : (field.defaultValue || '');

  console.log(`🔵 RadioFieldInput render: ${field.name}`, { value, defaultValue: field.defaultValue, displayValue });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={displayValue}
        onValueChange={(v) => {
          console.log(`🟢 RadioFieldInput onChange: ${field.name}`, v);
          onChange(field.name, v);
        }}
        className="flex gap-4"
      >
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${field.name}-${option}`} />
            <Label 
              htmlFor={`${field.name}-${option}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
