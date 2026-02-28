import { useState, useCallback } from 'react';

/**
 * Hook for optimistic UI updates
 * Updates UI immediately before server confirmation, with rollback on error
 */

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<void>;
  onRollback?: (error: Error) => void;
}

export function useOptimisticUpdate<T>(options: UseOptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticData: T) => {
      setIsUpdating(true);
      setError(null);

      try {
        // Perform the actual update
        await options.onUpdate(optimisticData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Update failed');
        setError(error);
        
        // Call rollback handler if provided
        if (options.onRollback) {
          options.onRollback(error);
        }
        
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [options]
  );

  return {
    update,
    isUpdating,
    error,
  };
}
