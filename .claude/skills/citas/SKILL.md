---
name: sistema-citas
description: Skill para gestión de agendamiento de citas odontológicas. Usa este skill para implementar calendario, citas recurrentes, validación de disponibilidad, y gestión de horarios.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Skill: Sistema de Agendamiento de Citas

Este skill proporciona conocimiento para implementar el sistema de citas.

## Estructura de datos

### Cita

```typescript
enum AppointmentStatus {
  SCHEDULED = 'scheduled',     // Agendada
  CONFIRMED = 'confirmed',     // Confirmada
  IN_PROGRESS = 'in_progress', // En curso
  COMPLETED = 'completed',     // Completada
  CANCELLED = 'cancelled',     // Cancelada
  NO_SHOW = 'no_show',        // No se presentó
  RESCHEDULED = 'rescheduled', // Reagendada
}

enum AppointmentType {
  CONSULTATION = 'consultation',   // Consulta
  TREATMENT = 'treatment',         // Tratamiento
  FOLLOW_UP = 'follow_up',        // Seguimiento
  EMERGENCY = 'emergency',         // Emergencia
  CLEANING = 'cleaning',           // Limpieza
  CHECKUP = 'checkup',            // Revisión
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: string;           // "09:00"
  endTime: string;             // "09:30"
  duration: number;            // minutos
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  treatmentId?: string;        // Si es parte de un tratamiento
  recurrenceId?: string;       // Si es cita recurrente
  reminderSent: boolean;
  color?: string;              // Para calendario
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Citas recurrentes

```typescript
enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',       // Cada 2 semanas
  MONTHLY = 'monthly',
}

interface RecurrencePattern {
  id: string;
  frequency: RecurrenceFrequency;
  interval: number;            // cada X días/semanas/meses
  daysOfWeek?: number[];       // [1,3,5] = Lun, Mie, Vie
  startDate: Date;
  endDate?: Date;              // Fecha fin (opcional)
  occurrences?: number;        // O número de ocurrencias
}

interface RecurringAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  pattern: RecurrencePattern;
  appointments: string[];      // IDs de citas generadas
  active: boolean;
  createdAt: Date;
}
```

### Horarios de disponibilidad

```typescript
interface WorkSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;           // 0-6 (Domingo-Sábado)
  startTime: string;           // "08:00"
  endTime: string;             // "18:00"
  breakStart?: string;         // "12:00"
  breakEnd?: string;           // "13:00"
  active: boolean;
}

interface BlockedTime {
  id: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;              // "Vacaciones", "Conferencia", etc.
  createdAt: Date;
}
```

### Configuración de citas

```typescript
interface AppointmentSettings {
  defaultDuration: number;           // 30 minutos
  minAdvanceBooking: number;         // 1 hora
  maxAdvanceBooking: number;         // 90 días
  allowDoubleBooking: boolean;       // false
  reminderHoursBefore: number;       // 24 horas
  allowOnlineBooking: boolean;
  bufferBetweenAppointments: number; // 5 minutos
}
```

## Lógica de negocio

### Validaciones de disponibilidad

```typescript
interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts?: Appointment[];
  reason?: string;
}

// Validar que:
// 1. El doctor trabaja ese día/hora
// 2. No hay otra cita en ese horario
// 3. Está dentro del horario laboral
// 4. No está en horario de descanso
// 5. No es tiempo bloqueado
// 6. Cumple con tiempo mínimo de anticipación
```

### Slots disponibles

```typescript
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointmentId?: string;      // Si está ocupado
}

// Generar slots de 15/30 minutos según configuración
// Marcar ocupados según citas existentes
// Considerar duración del tratamiento
```

### Citas recurrentes

```typescript
// Al crear cita recurrente:
// 1. Validar patrón de recurrencia
// 2. Generar todas las fechas según patrón
// 3. Validar disponibilidad de cada fecha
// 4. Crear citas individuales
// 5. Vincular con recurrenceId
// 6. Permitir editar/cancelar individual o serie completa
```

### Recordatorios

```typescript
interface Reminder {
  appointmentId: string;
  type: 'sms' | 'email' | 'whatsapp';
  scheduledFor: Date;          // 24h antes
  sent: boolean;
  sentAt?: Date;
}

// Enviar recordatorios automáticos
// Permitir confirmación de cita
// Reenviar si no confirma
```

## Vistas de calendario

### Vista día
- Timeline con horas del día
- Citas apiladas por doctor
- Arrastrar para reagendar
- Click para ver detalles

### Vista semana
- 7 columnas (días)
- Filas por hora
- Color por tipo de cita
- Filtro por doctor

### Vista mes
- Grid 7x5
- Cantidad de citas por día
- Click para ver lista del día
- Indicadores visuales

## Operaciones comunes

### Agendar cita
1. Seleccionar paciente
2. Seleccionar fecha y hora
3. Validar disponibilidad
4. Seleccionar tipo y duración
5. Agregar notas
6. Confirmar y crear

### Reagendar cita
1. Buscar cita existente
2. Seleccionar nueva fecha/hora
3. Validar disponibilidad
4. Actualizar y notificar
5. Registrar cambio en historial

### Cancelar cita
1. Seleccionar cita
2. Motivo de cancelación
3. Confirmar cancelación
4. Liberar slot
5. Notificar al paciente

## Integraciones

- **Pacientes**: Historial de citas
- **Tratamientos**: Agendar próxima sesión
- **Notificaciones**: SMS/Email/WhatsApp
- **Contabilidad**: Registrar pago al completar
- **Reportes**: Estadísticas de asistencia

## Consideraciones UX

- Drag & drop para reagendar
- Color coding por estado/tipo
- Filtros rápidos
- Búsqueda de citas
- Vista rápida (hover)
- Zoom in/out en timeline
- Shortcuts de teclado
- Export a calendario externo (iCal)
