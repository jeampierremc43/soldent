# Estructura del Proyecto Frontend - Soldent

## Resumen

Proyecto frontend completo configurado con Next.js 14, TypeScript, Tailwind CSS y shadcn/ui.

## Estructura de Archivos

```
frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Página de inicio de sesión
│   │   │   └── register/
│   │   │       └── page.tsx             # Página de registro
│   │   ├── (dashboard)/                  # Grupo de rutas protegidas
│   │   │   ├── layout.tsx               # Layout del dashboard
│   │   │   ├── page.tsx                 # Dashboard principal
│   │   │   ├── patients/
│   │   │   │   └── page.tsx             # Gestión de pacientes
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx             # Gestión de citas
│   │   │   ├── medical/
│   │   │   │   └── page.tsx             # Registros médicos
│   │   │   ├── accounting/
│   │   │   │   └── page.tsx             # Contabilidad
│   │   │   └── followups/
│   │   │       └── page.tsx             # Seguimientos
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   └── globals.css                   # Estilos globales
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   │   └── README.md
│   │   ├── layouts/                      # Layouts (Sidebar, Header)
│   │   │   └── README.md
│   │   ├── forms/                        # Form components
│   │   │   └── README.md
│   │   └── shared/                       # Shared components
│   │       └── README.md
│   ├── lib/
│   │   ├── api/                          # API client y funciones
│   │   │   ├── client.ts                # Axios client configurado
│   │   │   ├── auth.api.ts              # Auth API functions
│   │   │   └── index.ts                 # Exports
│   │   ├── auth/                         # Auth utilities
│   │   │   ├── auth.utils.ts            # Auth helper functions
│   │   │   └── index.ts                 # Exports
│   │   ├── utils.ts                      # Utility functions (cn, etc.)
│   │   └── validations/                  # Zod schemas
│   │       ├── auth.schema.ts           # Auth validation schemas
│   │       └── index.ts                 # Exports
│   ├── hooks/                            # Custom hooks
│   │   └── index.ts                      # Hook exports
│   ├── store/                            # Zustand stores
│   │   ├── auth.store.ts                # Auth state management
│   │   └── index.ts                     # Store exports
│   ├── types/                            # TypeScript types
│   │   └── index.ts                     # All type definitions
│   └── constants/                        # Constants
│       └── index.ts                      # App constants
├── public/                               # Static files
├── .env.example                          # Environment variables example
├── .eslintrc.json                        # ESLint configuration
├── .gitignore                            # Git ignore rules
├── components.json                       # shadcn/ui configuration
├── next.config.js                        # Next.js configuration
├── package.json                          # Dependencies
├── postcss.config.js                     # PostCSS configuration
├── tailwind.config.ts                    # Tailwind configuration
├── tsconfig.json                         # TypeScript configuration
├── PROJECT_STRUCTURE.md                  # This file
└── README.md                             # Project documentation
```

## Configuración Completada

### 1. Package.json
- Next.js 14.2.5
- React 18.3.1
- TypeScript 5.5.4
- Tailwind CSS 3.4.7
- shadcn/ui (Radix UI components)
- React Hook Form + Zod
- Zustand (state management)
- Axios (HTTP client)
- Lucide React (icons)
- Recharts (charts)
- Sonner (notifications)

