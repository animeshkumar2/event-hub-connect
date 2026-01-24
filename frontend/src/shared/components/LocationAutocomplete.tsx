import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { publicApi } from '../services/api';

export interface LocationDTO {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationSuggestion {
  displayName: string;
  shortName: string;
  latitude: number;
  longitude: number;
}

interface LocationAutocompleteProps {
  value: LocationDTO | null;
  onChange: (location: LocationDTO | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter your location',
  required = false,
  className = '',
  label,
  error,
}) => {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    if (value?.name && value.name !== inputValue) {
      setInputValue(value.name);
    }
  }, [value?.name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await publicApi.autocompleteLocation(query, 5);
      if (response.success && response.data) {
        setSuggestions(response.data);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);

    // Clear the selected location when user types
    if (value) {
      onChange(null);
    }

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const location: LocationDTO = {
      name: suggestion.shortName || suggestion.displayName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };
    setInputValue(location.name);
    onChange(location);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full pl-10 pr-10 py-2.5 
            border rounded-lg
            focus:ring-2 focus:ring-rose-500 focus:border-rose-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${value ? 'bg-rose-50' : 'bg-white'}
          `}
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {(inputValue || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.latitude}-${suggestion.longitude}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`
                w-full px-4 py-3 text-left flex items-start gap-3
                hover:bg-gray-50 transition-colors
                ${highlightedIndex === index ? 'bg-rose-50' : ''}
                ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <MapPin className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.shortName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {suggestion.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
