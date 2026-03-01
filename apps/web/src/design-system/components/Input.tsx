import React, { useState, useCallback, useEffect } from 'react';
import { formatCurrency, formatPhone, parseCurrency } from '../../utils/formatters';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  label: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  autoFormat?: 'currency' | 'date' | 'phone';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      icon,
      value,
      onChange,
      autoFormat,
      size = 'md',
      fullWidth = false,
      required = false,
      disabled = false,
      className = '',
      id,
      type = 'text',
      onBlur,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    // Track if input has been touched (for validation timing)
    const [touched, setTouched] = useState(false);

    // Internal state for cursor position (for auto-formatting)
    const [displayValue, setDisplayValue] = useState(value);

    // Update display value when prop value changes
    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        let formattedValue = rawValue;

        // Apply auto-formatting based on type
        if (autoFormat === 'currency') {
          // Remove non-numeric characters except decimal point
          const cleaned = rawValue.replace(/[^0-9.]/g, '');
          // Limit to 2 decimal places
          const parts = cleaned.split('.');
          if (parts.length > 2) {
            formattedValue = `${parts[0]}.${parts[1]}`;
          } else if (parts.length === 2 && parts[1].length > 2) {
            formattedValue = `${parts[0]}.${parts[1].slice(0, 2)}`;
          } else {
            formattedValue = cleaned;
          }
        } else if (autoFormat === 'date') {
          // Remove non-numeric characters
          const cleaned = rawValue.replace(/\D/g, '');
          // Format as DD/MM/YYYY
          if (cleaned.length <= 2) {
            formattedValue = cleaned;
          } else if (cleaned.length <= 4) {
            formattedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
          } else {
            formattedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
          }
        } else if (autoFormat === 'phone') {
          // Remove non-numeric characters
          const cleaned = rawValue.replace(/\D/g, '');
          formattedValue = cleaned;
        }

        setDisplayValue(formattedValue);
        onChange(formattedValue);
      },
      [autoFormat, onChange]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true);

        // Apply final formatting on blur
        let finalValue = displayValue;

        if (autoFormat === 'currency' && displayValue) {
          // Parse and reformat currency
          const numValue = parseCurrency(displayValue);
          if (!isNaN(numValue) && isFinite(numValue)) {
            finalValue = formatCurrency(numValue);
          }
        } else if (autoFormat === 'phone' && displayValue) {
          // Format phone number
          finalValue = formatPhone(displayValue);
        }

        if (finalValue !== displayValue) {
          setDisplayValue(finalValue);
          onChange(finalValue);
        }

        // Call original onBlur if provided
        if (onBlur) {
          onBlur(e);
        }
      },
      [autoFormat, displayValue, onChange, onBlur]
    );

    // Determine if we should show error (only after touched or if error is present)
    const showError = error && (touched || error);

    const containerClasses = [
      'flex',
      'flex-col',
      'gap-1.5',
      fullWidth ? 'w-full' : 'w-auto',
    ].join(' ');

    const labelClasses = [
      'text-sm',
      'font-medium',
      'text-neutral-700',
      disabled ? 'opacity-50' : '',
    ].join(' ');

    const wrapperClasses = [
      'relative',
      'flex',
      'items-center',
    ].join(' ');

    const sizeStyles = {
      sm: [
        'min-h-[44px]',  // Minimum 44px height for touch accessibility
        'px-3',
        'py-2',
        'text-sm',
      ],
      md: [
        'min-h-[44px]',  // Minimum 44px height for touch accessibility
        'px-4',
        'py-2.5',
        'text-base',
      ],
      lg: [
        'min-h-[48px]',  // Larger for emphasis
        'px-5',
        'py-3',
        'text-lg',
      ],
    };

    const inputBaseStyles = [
      'w-full',
      'rounded-lg',
      'border',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:bg-neutral-50',
    ];

    const inputStateStyles = showError
      ? [
          'border-danger-500',
          'text-danger-900',
          'focus:border-danger-500',
          'focus:ring-danger-500',
        ]
      : [
          'border-neutral-300',
          'text-neutral-900',
          'focus:border-primary-500',
          'focus:ring-primary-500',
          'hover:border-neutral-400',
        ];

    const iconPaddingStyles = icon ? ['pl-11'] : [];

    const inputClasses = [
      ...inputBaseStyles,
      ...sizeStyles[size],
      ...inputStateStyles,
      ...iconPaddingStyles,
      className,
    ].join(' ');

    const helperTextClasses = [
      'text-sm',
      'flex',
      'items-start',
      'gap-1.5',
      showError ? 'text-danger-600' : 'text-neutral-600',
    ].join(' ');

    const iconContainerClasses = [
      'absolute',
      'left-3',
      'flex',
      'items-center',
      'pointer-events-none',
      showError ? 'text-danger-500' : 'text-neutral-400',
    ].join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-danger-500 ml-1" aria-label="required">*</span>}
        </label>

        {/* Input wrapper with icon */}
        <div className={wrapperClasses}>
          {/* Icon */}
          {icon && (
            <div className={iconContainerClasses} aria-hidden="true">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={showError ? 'true' : 'false'}
            aria-describedby={showError ? errorId : helperText ? helperId : undefined}
            {...props}
          />
        </div>

        {/* Helper text or error message */}
        {(helperText || showError) && (
          <div
            id={showError ? errorId : helperId}
            className={helperTextClasses}
            role={showError ? 'alert' : undefined}
          >
            {showError && (
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{showError ? error : helperText}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
