# UI Components (shadcn/ui)

This directory contains all UI components from shadcn/ui used in the Soldent application.

## Installed Components

### Input Components
- **button.tsx** - Button with variants (default, destructive, outline, secondary, ghost, link)
- **input.tsx** - Text input with consistent styling
- **label.tsx** - Form label with Radix UI integration
- **textarea.tsx** - Multi-line text input
- **select.tsx** - Dropdown select with search
- **checkbox.tsx** - Checkbox with custom styling

### Form Components
- **form.tsx** - Complete form system with React Hook Form integration
- **calendar.tsx** - Date picker with react-day-picker

### Layout Components
- **card.tsx** - Card container with Header, Content, Footer, Title, Description
- **dialog.tsx** - Modal dialogs
- **tabs.tsx** - Tab navigation
- **table.tsx** - Data table with Header, Body, Footer
- **separator.tsx** - Visual separator

### Navigation Components
- **dropdown-menu.tsx** - Dropdown menu system
- **popover.tsx** - Popover for contextual content

### Feedback Components
- **toast.tsx** - Toast notifications with Radix UI
- **toaster.tsx** - Toast notification container
- **badge.tsx** - Status badges with variants
- **avatar.tsx** - User avatar with image and fallback
- **skeleton.tsx** - Loading skeleton

## Usage Examples

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click me</Button>
<Button variant="outline" size="lg">Large Outline</Button>
<Button variant="destructive">Delete</Button>
```

### Form
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const form = useForm({
  resolver: zodResolver(schema),
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} type="email" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
```

### Toast
```tsx
import { toast } from 'sonner'

toast.success('Operation successful')
toast.error('Something went wrong')
toast.info('Information', { description: 'Additional details' })
```

## Adding New Components

To add a new component from shadcn/ui:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert
```

## Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
