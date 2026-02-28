/**
 * Haptic feedback utilities for mobile devices
 */

/**
 * Trigger haptic feedback if available
 * @param type - Type of haptic feedback
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void {
  // Check if Vibration API is available
  if (!('vibrate' in navigator)) {
    return;
  }

  // Map feedback types to vibration patterns
  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 100, 30, 100, 30],
  };

  const pattern = patterns[type] || patterns.light;
  navigator.vibrate(pattern);
}

/**
 * Check if haptic feedback is available
 */
export function isHapticAvailable(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback for button press
 */
export function hapticButtonPress(): void {
  triggerHaptic('light');
}

/**
 * Trigger haptic feedback for successful action
 */
export function hapticSuccess(): void {
  triggerHaptic('success');
}

/**
 * Trigger haptic feedback for error
 */
export function hapticError(): void {
  triggerHaptic('error');
}

/**
 * Trigger haptic feedback for warning
 */
export function hapticWarning(): void {
  triggerHaptic('warning');
}

/**
 * Trigger haptic feedback for delete action
 */
export function hapticDelete(): void {
  triggerHaptic('heavy');
}
