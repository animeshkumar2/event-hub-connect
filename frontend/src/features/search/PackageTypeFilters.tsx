import React from 'react';
import { cn } from '@/shared/lib/utils';

interface PackageTypeFiltersProps {
  packageTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export const PackageTypeFilters: React.FC<PackageTypeFiltersProps> = ({
  packageTypes,
  selectedType,
  onTypeChange,
}) => {
  if (packageTypes.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {packageTypes.map((type) => {
          const isActive = selectedType === type || (!selectedType && type === 'All Packages');
          
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 whitespace-nowrap text-sm',
                'hover:shadow-md active:scale-95',
                isActive
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-foreground border-border hover:border-primary hover:bg-primary/5'
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
};
