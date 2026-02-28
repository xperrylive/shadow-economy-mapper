/**
 * Design System Hooks
 * 
 * Utility hooks for responsive design and accessibility preferences.
 * These hooks provide a clean API for detecting viewport sizes and user preferences.
 */

export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsSmallAndUp,
  useIsMediumAndUp,
  useIsLargeAndUp,
} from './useMediaQuery';

export {
  useReducedMotion,
  getAnimationDuration,
  getTransition,
  getAnimationClass,
} from './useReducedMotion';
