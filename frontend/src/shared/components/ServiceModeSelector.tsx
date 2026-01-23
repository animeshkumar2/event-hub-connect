import React from 'react';
import { Building2, Car, ArrowLeftRight } from 'lucide-react';

export type ServiceMode = 'CUSTOMER_VISITS' | 'VENDOR_TRAVELS' | 'BOTH';

interface ServiceModeSelectorProps {
  value: ServiceMode;
  onChange: (mode: ServiceMode) => void;
  className?: string;
  label?: string;
}

const SERVICE_MODE_OPTIONS: {
  value: ServiceMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'CUSTOMER_VISITS',
    label: 'Customer visits me',
    description: 'Customers come to your studio/location',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: 'VENDOR_TRAVELS',
    label: 'I travel to customer',
    description: 'You travel to the customer\'s venue',
    icon: <Car className="h-5 w-5" />,
  },
  {
    value: 'BOTH',
    label: 'Both options',
    description: 'Flexible - either option works',
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
];

export const ServiceModeSelector: React.FC<ServiceModeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label = 'Service Mode',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {SERVICE_MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
              ${value === option.value
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div
              className={`
                flex-shrink-0 p-2 rounded-full
                ${value === option.value ? 'bg-rose-100' : 'bg-gray-100'}
              `}
            >
              {option.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-500">{option.description}</div>
            </div>
            <div
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${value === option.value
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-gray-300'
                }
              `}
            >
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
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
