# Módulo de Gestión de Pacientes

Este módulo proporciona una interfaz completa para gestionar pacientes en el sistema Soldent.

## Componentes

### Dialogs

#### CreatePatientDialog
Dialog para crear nuevos pacientes.

**Props:**
- `open: boolean` - Controla si el dialog está abierto
- `onOpenChange: (open: boolean) => void` - Callback cuando cambia el estado del dialog
- `onSuccess?: () => void` - Callback ejecutado después de crear exitosamente

#### EditPatientDialog
Dialog para editar pacientes existentes.

**Props:**
- `patient: Patient | null` - Paciente a editar
- `open: boolean` - Controla si el dialog está abierto
- `onOpenChange: (open: boolean) => void` - Callback cuando cambia el estado del dialog
- `onSuccess?: () => void` - Callback ejecutado después de actualizar exitosamente

#### ViewPatientDialog
Dialog para visualizar información completa del paciente con tabs.

**Tabs:**
- Información Personal
- Historia Médica (placeholder)
- Citas (placeholder)
- Pagos (placeholder)

**Props:**
- `patient: Patient | null` - Paciente a visualizar
- `open: boolean` - Controla si el dialog está abierto
- `onOpenChange: (open: boolean) => void` - Callback cuando cambia el estado del dialog

#### DeletePatientDialog
Dialog de confirmación para eliminar pacientes.

**Props:**
- `patient: Patient | null` - Paciente a eliminar
- `open: boolean` - Controla si el dialog está abierto
- `onOpenChange: (open: boolean) => void` - Callback cuando cambia el estado del dialog
- `onSuccess?: () => void` - Callback ejecutado después de eliminar exitosamente

### Formularios

#### PatientForm
Formulario completo para crear/editar pacientes con validación.

**Secciones:**
1. **Identificación**
   - Tipo de identificación (Cédula, Pasaporte, RUC)
   - Número de identificación (con validación de cédula ecuatoriana)

2. **Información Personal**
   - Nombres y apellidos
   - Fecha de nacimiento
   - Género
   - Email (opcional)
   - Teléfono (validación formato ecuatoriano)

3. **Dirección**
   - Dirección completa (opcional)
   - Ciudad (opcional)
   - Provincia (opcional)

4. **Contacto de Emergencia**
   - Nombre (opcional)
   - Relación (opcional)
   - Teléfono (opcional)

5. **Seguro Médico**
   - ¿Tiene seguro? (checkbox)
   - Proveedor (condicional)
   - Número de póliza (condicional)

**Props:**
- `patient?: Patient` - Paciente a editar (opcional, si no se proporciona es modo crear)
- `onSubmit: (data: PatientFormValues) => Promise<void>` - Función para manejar el submit
- `onCancel: () => void` - Función para manejar la cancelación
- `isSubmitting?: boolean` - Estado de carga del formulario

## Hooks

### usePatients
Hook personalizado para manejar operaciones CRUD de pacientes.

**Retorna:**
```typescript
{
  patients: Patient[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchPatients: (filters?: PatientFilters, page?: number, limit?: number) => Promise<void>
  createPatient: (data: PatientFormData) => Promise<Patient | null>
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<Patient | null>
  deletePatient: (id: string) => Promise<boolean>
  getPatient: (id: string) => Promise<Patient | null>
}
```

## Validaciones

### Validación de Cédula Ecuatoriana
El sistema incluye validación completa de cédulas ecuatorianas:
- 10 dígitos numéricos
- Código de provincia válido (01-24 o 30)
- Tercer dígito menor a 7
- Verificación de dígito de control mediante algoritmo de módulo 10

### Validación de Teléfono
Acepta los siguientes formatos:
- `0991234567` (formato nacional)
- `+593991234567` (formato internacional)

### Otras Validaciones
- Email: formato estándar RFC
- Nombres/Apellidos: 2-50 caracteres
- Seguro: Si tiene seguro, el proveedor es requerido
- Contacto de emergencia: Si se proporciona nombre, el teléfono es requerido

## Página Principal

La página de pacientes (`/dashboard/patients`) incluye:

### Features
1. **Header**
   - Título y descripción
   - Botón "Nuevo Paciente"

2. **Filtros**
   - Búsqueda en tiempo real (nombre, cédula, email)
   - Filtro por estado (Activo/Inactivo)
   - Filtro por género
   - Filtro por seguro médico
   - Botón limpiar filtros

3. **Tabla de Pacientes**
   - Columnas: Identificación, Nombre, Email, Teléfono, Edad, Seguro, Estado, Acciones
   - Loading skeleton durante carga
   - Empty state cuando no hay datos
   - Menú de acciones: Ver, Editar, Eliminar

4. **Paginación**
   - Navegación prev/next
   - Información de registros mostrados
   - Número de página actual

## Uso

```tsx
import { usePatients } from '@/hooks/usePatients'
import { CreatePatientDialog, EditPatientDialog } from '@/components/patients'

function MyComponent() {
  const { patients, loading, fetchPatients } = usePatients()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        Nuevo Paciente
      </button>

      <CreatePatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => fetchPatients()}
      />
    </>
  )
}
```

## Datos Mock

Actualmente el hook `usePatients` utiliza datos mock. Para conectar con el backend:

1. Descomentar las llamadas a la API en `src/hooks/usePatients.ts`
2. Asegurarse de que las rutas de la API coincidan con el backend
3. Configurar la URL base de la API en las variables de entorno

## Próximas Mejoras

- [ ] Integración con API del backend
- [ ] Exportación de pacientes a Excel/PDF
- [ ] Importación masiva de pacientes
- [ ] Campos personalizados
- [ ] Historia clínica completa
- [ ] Vista de citas del paciente
- [ ] Vista de pagos del paciente
- [ ] Gráficos y estadísticas
