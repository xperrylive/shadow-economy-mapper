/**
 * Error handling utilities
 */

interface ApiError {
  error: true;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Format API error into user-friendly message
 */
export function formatApiError(error: unknown): string {
  // Handle API error response
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const apiError = error as ApiError;
    return apiError.message || 'An error occurred. Please try again.';
  }

  // Handle Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string error
  if (typeof error === 'string') {
    return error;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Map HTTP status codes to user-friendly messages
 */
export function getErrorMessageForStatus(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Your session has expired. Please log in again.',
    403: "You don't have permission to access this resource.",
    404: 'The requested information could not be found.',
    408: 'Request timed out. Please check your connection and try again.',
    409: 'This action conflicts with existing data. Please refresh and try again.',
    413: 'The file is too large. Maximum size is 10MB.',
    415: 'This file type is not supported.',
    422: 'The data provided is invalid. Please check and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again in a few moments.',
    502: 'Service temporarily unavailable. Please try again shortly.',
    503: 'Service temporarily unavailable. Please try again shortly.',
    504: 'Request timed out. Please try again.',
  };

  return messages[status] || 'An error occurred. Please try again.';
}

/**
 * Format file upload error
 */
export function formatFileUploadError(error: unknown): string {
  const message = formatApiError(error);

  // Check for specific file upload errors
  if (message.toLowerCase().includes('too large')) {
    return 'This file is too large. Maximum size is 10MB.';
  }

  if (message.toLowerCase().includes('unsupported') || message.toLowerCase().includes('format')) {
    return 'This file type is not supported. Please upload WhatsApp chats, CSV, PDF, or images.';
  }

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
    return 'Upload failed due to connection issues. Please check your internet and try again.';
  }

  return message || 'Upload failed. Please try again.';
}

/**
 * Format form validation error
 */
export function formatValidationError(field: string, error: string): string {
  const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return `${fieldName}: ${error}`;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('connection') ||
      error.message.toLowerCase().includes('timeout')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === 401 || status === 403;
  }
  return false;
}

/**
 * Get retry delay based on error type
 * @returns Delay in milliseconds, or null if should not retry
 */
export function getRetryDelay(error: unknown, attemptNumber: number): number | null {
  // Don't retry auth errors
  if (isAuthError(error)) {
    return null;
  }

  // Exponential backoff for network errors
  if (isNetworkError(error)) {
    return Math.min(1000 * Math.pow(2, attemptNumber), 10000);
  }

  // Don't retry other errors
  return null;
}
