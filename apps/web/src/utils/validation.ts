/**
 * Validation Utilities
 * 
 * Validation functions for user inputs with specific error messages.
 * Used in forms and file uploads throughout the application.
 * 
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a currency amount
 * Rules:
 * - Must be a valid number
 * - Must be greater than 0
 * - Must not exceed 1,000,000 (reasonable limit for informal businesses)
 * 
 * @param value - The amount to validate (can be string or number)
 * @returns Validation result with specific error message if invalid
 */
export function validateCurrency(value: string | number): ValidationResult {
  // Convert to number if string
  const amount = typeof value === 'string' 
    ? parseFloat(value.replace(/[RM\s,]/g, ''))
    : value;

  // Check if valid number
  if (isNaN(amount) || !isFinite(amount)) {
    return {
      valid: false,
      error: 'Please enter a valid amount',
    };
  }

  // Check if positive
  if (amount <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than RM 0.00',
    };
  }

  // Check maximum limit
  if (amount > 1000000) {
    return {
      valid: false,
      error: 'Amount cannot exceed RM 1,000,000.00',
    };
  }

  return { valid: true };
}

/**
 * Validate a date string in DD/MM/YYYY format
 * Rules:
 * - Must match DD/MM/YYYY format
 * - Must be a valid calendar date
 * - Must not be in the future
 * - Must not be more than 10 years in the past
 * 
 * @param value - The date string to validate
 * @returns Validation result with specific error message if invalid
 */
export function validateDate(value: string): ValidationResult {
  // Check format
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(value)) {
    return {
      valid: false,
      error: 'Please enter date in DD/MM/YYYY format',
    };
  }

  // Parse date components
  const parts = value.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  // Create date object
  const date = new Date(year, month, day);

  // Validate the date is real
  if (
    isNaN(date.getTime()) ||
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return {
      valid: false,
      error: 'Please enter a valid date',
    };
  }

  // Check if date is in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day
  if (date > now) {
    return {
      valid: false,
      error: 'Date cannot be in the future',
    };
  }

  // Check if date is too far in the past (10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  tenYearsAgo.setHours(0, 0, 0, 0);
  if (date < tenYearsAgo) {
    return {
      valid: false,
      error: 'Date cannot be more than 10 years ago',
    };
  }

  return { valid: true };
}

/**
 * Validate a Malaysian phone number
 * Rules:
 * - Must contain 9-11 digits
 * - Must start with 01 (mobile) or 03 (landline)
 * - Accepts various formats (with or without separators)
 * 
 * @param value - The phone number to validate
 * @returns Validation result with specific error message if invalid
 */
export function validatePhone(value: string): ValidationResult {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Check length
  if (digits.length < 9) {
    return {
      valid: false,
      error: 'Phone number is too short',
    };
  }

  if (digits.length > 11) {
    return {
      valid: false,
      error: 'Phone number is too long',
    };
  }

  // Check if starts with valid prefix
  if (!digits.startsWith('01') && !digits.startsWith('03')) {
    return {
      valid: false,
      error: 'Phone number must start with 01 (mobile) or 03 (landline)',
    };
  }

  return { valid: true };
}

/**
 * File upload validation configuration
 */
export interface FileValidationConfig {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Default file upload configuration
 */
const DEFAULT_FILE_CONFIG: Required<FileValidationConfig> = {
  maxSizeMB: 10,
  allowedTypes: [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    // Documents
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text
    'text/plain',
  ],
};

/**
 * Get human-readable file type name
 */
function getFileTypeName(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG image',
    'image/jpg': 'JPG image',
    'image/png': 'PNG image',
    'image/webp': 'WebP image',
    'application/pdf': 'PDF document',
    'text/csv': 'CSV file',
    'application/vnd.ms-excel': 'Excel file',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel file',
    'text/plain': 'text file',
  };
  return typeMap[mimeType] || mimeType;
}

/**
 * Validate a file for upload
 * Rules:
 * - Must not exceed maximum size (default 10MB)
 * - Must be an allowed file type
 * - File must have content (size > 0)
 * 
 * @param file - The file to validate
 * @param config - Optional validation configuration
 * @returns Validation result with specific error message if invalid
 */
export function validateFile(
  file: File,
  config: FileValidationConfig = {}
): ValidationResult {
  const { maxSizeMB, allowedTypes } = {
    ...DEFAULT_FILE_CONFIG,
    ...config,
  };

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please select a valid file.',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedNames = allowedTypes.map(getFileTypeName).join(', ');
    return {
      valid: false,
      error: `File type not supported. Please upload: ${allowedNames}`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files for upload
 * 
 * @param files - Array of files to validate
 * @param config - Optional validation configuration
 * @returns Array of validation results, one per file
 */
export function validateFiles(
  files: File[],
  config: FileValidationConfig = {}
): ValidationResult[] {
  return files.map(file => validateFile(file, config));
}

/**
 * Check if all validation results are valid
 * 
 * @param results - Array of validation results
 * @returns True if all results are valid
 */
export function allValid(results: ValidationResult[]): boolean {
  return results.every(result => result.valid);
}

/**
 * Get all error messages from validation results
 * 
 * @param results - Array of validation results
 * @returns Array of error messages (empty if all valid)
 */
export function getErrors(results: ValidationResult[]): string[] {
  return results
    .filter(result => !result.valid && result.error)
    .map(result => result.error!);
}
