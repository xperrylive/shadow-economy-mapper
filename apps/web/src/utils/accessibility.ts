/**
 * Accessibility Utilities
 * 
 * Functions for accessibility features:
 * - ARIA label generation
 * - Contrast ratio checking (WCAG 2.1 Level AA compliance)
 * - Focus management
 */

/**
 * Generate ARIA label for score card based on score value
 * @param score - The credibility score (0-100)
 * @returns ARIA label describing the score
 */
export function generateScoreAriaLabel(score: number): string {
  let level: string;
  
  if (score >= 71) {
    level = 'Strong';
  } else if (score >= 41) {
    level = 'Fair';
  } else {
    level = 'Needs Improvement';
  }
  
  return `Credibility score: ${score} out of 100. ${level} confidence level.`;
}

/**
 * Generate ARIA label for evidence item
 * @param filename - The evidence filename
 * @param sourceType - The source type (e.g., 'whatsapp', 'csv', 'pdf')
 * @param status - The processing status
 * @returns ARIA label describing the evidence
 */
export function generateEvidenceAriaLabel(
  filename: string,
  sourceType: string,
  status: string
): string {
  const statusText = status === 'PROCESSED' ? 'processed successfully' :
                     status === 'PROCESSING' ? 'currently processing' :
                     status === 'FAILED' ? 'failed to process' :
                     'uploaded';
  
  return `Evidence file: ${filename}, type: ${sourceType}, status: ${statusText}`;
}

/**
 * Generate ARIA label for file upload progress
 * @param filename - The file being uploaded
 * @param progress - Upload progress percentage (0-100)
 * @returns ARIA label describing upload progress
 */
export function generateUploadProgressAriaLabel(
  filename: string,
  progress: number
): string {
  if (progress === 0) {
    return `Starting upload of ${filename}`;
  } else if (progress === 100) {
    return `Upload of ${filename} complete`;
  } else {
    return `Uploading ${filename}: ${progress}% complete`;
  }
}

/**
 * Generate ARIA label for form validation error
 * @param fieldName - The field name
 * @param errorMessage - The error message
 * @returns ARIA label for the error
 */
export function generateErrorAriaLabel(
  fieldName: string,
  errorMessage: string
): string {
  return `Error in ${fieldName}: ${errorMessage}`;
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., '#ffffff' or 'ffffff')
 * @returns RGB values as [r, g, b] or null if invalid
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '');
  
  if (cleaned.length !== 6) {
    return null;
  }
  
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }
  
  return [r, g, b];
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Convert to 0-1 range
  const [rs, gs, bs] = [r, g, b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21) or null if invalid colors
 */
export function calculateContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    return null;
  }
  
  const lum1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AA requirements
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Object with compliance status and contrast ratio
 */
export function checkContrastCompliance(
  color1: string,
  color2: string,
  isLargeText: boolean = false
): { compliant: boolean; ratio: number | null; required: number } {
  const ratio = calculateContrastRatio(color1, color2);
  const required = isLargeText ? 3 : 4.5;
  
  return {
    compliant: ratio !== null && ratio >= required,
    ratio,
    required
  };
}

/**
 * Set focus to an element by ID
 * @param elementId - The ID of the element to focus
 * @returns Whether focus was successful
 */
export function setFocusById(elementId: string): boolean {
  const element = document.getElementById(elementId);
  
  if (element) {
    element.focus();
    return true;
  }
  
  return false;
}

/**
 * Set focus to the first error field in a form
 * @param formId - The ID of the form element
 * @returns Whether focus was successful
 */
export function focusFirstError(formId: string): boolean {
  const form = document.getElementById(formId);
  
  if (!form) {
    return false;
  }
  
  // Find first element with aria-invalid="true"
  const errorElement = form.querySelector('[aria-invalid="true"]') as HTMLElement;
  
  if (errorElement) {
    errorElement.focus();
    return true;
  }
  
  return false;
}

/**
 * Trap focus within a modal or dialog
 * @param containerId - The ID of the container element
 * @returns Cleanup function to remove event listeners
 */
export function trapFocus(containerId: string): () => void {
  const container = document.getElementById(containerId);
  
  if (!container) {
    return () => {};
  }
  
  // Get all focusable elements
  const focusableSelector = 
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  
  const focusableElements = container.querySelectorAll(focusableSelector);
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce a message to screen readers using ARIA live region
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create live region
  let liveRegion = document.getElementById('aria-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Visually hidden but accessible to screen readers
    document.body.appendChild(liveRegion);
  }
  
  // Update the live region
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 * @returns Whether reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate animation duration based on user preferences
 * @param normalDuration - Normal animation duration in ms
 * @param reducedDuration - Reduced animation duration in ms (default: 0)
 * @returns Duration to use based on user preference
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
}
