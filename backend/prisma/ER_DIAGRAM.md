# Diagrama Entidad-Relación - Soldent

Este documento contiene el diagrama ER del esquema de base de datos.

## Diagrama ER Completo

```mermaid
erDiagram
    %% ========================================
    %% USUARIOS Y AUTENTICACIÓN
    %% ========================================

    User ||--o{ Appointment : "schedules"
    User ||--o{ WorkSchedule : "has"
    User ||--o{ BlockedTime : "has"
    User ||--o{ Diagnosis : "creates"
    User ||--o{ Treatment : "performs"
    User ||--o{ Note : "writes"
    User ||--o{ Transaction : "creates"
    User }o--|| Role : "has"

    Role ||--o{ User : "assigned_to"
    Role }o--o{ Permission : "has"

    %% ========================================
    %% PACIENTES
    %% ========================================

    Patient ||--o{ EmergencyContact : "has"
    Patient ||--o{ MedicalHistory : "has"
    Patient ||--o{ Odontogram : "has"
    Patient ||--o{ Diagnosis : "receives"
    Patient ||--o{ Treatment : "receives"
    Patient ||--o{ TreatmentPlan : "has"
    Patient ||--o{ Appointment : "schedules"
    Patient ||--o{ FollowUp : "has"
    Patient ||--o{ Note : "about"
    Patient ||--o{ PatientPayment : "makes"
    Patient ||--o{ PaymentPlan : "has"

    %% ========================================
    %% HISTORIA CLÍNICA
    %% ========================================

    Odontogram ||--o{ Tooth : "contains"

    Diagnosis }o--|| CIE10Code : "uses"
    Diagnosis ||--o{ Treatment : "requires"

    Treatment }o--|| TreatmentCatalog : "based_on"
    Treatment }o--o| Appointment : "scheduled_in"
    Treatment ||--o{ PatientPayment : "paid_by"
    Treatment ||--o{ PaymentPlan : "has"

    %% ========================================
    %% AGENDAMIENTO
    %% ========================================

    RecurringAppointment ||--o{ Appointment : "generates"

    %% ========================================
    %% CONTABILIDAD
    %% ========================================

    PaymentPlan ||--o{ Installment : "has"
    Installment ||--o{ PatientPayment : "paid_with"

    %% ========================================
    %% DEFINICIONES DE ENTIDADES
    %% ========================================

    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string phone
        string avatar
        boolean isActive
        string roleId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Role {
        string id PK
        string name UK
        string description
        datetime createdAt
        datetime updatedAt
    }

    Permission {
        string id PK
        string resource
        string action
        string description
        datetime createdAt
        datetime updatedAt
    }

    Patient {
        string id PK
        string firstName
        string lastName
        datetime dateOfBirth
        enum gender
        string identification UK
        enum identificationType
        string phone
        string email
        string address
        string city
        string province
        boolean hasInsurance
        string insuranceProvider
        string insuranceNumber
        string occupation
        enum maritalStatus
        enum bloodType
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    EmergencyContact {
        string id PK
        string patientId FK
        string name
        string relationship
        string phone
        string phone2
        datetime createdAt
        datetime updatedAt
    }

    MedicalHistory {
        string id PK
        string patientId FK
        string allergies
        string chronicDiseases
        string currentMedications
        string previousSurgeries
        string familyHistory
        datetime lastDentalVisit
        int brushingFrequency
        boolean usesFloss
        boolean usesMouthwash
        enum smokingHabit
        enum alcoholConsumption
        boolean bruxism
        boolean nailBiting
        boolean isPregnant
        int gestationWeeks
        string notes
        datetime createdAt
        datetime updatedAt
    }

    Diagnosis {
        string id PK
        string patientId FK
        string doctorId FK
        datetime date
        string cie10Code FK
        string cie10Name
        string toothNumber
        string description
        enum severity
        datetime createdAt
        datetime updatedAt
    }

    Odontogram {
        string id PK
        string patientId FK
        datetime date
        int version
        enum type
        string generalNotes
        boolean isCurrent
        datetime createdAt
        datetime updatedAt
    }

    Tooth {
        string id PK
        string odontogramId FK
        string toothNumber
        enum status
        string surfaces
        string notes
        datetime createdAt
        datetime updatedAt
    }

    Treatment {
        string id PK
        string patientId FK
        string doctorId FK
        string diagnosisId FK
        string appointmentId FK
        string catalogId FK
        string toothNumber
        string description
        enum status
        decimal cost
        decimal paid
        decimal balance
        datetime plannedDate
        datetime completedDate
        string notes
        datetime createdAt
        datetime updatedAt
    }

    TreatmentPlan {
        string id PK
        string patientId FK
        string title
        string description
        decimal totalCost
        enum status
        string pdfUrl
        datetime approvedAt
        datetime createdAt
        datetime updatedAt
    }

    Appointment {
        string id PK
        string patientId FK
        string doctorId FK
        datetime date
        string startTime
        string endTime
        int duration
        enum type
        enum status
        string reason
        string notes
        string recurringAppointmentId FK
        boolean reminderSent
        datetime reminderSentAt
        string color
        datetime createdAt
        datetime updatedAt
    }

    RecurringAppointment {
        string id PK
        string patientId FK
        string doctorId FK
        string startTime
        int duration
        enum type
        string reason
        enum frequency
        int interval
        string daysOfWeek
        datetime startDate
        datetime endDate
        int occurrences
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    WorkSchedule {
        string id PK
        string doctorId FK
        int dayOfWeek
        string startTime
        string endTime
        string breakStart
        string breakEnd
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    BlockedTime {
        string id PK
        string doctorId FK
        datetime date
        string startTime
        string endTime
        string reason
        datetime createdAt
        datetime updatedAt
    }

    FollowUp {
        string id PK
        string patientId FK
        string title
        string description
        datetime dueDate
        enum status
        enum priority
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    Note {
        string id PK
        string patientId FK
        string authorId FK
        string title
        string content
        boolean isPinned
        datetime createdAt
        datetime updatedAt
    }

    Transaction {
        string id PK
        datetime date
        enum type
        decimal amount
        string description
        string category
        enum paymentMethod
        string patientId FK
        string appointmentId FK
        string invoiceNumber
        string createdBy FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    PatientPayment {
        string id PK
        string patientId FK
        string treatmentId FK
        string appointmentId FK
        decimal amount
        enum paymentMethod
        datetime date
        string concept
        boolean isPaid
        decimal balance
        string installmentId FK
        string notes
        string receiptNumber
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }

    PaymentPlan {
        string id PK
        string patientId FK
        string treatmentId FK
        decimal totalAmount
        decimal paidAmount
        decimal balance
        datetime startDate
        enum status
        datetime createdAt
        datetime updatedAt
    }

    Installment {
        string id PK
        string paymentPlanId FK
        int number
        decimal amount
        datetime dueDate
        datetime paidDate
        enum status
        datetime createdAt
        datetime updatedAt
    }

    Expense {
        string id PK
        datetime date
        decimal amount
        enum category
        string description
        string supplier
        string invoiceNumber
        enum paymentMethod
        boolean recurring
        string createdBy FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    CIE10Code {
        string code PK
        string name
        string category
        string chapter
        string description
        datetime createdAt
        datetime updatedAt
    }

    TreatmentCatalog {
        string id PK
        string code UK
        string name
        string description
        string category
        decimal baseCost
        int duration
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
```

