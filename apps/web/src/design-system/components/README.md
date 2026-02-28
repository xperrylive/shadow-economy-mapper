# Design System Components

Core UI primitives for the Shadow Economy Mapper platform, designed for mobile-first accessibility and financial inclusion context.

## Button Component

A versatile button component with multiple variants, sizes, and states. All buttons meet WCAG 2.1 Level AA accessibility standards and minimum 44x44px touch targets for mobile devices.

### Features

- **5 Variants**: primary, secondary, outline, ghost, danger
- **3 Sizes**: sm (44px min), md (44px min), lg (48px min)
- **Loading State**: Shows spinner and disables interaction
- **Disabled State**: Visual feedback and prevents interaction
- **Icon Support**: Icons on left or right side
- **Full Width**: Optional full-width layout
- **Keyboard Accessible**: Focus rings and proper ARIA attributes

### Usage

```tsx
import { Button } from '@/design-system/components';

// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="primary">Primary Action</Button>
<Button variant="danger">Delete</Button>

// With size
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading>Processing...</Button>

// With icon
<Button icon={<SearchIcon />}>Search</Button>
<Button icon={<ArrowRightIcon />} iconPosition="right">Next</Button>

// Full width
<Button fullWidth>Submit Form</Button>

// Disabled
<Button disabled>Unavailable</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size (all meet 44px minimum) |
| `loading` | `boolean` | `false` | Shows spinner and disables button |
| `disabled` | `boolean` | `false` | Disables button interaction |
| `icon` | `React.ReactNode` | - | Icon element to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of icon relative to text |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `children` | `React.ReactNode` | - | Button content (required) |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

### Variants

- **Primary**: Blue background, white text - Use for main actions (submit, save, continue)
- **Secondary**: Gray background, dark text - Use for secondary actions (cancel, back)
- **Outline**: Border only, transparent background - Use for alternative actions
- **Ghost**: No border, transparent background - Use for tertiary actions (links, subtle actions)
- **Danger**: Red background, white text - Use for destructive actions (delete, remove)

### Accessibility

- All buttons meet minimum 44x44px touch target for mobile accessibility (Requirement 6.2)
- Semantic colors follow design system (Requirement 18.1-18.4)
- Focus rings for keyboard navigation
- ARIA attributes for screen readers (`aria-busy`, `aria-disabled`)
- Proper button role and type attributes

### Requirements Covered

- **6.2**: Mobile touch targets (minimum 44x44px)
- **8.5**: Consistent interaction patterns
- **18.1**: Blue for primary actions (trust/stability)
- **18.2**: Red for danger actions (critical issues)
- **18.3**: Neutral colors for secondary actions
- **18.4**: Semantic color consistency

### Examples

See `Button.examples.tsx` for comprehensive usage examples including:
- All variants and sizes
- Loading and disabled states
- Icons and full-width layouts
- Real-world use cases (upload, share, delete)

### Testing

Unit tests are available in `Button.test.tsx` covering:
- Rendering all variants and sizes
- Loading and disabled states
- Icon positioning
- Click interactions
- Accessibility features
- Touch target requirements
- Semantic color consistency


## Input Component

A comprehensive input component with label, validation, icons, and auto-formatting. Designed for forms with real-time validation feedback and Malaysian locale support.

### Features

- **Clear Label**: Label displayed above input
- **Helper Text**: Optional helper text below input
- **Error State**: Error messages with icon
- **Icon Support**: Optional icon on left side
- **Auto-formatting**: Currency (RM), dates (DD/MM/YYYY), phone numbers
- **Real-time Validation**: Immediate feedback on input
- **3 Sizes**: sm (44px min), md (44px min), lg (48px min)
- **Full Width**: Optional full-width layout
- **Keyboard Accessible**: Proper ARIA attributes and associations

### Usage

```tsx
import { Input } from '@/design-system/components';

// Basic usage
<Input
  label="Email"
  value={email}
  onChange={setEmail}
/>

// With helper text
<Input
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  helperText="Must be at least 8 characters"
/>

// With error
<Input
  label="Amount"
  value={amount}
  onChange={setAmount}
  error="Amount must be greater than RM 0.00"
