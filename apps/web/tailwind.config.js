import { colors, spacing, typography, shadows, borderRadius } from './src/design-system/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Color system: primary (trust/stability), success (positive indicators),
      // warning (attention needed), danger (critical issues), neutral (text/backgrounds)
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        neutral: colors.neutral,
      },
      
      // Spacing scale: consistent 4px-based spacing system
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
        '3xl': spacing['3xl'],
      },
      
      // Typography: font families, sizes, and weights
      fontFamily: {
        sans: typography.fontFamily.sans.split(',').map(f => f.trim()),
      },
      fontSize: {
        xs: typography.fontSize.xs,
        sm: typography.fontSize.sm,
        base: typography.fontSize.base,
        lg: typography.fontSize.lg,
        xl: typography.fontSize.xl,
        '2xl': typography.fontSize['2xl'],
        '3xl': typography.fontSize['3xl'],
        '4xl': typography.fontSize['4xl'],
      },
      fontWeight: {
        normal: typography.fontWeight.normal,
        medium: typography.fontWeight.medium,
        semibold: typography.fontWeight.semibold,
        bold: typography.fontWeight.bold,
      },
      
      // Shadows: elevation for cards, modals, floating elements
      boxShadow: {
        sm: shadows.sm,
        DEFAULT: shadows.base,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
      },
      
      // Border radius: rounded corners for UI elements
      borderRadius: {
        sm: borderRadius.sm,
        DEFAULT: borderRadius.base,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        full: borderRadius.full,
      },
    },
    
    // Responsive breakpoints: mobile-first design
    screens: {
      'sm': '640px',   // Small devices (landscape phones)
      'md': '768px',   // Medium devices (tablets)
      'lg': '1024px',  // Large devices (desktops)
      'xl': '1280px',  // Extra large devices (large desktops)
      '2xl': '1536px', // 2X large devices (larger desktops)
    },
  },
  plugins: [],
};
