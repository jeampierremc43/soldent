# Guía de Uso - Dashboard y Componentes

## Inicio Rápido

### 1. Instalación y Setup

El proyecto ya tiene todas las dependencias instaladas. Si necesitas reinstalar:

```bash
cd frontend
npm install
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

El dashboard estará disponible en `http://localhost:3000/dashboard`

---

## Uso de Componentes

### DashboardLayout

Layout principal para todas las páginas del dashboard.

```tsx
import { DashboardLayout } from '@/components/layouts/DashboardLayout'

export default function MyPage() {
  return (
    <DashboardLayout>
      <h1>Mi Página</h1>
      {/* Tu contenido aquí */}
    </DashboardLayout>
  )
}
```

### StatCard

Tarjeta de estadística reutilizable.

```tsx
import { StatCard } from '@/components/shared/StatCard'
import { Users } from 'lucide-react'

<StatCard
  title="Total Pacientes"
  value={245}
  change={12.5}
  icon={Users}
  color="blue"
  loading={false}
/>
```

**Props:**
- `title`: string - Título de la estadística
- `value`: string | number - Valor a mostrar
- `change?`: number - Cambio porcentual (opcional)
- `icon`: LucideIcon - Icono a mostrar
- `color?`: 'blue' | 'green' | 'orange' | 'purple' | 'red' - Color del tema
- `loading?`: boolean - Estado de carga
- `className?`: string - Clases CSS adicionales

### DataTable

Tabla de datos genérica.

```tsx
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'

<DataTable
  title="Citas de Hoy"
  columns={[
    { key: 'time', label: 'Hora' },
    { key: 'patient', label: 'Paciente' },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => <Badge>{item.status}</Badge>
    },
  ]}
  data={appointments}
  loading={false}
  emptyMessage="No hay citas"
  onRowClick={(item) => console.log(item)}
/>
```

**Props:**
- `title?`: string - Título de la tabla
- `columns`: Column[] - Configuración de columnas
- `data`: T[] - Array de datos
- `loading?`: boolean - Estado de carga
- `emptyMessage?`: string - Mensaje cuando no hay datos
- `className?`: string - Clases CSS adicionales
- `onRowClick?`: (item: T) => void - Callback para click en fila

**Column:**
```typescript
{
  key: string           // Key del objeto de datos
  label: string         // Label de la columna
  render?: (item) => ReactNode  // Render custom
  className?: string    // Clases CSS para la columna
}
```

### LoadingSkeleton

Skeletons para estados de carga.

```tsx
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

// Skeleton para stats
<LoadingSkeleton variant="stat" count={4} />

// Skeleton para tabla
<LoadingSkeleton variant="table" count={5} />

// Skeleton para gráfico
<LoadingSkeleton variant="chart" />

// Skeleton para cards
<LoadingSkeleton variant="card" count={3} />
```

**Props:**
- `variant?`: 'card' | 'table' | 'stat' | 'chart' - Tipo de skeleton
- `count?`: number - Cantidad de items (default: 1)
- `className?`: string - Clases CSS adicionales

---

## Uso del Hook useDashboard

Hook para obtener datos del dashboard.

```tsx
import { useDashboard } from '@/hooks/useDashboard'

export default function Dashboard() {
  const { data, loading, error, refresh } = useDashboard(true, 30000)

  if (loading && !data) {
    return <LoadingSkeleton variant="stat" count={4} />
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <Button onClick={refresh}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div>
      <StatCard
        title="Total Pacientes"
        value={data?.stats.totalPatients || 0}
        icon={Users}
        color="blue"
      />
      {/* Más componentes */}
    </div>
  )
}
```

**Parámetros:**
- `autoRefresh`: boolean - Habilitar refresh automático (default: false)
- `refreshInterval`: number - Intervalo en ms (default: 30000)

**Retorno:**
```typescript
{
  data: DashboardData | null
  loading: boolean
  error: Error | null
  refresh: () => void
}
```

