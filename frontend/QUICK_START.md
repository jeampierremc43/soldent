# Quick Start Guide - Soldent Frontend

## Inicio Rápido en 5 Pasos

### 1. Instalar Dependencias
```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Soldent
```

### 3. Instalar Componentes UI Básicos
```bash
npx shadcn-ui@latest add button input label form card dialog table
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

### 5. Abrir en el Navegador
```
http://localhost:3000
```

## Verificar Backend

Asegúrate de que el backend esté corriendo:
```bash
cd ../backend
npm run dev
```

Backend debe estar en: http://localhost:4000

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Estructura de Importaciones

```typescript
// Componentes UI
import { Button } from '@/components/ui/button'

// API
import { apiClient } from '@/lib/api'
import { authApi } from '@/lib/api/auth.api'

// Tipos
import type { User, Patient } from '@/types'

// Utilidades
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency } from '@/lib/utils'

// Store
import { useAuthStore } from '@/store'

// Constantes
import { ROUTES, API_ENDPOINTS } from '@/constants'
```

## Primeros Pasos de Desarrollo

### 1. Instalar Más Componentes shadcn/ui
```bash
npx shadcn-ui@latest add select checkbox calendar dropdown-menu avatar badge separator tabs
```

### 2. Crear LoginForm
```typescript
// src/components/forms/LoginForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations'
// ... implementación
```

### 3. Crear Sidebar Layout
```typescript
// src/components/layouts/Sidebar.tsx
import Link from 'next/link'
import { ROUTES } from '@/constants'
// ... implementación
```

### 4. Integrar con API
```typescript
// Ejemplo de llamada API
import { authApi } from '@/lib/api'

const handleLogin = async (data) => {
  try {
    const response = await authApi.login(data)
    console.log(response)
  } catch (error) {
    console.error(error)
  }
}
```

## Rutas Disponibles

- `/` - Landing page
- `/login` - Iniciar sesión
- `/register` - Registro
- `/dashboard` - Dashboard principal
- `/dashboard/patients` - Pacientes
- `/dashboard/appointments` - Citas
- `/dashboard/medical` - Registros médicos
- `/dashboard/accounting` - Contabilidad
- `/dashboard/followups` - Seguimientos

## Archivos Importantes

### Configuración
- `package.json` - Dependencias
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config
- `next.config.js` - Next.js config

### Core
- `src/types/index.ts` - Todos los tipos
- `src/constants/index.ts` - Constantes
- `src/lib/api/client.ts` - API client
- `src/lib/utils.ts` - Utilidades
- `src/store/auth.store.ts` - Auth state

### Estilos
- `src/app/globals.css` - Estilos globales

## Troubleshooting

### Error: Module not found
```bash
npm install
```

### Error de tipos TypeScript
```bash
npm run type-check
```

### Puerto 3000 en uso
```bash
# Cambiar puerto
PORT=3001 npm run dev
```

### Backend no responde
Verificar que el backend esté corriendo en http://localhost:4000

## Próximos Pasos

1. ✅ Instalación completada
2. ⏳ Implementar LoginForm
3. ⏳ Implementar Sidebar y Header
4. ⏳ Conectar con backend API
5. ⏳ Desarrollar módulos principales

## Recursos

- [Documentación Completa](./README.md)
- [Estructura del Proyecto](./PROJECT_STRUCTURE.md)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Next.js 14 Docs](https://nextjs.org/docs)

---

¿Problemas? Revisa la documentación completa en `README.md`
