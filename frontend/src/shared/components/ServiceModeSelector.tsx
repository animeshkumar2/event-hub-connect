import React from 'react';
import { Building2, Car, ArrowLeftRight } from 'lucide-react';

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
  icon: React.ReactNode;
  compactIcon: React.ReactNode;
}[] = [
  {
    value: 'CUSTOMER_VISITS',
    label: 'Customer visits me',
    shortLabel: 'Visit me',
    icon: <Building2 className="h-4 w-4" />,
    compactIcon: <Building2 className="h-3 w-3" />,
  },
  {
    value: 'VENDOR_TRAVELS',
    label: 'I travel to customer',
    shortLabel: 'I travel',
    icon: <Car className="h-4 w-4" />,
    compactIcon: <Car className="h-3 w-3" />,
  },
  {
    value: 'BOTH',
    label: 'Both options',
    shortLabel: 'Both',
    icon: <ArrowLeftRight className="h-4 w-4" />,
    compactIcon: <ArrowLeftRight className="h-3 w-3" />,
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
        <div className="flex gap-1">
          {SERVICE_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-all
                ${value === option.value
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {option.compactIcon}
              <span>{option.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="space-y-1">
        {SERVICE_MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              w-full flex items-center gap-2 p-2 rounded border transition-all
              ${value === option.value
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div
              className={`
                flex-shrink-0 p-1 rounded-full
                ${value === option.value ? 'bg-rose-100' : 'bg-gray-100'}
              `}
            >
              {option.icon}
            </div>
            <div className="flex-1 text-left text-[11px] font-medium">{option.label}</div>
            <div
              className={`
                w-3.5 h-3.5 rounded-full border flex items-center justify-center
                ${value === option.value
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-gray-300'
                }
              `}
            >
              {value === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
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

export default ServiceModeSelector;
