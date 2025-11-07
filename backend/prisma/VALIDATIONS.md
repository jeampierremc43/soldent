# Validaciones y Reglas de Negocio

Este documento describe las validaciones y reglas de negocio que deben implementarse en la capa de aplicación.

## Pacientes

### Creación de Paciente

#### Validaciones de Datos
- [x] **Identificación única**: No puede haber dos pacientes con la misma identificación
- [x] **Formato de cédula** (Ecuador): 10 dígitos, validar dígito verificador
- [x] **Formato de RUC** (Ecuador): 13 dígitos
- [x] **Edad mínima**: Fecha de nacimiento no puede ser futura
- [x] **Email válido**: Formato correcto de email
- [x] **Teléfono**: Formato Ecuador (10 dígitos, empieza con 0)

#### Reglas de Negocio
- Si es menor de edad, requerir contacto de emergencia obligatorio
- Si tiene seguro, requerir provider y número
- Tipo de dentición según edad:
  - 0-6 años: TEMPORARY
  - 6-12 años: MIXED
  - 12+ años: PERMANENT

### Actualización de Paciente
- No permitir cambiar identificación si tiene historial médico
- Mantener audit trail de cambios importantes
- Validar que el paciente existe y está activo

### Eliminación de Paciente
- Soft delete únicamente
- Verificar que no tenga citas futuras pendientes
- Verificar que no tenga deudas pendientes

## Odontogramas

### Numeración FDI

#### Dientes Permanentes (32 dientes)
```
Cuadrante 1 (superior derecho): 11, 12, 13, 14, 15, 16, 17, 18
Cuadrante 2 (superior izquierdo): 21, 22, 23, 24, 25, 26, 27, 28
Cuadrante 3 (inferior izquierdo): 31, 32, 33, 34, 35, 36, 37, 38
Cuadrante 4 (inferior derecho): 41, 42, 43, 44, 45, 46, 47, 48
```

#### Dientes Temporales (20 dientes)
```
Cuadrante 5 (superior derecho): 51, 52, 53, 54, 55
Cuadrante 6 (superior izquierdo): 61, 62, 63, 64, 65
Cuadrante 7 (inferior izquierdo): 71, 72, 73, 74, 75
Cuadrante 8 (inferior derecho): 81, 82, 83, 84, 85
```

### Validaciones
- [x] **Número de diente válido**: Debe estar en el rango correcto según tipo
- [x] **No duplicar dientes**: Un odontograma no puede tener dos veces el mismo diente
- [x] **Tipo correcto**: PERMANENT debe tener 32, TEMPORARY debe tener 20
- [x] **Solo un odontograma actual**: `isCurrent = true` debe ser único por paciente
- [x] **Superficies válidas**: O, M, D, V, L, P (solo P en superiores)

### Reglas de Versionado
- Cada modificación crea una nueva versión
- La versión anterior se marca como `isCurrent = false`
- Mantener historial completo (no eliminar versiones antiguas)
- Incrementar `version` en +1

## Citas

### Validaciones de Disponibilidad

#### 1. Horario Laboral
```typescript
// Verificar que el doctor trabaja ese día
const workSchedule = WorkSchedule.find({
  doctorId,
  dayOfWeek,
  isActive: true
});

// Verificar que está dentro del horario
if (startTime < workSchedule.startTime || endTime > workSchedule.endTime) {
  throw new Error('Fuera del horario laboral');
}

// Verificar que no está en horario de descanso
if (startTime >= workSchedule.breakStart && startTime < workSchedule.breakEnd) {
  throw new Error('En horario de descanso');
}
```

#### 2. Tiempo Bloqueado
```typescript
const blocked = BlockedTime.find({
  doctorId,
  date,
  startTime <= appointmentStart,
  endTime > appointmentStart
});

if (blocked) {
  throw new Error(`Bloqueado: ${blocked.reason}`);
}
```

#### 3. Conflictos de Horario
```typescript
const conflict = Appointment.find({
  doctorId,
  date,
  status: { notIn: ['CANCELLED', 'NO_SHOW'] },
  // Overlap: (StartA <= EndB) and (EndA >= StartB)
  startTime < newEndTime,
  endTime > newStartTime
});

if (conflict) {
  throw new Error('Horario ocupado');
}
```

#### 4. Tiempo de Anticipación
```typescript
const minAdvance = env.MIN_ADVANCE_BOOKING_HOURS;
const now = new Date();
const appointmentDate = new Date(date + ' ' + startTime);

if (appointmentDate < new Date(now.getTime() + minAdvance * 60 * 60 * 1000)) {
  throw new Error(`Debe agendar con al menos ${minAdvance} horas de anticipación`);
}
```

#### 5. Máximo de Días Adelante
```typescript
const maxDays = env.MAX_ADVANCE_BOOKING_DAYS;
const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

if (appointmentDate > maxDate) {
  throw new Error(`No puede agendar con más de ${maxDays} días de anticipación`);
}
```

