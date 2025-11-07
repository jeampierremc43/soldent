# 📚 Soldent API Documentation

Documentación completa de la API REST del sistema de gestión odontológica Soldent.

**Base URL:** `http://localhost:4000/api/v1`

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Pacientes](#pacientes)
3. [Citas](#citas)
4. [Historia Clínica](#historia-clínica)
5. [Odontogramas](#odontogramas)
6. [Contabilidad](#contabilidad)
7. [Seguimiento](#seguimiento)
8. [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

### POST /auth/register
Registrar nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "phone": "+593987654321"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "role": { "name": "receptionist" }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

### POST /auth/login
Iniciar sesión.

**Body:**
```json
{
  "email": "admin@soldent.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@soldent.com",
      "name": "Administrador"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

### GET /auth/me
Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "doctor@soldent.com",
    "name": "Dr. Juan Pérez",
    "role": {
      "name": "doctor",
      "permissions": ["patient:read", "patient:create", ...]
    }
  }
}
```

### POST /auth/logout
Cerrar sesión.

**Headers:** `Authorization: Bearer {token}`

---

## 👤 Pacientes

### GET /patients
Listar pacientes con paginación y filtros.

**Query params:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string): Busca en nombre, cédula, email
- `gender` (MALE | FEMALE | OTHER)
- `hasInsurance` (boolean)
- `isActive` (boolean)
- `sortBy` (string, default: 'createdAt')
- `sortOrder` ('asc' | 'desc', default: 'desc')

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "identification": "1234567890",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "+593987654321",
      "dateOfBirth": "1990-01-15",
      "gender": "MALE",
      "hasInsurance": true,
      "insuranceProvider": "Seguros Unidos",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalCount": 50,
    "hasMore": true
  }
}
```

### POST /patients
Crear nuevo paciente.

**Body:**
```json
{
  "identification": "1234567890",
  "identificationType": "CEDULA",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "+593987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "address": "Calle Principal 123",
  "city": "Quito",
  "province": "Pichincha",
  "hasInsurance": true,
  "insuranceProvider": "Seguros Unidos",
  "emergencyContact": {
    "name": "María Pérez",
    "relationship": "Hermana",
    "phone": "+593987654322"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "identification": "1234567890",
    "firstName": "Juan",
    "lastName": "Pérez",
    ...
  }
}
```

### GET /patients/:id
Obtener paciente por ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "identification": "1234567890",
    "firstName": "Juan",
    "emergencyContacts": [...],
    "_count": {
      "medicalHistories": 1,
      "appointments": 5,
      "treatments": 3
    }
  }
}
```

### PUT /patients/:id
Actualizar paciente.

### DELETE /patients/:id
Eliminar paciente (soft delete, solo admin).

### GET /patients/:id/history
Obtener historia clínica del paciente.

### GET /patients/:id/stats
Obtener estadísticas del paciente (citas, tratamientos, pagos).

---

## 📅 Citas

### GET /appointments
Listar citas con filtros.

**Query params:**
- `patientId` (string)
- `doctorId` (string)
- `date` (date): Fecha específica
- `startDate` / `endDate` (date): Rango de fechas
- `status` (SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW | RESCHEDULED)
- `type` (CONSULTATION | TREATMENT | FOLLOW_UP | EMERGENCY | CLEANING | CHECKUP)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "doctor": {
        "id": "uuid",
        "name": "Dr. García"
      },
      "date": "2025-11-10",
      "startTime": "09:00",
      "endTime": "09:30",
      "duration": 30,
      "type": "CONSULTATION",
      "status": "SCHEDULED",
      "reason": "Revisión de rutina"
    }
  ]
}
```

### POST /appointments
Crear nueva cita.

**Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "date": "2025-11-10",
  "startTime": "09:00",
  "duration": 30,
  "type": "CONSULTATION",
  "reason": "Revisión de rutina",
  "notes": "Primera consulta"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2025-11-10",
    "startTime": "09:00",
    "endTime": "09:30",
    ...
  }
}
```

### POST /appointments/recurring
Crear cita recurrente.

**Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "startTime": "09:00",
  "duration": 30,
  "type": "TREATMENT",
  "reason": "Tratamiento de ortodoncia",
  "pattern": {
    "frequency": "WEEKLY",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "startDate": "2025-11-10",
    "endDate": "2025-12-31"
  }
}
```

### POST /appointments/check-availability
Validar disponibilidad de horario.

**Body:**
```json
{
  "doctorId": "uuid",
  "date": "2025-11-10",
  "startTime": "09:00",
  "duration": 30
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflicts": []
  }
}
```

### GET /appointments/available-slots
Obtener slots disponibles.

**Query params:**
- `doctorId` (required)
- `date` (required)
- `duration` (optional, default: 30)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "startTime": "09:00",
        "endTime": "09:30",
        "available": true
      },
      {
        "startTime": "09:30",
        "endTime": "10:00",
        "available": false,
        "appointmentId": "uuid"
      }
    ]
  }
}
```

---

## 🏥 Historia Clínica

### GET /medical/patients/:patientId/medical-history
Obtener historia médica del paciente.

