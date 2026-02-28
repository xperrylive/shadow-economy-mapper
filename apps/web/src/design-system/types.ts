/**
 * Design System Types
 * 
 * TypeScript interfaces and types for the Shadow Economy Mapper design system.
 * These types provide type safety for UI components and ensure consistency
 * across the platform.
 */

import { colors, spacing, typography, shadows, borderRadius } from './tokens';

/**
 * Color Variant
 * 
 * Semantic color variants used throughout the UI
 * - primary: Trust and stability (blue) - main actions
 * - success: Positive indicators (green) - income, growth, high scores
 * - warning: Attention needed (amber) - cautions
 * - danger: Critical issues (red) - errors, low scores
 * - neutral: Text and backgrounds (gray)
 */
export type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

/**
 * Size
 * 
 * Standard size scale for UI components (buttons, inputs, badges, etc.)
 * - xs: Extra small (compact UI elements)
 * - sm: Small (secondary actions)
 * - md: Medium (default size)
 * - lg: Large (primary actions)
 * - xl: Extra large (hero elements)
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spacing
 * 
 * Spacing scale for padding, margins, and gaps
 * Based on 4px base unit for consistent rhythm
 * - xs: 4px
 * - sm: 8px
 * - md: 16px
 * - lg: 24px
 * - xl: 32px
 * - 2xl: 48px
 * - 3xl: 64px
 */
export type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Design Token
 * 
 * Complete design token system containing all design primitives
 * Used to maintain consistency across the platform
 */
export interface DesignToken {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
}

/**
 * Theme Config
 * 
 * Theme configuration including design tokens and responsive breakpoints
 * Provides the foundation for the entire design system
 */
export interface ThemeConfig {
  tokens: DesignToken;
  breakpoints: {
    sm: string;   // Mobile devices (640px)
    md: string;   // Tablets (768px)
    lg: string;   // Laptops (1024px)
    xl: string;   // Desktops (1280px)
  };
}

/**
 * Component Base Props
 * 
 * Common props shared across UI components
 */
export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

/**
 * Interactive Component Props
 * 
 * Props for interactive UI elements (buttons, inputs, etc.)
 */
export interface InteractiveComponentProps extends ComponentBaseProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
