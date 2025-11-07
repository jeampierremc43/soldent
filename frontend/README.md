# Soldent Frontend

Sistema de gestión médica dental - Frontend desarrollado con Next.js 14.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas protegidas del dashboard
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx           # Página de inicio
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── layouts/           # Layouts (Sidebar, Header)
│   │   ├── forms/             # Componentes de formularios
│   │   └── shared/            # Componentes compartidos
│   ├── lib/
│   │   ├── api/               # Cliente API y funciones
│   │   ├── auth/              # Utilidades de autenticación
│   │   ├── utils.ts           # Funciones utilitarias
│   │   └── validations/       # Esquemas de validación Zod
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Stores de Zustand
│   ├── types/                 # Tipos TypeScript
│   └── constants/             # Constantes
├── public/                    # Archivos estáticos
└── ...                        # Archivos de configuración
```

## Requisitos Previos

- Node.js 18+ o superior
- npm o yarn o pnpm
- Backend de Soldent ejecutándose en http://localhost:4000

## Instalación

1. Instalar dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones.

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos TypeScript

## Convenciones de Código

### Componentes

- Usar Server Components por defecto
- Marcar con `'use client'` solo cuando sea necesario
- Nombres de componentes en PascalCase
- Props bien tipadas con interfaces

### Estilos

- Usar Tailwind CSS para estilos
- Seguir el sistema de diseño de shadcn/ui
- Clases utilitarias antes que CSS custom
- Usar la función `cn()` para clases condicionales

### TypeScript

- Modo estricto habilitado
- Evitar `any`, usar tipos explícitos
- Interfaces para objetos, types para uniones
- Exportar tipos desde `src/types/`

### Estado

- Server State: React Query (si se implementa)
- Client State: Zustand para estado global
- Form State: React Hook Form

## shadcn/ui Components

Para agregar componentes de shadcn/ui:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
# etc...
```

Los componentes se agregarán automáticamente a `src/components/ui/`.

## Rutas Principales

- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro
- `/dashboard` - Dashboard principal
- `/dashboard/patients` - Gestión de pacientes
- `/dashboard/appointments` - Gestión de citas
- `/dashboard/medical` - Registros médicos
- `/dashboard/accounting` - Contabilidad
- `/dashboard/followups` - Seguimientos

## API Integration

El cliente API está configurado para conectarse al backend en `http://localhost:4000`.

Las llamadas a la API deben hacerse a través de:
- `src/lib/api/` - Funciones de API organizadas por módulo

## Autenticación

- JWT almacenado en localStorage
- Refresh token automático
- Rutas protegidas con middleware
- Redirección automática si no está autenticado

## Próximos Pasos

1. Implementar componentes de UI base
2. Crear layouts (Sidebar, Header)
3. Implementar páginas de autenticación
4. Desarrollar módulos del dashboard
5. Integrar con backend API
6. Agregar pruebas

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
