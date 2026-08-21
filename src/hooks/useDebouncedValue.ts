import React, { useState, useEffect } from 'react';

/**
 * React hook for debounced values
 * Useful for search inputs and filter fields
 */
export const useDebouncedValue = <T,>(value: T, delayMs: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
};

/**
 * React hook for debounced callback
 * Useful for search queries and API calls
 */
export const useDebouncedCallback = <T extends any[], R = void>(
  callback: (...args: T) => R,
  delayMs: number = 300
): ((...args: T) => void) => {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = React.useCallback(
    (...args: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delayMs);

      setTimeoutId(newTimeoutId);
    },
    [callback, delayMs, timeoutId]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFn;
};
