import React from 'react';
import { MapPin } from 'lucide-react';

interface RadiusSliderProps {
  value: number;
  onChange: (radius: number) => void;
  options?: number[];
  label?: string;
  className?: string;
  showKmSuffix?: boolean;
}

// Default options for vendors and customers
export const VENDOR_RADIUS_OPTIONS = [10, 25, 50, 100];
export const CUSTOMER_RADIUS_OPTIONS = [5, 10, 20, 30, 50];

export const RadiusSlider: React.FC<RadiusSliderProps> = ({
  value,
  onChange,
  options = CUSTOMER_RADIUS_OPTIONS,
  label = 'Search Radius',
  className = '',
  showKmSuffix = true,
}) => {
  // Find the index of the current value in options
  const currentIndex = options.indexOf(value);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    onChange(options[index]);
  };

  const handleOptionClick = (optionValue: number) => {
    onChange(optionValue);
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Current value display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <MapPin className="h-5 w-5" />
            <span className="text-lg font-semibold">
              {value} {showKmSuffix && 'km'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {value <= 10 ? 'Nearby' : value <= 25 ? 'Local area' : value <= 50 ? 'Extended area' : 'Wide range'}
          </span>
        </div>

        {/* Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={options.length - 1}
            value={effectiveIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            style={{
              background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${(effectiveIndex / (options.length - 1)) * 100}%, #e5e7eb ${(effectiveIndex / (options.length - 1)) * 100}%, #e5e7eb 100%)`,
            }}
          />
          
          {/* Tick marks */}
          <div className="flex justify-between mt-2">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`
                  text-xs px-2 py-1 rounded transition-colors
                  ${value === option 
                    ? 'text-rose-600 font-semibold bg-rose-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {option} km
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiusSlider;
