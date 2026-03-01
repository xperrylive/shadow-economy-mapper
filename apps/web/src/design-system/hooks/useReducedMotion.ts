import { useState, useEffect } from 'react';

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

export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0 : normalDuration;
}

export function getTransition(
  normalTransition: string,
  prefersReducedMotion: boolean
): string {
  return prefersReducedMotion ? 'none' : normalTransition;
}

export function getAnimationClass(
  animationClass: string,
  prefersReducedMotion: boolean
): string {
  return prefersReducedMotion ? '' : animationClass;
}

export default useReducedMotion;
