# Prisma Schema - Soldent

Este documento describe el esquema de base de datos para el sistema de gestión odontológica Soldent.

## Estructura de la Base de Datos

### 1. Usuarios y Autenticación

#### User
Usuarios del sistema (administradores, doctores, recepcionistas).
- Autenticación con email y contraseña (bcrypt)
- Relación con Role para permisos
- Soft delete (deletedAt)

#### Role
Roles del sistema con permisos asociados.
- `admin`: Acceso total al sistema
- `doctor`: Gestión de pacientes, tratamientos, agenda
- `receptionist`: Gestión de citas y pagos

#### Permission
Permisos granulares por recurso y acción.
- Patrón: `resource:action` (ej: `patients:create`)

### 2. Pacientes

#### Patient
Información personal y de contacto de pacientes.
- Identificación única (cédula/pasaporte)
- Datos de seguro médico
- Soft delete para historial

#### EmergencyContact
Contactos de emergencia del paciente.
- Relación con teléfono secundario opcional

### 3. Historia Clínica

#### MedicalHistory
Antecedentes médicos y odontológicos del paciente.
- Alergias, medicamentos, enfermedades crónicas
- Hábitos de higiene oral
- Información de embarazo si aplica

#### Diagnosis
Diagnósticos con códigos CIE-10.
- Fecha de diagnóstico
- Diente específico si aplica
- Relación con tratamientos

#### Odontogram
Odontogramas con versionado.
- Tipo: permanente (32 dientes) o temporal (20 dientes)
- Solo uno puede ser `isCurrent = true`
- Historial inmutable

#### Tooth
Estado individual de cada diente.
- Numeración FDI (11-48 para adultos, 51-85 para niños)
- Estado general (sano, caries, obturado, etc.)
- Superficies (JSON con estado de cada cara)

#### Treatment
Tratamientos realizados o planificados.
- Relación con catálogo de tratamientos
- Control de costos y pagos
- Estados: planificado, en progreso, completado

#### TreatmentPlan
Planes de tratamiento completos (presupuestos).
- Aprobación de paciente
- PDF adjunto opcional

### 4. Agendamiento

#### Appointment
Citas agendadas.
- Fecha, hora inicio/fin, duración
- Tipo: consulta, tratamiento, seguimiento, emergencia
- Estados: agendada, confirmada, completada, cancelada
- Sistema de recordatorios

#### RecurringAppointment
Citas recurrentes (ej: ortodoncia mensual).
- Patrón de recurrencia: diaria, semanal, quincenal, mensual
- Genera múltiples Appointment

#### WorkSchedule
Horarios de trabajo de doctores.
- Por día de la semana
- Incluye horario de almuerzo/break

#### BlockedTime
Tiempos bloqueados (vacaciones, conferencias).
- Por doctor y fecha específica

### 5. Seguimiento

#### FollowUp
Tareas de seguimiento de pacientes.
- Prioridad y estado
- Fecha de vencimiento

#### Note
Notas adicionales sobre pacientes.
- Pueden ser fijadas (pinned)
- Autor y timestamps

### 6. Contabilidad

#### Transaction
Registro general de transacciones financieras.
- Tipo: ingreso o egreso
- Categorías configurables
- Soft delete para auditoría

#### PatientPayment
Pagos específicos de pacientes.
- Por tratamiento o cita
- Múltiples métodos de pago
- Relación con cuotas (installments)

#### PaymentPlan
Planes de pago para tratamientos.
- Control de monto total, pagado, balance
- Estados: activo, completado, en mora

#### Installment
Cuotas de planes de pago.
- Número de cuota y monto
- Fecha de vencimiento
- Estado: pendiente, pagado, vencido

#### Expense
Gastos operativos del consultorio.
- Categorías: insumos, equipamiento, salarios, etc.
- Gastos recurrentes marcados
- Soft delete

### 7. Catálogos

#### CIE10Code
Códigos diagnósticos CIE-10 (Ecuador).
- Enfoque en odontología (K00-K14)
- Código, nombre, categoría

