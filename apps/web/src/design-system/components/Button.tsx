import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Spinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={`animate-spin ${sizeMap[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      children,
      fullWidth = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles - always applied
    const baseStyles = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    // Size styles - all meet 44x44px minimum touch target
    const sizeStyles = {
      sm: [
        'min-h-[44px]',  // Minimum 44px height for touch accessibility
        'px-4',
        'py-2.5',
        'text-sm',
      ],
      md: [
        'min-h-[44px]',  // Minimum 44px height for touch accessibility
        'px-6',
        'py-3',
        'text-base',
      ],
      lg: [
        'min-h-[48px]',  // Larger for emphasis
        'px-8',
        'py-3.5',
        'text-lg',
      ],
    };

    // Variant styles - semantic colors from design system
    const variantStyles = {
      primary: [
        'bg-primary-600',
        'text-white',
        'hover:bg-primary-700',
        'active:bg-primary-800',
        'focus:ring-primary-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
      secondary: [
        'bg-neutral-100',
        'text-neutral-900',
        'hover:bg-neutral-200',
        'active:bg-neutral-300',
        'focus:ring-neutral-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
      outline: [
        'bg-transparent',
        'text-primary-700',
        'border-2',
        'border-primary-600',
        'hover:bg-primary-50',
        'active:bg-primary-100',
        'focus:ring-primary-500',
      ],
      ghost: [
        'bg-transparent',
        'text-neutral-700',
        'hover:bg-neutral-100',
        'active:bg-neutral-200',
        'focus:ring-neutral-500',
      ],
      danger: [
        'bg-danger-600',
        'text-white',
        'hover:bg-danger-700',
        'active:bg-danger-800',
        'focus:ring-danger-500',
        'shadow-sm',
        'hover:shadow-md',
      ],
    };

    // Width styles
    const widthStyles = fullWidth ? ['w-full'] : [];

    // Combine all styles
    const buttonClasses = [
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...widthStyles,
      className,
    ].join(' ');

    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Render icon or spinner
    const renderIcon = () => {
      if (loading) {
        return <Spinner size={size} />;
      }
      if (icon) {
        return <span className="flex-shrink-0" aria-hidden="true">{icon}</span>;
      }
      return null;
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {iconPosition === 'left' && renderIcon()}
        <span>{children}</span>
        {iconPosition === 'right' && !loading && renderIcon()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
