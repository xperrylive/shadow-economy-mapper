/**
 * useMediaQuery Hook
 * 
 * Custom React hook for responsive breakpoint detection.
 * Provides a clean API for checking if a media query matches the current viewport.
 * 
 * Features:
 * - Server-side rendering safe (returns false during SSR)
 * - Automatic cleanup of event listeners
 * - TypeScript support with proper typing
 * - Works with any valid CSS media query string
 * 
 * Usage:
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 * 
 * Validates: Requirements 6.1 (Mobile-First Responsive Design), 8.1 (Progressive Disclosure)
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches the current viewport
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false for SSR safety
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    // Use addEventListener for modern browsers, addListener for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common responsive scenarios
 * Based on Tailwind CSS breakpoints configured in tailwind.config.js
 */

/**
 * Check if viewport is mobile size (< 640px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/**
 * Check if viewport is tablet size (640px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/**
 * Check if viewport is desktop size (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Check if viewport is at least small breakpoint (>= 640px)
 */
export function useIsSmallAndUp(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

/**
 * Check if viewport is at least medium breakpoint (>= 768px)
 */
export function useIsMediumAndUp(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/**
 * Check if viewport is at least large breakpoint (>= 1024px)
 */
export function useIsLargeAndUp(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export default useMediaQuery;