## Diagrama por Módulos

### Módulo de Usuarios

```mermaid
erDiagram
    User }o--|| Role : "has"
    Role }o--o{ Permission : "has"

    User {
        string id PK
        string email UK
        string roleId FK
    }

    Role {
        string id PK
        string name UK
    }

    Permission {
        string id PK
        string resource
        string action
    }
```

### Módulo de Pacientes

```mermaid
erDiagram
    Patient ||--o{ EmergencyContact : "has"
    Patient ||--o{ MedicalHistory : "has"

    Patient {
        string id PK
        string identification UK
        string firstName
        string lastName
        datetime dateOfBirth
    }

    EmergencyContact {
        string id PK
        string patientId FK
        string name
        string phone
    }

    MedicalHistory {
        string id PK
        string patientId FK
        string allergies
        string chronicDiseases
    }
```

### Módulo de Historia Clínica

```mermaid
erDiagram
    Patient ||--o{ Odontogram : "has"
    Patient ||--o{ Diagnosis : "receives"
    Odontogram ||--o{ Tooth : "contains"
    Diagnosis }o--|| CIE10Code : "uses"
    Diagnosis ||--o{ Treatment : "requires"
    Treatment }o--|| TreatmentCatalog : "based_on"

    Odontogram {
        string id PK
        string patientId FK
        int version
        boolean isCurrent
    }

    Tooth {
        string id PK
        string odontogramId FK
        string toothNumber
        enum status
    }

    Diagnosis {
        string id PK
        string patientId FK
        string cie10Code FK
    }

    Treatment {
        string id PK
        string patientId FK
        string catalogId FK
        decimal cost
    }
```

