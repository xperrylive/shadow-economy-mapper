import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface DesignToken {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
}

export interface ThemeConfig {
  tokens: DesignToken;
  breakpoints: {
    sm: string;   // Mobile devices (640px)
    md: string;   // Tablets (768px)
    lg: string;   // Laptops (1024px)
    xl: string;   // Desktops (1280px)
  };
}

export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface InteractiveComponentProps extends ComponentBaseProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