### POST /medical/patients/:patientId/medical-history
Crear historia médica.

**Body:**
```json
{
  "bloodType": "O_POSITIVE",
  "allergies": ["Penicilina", "Látex"],
  "chronicDiseases": ["Hipertensión"],
  "previousSurgeries": ["Apendicectomía (2015)"],
  "currentMedications": ["Losartán 50mg"],
  "smokingHabit": "NEVER",
  "alcoholConsumption": "OCCASIONALLY"
}
```

### POST /medical/patients/:patientId/diagnoses
Crear diagnóstico con código CIE-10.

**Body:**
```json
{
  "cie10Code": "K02.1",
  "tooth": "16",
  "severity": "MODERATE",
  "notes": "Caries profunda en molar superior derecho"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cie10Code": "K02.1",
    "cie10Name": "Caries de la dentina",
    "tooth": "16",
    "severity": "MODERATE",
    "date": "2025-11-06"
  }
}
```

### POST /medical/patients/:patientId/treatments
Crear tratamiento.

**Body:**
```json
{
  "diagnosisId": "uuid",
  "catalogId": "uuid",
  "tooth": "16",
  "description": "Obturación con resina",
  "cost": 150.00,
  "paid": 50.00,
  "status": "IN_PROGRESS",
  "startDate": "2025-11-06"
}
```

### GET /medical/patients/:patientId/complete-history
Obtener historial completo del paciente.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "medicalHistory": {...},
    "diagnoses": [...],
    "treatments": [...],
    "treatmentPlans": [...]
  }
}
```

---

## 🦷 Odontogramas

### GET /odontograms/patients/:patientId/odontograms
Listar odontogramas del paciente.

**Query params:**
- `isCurrent` (boolean): Solo el actual

### GET /odontograms/patients/:patientId/odontograms/current
Obtener odontograma actual.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "date": "2025-11-06",
    "version": 1,
    "type": "PERMANENT",
    "isCurrent": true,
    "teeth": [
      {
        "id": "uuid",
        "toothNumber": "11",
        "status": "HEALTHY",
        "surfaces": {
          "O": { "status": "HEALTHY" },
          "M": { "status": "HEALTHY" }
        },
        "notes": null
      },
      {
        "toothNumber": "16",
        "status": "FILLED",
        "surfaces": {
          "O": { "status": "FILLED", "material": "Resina" }
        }
      }
    ]
  }
}
```

### POST /odontograms/patients/:patientId/odontograms
Crear odontograma.

**Body:**
```json
{
  "type": "PERMANENT",
  "generalNotes": "Primera revisión completa",
  "teeth": [
    {
      "toothNumber": "11",
      "status": "HEALTHY"
    },
    {
      "toothNumber": "16",
      "status": "CARIES",
      "surfaces": {
        "O": { "status": "CARIES" },
        "M": { "status": "HEALTHY" }
      },
      "notes": "Requiere tratamiento"
    }
  ]
}
```

### PATCH /odontograms/:id/teeth/:toothNumber
Actualizar diente específico (crea nueva versión).

**Body:**
```json
{
  "status": "FILLED",
  "surfaces": {
    "O": { "status": "FILLED", "material": "Resina compuesta" }
  },
  "notes": "Obturación realizada el 2025-11-06"
}
```

### GET /odontograms/:id/history
Obtener historial de versiones del odontograma.

### GET /odontograms/compare?v1=uuid1&v2=uuid2
Comparar dos versiones de odontograma.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "version1": {...},
    "version2": {...},
    "changes": [
      {
        "toothNumber": "16",
        "field": "status",
        "oldValue": "CARIES",
        "newValue": "FILLED"
      }
    ],
    "summary": {
      "totalChanges": 3,
      "statusChanges": 2,
      "surfaceChanges": 1
    }
  }
}
```

---

## 💰 Contabilidad

### GET /accounting/transactions
Listar transacciones.

**Query params:**
- `type` (INCOME | EXPENSE)
- `startDate` / `endDate`
- `patientId`

### POST /accounting/transactions
Crear transacción.

**Body:**
```json
{
  "type": "INCOME",
  "amount": 150.00,
  "description": "Pago consulta",
  "category": "Servicios odontológicos",
  "paymentMethod": "CASH",
  "patientId": "uuid"
}
```

### POST /accounting/patients/:patientId/payment-plans
Crear plan de pago.

**Body:**
```json
{
  "treatmentId": "uuid",
  "totalAmount": 500.00,
  "totalInstallments": 5,
  "firstDueDate": "2025-11-15",
  "frequency": "MONTHLY"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "totalAmount": 500.00,
    "paidAmount": 0.00,
    "balance": 500.00,
    "totalInstallments": 5,
    "status": "ACTIVE",
    "installments": [
      {
        "number": 1,
        "amount": 100.00,
        "dueDate": "2025-11-15",
        "status": "PENDING"
      },
      ...
    ]
  }
}
```

### POST /accounting/payment-plans/:id/record-payment
Registrar pago de cuota.

**Body:**
```json
{
  "amount": 100.00,
  "paymentMethod": "CARD"
}
```

### GET /accounting/reports/monthly?month=11&year=2025
Obtener balance mensual (solo admin).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "month": "2025-11",
    "totalIncome": 5000.00,
    "totalExpenses": 2000.00,
    "netIncome": 3000.00,
    "incomeSources": {
      "patientPayments": 4500.00,
      "otherIncome": 500.00
    },
    "expensesByCategory": {
      "SUPPLIES": 800.00,
      "SALARIES": 1000.00,
      "RENT": 200.00
    }
  }
}
```

