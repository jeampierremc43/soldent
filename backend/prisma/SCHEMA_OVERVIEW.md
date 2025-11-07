# Visión General del Esquema de Base de Datos

## Resumen Ejecutivo

El esquema de base de datos de Soldent está diseñado para gestionar un consultorio odontológico completo con:

- 23 tablas principales
- 19 enums
- 7 módulos funcionales
- ~3,800 líneas de código y documentación

## Estadísticas del Esquema

```
📊 Total de Modelos: 23
🔢 Total de Enums: 19
🔗 Total de Relaciones: ~40
📈 Total de Índices: ~30
```

## Módulos y Tablas

### 1️⃣ Usuarios y Autenticación (3 tablas)

```
User (Usuarios del sistema)
├── Role (Roles)
└── Permission (Permisos granulares)
```

**Funcionalidad:**
- Sistema de autenticación con JWT
- Control de acceso basado en roles (RBAC)
- 3 roles: admin, doctor, receptionist
- Permisos granulares por recurso:acción

### 2️⃣ Pacientes (2 tablas)

```
Patient (Pacientes)
└── EmergencyContact (Contactos de emergencia)
```

**Funcionalidad:**
- Registro completo de pacientes
- Datos demográficos y de contacto
- Información de seguro médico
- Contactos de emergencia múltiples

### 3️⃣ Historia Clínica (6 tablas)

```
Patient
├── MedicalHistory (Antecedentes médicos)
├── Diagnosis (Diagnósticos CIE-10)
├── Odontogram (Odontogramas versionados)
│   └── Tooth (Dientes individuales)
├── Treatment (Tratamientos)
└── TreatmentPlan (Planes de tratamiento)
```

**Funcionalidad:**
- Historial médico completo
- Diagnósticos con códigos CIE-10
- Odontogramas con versionado automático
- Sistema FDI para numeración dental
- Tratamientos planificados y realizados
- Presupuestos con aprobación

### 4️⃣ Agendamiento (4 tablas)

```
Appointment (Citas)
├── RecurringAppointment (Citas recurrentes)
└── Doctor
    ├── WorkSchedule (Horarios de trabajo)
    └── BlockedTime (Tiempos bloqueados)
```

**Funcionalidad:**
- Agenda de citas con múltiples doctores
- Validación de disponibilidad
- Citas recurrentes (ortodoncia, etc.)
- Gestión de horarios laborales
- Bloqueo de tiempos (vacaciones, eventos)
- Sistema de recordatorios

### 5️⃣ Seguimiento (2 tablas)

```
Patient
├── FollowUp (Tareas de seguimiento)
└── Note (Notas y observaciones)
```

**Funcionalidad:**
- Seguimiento de pacientes
- Tareas con prioridad y fecha límite
- Notas clínicas
- Sistema de notas destacadas

### 6️⃣ Contabilidad (5 tablas)

```
Transaction (Transacciones generales)
PatientPayment (Pagos de pacientes)
PaymentPlan (Planes de pago)
├── Installment (Cuotas)
Expense (Gastos operativos)
```

**Funcionalidad:**
- Control de ingresos y egresos
- Pagos de pacientes por tratamiento
- Planes de pago con cuotas
- Gestión de cuotas vencidas
- Gastos operativos categorizados
- Reportes financieros

### 7️⃣ Catálogos (2 tablas)

```
CIE10Code (Códigos diagnósticos)
TreatmentCatalog (Catálogo de tratamientos)
```

**Funcionalidad:**
- Catálogo CIE-10 para odontología
- Tratamientos estándar con costos
- Duraciones estimadas
- Categorización de servicios

## Características Principales

### 🔐 Seguridad

```typescript
✓ Passwords hasheados con bcrypt
✓ Control de acceso basado en roles (RBAC)
✓ Permisos granulares por recurso
✓ Soft delete para datos sensibles
✓ Audit trail con timestamps
```

### 📊 Integridad de Datos

```typescript
✓ Foreign keys con constraints
✓ Unique constraints (email, identificación)
✓ Validación de tipos con enums
✓ Precisión decimal para montos
✓ Índices para performance
```

### 🔄 Versionado

```typescript
✓ Odontogramas versionados
✓ Historial inmutable
✓ Solo una versión actual (isCurrent)
✓ Trazabilidad completa
```

### 💰 Manejo de Dinero

