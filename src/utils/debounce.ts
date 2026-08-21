/**
 * Debouncing and throttling utilities for search and filtering
 */

/**
 * Debounce function - delays execution until after delay ms of inactivity
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * React hook for debounced search input - to be used with React
 * Usage: import { useDebouncedValue } from '@/hooks/useDebouncedValue'
 */
export const createDebouncedValue = <T>(initialValue: T, delay: number = 300) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentValue = initialValue;

  return {
    setValue: (newValue: T, callback: (value: T) => void) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        currentValue = newValue;
        callback(currentValue);
      }, delay);
    },
    getValue: () => currentValue,
  };
};

/**
 * Throttle function - ensures function executes at most once per delay ms
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastCall = Date.now();
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Request deduplication cache
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class RequestDeduplicator {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Execute function with deduplication
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached result if still valid
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Execute function
    const result = await fn();

    // Cache result
    this.cache.set(key, {
      data: result,
      timestamp: now,
      ttl,
    });

    return result;
  }

  /**
   * Clear cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();
