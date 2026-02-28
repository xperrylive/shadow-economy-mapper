import React from 'react';

/**
 * Badge Component
 * 
 * A compact component for displaying status indicators, labels, and tags.
 * Supports color variants matching the design system and icon + text combinations.
 * 
 * Features:
 * - 5 color variants: primary, success, warning, danger, neutral
 * - 3 sizes: sm, md, lg
 * - Icon support (left or right)
 * - Rounded or pill-shaped
 * - Accessible with proper ARIA labels
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Color variant of the badge
   * - primary: Blue (neutral information, primary actions)
   * - success: Green (positive indicators, completed, high scores)
   * - warning: Amber (caution, attention needed)
   * - danger: Red (errors, critical issues, low scores)
   * - neutral: Gray (default, inactive, pending)
   */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  
  /**
   * Size of the badge
   * - sm: Small, compact badge
   * - md: Medium badge (default)
   * - lg: Large badge for emphasis
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Icon element to display (from Lucide React or other icon library)
   */
  icon?: React.ReactNode;
  
  /**
   * Position of the icon relative to text
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Badge content (text)
   */
  children: React.ReactNode;
  
  /**
   * Shape of the badge
   * - rounded: Standard rounded corners
   * - pill: Fully rounded (pill-shaped)
   */
  shape?: 'rounded' | 'pill';
  
  /**
   * Whether to use a dot indicator instead of an icon
   */
  dot?: boolean;
}

/**
 * Badge Component
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      icon,
      iconPosition = 'left',
      children,
      shape = 'rounded',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles - always applied
    const baseStyles = [
      'inline-flex',
      'items-center',
      'gap-1.5',
      'font-medium',
      'transition-colors',
      'duration-200',
    ];

    // Size styles
    const sizeStyles = {
      sm: [
        'px-2',
        'py-0.5',
        'text-xs',
      ],
      md: [
        'px-2.5',
        'py-1',
        'text-sm',
      ],
      lg: [
        'px-3',
        'py-1.5',
        'text-base',
      ],
    };

    // Shape styles
    const shapeStyles = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
    };

    // Variant styles - semantic colors from design system
    const variantStyles = {
      primary: [
        'bg-primary-100',
        'text-primary-800',
        'border',
        'border-primary-200',
      ],
      success: [
        'bg-success-100',
        'text-success-800',
        'border',
        'border-success-200',
      ],
      warning: [
        'bg-warning-100',
        'text-warning-800',
        'border',
        'border-warning-200',
      ],
      danger: [
        'bg-danger-100',
        'text-danger-800',
        'border',
        'border-danger-200',
      ],
      neutral: [
        'bg-neutral-100',
        'text-neutral-800',
        'border',
        'border-neutral-200',
      ],
    };

    // Dot color styles (for status indicators)
    const dotColorStyles = {
      primary: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      neutral: 'bg-neutral-600',
    };

    // Icon size based on badge size
    const iconSizeStyles = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    // Combine all styles
    const badgeClasses = [
      ...baseStyles,
      ...sizeStyles[size],
      shapeStyles[shape],
      ...variantStyles[variant],
      className,
    ].join(' ');

    // Render dot indicator
    const renderDot = () => {
      if (!dot) return null;
      return (
        <span
          className={`inline-block w-2 h-2 rounded-full ${dotColorStyles[variant]}`}
          aria-hidden="true"
        />
      );
    };

    // Render icon
    const renderIcon = () => {
      if (!icon) return null;
      return (
        <span 
          className={`flex-shrink-0 ${iconSizeStyles[size]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      );
    };

    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {dot && renderDot()}
        {iconPosition === 'left' && !dot && renderIcon()}
        <span>{children}</span>
        {iconPosition === 'right' && !dot && renderIcon()}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
