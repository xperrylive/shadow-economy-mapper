/**
 * useReducedMotion Hook
 * 
 * Custom React hook for detecting user's motion preferences for accessibility.
 * Respects the prefers-reduced-motion media query to support users who prefer
 * reduced motion due to vestibular disorders or motion sensitivity.
 * 
 * Features:
 * - Detects prefers-reduced-motion system preference
 * - Server-side rendering safe (returns false during SSR)
 * - Automatic cleanup of event listeners
 * - TypeScript support with proper typing
 * 
 * Usage:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * // Conditionally apply animations
 * <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
 *   Content
 * </div>
 * 
 * // Or in inline styles
 * <div style={{ transition: prefersReducedMotion ? 'none' : 'all 0.3s ease' }}>
 *   Content
 * </div>
 * ```
 * 
 * Validates: Requirements 15.5 (Motion Preference Respect), 8.1 (Accessibility)
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * 
 * @returns boolean - true if user prefers reduced motion, false otherwise
 */
export function useReducedMotion(): boolean {
  // Initialize with false for SSR safety
  // This means animations will be enabled by default during SSR,
  // then adjusted on the client if needed
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Define event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
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
  }, []);

  return prefersReducedMotion;
}

/**
 * Helper function to get animation duration based on motion preference
 * 
 * @param normalDuration - Duration in milliseconds for normal motion
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns 0 if reduced motion is preferred, normalDuration otherwise
 */
export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0 : normalDuration;
}

/**
 * Helper function to get transition CSS based on motion preference
 * 
 * @param normalTransition - CSS transition string for normal motion
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns 'none' if reduced motion is preferred, normalTransition otherwise
 */
export function getTransition(
  normalTransition: string,
  prefersReducedMotion: boolean
): string {
  return prefersReducedMotion ? 'none' : normalTransition;
}

/**
 * Helper function to conditionally apply animation class
 * 
 * @param animationClass - CSS class for animation
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns empty string if reduced motion is preferred, animationClass otherwise
 */
export function getAnimationClass(
  animationClass: string,
  prefersReducedMotion: boolean
): string {
  return prefersReducedMotion ? '' : animationClass;
}

export default useReducedMotion;