### Citas Recurrentes

#### Validaciones
- [x] **Patrón válido**: Frecuencia + intervalo correcto
- [x] **Fecha fin o ocurrencias**: Al menos uno debe estar definido
- [x] **Días de semana**: Solo para frecuencia WEEKLY
- [x] **No más de 52 ocurrencias**: Límite razonable

#### Generación de Citas
```typescript
// Validar cada fecha generada
for (const date of generatedDates) {
  const availability = await checkAvailability(doctorId, date, startTime, duration);
  if (!availability.available) {
    // Registrar conflicto pero continuar
    conflicts.push({ date, reason: availability.reason });
  } else {
    // Crear cita
    appointments.push(await createAppointment({ ... }));
  }
}

// Retornar citas creadas y conflictos
return { appointments, conflicts };
```

### Cambios de Estado

#### De SCHEDULED a CONFIRMED
- Puede ser automático al confirmar recordatorio
- Puede ser manual por recepcionista

#### De CONFIRMED a IN_PROGRESS
- Solo el doctor puede marcar
- Validar que la fecha/hora es cercana (±15 min)

#### De IN_PROGRESS a COMPLETED
- Solo el doctor puede marcar
- Puede requerir registrar tratamiento

#### A CANCELLED
- Cualquier usuario con permisos
- Registrar motivo de cancelación
- Liberar slot
- Notificar al paciente

#### A NO_SHOW
- Solo si la fecha/hora ya pasó
- Puede tener penalización automática

#### A RESCHEDULED
- Al reagendar, marcar la original como RESCHEDULED
- Crear nueva cita
- Vincular ambas para historial

## Tratamientos y Pagos

### Validaciones de Costos

#### Montos
- [x] **Siempre positivos**: No negativos ni cero
- [x] **Precisión decimal**: Máximo 2 decimales
- [x] **Balance correcto**: `balance = cost - paid`
- [x] **No pagar más del costo**: `paid <= cost`

#### Plan de Pago
```typescript
// Validar que las cuotas sumen el total
const sumInstallments = installments.reduce((sum, i) => sum + i.amount, 0);
if (Math.abs(sumInstallments - totalAmount) > 0.01) {
  throw new Error('Las cuotas no suman el total');
}

// Al menos 1 cuota
if (installments.length < 1) {
  throw new Error('Debe tener al menos una cuota');
}

// Fechas de vencimiento ordenadas
for (let i = 1; i < installments.length; i++) {
  if (installments[i].dueDate <= installments[i-1].dueDate) {
    throw new Error('Fechas de vencimiento deben ser ordenadas');
  }
}
```

### Registro de Pagos

#### Validaciones
- [x] **Monto positivo**: `amount > 0`
- [x] **No exceder balance**: `amount <= balance`
- [x] **Método de pago válido**: CASH, CARD, TRANSFER, CHECK
- [x] **Fecha no futura**: `date <= now`

#### Actualización en Cascada
```typescript
// Al registrar pago de cuota:
1. Crear PatientPayment
2. Actualizar Installment (status = PAID, paidDate)
3. Actualizar PaymentPlan (paidAmount += amount, balance -= amount)
4. Actualizar Treatment (paid += amount, balance -= amount)
5. Crear Transaction (type = INCOME)

// Todo dentro de una transacción
```

### Cuotas Vencidas

#### Cron Job Diario
```typescript
// Ejecutar diariamente a las 00:00
async function markOverdueInstallments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.installment.updateMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: today }
    },
    data: {
      status: 'OVERDUE'
    }
  });

  // Actualizar PaymentPlan si tiene cuotas vencidas
  const plansWithOverdue = await prisma.paymentPlan.findMany({
    where: {
      installments: {
        some: { status: 'OVERDUE' }
      }
    }
  });

  for (const plan of plansWithOverdue) {
    await prisma.paymentPlan.update({
      where: { id: plan.id },
      data: { status: 'DEFAULTED' }
    });
  }
}
```

## Diagnósticos

### Código CIE-10

#### Validaciones
- [x] **Código existe**: Debe estar en tabla `cie10_codes`
- [x] **Categoría odontológica**: Preferiblemente K00-K14
- [x] **Formato correcto**: Letra + dígitos + punto + dígito (ej: K02.1)

#### Relación con Tratamiento
- Un diagnóstico puede tener múltiples tratamientos
- Un tratamiento puede estar asociado a un diagnóstico

### Historial Inmutable
- Los diagnósticos NO se editan, se crean nuevos
- Mantener fecha de diagnóstico original
- Audit trail completo

## Seguridad y Permisos

### Por Rol

#### Admin
- Acceso total
- Puede gestionar usuarios y roles
- Puede eliminar registros (soft delete)

