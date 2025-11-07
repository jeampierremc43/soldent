# Instalación y Configuración de Componentes

## Paso 1: Instalar Dependencias

Ejecuta el siguiente comando en el directorio `frontend/`:

```bash
npm install
```

Esto instalará:
- `react-day-picker@^8.10.1` - Para el componente Calendar

## Paso 2: Verificar Configuración

### package.json
Verifica que las siguientes dependencias estén en tu `package.json`:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-tooltip": "^1.1.2",
    "axios": "^1.7.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.424.0",
    "react-day-picker": "^8.10.1",
    "react-hook-form": "^7.52.1",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8",
    "zustand": "^4.5.4"
  }
}
```

### tailwind.config.ts
Tu configuración de Tailwind debe incluir:

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ... colores configurados
        medical: {
          blue: { /* ... */ },
          green: { /* ... */ },
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      // ... resto de configuración
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### tsconfig.json
Verifica que tengas el path alias configurado:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Paso 3: Verificar Archivos Creados

### Componentes UI (15 archivos)
```
src/components/ui/
├── avatar.tsx ✓
├── badge.tsx ✓
├── button.tsx ✓
├── calendar.tsx ✓
├── card.tsx ✓
├── dialog.tsx ✓
├── dropdown-menu.tsx ✓
├── form.tsx ✓
├── input.tsx ✓
├── label.tsx ✓
├── select.tsx ✓
├── table.tsx ✓
├── tabs.tsx ✓
├── textarea.tsx ✓
├── toast.tsx ✓
└── toaster.tsx ✓
```

### Hooks (2 archivos)
```
src/hooks/
├── useAuth.ts ✓
├── useToast.ts ✓
└── index.ts (actualizado)
```

### Páginas de Autenticación (3 archivos)
```
src/app/(auth)/
├── layout.tsx ✓
├── login/
│   └── page.tsx ✓
└── register/
    └── page.tsx ✓
```

### Layout Principal (actualizado)
```
src/app/
└── layout.tsx ✓ (actualizado con Toaster)
```

## Paso 4: Variables de Entorno

Crea un archivo `.env.local` en el directorio `frontend/`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# App Configuration
NEXT_PUBLIC_APP_NAME=Soldent
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Paso 5: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El servidor debería iniciarse en http://localhost:3000

## Paso 6: Verificar Rutas

Abre tu navegador y verifica las siguientes rutas:

1. **Login**: http://localhost:3000/login
   - Debe mostrar formulario de login con email y password
   - Debe tener toggle para mostrar/ocultar contraseña
   - Debe tener link a registro

2. **Register**: http://localhost:3000/register
   - Debe mostrar formulario completo con nombre, apellido, email, teléfono, password
   - Debe validar en tiempo real
   - Debe tener link a login

## Paso 7: Probar Funcionalidad

### Test de Validación
1. Deja campos vacíos y haz clic en "Crear Cuenta"
2. Deberías ver mensajes de error en rojo debajo de cada campo
3. Ingresa un email inválido (sin @)
4. Deberías ver error de formato
5. Ingresa una contraseña de menos de 8 caracteres
6. Deberías ver error de longitud

### Test de UI
1. Los iconos (Mail, Lock, User, Phone) deben aparecer en los inputs
2. El botón debe mostrar "Registrando..." con spinner durante carga
3. Los campos deben estar deshabilitados durante carga
4. Los toasts deben aparecer en la esquina superior derecha

## Troubleshooting

### Error: Cannot find module 'react-day-picker'
**Solución**: Ejecuta `npm install` nuevamente

### Error: Module not found: Can't resolve '@/components/ui/...'
**Solución**: Verifica que tsconfig.json tenga el path alias configurado

### Error: Hydration failed
**Solución**: Verifica que el layout tenga `suppressHydrationWarning`

### Toast notifications no aparecen
**Solución**: Verifica que el Toaster esté en el layout principal

### Estilos no se aplican correctamente
**Solución**:
1. Verifica que globals.css esté importado en layout.tsx
2. Ejecuta `npm run dev` nuevamente
3. Limpia el caché del navegador

### TypeScript errors
**Solución**: Ejecuta `npm run type-check` para ver los errores específicos

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Próximos Pasos

Una vez que todo esté funcionando:

1. Configura el backend API en el puerto 4000
2. Prueba el flujo completo de registro y login
3. Verifica que los tokens se guarden en localStorage
4. Prueba la redirección al dashboard después del login
5. Implementa las páginas protegidas del dashboard

## Contacto

Si encuentras problemas:
1. Verifica la consola del navegador para errores
2. Verifica la consola de la terminal para errores de compilación
3. Revisa los archivos de log
4. Consulta la documentación de shadcn/ui y Next.js 14
