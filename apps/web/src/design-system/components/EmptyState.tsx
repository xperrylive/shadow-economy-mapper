import React from 'react';
import { Button } from './Button';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  helpText,
  size = 'md',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Size-based styling
  const sizeStyles = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12 mb-3',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-2',
      buttonSize: 'sm' as const,
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16 mb-4',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-3',
      buttonSize: 'md' as const,
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20 mb-6',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-4',
      buttonSize: 'lg' as const,
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon/Illustration */}
      {icon && (
        <div
          className={`${styles.icon} text-neutral-400 flex items-center justify-center ${
            prefersReducedMotion ? '' : 'transition-all duration-300'
          }`}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className={`max-w-md ${styles.spacing}`}>
        {/* Title */}
        <h3 className={`${styles.title} font-semibold text-neutral-900`}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={`${styles.description} text-neutral-600`}>
            {description}
          </p>
        )}

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {actionLabel && onAction && (
              <Button
                variant="primary"
                size={styles.buttonSize}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="ghost"
                size={styles.buttonSize}
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}

        {/* Help Text */}
        {helpText && (
          <p className="text-sm text-neutral-500 mt-4 italic">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