/>

// With auto-formatting
<Input
  label="Amount"
  value={amount}
  onChange={setAmount}
  autoFormat="currency"
  placeholder="RM 0.00"
/>

<Input
  label="Date"
  value={date}
  onChange={setDate}
  autoFormat="date"
  placeholder="DD/MM/YYYY"
/>

// With icon
<Input
  label="Search"
  value={search}
  onChange={setSearch}
  icon={<SearchIcon />}
/>

// Required field
<Input
  label="Name"
  value={name}
  onChange={setName}
  required
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text (required) |
| `value` | `string` | - | Input value (required) |
| `onChange` | `(value: string) => void` | - | Change handler (required) |
| `helperText` | `string` | - | Helper text below input |
| `error` | `string` | - | Error message (takes precedence over helperText) |
| `icon` | `React.ReactNode` | - | Icon element on left side |
| `autoFormat` | `'currency' \| 'date' \| 'phone'` | - | Auto-formatting type |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `fullWidth` | `boolean` | `false` | Makes input full width |
| `required` | `boolean` | `false` | Shows required indicator |
| `disabled` | `boolean` | `false` | Disables input |
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | - | Placeholder text |

### Auto-formatting

- **Currency**: Formats as RM with thousands separator (e.g., "RM 1,234.56")
- **Date**: Formats as DD/MM/YYYY (Malaysian format)
- **Phone**: Formats as Malaysian phone number (e.g., "012-345 6789")

### Accessibility

- All inputs meet minimum 44px height for touch accessibility
- Label properly associated with input via `htmlFor` and `id`
- Helper text and error messages associated via `aria-describedby`
- Error state indicated with `aria-invalid`
- Error messages have `role="alert"` for screen reader announcements
- Required fields indicated visually and with `aria-label`

### Requirements Covered

- **11.1**: Clear labels and placeholder examples
- **11.2**: Real-time validation with helpful error messages
- **11.4**: Auto-formatting for currency and dates
- **1.5**: Malaysian locale formatting conventions
- **7.2**: Currency formatting (RM symbol)
- **7.3**: Date formatting (DD/MM/YYYY)

### Examples

See `Input.examples.tsx` for comprehensive usage examples.

### Testing

Unit tests are available in `Input.test.tsx` covering:
- Basic rendering and interaction
- Error states and validation
- Auto-formatting for currency, date, and phone
- Accessibility features
- Size variants

## Card Component

A versatile container component with configurable padding, shadow, and border. Used as a standard container throughout the application for grouping related content.

### Features

- **White Background**: Clean, professional appearance
- **Rounded Corners**: 16px border radius (lg)
- **Configurable Padding**: sm (12px), md (16px), lg (24px)
- **Configurable Shadow**: sm, base, md, lg
- **Optional Border**: Subtle neutral border
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Custom Styling**: Accepts custom className for additional styling

### Usage

```tsx
import { Card } from '@/design-system/components';

// Basic usage (default: md padding, base shadow, no border)
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// With custom padding
<Card padding="lg">
  <h3>Large Padding Card</h3>
  <p>More spacious content</p>
</Card>

// With custom shadow
<Card shadow="lg">
  <h3>Prominent Card</h3>
  <p>Stands out with large shadow</p>
</Card>

// With border
<Card border>
  <h3>Bordered Card</h3>
  <p>Defined edges with subtle border</p>
</Card>

// Combined configuration
<Card padding="lg" shadow="md" border>
  <h3>Custom Card</h3>
  <p>Multiple options combined</p>
</Card>

// With custom styling
<Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
  <h3>Custom Background</h3>
  <p>Override default white background</p>
</Card>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding size (sm=12px, md=16px, lg=24px) |
| `shadow` | `'sm' \| 'base' \| 'md' \| 'lg'` | `'base'` | Shadow size for elevation |
| `border` | `boolean` | `false` | Whether to show a border |
| `children` | `React.ReactNode` | - | Card content (required) |
| `className` | `string` | - | Additional CSS classes |

### Padding Sizes

- **sm (12px)**: Compact cards for dense layouts
- **md (16px)**: Default padding for most use cases
- **lg (24px)**: Spacious cards for important content

### Shadow Sizes

- **sm**: Subtle shadow for minimal elevation
- **base**: Standard shadow for most cards (default)
- **md**: More prominent elevation
- **lg**: Maximum elevation for emphasis

### Common Use Cases

**Score Card**
```tsx
<Card padding="lg" shadow="md">
  <div className="text-center">
    <div className="text-5xl font-bold text-success-600">85</div>
    <div className="text-lg font-semibold">Strong</div>
  </div>