### 2. TypeScript Configuration
- Modo estricto habilitado
- Path aliases (@/*)
- Configuración optimizada para Next.js 14 App Router
- Type checking estricto

### 3. Tailwind CSS
- Configuración personalizada para shadcn/ui
- Tema médico con colores azules y verdes
- Dark mode support
- Animaciones y utilidades custom
- Estilos para tablas, badges, cards médicos

### 4. Next.js Configuration
- API proxy al backend (http://localhost:4000)
- Image optimization configurado
- Security headers
- Environment variables setup

### 5. shadcn/ui
- Configuración base completada (components.json)
- Listo para instalar componentes con CLI
- CSS variables habilitadas
- Base color: slate

## Archivos Implementados

### Core Configuration
- ✅ package.json
- ✅ tsconfig.json
- ✅ next.config.js
- ✅ tailwind.config.ts
- ✅ postcss.config.js
- ✅ components.json
- ✅ .eslintrc.json
- ✅ .gitignore
- ✅ .env.example

### Application Files
- ✅ globals.css (estilos completos)
- ✅ lib/utils.ts (utilidades)
- ✅ types/index.ts (todos los tipos)
- ✅ constants/index.ts (constantes de app)
- ✅ lib/api/client.ts (Axios client)
- ✅ lib/api/auth.api.ts (Auth API)
- ✅ lib/auth/auth.utils.ts (Auth helpers)
- ✅ lib/validations/auth.schema.ts (Zod schemas)
- ✅ store/auth.store.ts (Zustand auth store)

### Page Files
- ✅ app/layout.tsx (root layout)
- ✅ app/page.tsx (landing page)
- ✅ app/(auth)/login/page.tsx
- ✅ app/(auth)/register/page.tsx
- ✅ app/(dashboard)/layout.tsx
- ✅ app/(dashboard)/page.tsx
- ✅ app/(dashboard)/patients/page.tsx
- ✅ app/(dashboard)/appointments/page.tsx
- ✅ app/(dashboard)/medical/page.tsx
- ✅ app/(dashboard)/accounting/page.tsx
- ✅ app/(dashboard)/followups/page.tsx

### Documentation
- ✅ README.md (completo)
- ✅ PROJECT_STRUCTURE.md (este archivo)
- ✅ Component READMEs en cada carpeta

## Próximos Pasos

### 1. Instalar Dependencias
```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

### 3. Instalar Componentes shadcn/ui Básicos
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add calendar
```

### 4. Implementar Componentes Principales
- [ ] Sidebar component
- [ ] Header component
- [ ] LoginForm component
- [ ] RegisterForm component
- [ ] DataTable component
- [ ] LoadingSpinner component
- [ ] ErrorBoundary component

### 5. Desarrollar Módulos
- [ ] Sistema de autenticación completo
- [ ] Módulo de pacientes
- [ ] Módulo de citas
- [ ] Módulo de registros médicos
- [ ] Módulo de contabilidad
- [ ] Módulo de seguimientos

### 6. Integración con Backend
- [ ] Conectar API endpoints
- [ ] Implementar autenticación JWT
- [ ] Manejo de errores
- [ ] Loading states

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Notas Importantes

1. **Server Components por Defecto**: Todos los componentes son Server Components por defecto. Solo usa 'use client' cuando sea necesario.

2. **Path Aliases**: Usa `@/` para importar desde `src/`:
   ```typescript
   import { Button } from '@/components/ui/button'
   import { apiClient } from '@/lib/api'
   import type { User } from '@/types'
   ```

3. **Validación de Formularios**: Usa React Hook Form + Zod para todos los formularios.

4. **Estado Global**: Usa Zustand para estado global de la aplicación.

5. **Estilos**: Preferir Tailwind CSS classes sobre CSS custom.

6. **TypeScript**: Modo estricto habilitado. Evitar `any`.

## Convenciones de Código

- Componentes en PascalCase
- Archivos de componentes: `ComponentName.tsx`
- Hooks personalizados: `useHookName.ts`
- Utilidades: `utilityName.ts`
- Tipos: `TypeName` (interfaces/types)
- Constantes: `CONSTANT_NAME`

## Stack Tecnológico Resumido

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.2.5 | Framework React |
| React | 18.3.1 | UI Library |
| TypeScript | 5.5.4 | Type Safety |
| Tailwind CSS | 3.4.7 | Styling |
| shadcn/ui | Latest | UI Components |
| Zustand | 4.5.4 | State Management |
| React Hook Form | 7.52.1 | Forms |
| Zod | 3.23.8 | Validation |
| Axios | 1.7.2 | HTTP Client |
| Lucide React | Latest | Icons |
| Recharts | 2.12.7 | Charts |
| Sonner | 1.5.0 | Notifications |

## Estado del Proyecto

✅ Configuración inicial completada
✅ Estructura de carpetas creada
✅ Archivos de configuración listos
✅ Tipos TypeScript definidos
✅ API client configurado
✅ Auth utilities implementadas
✅ Store de autenticación creado
✅ Páginas base creadas
✅ Estilos globales configurados

🔄 Pendiente:
- Implementación de componentes UI
- Desarrollo de formularios
- Integración completa con backend
- Testing
- Documentación adicional