### GET /accounting/reports/accounts-receivable
Obtener cuentas por cobrar.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "patient": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "totalDebt": 400.00,
      "overdueAmount": 200.00,
      "paymentPlans": [...],
      "daysOverdue": 15
    }
  ]
}
```

---

## 📝 Seguimiento

### GET /followups
Listar seguimientos.

**Query params:**
- `patientId` (string)
- `status` (PENDING | IN_PROGRESS | COMPLETED | CANCELLED)
- `priority` (LOW | MEDIUM | HIGH | URGENT)
- `dueDateFrom` / `dueDateTo`

### POST /followups
Crear seguimiento.

**Body:**
```json
{
  "patientId": "uuid",
  "title": "Control post-operatorio",
  "description": "Revisar evolución de tratamiento",
  "dueDate": "2025-11-15",
  "priority": "HIGH",
  "status": "PENDING"
}
```

### PATCH /followups/:id/complete
Marcar seguimiento como completado.

**Body:**
```json
{
  "notes": "Paciente evoluciona favorablemente"
}
```

### GET /followups/overdue
Obtener seguimientos vencidos.

### GET /followups/upcoming?days=7
Obtener seguimientos próximos.

### GET /followups/stats
Obtener estadísticas de seguimientos.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "byStatus": {
      "pending": 20,
      "in_progress": 10,
      "completed": 15,
      "cancelled": 5
    },
    "byPriority": {
      "low": 10,
      "medium": 20,
      "high": 15,
      "urgent": 5
    },
    "overdue": 8,
    "upcomingThisWeek": 12
  }
}
```

### POST /followups/patients/:patientId/notes
Agregar nota al paciente.

**Body:**
```json
{
  "content": "Paciente muestra interés en ortodoncia",
  "isPinned": false
}
```

---

## ⚠️ Códigos de Error

### 400 Bad Request
Datos de entrada inválidos o validación fallida.

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation error",
    "errors": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

### 401 Unauthorized
No autenticado o token inválido.

```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "message": "No autorizado. Token inválido o expirado."
  }
}
```

### 403 Forbidden
No tiene permisos para realizar la operación.

```json
{
  "success": false,
  "error": {
    "statusCode": 403,
    "message": "No tienes permisos para realizar esta acción"
  }
}
```

### 404 Not Found
Recurso no encontrado.

```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Paciente no encontrado"
  }
}
```

### 409 Conflict
Conflicto con el estado actual (ej: email duplicado).

```json
{
  "success": false,
  "error": {
    "statusCode": 409,
    "message": "El email ya está registrado"
  }
}
```

### 422 Unprocessable Entity
Entidad no procesable (validación de lógica de negocio).

```json
{
  "success": false,
  "error": {
    "statusCode": 422,
    "message": "El monto pagado no puede exceder el costo total"
  }
}
```

### 500 Internal Server Error
Error interno del servidor.

```json
{
  "success": false,
  "error": {
    "statusCode": 500,
    "message": "Error interno del servidor"
  }
}
```

---

## 🔒 Autenticación y Autorización

### Headers Requeridos

Todas las rutas protegidas requieren:
```
Authorization: Bearer {accessToken}
```

### Roles y Permisos

**Admin:**
- Acceso total a todo el sistema
- Puede eliminar registros
- Puede ver reportes financieros

**Doctor:**
- Puede crear/modificar citas, diagnósticos, tratamientos, odontogramas
- Puede ver información de pacientes
- No puede eliminar registros
- No puede ver reportes financieros completos

**Receptionist:**
- Puede registrar pacientes
- Puede crear/modificar citas
- Puede registrar pagos
- No puede ver/modificar información médica sensible
- No puede ver reportes financieros

---

## 📊 Paginación

Todas las rutas de listado soportan paginación:

**Query params:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalCount": 50,
    "hasMore": true
  }
}
```

---

## 🔍 Búsqueda y Filtros

### Búsqueda de texto
Usa el parámetro `search` para buscar en múltiples campos:
```
GET /patients?search=juan
```

### Filtros múltiples
Combina múltiples filtros:
```
GET /appointments?doctorId=uuid&status=SCHEDULED&date=2025-11-10
```

### Ordenamiento
```
GET /patients?sortBy=lastName&sortOrder=asc
```

---

## 🚀 Rate Limiting

**Límites por endpoint:**
- Login: 5 intentos por 15 minutos
- Register: 3 intentos por hora
- Password reset: 3 intentos por hora
- API general: 100 requests por 15 minutos

---

<div align="center">

**Documentación generada para Soldent API v1.0.0**

© 2025 Soldent. Todos los derechos reservados.

</div>
