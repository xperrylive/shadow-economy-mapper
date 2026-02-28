/**
 * Design Tokens for Shadow Economy Mapper
 * 
 * This module defines the core design tokens for the platform's UI redesign,
 * aligned with financial inclusion and informal economy context.
 * 
 * Tokens include:
 * - Color palettes (primary, success, warning, danger, neutral)
 * - Spacing scale (xs to 3xl)
 * - Typography system (font families, sizes, weights)
 * - Shadows (sm to xl)
 * - Border radius (sm to full)
 */

/**
 * Color Palettes
 *
 * Primary (Teal): Warm trust and stability for financial credibility
 * Accent (Amber/Gold): Warm highlights and call-to-action elements
 * Success (Green): Positive financial indicators, income, growth, high scores
 * Warning (Amber): Attention needed, cautions
 * Danger (Red): Critical issues, low scores, errors
 * Neutral (Stone/Warm Gray): Text, backgrounds, borders
 */
export const colors = {
  // Primary: Warm trust and stability (teal)
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Accent: Warm highlights (amber/gold)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Success: Positive financial indicators (green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning: Attention needed (amber)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Danger: Critical issues (red)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral: Text and backgrounds (stone/warm gray)
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
} as const;

/**
 * Spacing Scale
 * 
 * Consistent spacing system based on 4px base unit
 * Used for padding, margins, gaps throughout the UI
 */
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

/**
 * Typography System
 * 
 * Font families, sizes, and weights for text hierarchy
 * Optimized for readability on mobile devices
 */
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/**
 * Shadow System
 * 
 * Elevation shadows for cards, modals, and floating elements
 * Creates depth and visual hierarchy
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

/**
 * Border Radius System
 * 
 * Rounded corners for cards, buttons, inputs, and other UI elements
 * Creates friendly, approachable aesthetic
 */
export const borderRadius = {
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',  // Fully rounded (pills, circles)
} as const;

/**
 * Type Definitions
 */
export type ColorPalette = typeof colors;
export type ColorVariant = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;

export type SpacingScale = typeof spacing;
export type SpacingValue = keyof typeof spacing;

export type Typography = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;

export type ShadowScale = typeof shadows;
export type ShadowValue = keyof typeof shadows;

export type BorderRadiusScale = typeof borderRadius;
export type BorderRadiusValue = keyof typeof borderRadius;

/**
 * Design Token Interface
 * 
 * Complete design token system for the platform
 */
export interface DesignTokens {
  colors: ColorPalette;
  spacing: SpacingScale;
  typography: Typography;
  shadows: ShadowScale;
  borderRadius: BorderRadiusScale;
}

/**
 * Default export of all design tokens
 */
export const tokens: DesignTokens = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
};

export default tokens;