**DashboardData:**
```typescript
{
  stats: {
    totalPatients: number
    todayAppointments: number
    pendingFollowUps: number
    monthlyRevenue: number
    revenueChange: number
    appointmentsChange: number
  }
  todayAppointments: Array<{...}>
  urgentFollowups: Array<{...}>
  revenueChartData: Array<{...}>
  appointmentsChartData: Array<{...}>
}
```

---

## Personalización

### Colores del Tema

Los colores están definidos en `tailwind.config.ts`:

```typescript
medical: {
  blue: { 50: '#eff6ff', ..., 900: '#1e3a8a' },
  green: { 50: '#f0fdf4', ..., 900: '#14532d' },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}
```

Uso:
```tsx
<div className="bg-medical-blue-50 text-medical-blue-700">
  Contenido
</div>
```

### Constantes

Estados y labels están en `src/constants/index.ts`:

```typescript
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  FOLLOWUP_PRIORITY_COLORS,
  FOLLOWUP_PRIORITY_LABELS,
} from '@/constants'

<Badge className={APPOINTMENT_STATUS_COLORS[status]}>
  {APPOINTMENT_STATUS_LABELS[status]}
</Badge>
```

---

## Integración con API Real

### Paso 1: Actualizar el Hook

En `src/hooks/useDashboard.ts`, reemplaza el mock data:

```typescript
const fetchData = async () => {
  try {
    setLoading(true)
    setError(null)

    // Reemplazar esto:
    // const mockData = generateMockData()
    // setData(mockData)

    // Con esto:
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS)
    setData(response.data)
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Error al cargar datos'))
  } finally {
    setLoading(false)
  }
}
```

### Paso 2: Agregar Endpoint en Backend

```typescript
// Backend: src/routes/dashboard.routes.ts
router.get('/stats', dashboardController.getStats)

// Backend: src/controllers/dashboard.controller.ts
export const getStats = async (req: Request, res: Response) => {
  const stats = await dashboardService.getStats(req.user.id)
  res.json({ success: true, data: stats })
}
```

### Paso 3: Actualizar Constantes

En `src/constants/index.ts`, asegúrate de tener:

```typescript
export const API_ENDPOINTS = {
  // ...
  DASHBOARD_STATS: '/api/dashboard/stats',
}
```

---

## Responsive Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

Uso en componentes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col en mobile, 2 en tablet, 4 en desktop */}
</div>

<div className="hidden md:block">
  {/* Oculto en mobile, visible en tablet+ */}
</div>

<div className="block md:hidden">
  {/* Visible en mobile, oculto en tablet+ */}
</div>
```

---

## Tips de Performance

### 1. Memoización

```tsx
import { useMemo } from 'react'

const expensiveData = useMemo(() => {
  return processLargeData(data)
}, [data])
```

### 2. Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <LoadingSkeleton variant="chart" />,
  ssr: false
})
```

### 3. Paginación

```tsx
const [page, setPage] = useState(1)
const pageSize = 10

const paginatedData = useMemo(() => {
  const start = (page - 1) * pageSize
  return data.slice(start, start + pageSize)
}, [data, page])
```

---

## Troubleshooting

### Error: "Module not found"
```bash
npm install
```

### Error de tipos
```bash
npm run type-check
```

### Tailwind no funciona
```bash
# Verificar que tailwind.config.ts incluye las rutas correctas
content: [
  './src/**/*.{ts,tsx}',
]
```

### Gráficos no se renderizan
```tsx
// Asegúrate de tener ResponsiveContainer
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

---

## Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org)
- [Lucide Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## Soporte

Para preguntas o issues, contacta al equipo de desarrollo o revisa:
- `DASHBOARD_IMPLEMENTATION.md` - Documentación técnica completa
- `DASHBOARD_SUMMARY.md` - Resumen ejecutivo
- Código fuente con comentarios

---

Última actualización: 6 de Noviembre, 2025
