# shadcn/ui Components - Installation Guide

## Componentes Necesarios para Soldent

Esta es la lista completa de componentes de shadcn/ui que se necesitarán para el proyecto.

## Instalación Rápida (Todos los Componentes)

```bash
# Core UI Components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch

# Form Components
npx shadcn-ui@latest add form

# Layout & Navigation
npx shadcn-ui@latest add card
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add navigation-menu

# Data Display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar

# Feedback
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton

# Overlays
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add sheet

# Date & Time
npx shadcn-ui@latest add calendar

# Advanced
npx shadcn-ui@latest add command
npx shadcn-ui@latest add context-menu
npx shadcn-ui@latest add menubar
npx shadcn-ui@latest add scroll-area
```

## Instalación por Módulo

### 1. Autenticación (Prioridad Alta)
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
```

**Uso**: LoginForm, RegisterForm

### 2. Dashboard Layout (Prioridad Alta)
```bash
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
```

**Uso**: Sidebar, Header, UserMenu

### 3. Gestión de Pacientes (Prioridad Alta)
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add calendar
```

**Uso**: PatientList, PatientForm, PatientDetails

### 4. Citas (Prioridad Alta)
```bash
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add popover
```

**Uso**: AppointmentCalendar, AppointmentForm

### 5. Registros Médicos (Prioridad Media)
```bash
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
```

**Uso**: MedicalRecordForm, MedicalHistory

### 6. Contabilidad (Prioridad Media)
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
```

**Uso**: InvoiceList, InvoiceForm, PaymentForm

### 7. Seguimientos (Prioridad Media)
```bash
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
```

**Uso**: FollowUpList, FollowUpForm

### 8. UI General (Prioridad Baja)
```bash
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add command
```

**Uso**: Notificaciones, Loading states, Search

## Componentes por Prioridad

### Fase 1: Básicos (Instalar Primero)
1. button
2. input
3. label
4. form
5. card
6. dialog
7. select
8. table

### Fase 2: Layout y Navegación
9. separator
10. avatar
11. dropdown-menu
12. sheet
13. tooltip
14. tabs

### Fase 3: Formularios Avanzados
15. textarea
16. checkbox
17. radio-group
18. switch
19. calendar
20. popover

### Fase 4: Feedback y Display
21. badge
22. alert
23. alert-dialog
24. toast
25. progress
26. skeleton

### Fase 5: Avanzados
27. accordion
28. navigation-menu
29. command
30. context-menu
31. menubar
32. scroll-area

## Script de Instalación Completo

Crea un archivo `install-shadcn.sh`:

```bash
#!/bin/bash

echo "Installing shadcn/ui components..."

# Fase 1: Básicos
echo "Phase 1: Basic components..."
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table

# Fase 2: Layout
echo "Phase 2: Layout components..."
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add tabs

# Fase 3: Formularios
echo "Phase 3: Form components..."
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# Fase 4: Feedback
echo "Phase 4: Feedback components..."
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton

# Fase 5: Avanzados
echo "Phase 5: Advanced components..."
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add command
npx shadcn-ui@latest add context-menu
npx shadcn-ui@latest add menubar
npx shadcn-ui@latest add scroll-area

echo "All components installed!"
```

Para Windows PowerShell, crea `install-shadcn.ps1`:

```powershell
Write-Host "Installing shadcn/ui components..."

# Fase 1: Básicos
Write-Host "Phase 1: Basic components..."
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table

# Fase 2: Layout
Write-Host "Phase 2: Layout components..."
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add tabs

# Fase 3: Formularios
Write-Host "Phase 3: Form components..."
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# Fase 4: Feedback
Write-Host "Phase 4: Feedback components..."
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton

# Fase 5: Avanzados
Write-Host "Phase 5: Advanced components..."
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add command
npx shadcn-ui@latest add context-menu
npx shadcn-ui@latest add menubar
npx shadcn-ui@latest add scroll-area

Write-Host "All components installed!"
```

## Uso después de la Instalación

Una vez instalados, importar así:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
// etc...
```

## Personalización

Los componentes se instalan en `src/components/ui/` y pueden ser personalizados:

1. Modificar estilos en cada componente
2. Ajustar variantes en el código del componente
3. Extender funcionalidad según necesidades

## Documentación

Para cada componente, consultar:
https://ui.shadcn.com/docs/components/[component-name]

Ejemplo:
- Button: https://ui.shadcn.com/docs/components/button
- Form: https://ui.shadcn.com/docs/components/form
- Table: https://ui.shadcn.com/docs/components/table

## Notas

- Los componentes se instalan como código fuente, no como dependencia npm
- Puedes modificarlos libremente según tus necesidades
- Todos usan Radix UI primitives por debajo
- Completamente tipados con TypeScript
- Estilizados con Tailwind CSS

---

**Total de componentes**: ~32
**Tiempo estimado de instalación**: 10-15 minutos
