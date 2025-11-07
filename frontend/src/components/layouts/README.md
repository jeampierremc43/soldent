# Layout Components

This directory contains layout components for the application.

## Components to be implemented:

- **Sidebar**: Main navigation sidebar for dashboard
- **Header**: Top header bar with user menu and notifications
- **DashboardLayout**: Main layout wrapper for dashboard pages
- **AuthLayout**: Layout wrapper for authentication pages
- **Footer**: Footer component (if needed)

## Usage

Layout components will wrap page content:

```tsx
import { DashboardLayout } from '@/components/layouts/DashboardLayout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Page content */}
    </DashboardLayout>
  )
}
```
