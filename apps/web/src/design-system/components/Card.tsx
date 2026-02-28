import React from 'react';

/**
 * Card Component
 * 
 * A versatile container component with configurable padding, shadow, and border.
 * Used as a standard container throughout the application for grouping related content.
 * 
 * Features:
 * - White background with rounded corners (16px)
 * - Configurable padding (sm, md, lg)
 * - Configurable shadow (sm, base, md, lg)
 * - Optional border
 * - Responsive design
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Padding size
   * - sm: 12px (0.75rem)
   * - md: 16px (1rem) - default
   * - lg: 24px (1.5rem)
   */
  padding?: 'sm' | 'md' | 'lg';
  
  /**
   * Shadow size
   * - sm: Subtle shadow
   * - base: Standard shadow - default
   * - md: Medium shadow
   * - lg: Large shadow
   */
  shadow?: 'sm' | 'base' | 'md' | 'lg';
  
  /**
   * Whether to show a border
   */
  border?: boolean;
  
  /**
   * Card content
   */
  children: React.ReactNode;
}

/**
 * Card Component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      shadow = 'base',
      border = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles - always applied
    const baseStyles = [
      'bg-white',
      'rounded-lg',  // 16px border radius
    ];

    // Padding styles
    const paddingStyles = {
      sm: 'p-3',   // 12px
      md: 'p-4',   // 16px
      lg: 'p-6',   // 24px
    };

    // Shadow styles - matching design system tokens
    const shadowStyles = {
      sm: 'shadow-sm',    // 0 1px 2px 0 rgb(0 0 0 / 0.05)
      base: 'shadow',     // 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
      md: 'shadow-md',    // 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
      lg: 'shadow-lg',    // 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
    };

    // Border styles
    const borderStyles = border ? ['border', 'border-neutral-200'] : [];

    // Combine all styles
    const cardClasses = [
      ...baseStyles,
      paddingStyles[padding],
      shadowStyles[shadow],
      ...borderStyles,
      className,
    ].join(' ');

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
