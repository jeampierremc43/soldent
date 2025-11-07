# Form Components

This directory contains reusable form components built with React Hook Form and Zod validation.

## Components to be implemented:

- **LoginForm**: User login form
- **RegisterForm**: User registration form
- **PatientForm**: Create/edit patient form
- **AppointmentForm**: Create/edit appointment form
- **MedicalRecordForm**: Medical record entry form
- **InvoiceForm**: Invoice creation form
- **PaymentForm**: Payment processing form
- **FollowUpForm**: Follow-up task form

## Features

All form components should include:
- React Hook Form integration
- Zod validation schemas
- Error handling and display
- Loading states
- Accessible form controls
- Submit handlers

## Usage

```tsx
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  return <LoginForm onSuccess={(data) => console.log(data)} />
}
```
