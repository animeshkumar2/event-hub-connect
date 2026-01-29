import React from 'react';
import { Building2, Car, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type ServiceMode = 'CUSTOMER_VISITS' | 'VENDOR_TRAVELS' | 'BOTH';

interface ServiceModeSelectorProps {
  value: ServiceMode;
  onChange: (mode: ServiceMode) => void;
  className?: string;
  label?: string;
  compact?: boolean;
}

const SERVICE_MODE_OPTIONS: {
  value: ServiceMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    value: 'CUSTOMER_VISITS',
    label: 'Customer visits me',
    shortLabel: 'Visit venue',
    description: 'Clients come to your studio/location',
    icon: <Building2 className="h-5 w-5" />,
    gradient: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  {
    value: 'VENDOR_TRAVELS',
    label: 'I travel to customer',
    shortLabel: 'We travel',
    description: 'You go to the client\'s event location',
    icon: <Car className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  {
    value: 'BOTH',
    label: 'Both options',
    shortLabel: 'Flexible',
    description: 'Clients choose their preference',
    icon: <ArrowLeftRight className="h-5 w-5" />,
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
  },
];

export const ServiceModeSelector: React.FC<ServiceModeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label = 'Service Mode',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className={className}>
        <div className="flex gap-1.5">
          {SERVICE_MODE_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isSelected
                    ? `bg-gradient-to-r ${option.gradient} text-white shadow-md scale-[1.02]`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-[1.02]"
                )}
              >
                <span className={cn(
                  "flex-shrink-0",
                  isSelected ? "text-white" : "text-slate-400"
                )}>
                  {React.cloneElement(option.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
                </span>
                <span>{option.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {SERVICE_MODE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full relative overflow-hidden group rounded-xl border-2 p-4 transition-all duration-300 text-left",
                isSelected
                  ? `${option.borderColor} ${option.bgColor} shadow-md`
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                isSelected
                  ? `bg-gradient-to-r ${option.gradient} border-transparent`
                  : "border-slate-300 bg-white"
              )}>
                {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
              </div>

              <div className="flex items-start gap-3 pr-8">
                {/* Icon container */}
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  isSelected
                    ? `bg-gradient-to-br ${option.gradient} text-white shadow-md`
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                )}>
                  {option.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-slate-800" : "text-slate-700"
                  )}>
                    {option.label}
                  </p>
                  <p className={cn(
                    "text-xs mt-0.5 transition-colors",
                    isSelected ? "text-slate-600" : "text-slate-500"
                  )}>
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Decorative gradient line */}
              {isSelected && (
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                  option.gradient
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Get human-readable label for service mode
 */
export const getServiceModeLabel = (mode: ServiceMode): string => {
  switch (mode) {
    case 'CUSTOMER_VISITS':
      return 'Visit their studio';
    case 'VENDOR_TRAVELS':
      return 'Travels to your venue';
    case 'BOTH':
      return 'Both options available';
    default:
      return 'Both options available';
  }
};

/**
 * Get detailed description for service mode
 */
export const getServiceModeDescription = (mode: ServiceMode): string => {
  switch (mode) {
    case 'CUSTOMER_VISITS':
      return 'You visit the vendor\'s studio or location';
    case 'VENDOR_TRAVELS':
      return 'The vendor travels to your event venue';
    case 'BOTH':
      return 'Flexible - choose based on your preference';
    default:
      return 'Flexible - choose based on your preference';
  }
};

export default ServiceModeSelector;
