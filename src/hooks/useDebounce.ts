// ============================================
// DEBOUNCE HOOK
// File: src/hooks/useDebounce.ts
// ============================================

import { useEffect, useState } from 'react';

/**
 * Debounce a value by delaying updates until the value hasn't changed for the specified delay.
 * Useful for search inputs to prevent excessive API calls.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * ```typescript
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 500);
 * 
 * // Use debouncedSearch in your API call
 * useQuery(['search', debouncedSearch], () => searchAPI(debouncedSearch));
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}