import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * LoadingState Component
 * 
 * A comprehensive loading state component supporting skeleton screens, progress bars,
 * and spinners with contextual loading messages. Designed for mobile-first accessibility
 * and respects user motion preferences.
 * 
 * Features:
 * - Skeleton screens for predictable content layouts
 * - Progress bars with percentage and estimated time
 * - Spinners for indeterminate operations
 * - Contextual loading messages
 * - Respects prefers-reduced-motion
 * - ARIA live regions for screen reader announcements
 */

export interface LoadingStateProps {
  /**
   * Type of loading indicator
   * - skeleton: Skeleton screen matching content layout
   * - progress: Progress bar with percentage
   * - spinner: Circular spinner for indeterminate operations
   */
  type?: 'skeleton' | 'progress' | 'spinner';
  
  /**
   * Contextual loading message
   * Examples: "Analyzing your evidence...", "Computing score...", "Uploading files..."
   */
  message?: string;
  
  /**
   * Progress percentage (0-100) - only used with type="progress"
   */
  progress?: number;
  
  /**
   * Estimated time remaining - only used with type="progress"
   * Examples: "2 seconds remaining", "About 30 seconds left"
   */
  estimatedTime?: string;
  
  /**
   * Size of the loading indicator
   * - sm: Small (16px spinner, thin skeleton)
   * - md: Medium (24px spinner, medium skeleton) - default
   * - lg: Large (32px spinner, thick skeleton)
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Skeleton variant - only used with type="skeleton"
   * - text: Text line skeleton
   * - card: Card-shaped skeleton
   * - circle: Circular skeleton (for avatars, scores)
   * - custom: Custom skeleton with children
   */
  skeletonVariant?: 'text' | 'card' | 'circle' | 'custom';
  
  /**
   * Number of skeleton lines - only used with skeletonVariant="text"
   */
  lines?: number;
  
  /**
   * Custom skeleton content - only used with skeletonVariant="custom"
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Spinner Component
 * Circular spinner for indeterminate loading operations
 */
const Spinner: React.FC<{ size: 'sm' | 'md' | 'lg'; prefersReducedMotion: boolean }> = ({ 
  size, 
  prefersReducedMotion 
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={`${sizeMap[size]} ${prefersReducedMotion ? '' : 'animate-spin'} text-primary-600`}
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

/**
 * ProgressBar Component
 * Progress bar with percentage indicator
 */
const ProgressBar: React.FC<{ 
  progress: number; 
  size: 'sm' | 'md' | 'lg';
  prefersReducedMotion: boolean;
}> = ({ progress, size, prefersReducedMotion }) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${heightMap[size]}`}>
        <div
          className={`h-full bg-primary-600 rounded-full ${prefersReducedMotion ? '' : 'transition-all duration-300 ease-out'}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Loading progress: ${clampedProgress}%`}
        />
      </div>
      <div className="mt-2 flex justify-between items-center text-sm text-neutral-600">
        <span>{clampedProgress}%</span>
      </div>
    </div>
  );
};

/**
 * SkeletonText Component
 * Text line skeleton with shimmer effect
 */
const SkeletonText: React.FC<{ 
  lines: number; 
  size: 'sm' | 'md' | 'lg';
  prefersReducedMotion: boolean;
}> = ({ lines, size, prefersReducedMotion }) => {
  const heightMap = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  };

  const spaceMap = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  };

  return (
    <div className={spaceMap[size]}>
      {Array.from({ length: lines }).map((_, index) => {
        // Last line is shorter (80% width) for natural text appearance
        const isLastLine = index === lines - 1;
        const widthClass = isLastLine ? 'w-4/5' : 'w-full';
        
        return (
          <div
            key={index}
            className={`${heightMap[size]} ${widthClass} bg-neutral-200 rounded ${
              prefersReducedMotion ? '' : 'animate-pulse'
            }`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Card-shaped skeleton for content cards
 */
const SkeletonCard: React.FC<{ 
  size: 'sm' | 'md' | 'lg';
  prefersReducedMotion: boolean;
}> = ({ size, prefersReducedMotion }) => {
  const heightMap = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-40',
  };

  return (
    <div
      className={`${heightMap[size]} w-full bg-neutral-200 rounded-lg ${
        prefersReducedMotion ? '' : 'animate-pulse'
      }`}
      aria-hidden="true"
    />
  );
};

/**
 * SkeletonCircle Component
 * Circular skeleton for avatars, scores, etc.
 */
const SkeletonCircle: React.FC<{ 
  size: 'sm' | 'md' | 'lg';
  prefersReducedMotion: boolean;
}> = ({ size, prefersReducedMotion }) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div
      className={`${sizeMap[size]} bg-neutral-200 rounded-full ${
        prefersReducedMotion ? '' : 'animate-pulse'
      }`}
      aria-hidden="true"
    />
  );
};

/**
 * LoadingState Component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message,
  progress = 0,
  estimatedTime,
  size = 'md',
  skeletonVariant = 'text',
  lines = 3,
  children,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Render loading indicator based on type
  const renderLoadingIndicator = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner size={size} prefersReducedMotion={prefersReducedMotion} />
            {message && (
              <p className="text-sm text-neutral-600 text-center">{message}</p>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="w-full max-w-md">
            {message && (
              <p className="text-sm text-neutral-700 mb-3 font-medium">{message}</p>
            )}
            <ProgressBar 
              progress={progress} 
              size={size} 
              prefersReducedMotion={prefersReducedMotion}
            />
            {estimatedTime && (
              <p className="text-xs text-neutral-500 mt-2">{estimatedTime}</p>
            )}
          </div>
        );

      case 'skeleton':
        return (
          <div className="w-full">
            {message && (
              <p className="text-sm text-neutral-600 mb-4">{message}</p>
            )}
            {skeletonVariant === 'text' && (
              <SkeletonText 
                lines={lines} 
                size={size} 
                prefersReducedMotion={prefersReducedMotion}
              />
            )}
            {skeletonVariant === 'card' && (
              <SkeletonCard 
                size={size} 
                prefersReducedMotion={prefersReducedMotion}
              />
            )}
            {skeletonVariant === 'circle' && (
              <div className="flex justify-center">
                <SkeletonCircle 
                  size={size} 
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            )}
            {skeletonVariant === 'custom' && children}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {renderLoadingIndicator()}
      <span className="sr-only">
        {message || 'Loading...'}
      </span>
    </div>
  );
};

LoadingState.displayName = 'LoadingState';

export default LoadingState;