### Módulo de Citas

```mermaid
erDiagram
    Patient ||--o{ Appointment : "schedules"
    User ||--o{ Appointment : "attends"
    User ||--o{ WorkSchedule : "has"
    User ||--o{ BlockedTime : "has"
    RecurringAppointment ||--o{ Appointment : "generates"

    Appointment {
        string id PK
        string patientId FK
        string doctorId FK
        datetime date
        string startTime
        enum status
    }

    WorkSchedule {
        string id PK
        string doctorId FK
        int dayOfWeek
        string startTime
        string endTime
    }

    BlockedTime {
        string id PK
        string doctorId FK
        datetime date
    }
```

### Módulo de Contabilidad

```mermaid
erDiagram
    Patient ||--o{ PaymentPlan : "has"
    Treatment ||--o{ PaymentPlan : "has"
    PaymentPlan ||--o{ Installment : "has"
    Installment ||--o{ PatientPayment : "paid_with"
    Patient ||--o{ PatientPayment : "makes"

    PaymentPlan {
        string id PK
        string patientId FK
        string treatmentId FK
        decimal totalAmount
        decimal balance
    }

    Installment {
        string id PK
        string paymentPlanId FK
        int number
        decimal amount
        datetime dueDate
        enum status
    }

    PatientPayment {
        string id PK
        string patientId FK
        decimal amount
        enum paymentMethod
    }

    Expense {
        string id PK
        decimal amount
        enum category
    }
```

## Índices Principales

### Por Performance

```sql
-- Búsqueda de pacientes
CREATE INDEX idx_patients_identification ON patients(identification);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_phone ON patients(phone);

-- Agenda de citas
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Diagnósticos
CREATE INDEX idx_diagnoses_cie10 ON diagnoses(cie10_code);
CREATE INDEX idx_diagnoses_date ON diagnoses(date);

-- Contabilidad
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status ON installments(status);
```

### Unique Constraints

```sql
-- No duplicar identificación
UNIQUE(identification) ON patients

-- No duplicar email
UNIQUE(email) ON users

-- No duplicar código de tratamiento
UNIQUE(code) ON treatment_catalog

-- Solo un odontograma actual por paciente
UNIQUE(patient_id, is_current=true) ON odontograms (parcial)

-- No duplicar permisos
UNIQUE(resource, action) ON permissions
```

## Relaciones Cascade

### OnDelete: Cascade

Cuando se elimina el padre, se eliminan los hijos:

```
Patient → EmergencyContact
Patient → MedicalHistory
Patient → Odontogram
Patient → PaymentPlan
Odontogram → Tooth
PaymentPlan → Installment
User → WorkSchedule
User → BlockedTime
```

### OnDelete: Restrict (default)

No se puede eliminar si tiene hijos:

```
User (con Appointments)
TreatmentCatalog (con Treatments)
CIE10Code (con Diagnoses)
```

## Cardinalidades

### Uno a Muchos (1:N)

```
Patient → Appointments (un paciente, muchas citas)
User → Appointments (un doctor, muchas citas)
Patient → Odontograms (un paciente, muchos odontogramas)
Odontogram → Teeth (un odontograma, muchos dientes)
PaymentPlan → Installments (un plan, muchas cuotas)
```

### Muchos a Muchos (N:M)

```
Role ←→ Permission (a través de tabla implícita)
```

### Uno a Uno (1:1)

```
(Ninguna relación estrictamente 1:1 en este esquema)
```

## Soft Delete

Tablas con eliminación lógica (`deleted_at`):

- `users`
- `patients`
- `transactions`
- `expenses`

Query pattern:
```typescript
where: { deletedAt: null }
```

## Versionado

Tablas con versionado:

- `odontograms` (campo `version`, `is_current`)

Pattern:
```typescript
// Al actualizar, crear nueva versión
1. SET is_current = false WHERE id = current_id
2. INSERT new version WITH version = current_version + 1, is_current = true
```
