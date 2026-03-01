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

export function isHapticAvailable(): boolean {
  return 'vibrate' in navigator;
}

export function hapticButtonPress(): void {
  triggerHaptic('light');
}

export function hapticSuccess(): void {
  triggerHaptic('success');
}

export function hapticError(): void {
  triggerHaptic('error');
}

export function hapticWarning(): void {
  triggerHaptic('warning');
}

export function hapticDelete(): void {
  triggerHaptic('heavy');
}
