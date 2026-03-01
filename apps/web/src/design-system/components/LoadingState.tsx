import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface LoadingStateProps {
  type?: 'skeleton' | 'progress' | 'spinner';
  message?: string;
  progress?: number;
  estimatedTime?: string;
  size?: 'sm' | 'md' | 'lg';
  skeletonVariant?: 'text' | 'card' | 'circle' | 'custom';
  lines?: number;
  children?: React.ReactNode;
  className?: string;
}

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