```typescript
✓ Tipo Decimal(10,2) para montos
✓ Balance automático (total - pagado)
✓ Sistema de cuotas
✓ Control de morosidad
✓ Soft delete para auditoría
```

## Enums Principales

### Estados de Citas

```typescript
enum AppointmentStatus {
  SCHEDULED    // Agendada
  CONFIRMED    // Confirmada
  IN_PROGRESS  // En curso
  COMPLETED    // Completada
  CANCELLED    // Cancelada
  NO_SHOW      // No se presentó
  RESCHEDULED  // Reagendada
}
```

### Estados de Tratamiento

```typescript
enum TreatmentStatus {
  PLANNED      // Planificado
  IN_PROGRESS  // En progreso
  COMPLETED    // Completado
  CANCELLED    // Cancelado
  POSTPONED    // Pospuesto
}
```

### Estados de Dientes

```typescript
enum ToothStatus {
  HEALTHY      // Sano
  CARIES       // Caries
  FILLED       // Obturado
  MISSING      // Ausente
  FRACTURED    // Fracturado
  CROWN        // Corona
  IMPLANT      // Implante
  ROOT_CANAL   // Endodoncia
  EXTRACTION   // Para extracción
  BRIDGE       // Puente
  TEMPORARY    // Temporal
}
```

### Métodos de Pago

```typescript
enum PaymentMethod {
  CASH         // Efectivo
  CARD         // Tarjeta
  TRANSFER     // Transferencia
  CHECK        // Cheque
}
```

## Flujos de Trabajo Principales

### 📅 Agendar Cita

```
1. Buscar paciente (o crear nuevo)
2. Seleccionar doctor y fecha/hora
3. Validar disponibilidad:
   ✓ Horario laboral del doctor
   ✓ No hay conflictos
   ✓ No está bloqueado
   ✓ Anticipación mínima
4. Crear cita
5. Enviar recordatorio (24h antes)
```

### 🦷 Registro de Tratamiento

```
1. Paciente en consulta
2. Crear/actualizar odontograma
3. Registrar diagnóstico (CIE-10)
4. Seleccionar tratamiento del catálogo
5. Crear plan de tratamiento
6. Paciente aprueba presupuesto
7. Crear plan de pago (si es necesario)
8. Realizar tratamiento
9. Actualizar estado del diente
10. Registrar pago
```

### 💳 Pago de Cuota

```
1. Identificar cuota pendiente
2. Registrar pago
3. Actualizar Installment → PAID
4. Actualizar PaymentPlan.paidAmount
5. Actualizar PaymentPlan.balance
6. Actualizar Treatment.paid
7. Actualizar Treatment.balance
8. Crear Transaction (INCOME)
9. Generar recibo
```

### 📊 Reporte Mensual

```
1. Definir período (mes/año)
2. Sumar ingresos (PatientPayment)
3. Sumar egresos (Expense)
4. Calcular balance neto
5. Agrupar gastos por categoría
6. Listar cuentas por cobrar
7. Identificar cuotas vencidas
8. Exportar a PDF/Excel
```

## Índices de Performance

### Búsquedas Frecuentes

```sql
-- Pacientes
idx_patients_identification  (identification)
idx_patients_name           (first_name, last_name)
idx_patients_phone          (phone)

-- Citas
idx_appointments_date       (date)
idx_appointments_doctor     (doctor_id, date)
idx_appointments_status     (status)

-- Contabilidad
idx_transactions_date       (date)
idx_installments_due_date   (due_date)
idx_installments_status     (status)
```

## Relaciones Destacadas

### Cascada (OnDelete: Cascade)

Cuando se elimina el padre, se eliminan automáticamente los hijos:

```
Patient → EmergencyContact
Patient → MedicalHistory
Patient → Odontogram
Patient → PaymentPlan
Odontogram → Tooth
PaymentPlan → Installment
```

### Restricción (OnDelete: Restrict)

No se puede eliminar si tiene registros relacionados:

```
User (con Appointments)
TreatmentCatalog (con Treatments)
CIE10Code (con Diagnoses)
```

## Consideraciones de Diseño

### ✅ Decisiones Clave

1. **UUID en lugar de Auto-increment**
   - Mayor seguridad
   - Evita enumeration attacks
   - Mejor para sistemas distribuidos

