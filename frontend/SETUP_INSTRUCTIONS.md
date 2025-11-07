# Instrucciones de Configuración - Frontend Soldent

## Componentes shadcn/ui y Sistema de Autenticación

Este documento describe la implementación completa de los componentes base de shadcn/ui y el sistema de autenticación.

## Instalación de Dependencias

Después de la implementación, ejecuta el siguiente comando para instalar las nuevas dependencias:

```bash
cd frontend
npm install
```

Esto instalará:
- `react-day-picker@^8.10.1` - Selector de fechas para el componente Calendar

## Componentes Implementados

### 1. Componentes UI Base (shadcn/ui)

Todos los componentes están en `frontend/src/components/ui/`:

#### Componentes de Entrada
- **button.tsx** - Botones con variantes (default, destructive, outline, secondary, ghost, link)
- **input.tsx** - Input de texto con estilos consistentes
- **label.tsx** - Labels para formularios con integración Radix UI
- **textarea.tsx** - Área de texto para inputs largos
- **select.tsx** - Selector dropdown con búsqueda
- **checkbox.tsx** - Checkbox con estilos personalizados

#### Componentes de Formulario
- **form.tsx** - Sistema completo de formularios con React Hook Form
- **calendar.tsx** - Selector de fechas con react-day-picker

#### Componentes de Layout
- **card.tsx** - Tarjetas con Header, Content, Footer, Title, Description
- **dialog.tsx** - Modales y diálogos
- **tabs.tsx** - Pestañas para navegación
- **table.tsx** - Tablas con Header, Body, Footer, Row, Cell

#### Componentes de Navegación
- **dropdown-menu.tsx** - Menú desplegable completo
- **separator.tsx** - Separador visual
- **popover.tsx** - Popover para contenido contextual

#### Componentes de Feedback
- **toast.tsx** - Notificaciones toast con Radix UI
- **toaster.tsx** - Contenedor para las notificaciones
- **badge.tsx** - Badges con variantes (default, secondary, destructive, outline, success, warning, info)
- **avatar.tsx** - Avatar de usuario con imagen y fallback
- **skeleton.tsx** - Loading skeleton para carga de contenido

### 2. Hooks Personalizados

Ubicados en `frontend/src/hooks/`:

#### **useAuth.ts**
Hook principal para autenticación con las siguientes funciones:
- `login(credentials)` - Iniciar sesión
- `register(data)` - Registrar nuevo usuario
- `logout()` - Cerrar sesión
- `checkAuth()` - Verificar estado de autenticación
- Estados: `user`, `isAuthenticated`, `isLoading`, `error`

#### **useToast.ts**
Hook para notificaciones toast:
- `toast({ title, description, variant })` - Mostrar notificación
- `dismiss(id)` - Cerrar notificación
- Integración con Radix UI Toast

### 3. Páginas de Autenticación

#### **Login Page** (`frontend/src/app/(auth)/login/page.tsx`)
Características:
- Formulario con React Hook Form + Zod validation
- Campos: email, password
- Validación en tiempo real
- Toggle para mostrar/ocultar contraseña
- Loading states durante el login
- Link a página de registro
- Manejo de errores con toast notifications
- Diseño responsive con Card de shadcn/ui

#### **Register Page** (`frontend/src/app/(auth)/register/page.tsx`)
Características:
- Formulario completo de registro
- Campos: firstName, lastName, email, phone (opcional), password, confirmPassword
- Validaciones:
  - Email único y formato válido
  - Password mínimo 8 caracteres
  - Password debe incluir mayúscula, minúscula y número
  - Confirmación de password
  - Teléfono con formato válido (opcional)
- Toggle para mostrar/ocultar contraseñas
- Loading states durante el registro
- Link a página de login
- Grid responsive de 2 columnas en desktop
- Manejo de errores con toast notifications

### 4. Layouts

#### **Auth Layout** (`frontend/src/app/(auth)/layout.tsx`)
- Layout centrado para páginas de autenticación
- Fondo con gradiente médico (azul/verde)
- Sin header/footer para experiencia enfocada

#### **Root Layout** (`frontend/src/app/layout.tsx`)
Actualizado con:
- Integración de Sonner para notificaciones
- Integración de Radix UI Toaster
- Configuración de idioma español
- Metadata mejorada con keywords
- suppressHydrationWarning para temas

## Características Implementadas

### Validación de Formularios
- **Zod schemas** para validación type-safe
- Validación en tiempo real con React Hook Form
- Mensajes de error personalizados en español
- Validaciones específicas:
  - Email con regex
  - Password con requisitos de seguridad
  - Teléfono con formato internacional

### Manejo de Estados
- Loading states en botones
- Disabled states durante operaciones async
- Estados de error con mensajes descriptivos
- Feedback visual inmediato

### Experiencia de Usuario
- Animaciones suaves en transiciones
- Toast notifications con Sonner
- Icons de Lucide React en campos de formulario
- Responsive design mobile-first
- Accesibilidad (aria-labels, roles, autocomplete)

### Seguridad
- Passwords ocultos por defecto
- Toggle para visualizar password
- Validación de fuerza de contraseña
- Autocomplete hints apropiados

## Tema y Estilos

### Colores Médicos
El tema utiliza colores específicos para el contexto médico:
- **Primary**: Azul médico (#2563eb)
- **Success**: Verde médico (#22c55e)
- **Warning**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)
- **Info**: Azul (#3b82f6)

### Variables CSS Personalizadas
Definidas en `globals.css`:
- Medical blue scale (50-900)
- Medical green scale (50-900)
- Colores semánticos (success, warning, error, info)

## Integración con Backend

Los formularios están preparados para integrarse con el backend:

### Login Request
```typescript
POST /api/auth/login
{
  "email": "string",
  "password": "string"
}
```

### Register Request
```typescript
POST /api/auth/register
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string?" // opcional
}
```

### Auth Response
```typescript
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "admin" | "doctor" | "receptionist" | "assistant"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

## Próximos Pasos

1. **Instalar dependencias**: `npm install`
2. **Iniciar servidor de desarrollo**: `npm run dev`
3. **Verificar rutas**:
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register
4. **Configurar variables de entorno** en `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_APP_NAME=Soldent
   ```

## Testing

Para probar la funcionalidad:

1. Navega a `/register`
2. Completa el formulario con datos válidos
3. Verifica que las validaciones funcionen en tiempo real
4. Intenta enviar el formulario y verifica la notificación toast
5. Haz clic en "Inicia sesión aquí" para ir al login
6. Prueba el login con las mismas credenciales

## Estructura de Archivos

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── register/
│   │       └── page.tsx        # Register page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── form.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── tabs.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       ├── calendar.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── badge.tsx
│       └── avatar.tsx
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── useToast.ts             # Toast hook
│   └── index.ts                # Exports
├── lib/
│   ├── api/
│   │   └── auth.api.ts         # Auth API calls
│   ├── validations/
│   │   └── auth.schema.ts      # Zod schemas
│   └── utils.ts                # Utilities
├── store/
│   └── auth.store.ts           # Zustand auth store
└── types/
    └── index.ts                # TypeScript types
```

## Notas Técnicas

- Todos los componentes client-side usan `'use client'` directive
- TypeScript strict mode habilitado
- ESLint configurado con reglas de Next.js
- Tailwind CSS con plugin de animaciones
- Componentes optimizados con React.forwardRef
- Memoización donde es necesario

## Soporte

Para problemas o preguntas:
1. Verificar errores en la consola del navegador
2. Revisar errores de compilación en la terminal
3. Verificar que todas las dependencias estén instaladas
4. Confirmar que el backend esté corriendo en el puerto correcto
