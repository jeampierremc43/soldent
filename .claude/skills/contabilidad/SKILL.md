---
name: contabilidad-consultorio
description: Skill para gestión contable de consultorios odontológicos. Usa este skill para implementar control de ingresos/egresos, pagos de cuotas, facturación, y reportes financieros.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Skill: Contabilidad de Consultorio Odontológico

Este skill proporciona conocimiento para implementar el módulo de contabilidad.

## Estructura de datos

### Transacciones

```typescript
enum TransactionType {
  INCOME = 'income',           // Ingreso
  EXPENSE = 'expense',         // Egreso
}

enum PaymentMethod {
  CASH = 'cash',               // Efectivo
  CARD = 'card',               // Tarjeta
  TRANSFER = 'transfer',       // Transferencia
  CHECK = 'check',             // Cheque
}

interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  amount: number;              // Usar Decimal para precisión
  description: string;
  category: string;
  paymentMethod?: PaymentMethod;
  patientId?: string;          // Si es pago de paciente
  appointmentId?: string;      // Si está ligado a cita
  invoiceNumber?: string;
  createdBy: string;
  createdAt: Date;
}
```

### Pagos de pacientes

```typescript
interface PatientPayment {
  id: string;
  patientId: string;
  appointmentId?: string;
  treatmentId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: Date;
  concept: string;
  isPaid: boolean;
  balance: number;             // Saldo pendiente
  installment?: number;        // Número de cuota
  totalInstallments?: number;  // Total de cuotas
  notes?: string;
  receiptNumber?: string;
  createdBy: string;
}
```

### Planes de pago

```typescript
interface PaymentPlan {
  id: string;
  patientId: string;
  treatmentId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  installments: Installment[];
  startDate: Date;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: Date;
}

interface Installment {
  id: string;
  number: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentId?: string;
}
```

### Gastos operativos

```typescript
enum ExpenseCategory {
  SUPPLIES = 'supplies',           // Insumos
  EQUIPMENT = 'equipment',         // Equipamiento
  SALARIES = 'salaries',           // Salarios
  RENT = 'rent',                   // Alquiler
  UTILITIES = 'utilities',         // Servicios básicos
  MARKETING = 'marketing',         // Marketing
  MAINTENANCE = 'maintenance',     // Mantenimiento
  INSURANCE = 'insurance',         // Seguros
  TAXES = 'taxes',                 // Impuestos
  OTHER = 'other',                 // Otros
}

interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  description: string;
  supplier?: string;
  invoiceNumber?: string;
  paymentMethod: PaymentMethod;
  recurring: boolean;              // Si es gasto recurrente
  createdBy: string;
  createdAt: Date;
}
```

## Reportes financieros

### Balance mensual

```typescript
interface MonthlyBalance {
  month: string;               // "2025-01"
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeSources: {
    patientPayments: number;
    otherIncome: number;
  };
  expensesByCategory: Record<ExpenseCategory, number>;
}
```

### Flujo de caja

```typescript
interface CashFlow {
  period: { start: Date; end: Date };
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  closingBalance: number;
  transactions: Transaction[];
}
```

### Cuentas por cobrar

```typescript
interface AccountsReceivable {
  patientId: string;
  patientName: string;
  totalDebt: number;
  overdueAmount: number;
  paymentPlans: PaymentPlan[];
  lastPaymentDate?: Date;
  daysOverdue: number;
}
```

## Reglas de negocio

### Validaciones
1. ✓ Montos siempre positivos
2. ✓ Fechas no futuras (excepto cuotas programadas)
3. ✓ Balance de plan de pago = total - pagado
4. ✓ Cuotas vencidas cambian a 'overdue'
5. ✓ Total de cuotas suma el monto total
6. ✓ No permitir eliminar transacciones (soft delete)

### Cálculos
- Balance pendiente = Total tratamiento - Suma de pagos
- Cuota vencida = Fecha actual > Fecha vencimiento && status = 'pending'
- Interés por mora (opcional)
- Descuentos y promociones

### Notificaciones
- Recordatorio antes de vencimiento de cuota
- Alerta de cuota vencida
- Confirmación de pago recibido
- Resumen mensual automático

## Integración con otros módulos

- **Citas**: Registrar pago al completar cita
- **Tratamientos**: Crear plan de pago al aprobar presupuesto
- **Pacientes**: Ver historial de pagos en perfil
- **Reportes**: Exportar a PDF/Excel

## Consideraciones Ecuador

- Facturación electrónica SRI
- Retenciones (si aplica)
- IVA (12% en servicios de salud puede estar exento)
- Formato de cédula/RUC
- RISE (Régimen Simplificado)