</Card>
```

**Evidence Item**
```tsx
<Card padding="md" shadow="sm" border>
  <div className="flex items-start gap-3">
    <div className="text-2xl">📄</div>
    <div>
      <h4 className="font-semibold">WhatsApp Chat Export</h4>
      <p className="text-sm text-neutral-600">Uploaded on 25/12/2024</p>
    </div>
  </div>
</Card>
```

**Form Container**
```tsx
<Card padding="lg" shadow="md">
  <h4 className="text-xl font-semibold mb-4">Manual Entry</h4>
  <form>
    {/* Form fields */}
  </form>
</Card>
```

**Empty State**
```tsx
<Card padding="lg" shadow="sm">
  <div className="text-center py-8">
    <div className="text-6xl mb-4">📭</div>
    <h4 className="text-lg font-semibold">No evidence uploaded yet</h4>
    <p className="text-sm text-neutral-600 mb-4">
      Upload WhatsApp chats, bank statements, or platform CSVs
    </p>
  </div>
</Card>
```

### Accessibility

- Semantic HTML (`<div>` element)
- Accepts all standard HTML div attributes
- Can be enhanced with ARIA attributes as needed (role, aria-label, etc.)
- Proper visual hierarchy through spacing and shadows

### Requirements Covered

- **17.1**: Consistent spacing scale based on Tailwind CSS
- **17.2**: Grouped related information with appropriate visual proximity
- **17.4**: Consistent padding and margins across UI components

### Examples

See `Card.examples.tsx` for comprehensive usage examples including:
- All padding and shadow variants
- Border option
- Combined configurations
- Real-world use cases (score card, evidence item, form, empty state)
- Custom styling examples
- List of cards

### Testing

Unit tests are available in `Card.test.tsx` covering:
- Basic rendering
- Padding variants (sm, md, lg)
- Shadow variants (sm, base, md, lg)
- Border option
- Custom className
- Combined props
- Ref forwarding
- Edge cases

---

## Design System Principles

All components in this design system follow these principles:

1. **Mobile-First**: Optimized for mobile devices with minimum 44x44px touch targets
2. **Accessibility**: WCAG 2.1 Level AA compliant with proper ARIA attributes
3. **Semantic Colors**: Consistent color usage (blue=primary, green=success, red=danger, amber=warning)
4. **Malaysian Locale**: Currency (RM), dates (DD/MM/YYYY), and phone formatting
5. **Consistent Spacing**: Based on Tailwind CSS spacing scale
6. **Keyboard Navigation**: Full keyboard accessibility with focus indicators
7. **Screen Reader Support**: Proper labels and announcements
8. **Responsive Design**: Works seamlessly across all screen sizes

## Getting Started

```tsx
// Import components
import { Button, Input, Card } from '@/design-system/components';

// Use in your application
function MyComponent() {
  const [amount, setAmount] = useState('');
  
  return (
    <Card padding="lg" shadow="md">
      <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
      <Input
        label="Amount"
        value={amount}
        onChange={setAmount}
        autoFormat="currency"
        placeholder="RM 0.00"
      />
      <Button variant="primary" fullWidth className="mt-4">
        Submit
      </Button>
    </Card>
  );
}
```

## Contributing

When adding new components:

1. Follow the existing component structure
2. Include comprehensive TypeScript types
3. Add JSDoc comments for documentation
4. Create unit tests with good coverage
5. Create examples file demonstrating all variants
6. Update this README with component documentation
7. Ensure WCAG 2.1 Level AA compliance
8. Test on mobile devices
9. Verify keyboard navigation
10. Test with screen readers