2. **Soft Delete en tablas críticas**
   - No perder historial médico
   - Auditoría completa
   - Recuperación de datos

3. **Versionado de Odontogramas**
   - Historial inmutable
   - Trazabilidad de cambios
   - Compliance médico

4. **Decimal para dinero**
   - Precisión exacta
   - No errores de redondeo
   - Cálculos correctos

5. **Timestamps automáticos**
   - createdAt, updatedAt
   - Auditoría básica
   - Debugging

6. **Normalización apropiada**
   - 3NF en general
   - Desnormalización estratégica (cie10Name en Diagnosis)
   - Balance entre integridad y performance

### 🎯 Trade-offs

| Aspecto | Decisión | Ventaja | Desventaja |
|---------|----------|---------|------------|
| UUIDs | Usar UUIDs | Seguridad, Distribución | Más espacio, Índices más grandes |
| Soft Delete | Implementar | No perder datos | Queries más complejos |
| Versionado | Odontogramas | Historial completo | Más espacio en DB |
| JSON | Superficies de dientes | Flexibilidad | No validación estricta |
| Normalización | Alta | Integridad | Más JOINs |

## Casos de Uso Cubiertos

### ✅ Gestión de Pacientes
- [x] Registro de pacientes
- [x] Historia clínica completa
- [x] Contactos de emergencia
- [x] Datos de seguro

### ✅ Agenda y Citas
- [x] Calendario de citas
- [x] Múltiples doctores
- [x] Citas recurrentes
- [x] Validación de disponibilidad
- [x] Recordatorios automáticos

### ✅ Diagnóstico y Tratamiento
- [x] Diagnósticos con CIE-10
- [x] Odontogramas versionados
- [x] Sistema FDI completo
- [x] Catálogo de tratamientos
- [x] Planes de tratamiento

### ✅ Contabilidad
- [x] Registro de pagos
- [x] Planes de pago con cuotas
- [x] Control de morosidad
- [x] Gastos operativos
- [x] Reportes financieros

### ✅ Seguimiento
- [x] Tareas de seguimiento
- [x] Notas clínicas
- [x] Alertas de cuotas vencidas

## Escalabilidad

### Límites Estimados

```
Pacientes: 50,000+
Citas/mes: 5,000+
Tratamientos: 100,000+
Transacciones: 500,000+
```

### Optimizaciones

1. **Índices estratégicos**
   - Queries frecuentes optimizados
   - Búsquedas rápidas

2. **Paginación**
   - Todas las listas paginadas
   - Límite de resultados

3. **Connection Pooling**
   - Reuso de conexiones
   - Mejor performance

4. **Cache (Redis)**
   - Catálogos
   - Sesiones
   - Datos frecuentes

## Archivos del Proyecto

```
backend/prisma/
├── schema.prisma           (834 líneas) - Schema principal
├── seed.ts                 (324 líneas) - Datos iniciales
├── examples.ts             (635 líneas) - Ejemplos de código
├── README.md               (318 líneas) - Descripción general
├── GETTING_STARTED.md      (443 líneas) - Guía de inicio
├── VALIDATIONS.md          (522 líneas) - Reglas de negocio
├── ER_DIAGRAM.md           (713 líneas) - Diagramas ER
├── SCHEMA_OVERVIEW.md      (este archivo) - Visión general
└── package.json.snippet                 - Scripts npm

backend/
└── .env.example            (142 líneas) - Variables de entorno
```

## Próximos Pasos

1. ✅ Esquema completo definido
2. ⏭️ Crear migraciones (`prisma migrate dev`)
3. ⏭️ Ejecutar seed (`prisma db seed`)
4. ⏭️ Implementar servicios de negocio
5. ⏭️ Crear APIs REST/GraphQL
6. ⏭️ Implementar autenticación JWT
7. ⏭️ Tests unitarios e integración
8. ⏭️ Documentación de API

## Conclusión

El esquema de base de datos de Soldent es:

- ✅ **Completo**: Cubre todos los casos de uso
- ✅ **Escalable**: Diseñado para crecer
- ✅ **Seguro**: Control de acceso robusto
- ✅ **Documentado**: Amplia documentación
- ✅ **Mantenible**: Código limpio y organizado
- ✅ **Performante**: Índices estratégicos
- ✅ **Auditable**: Historial completo

¡Listo para implementar! 🚀