#### TreatmentCatalog
Catálogo de tratamientos disponibles.
- Código único
- Costo base y duración estimada
- Categorías: preventivo, restauración, cirugía, etc.

## Enums

### Estados y Tipos

- **Gender**: MALE, FEMALE, OTHER
- **IdentificationType**: CEDULA, PASAPORTE, RUC
- **ToothStatus**: HEALTHY, CARIES, FILLED, MISSING, etc.
- **AppointmentStatus**: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, etc.
- **AppointmentType**: CONSULTATION, TREATMENT, FOLLOW_UP, EMERGENCY, etc.
- **TreatmentStatus**: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentMethod**: CASH, CARD, TRANSFER, CHECK
- **ExpenseCategory**: SUPPLIES, EQUIPMENT, SALARIES, RENT, etc.

Ver `schema.prisma` para lista completa de enums.

## Índices

Índices creados para optimización de queries frecuentes:
- Búsqueda de pacientes por identificación, nombre, teléfono
- Filtrado de citas por fecha, doctor, estado
- Reportes financieros por fecha y tipo
- Diagnósticos por código CIE-10

## Relaciones Importantes

### Cascada (onDelete: Cascade)
Cuando se elimina un registro padre, se eliminan los hijos:
- Patient → EmergencyContact, MedicalHistory, Odontogram, etc.
- Odontogram → Tooth
- PaymentPlan → Installment

### Restricción (sin onDelete)
No se puede eliminar si tiene registros relacionados:
- User (doctor) con Appointment
- TreatmentCatalog con Treatment

## Migraciones

### Crear una migración
```bash
npx prisma migrate dev --name nombre_descriptivo
```

### Aplicar migraciones
```bash
npx prisma migrate deploy
```

### Generar cliente Prisma
```bash
npx prisma generate
```

## Seed

### Ejecutar seed
```bash
npx prisma db seed
```

El seed crea:
- Permisos y roles (admin, doctor, receptionist)
- 3 usuarios de prueba
- Códigos CIE-10 más comunes en odontología
- Catálogo de tratamientos base

### Usuarios de prueba
- `admin@soldent.com` / `admin123`
- `doctor@soldent.com` / `admin123`
- `recepcion@soldent.com` / `admin123`

## Versionado

### Odontogramas
- Cada modificación crea una nueva versión
- Solo una versión tiene `isCurrent = true`
- Mantiene historial completo

### Soft Delete
Modelos con `deletedAt`:
- User
- Patient
- Transaction
- Expense

## Mejores Prácticas

1. **Siempre usar transacciones** para operaciones relacionadas
2. **Validar integridad** en la capa de servicio
3. **No eliminar datos financieros** (usar soft delete)
4. **Mantener historial médico** inmutable
5. **Versionar odontogramas** en cada actualización

## Tipos de Datos Especiales

### Decimal
Usado para valores monetarios con precisión:
```typescript
Decimal @db.Decimal(10, 2)
```

### JSON
Para datos estructurados flexibles:
```typescript
surfaces String? // JSON: { "oclusal": "caries", "mesial": "filled" }
```

### DateTime
Con valores por defecto:
```typescript
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

## Consultas Comunes

### Buscar paciente con historia completa
```typescript
const patient = await prisma.patient.findUnique({
  where: { id },
  include: {
    medicalHistories: true,
    odontograms: { where: { isCurrent: true } },
    appointments: { orderBy: { date: 'desc' } },
    treatments: true,
  }
});
```

### Obtener citas del día
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const appointments = await prisma.appointment.findMany({
  where: {
    date: {
      gte: today,
      lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    },
    status: { in: ['SCHEDULED', 'CONFIRMED'] }
  },
  include: { patient: true, doctor: true }
});
```

### Balance financiero mensual
```typescript
const transactions = await prisma.transaction.groupBy({
  by: ['type'],
  where: {
    date: {
      gte: startOfMonth,
      lte: endOfMonth
    },
    deletedAt: null
  },
  _sum: { amount: true }
});
```

## Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [CIE-10 Ecuador](https://www.salud.gob.ec/)