#### Doctor
- Puede ver todos sus pacientes
- Puede ver citas de todos los doctores (read-only)
- Puede modificar solo sus citas
- Puede crear diagnósticos y tratamientos
- Puede ver reportes financieros (sin modificar)

#### Receptionist
- Puede ver todos los pacientes
- Puede crear y modificar pacientes
- Puede gestionar todas las citas
- Puede registrar pagos
- NO puede ver detalles médicos sensibles
- NO puede crear diagnósticos

### Validaciones de Acceso
```typescript
// Ejemplo: Doctor solo puede modificar sus citas
async function updateAppointment(appointmentId: string, userId: string, updates: any) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  // Admin puede todo
  if (user.role.name === 'admin') {
    return await prisma.appointment.update({ ... });
  }

  // Doctor solo sus citas
  if (user.role.name === 'doctor' && appointment.doctorId !== userId) {
    throw new Error('No autorizado');
  }

  return await prisma.appointment.update({ ... });
}
```

## Notificaciones

### Recordatorios de Cita

#### Cuándo Enviar
- 24 horas antes (configurable)
- Solo para citas con estado SCHEDULED o CONFIRMED
- No enviar duplicados

#### Canales
1. **Email** (si tiene email)
2. **SMS** (si no tiene email o preferencia)
3. **WhatsApp** (si está disponible)

#### Contenido
```
Recordatorio de Cita
Paciente: Juan Pérez
Doctor: Dr. María González
Fecha: 15/11/2025 - 10:00 AM
Tipo: Consulta
Dirección: [Dirección del consultorio]

Para confirmar responda SÍ
Para cancelar responda NO
```

### Cuotas por Vencer
- Enviar 3 días antes de vencimiento
- Incluir monto y métodos de pago

### Cuotas Vencidas
- Enviar cada 7 días mientras esté vencida
- Incluir monto vencido + días de mora

## Reportes

### Validaciones Comunes

#### Rango de Fechas
- Fecha inicio <= Fecha fin
- No permitir rangos > 1 año (performance)
- Validar formato de fecha

#### Filtros
- Validar que los IDs existen (doctorId, patientId, etc.)
- Validar enums (status, type, etc.)

## Integridad de Datos

### Transacciones Requeridas

Usar transacciones de Prisma para:
- [x] Crear tratamiento con plan de pago
- [x] Registrar pago (actualizar cuota + plan + tratamiento)
- [x] Actualizar odontograma (desactivar actual + crear nuevo)
- [x] Crear diagnóstico con tratamiento
- [x] Completar cita con tratamiento

### Soft Delete

Modelos con soft delete:
- User (`deletedAt`)
- Patient (`deletedAt`)
- Transaction (`deletedAt`)
- Expense (`deletedAt`)

Queries deben filtrar: `where: { deletedAt: null }`

### Cascada vs Restrict

#### Cascade (eliminar hijos)
- Patient → EmergencyContact, MedicalHistory, Odontogram
- Odontogram → Tooth
- PaymentPlan → Installment

#### Restrict (no permitir eliminar)
- User con Appointments
- TreatmentCatalog con Treatments
- CIE10Code con Diagnoses

## Performance

### Índices Importantes

Ya definidos en schema:
- `patients.identification`
- `patients.phone`
- `patients.firstName + lastName`
- `appointments.date`
- `appointments.doctorId`
- `appointments.status`
- `transactions.date`
- `cie10_codes.category`

### Paginación

Siempre usar paginación para listas:
```typescript
const patients = await prisma.patient.findMany({
  skip: (page - 1) * limit,
  take: limit,
  where: { ... },
  orderBy: { ... }
});

const total = await prisma.patient.count({ where: { ... } });

return {
  data: patients,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
};
```

### Queries Pesados

Para reportes complejos, considerar:
- Vistas materializadas
- Cache en Redis
- Background jobs
- Agregaciones en DB

## Testing

### Casos de Prueba Importantes

1. **Duplicados**: Intentar crear paciente con cédula existente
2. **Concurrencia**: Dos usuarios agendando la misma hora
3. **Validaciones**: Montos negativos, fechas futuras, etc.
4. **Transacciones**: Fallo en mitad de operación
5. **Soft Delete**: Queries no deben retornar eliminados
6. **Permisos**: Usuarios sin permisos intentando acciones
7. **Versionado**: Crear múltiples versiones de odontograma

## Logs y Auditoría

### Eventos a Registrar

#### Críticos (siempre)
- Login/Logout
- Creación/modificación de usuarios
- Eliminación de registros
- Cambios en permisos

#### Importantes (recomendado)
- Creación de pacientes
- Diagnósticos y tratamientos
- Transacciones financieras
- Cambios de estado de citas

#### Información de Log
```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE'
  resource: string; // 'Patient', 'Appointment', etc.
  resourceId: string;
  changes?: Record<string, any>; // Antes y después
  ipAddress?: string;
}
```
