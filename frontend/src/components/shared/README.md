# Shared Components

This directory contains shared/common components used across the application.

## Components to be implemented:

- **LoadingSpinner**: Loading indicator
- **EmptyState**: Empty state placeholder
- **ErrorBoundary**: Error boundary wrapper
- **ConfirmDialog**: Confirmation dialog
- **DataTable**: Reusable data table with sorting/filtering
- **StatusBadge**: Status indicator badge
- **Avatar**: User avatar component
- **SearchInput**: Search input with debounce
- **DatePicker**: Date picker component
- **FileUpload**: File upload component
- **Pagination**: Pagination controls
- **Breadcrumb**: Breadcrumb navigation

## Usage

Import and use shared components throughout the app:

```tsx
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export default function MyComponent() {
  if (isLoading) return <LoadingSpinner />
  if (!data.length) return <EmptyState message="No data found" />

  return <div>{/* content */}</div>
}
```
