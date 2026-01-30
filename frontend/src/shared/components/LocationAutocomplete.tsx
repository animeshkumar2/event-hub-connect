import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
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
  /** Restrict results to Bangalore only (for vendor location selection during initial launch) */
  bangaloreOnly?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter your location',
  required = false,
  className = '',
  label,
  error,
  bangaloreOnly = false,
}) => {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    if (value?.name && value.name !== inputValue) {
      setInputValue(value.name);
    }
  }, [value?.name]);

  // Update dropdown position when showing
  useEffect(() => {
    if (showDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showDropdown, suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showDropdown && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [showDropdown]);

  // Bangalore bounding box for filtering
  const BANGALORE_BOUNDS = {
    minLat: 12.7,
    maxLat: 13.2,
    minLng: 77.3,
    maxLng: 77.9,
  };

  const isInBangalore = (lat: number, lng: number): boolean => {
    return (
      lat >= BANGALORE_BOUNDS.minLat &&
      lat <= BANGALORE_BOUNDS.maxLat &&
      lng >= BANGALORE_BOUNDS.minLng &&
      lng <= BANGALORE_BOUNDS.maxLng
    );
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await publicApi.autocompleteLocation(query, bangaloreOnly ? 15 : 8);
      if (response.success && response.data) {
        let results = response.data;
        
        // Filter to Bangalore only if restricted
        if (bangaloreOnly) {
          results = results.filter((s: LocationSuggestion) => 
            isInBangalore(s.latitude, s.longitude)
          );
        }
        
        setSuggestions(results.slice(0, 6));
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [bangaloreOnly]);

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
    <div ref={containerRef} className={`relative ${className}`}>
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
          autoComplete="off"
          className={`
            block w-full pl-10 pr-10 py-3
            border rounded-xl
            text-base
            focus:ring-2 focus:ring-rose-500 focus:border-rose-500
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${value ? 'bg-rose-50 border-rose-300' : 'bg-white'}
          `}
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <Loader2 className="h-5 w-5 text-rose-500 animate-spin" />
          </div>
        )}
        
        {(inputValue || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown - rendered via portal to escape overflow:hidden containers */}
      {showDropdown && suggestions.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Navigation className="h-3 w-3" />
              {bangaloreOnly ? 'Showing Bangalore locations' : 'Select a location'}
            </p>
          </div>
          
          {/* Scrollable list */}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  w-full px-4 py-3.5 text-left flex items-start gap-3
                  transition-colors duration-150
                  ${highlightedIndex === index ? 'bg-rose-50' : 'hover:bg-gray-50'}
                  ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}
                `}
              >
                <div className={`
                  p-1.5 rounded-lg flex-shrink-0 mt-0.5
                  ${highlightedIndex === index ? 'bg-rose-100' : 'bg-gray-100'}
                `}>
                  <MapPin className={`h-4 w-4 ${highlightedIndex === index ? 'text-rose-600' : 'text-gray-500'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium truncate ${highlightedIndex === index ? 'text-rose-900' : 'text-gray-900'}`}>
                    {suggestion.shortName}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-0.5">
                    {suggestion.displayName}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Use ↑↓ to navigate, Enter to select
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* No results message */}
      {showDropdown && suggestions.length === 0 && inputValue.length >= 2 && !isLoading && createPortal(
        <div
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 text-center"
        >
          <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {bangaloreOnly 
              ? 'No locations found in Bangalore. Try a different search.' 
              : 'No locations found. Try a different search.'}
          </p>
        </div>,
        document.body
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
