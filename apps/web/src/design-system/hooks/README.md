# Design System Hooks

Utility hooks for responsive design and accessibility preferences.

## useMediaQuery

Custom React hook for responsive breakpoint detection. Provides a clean API for checking if a media query matches the current viewport.

### Features

- Server-side rendering safe (returns false during SSR)
- Automatic cleanup of event listeners
- TypeScript support with proper typing
- Works with any valid CSS media query string

### Basic Usage

```tsx
import { useMediaQuery } from '@/design-system/hooks';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### Predefined Breakpoint Hooks

The hook provides convenient predefined breakpoint helpers based on Tailwind CSS breakpoints:

```tsx
import { 
  useIsMobile,      // < 640px
  useIsTablet,      // 640px - 1023px
  useIsDesktop,     // >= 1024px
  useIsSmallAndUp,  // >= 640px
  useIsMediumAndUp, // >= 768px
  useIsLargeAndUp,  // >= 1024px
} from '@/design-system/hooks';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  
  return (
    <div className={isMobile ? 'flex-col' : 'flex-row'}>
      {/* Content adapts to viewport size */}
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useMediaQuery } from '@/design-system/hooks';

function AdvancedComponent() {
  // Check for landscape orientation
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Check for high-resolution displays
  const isRetina = useMediaQuery('(min-resolution: 2dppx)');
  
  // Check for dark mode preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  
  return (
    <div>
      {isLandscape && <p>Landscape mode</p>}
      {isRetina && <p>High-resolution display</p>}
      {prefersDark && <p>Dark mode preferred</p>}
    </div>
  );
}
```

## useReducedMotion

Custom React hook for detecting user's motion preferences for accessibility. Respects the `prefers-reduced-motion` media query to support users who prefer reduced motion due to vestibular disorders or motion sensitivity.

### Features

- Detects prefers-reduced-motion system preference
- Server-side rendering safe (returns false during SSR)
- Automatic cleanup of event listeners
- TypeScript support with proper typing
- Helper functions for common animation scenarios

### Basic Usage

```tsx
import { useReducedMotion } from '@/design-system/hooks';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
      Content with conditional animation
    </div>
  );
}
```

### With Inline Styles

```tsx
import { useReducedMotion } from '@/design-system/hooks';

function TransitionComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div 
      style={{ 
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
        transform: prefersReducedMotion ? 'none' : 'translateY(0)'
      }}
    >
      Content with conditional transitions
    </div>
  );
}
```

### Helper Functions

The hook provides helper functions for common animation scenarios:

```tsx
import { 
  useReducedMotion,
  getAnimationDuration,
  getTransition,
  getAnimationClass,
} from '@/design-system/hooks';

function ComponentWithHelpers() {
  const prefersReducedMotion = useReducedMotion();
  
  // Get animation duration (0 if reduced motion preferred)
  const duration = getAnimationDuration(300, prefersReducedMotion);
  
  // Get transition CSS (none if reduced motion preferred)
  const transition = getTransition('all 0.3s ease', prefersReducedMotion);
  
  // Get animation class (empty if reduced motion preferred)
  const animClass = getAnimationClass('animate-bounce', prefersReducedMotion);
  
  return (
    <div 
      className={animClass}
      style={{ transition }}
    >
      Content with helper functions
    </div>
  );
}
```

### Real-World Example: Score Card Animation

```tsx
import { useReducedMotion, getTransition } from '@/design-system/hooks';

function ScoreCard({ score }: { score: number }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="score-card">
      <div 
        className="score-gauge"
        style={{
          // Animate gauge fill, but respect motion preferences
          transition: getTransition('transform 1s ease-out', prefersReducedMotion),
          transform: `rotate(${score * 1.8}deg)`,
        }}
      />
      <div 
        className={prefersReducedMotion ? '' : 'animate-fade-in'}
      >
        Score: {score}
      </div>
    </div>
  );
}
```

## Browser Compatibility

Both hooks use the `matchMedia` API which is supported in all modern browsers:

- Chrome 9+
- Firefox 6+
- Safari 5.1+
- Edge 12+
- iOS Safari 5+
- Android Browser 3+

The hooks include fallbacks for older browsers using `addListener`/`removeListener` methods.

## Accessibility Considerations

### useReducedMotion

The `useReducedMotion` hook is critical for accessibility compliance:

- **WCAG 2.1 Success Criterion 2.3.3** (Level AAA): Animation from Interactions
- **WCAG 2.1 Success Criterion 2.2.2** (Level A): Pause, Stop, Hide

Users may enable reduced motion for various reasons:
- Vestibular disorders (motion sickness, vertigo)
- Attention disorders (ADHD)
- Photosensitive epilepsy
- Personal preference

Always respect this preference by:
1. Disabling or reducing animations
2. Using instant transitions instead of animated ones
3. Removing parallax effects
4. Simplifying complex motion

### useMediaQuery

The `useMediaQuery` hook supports responsive design which is essential for:
- **WCAG 2.1 Success Criterion 1.4.10** (Level AA): Reflow
- Mobile accessibility (touch targets, readable text)
- Progressive disclosure (showing appropriate content for viewport)

## Requirements Validation

These hooks validate the following requirements from the spec:

- **Requirement 6.1**: Mobile-First Responsive Design - `useMediaQuery` enables responsive breakpoint detection
- **Requirement 15.5**: Motion Preference Respect - `useReducedMotion` ensures animations respect user preferences
- **Requirement 8.1**: Progressive Disclosure - Both hooks enable showing appropriate content based on context

## TypeScript Support

Both hooks are fully typed with TypeScript:

```typescript
// useMediaQuery returns boolean
const isMobile: boolean = useMediaQuery('(max-width: 768px)');

// useReducedMotion returns boolean
const prefersReducedMotion: boolean = useReducedMotion();

// Helper functions are also typed
const duration: number = getAnimationDuration(300, prefersReducedMotion);
const transition: string = getTransition('all 0.3s', prefersReducedMotion);
const className: string = getAnimationClass('animate-fade', prefersReducedMotion);
```

## Testing

These hooks can be tested using React Testing Library and Vitest:

```tsx
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useReducedMotion } from '@/design-system/hooks';

describe('useMediaQuery', () => {
  it('should return false for non-matching query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 1px)'));
    expect(result.current).toBe(false);
  });
});

describe('useReducedMotion', () => {
  it('should return false by default', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
```

## Performance Considerations

Both hooks are optimized for performance:

1. **Event Listener Cleanup**: Automatically removes event listeners on unmount
2. **SSR Safe**: Returns safe default values during server-side rendering
3. **Minimal Re-renders**: Only triggers re-renders when media query match changes
4. **Browser Compatibility**: Uses modern APIs with fallbacks for older browsers

## Future Enhancements

Potential future improvements:

1. Add debouncing for resize events (if needed)
2. Add support for custom breakpoint configurations
3. Add hook for detecting touch vs mouse input
4. Add hook for detecting network speed (slow 3G, 4G, etc.)
