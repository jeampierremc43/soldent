import { z } from 'zod';
// import { commonSchemas } from '@middleware/validation';
import {
  TransactionType,
  PaymentMethod,
  PaymentPlanStatus,
  // InstallmentStatus,
  ExpenseCategory,
} from '@prisma/client';

/**
 * ============================================
 * CUSTOM VALIDATION FUNCTIONS
 * ============================================
 */

/**
 * Validates positive decimal amounts
 */
const positiveDecimalSchema = z
  .string()
  .or(z.number())
  .refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Amount must be a positive number' }
  )
  .transform((val) => (typeof val === 'string' ? parseFloat(val) : val));

/**
 * Validates non-negative decimal amounts
 * Currently unused but kept for future use
 */
// const _nonNegativeDecimalSchema = z
//   .string()
//   .or(z.number())
//   .refine(
//     (val) => {
//       const num = typeof val === 'string' ? parseFloat(val) : val;
//       return !isNaN(num) && num >= 0;
//     },
//     { message: 'Amount must be a non-negative number' }
//   )
//   .transform((val) => (typeof val === 'string' ? parseFloat(val) : val));

/**
 * ============================================
 * ZOD VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Transaction schemas
 */
export const createTransactionSchema = z.object({
  date: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }),
  amount: positiveDecimalSchema,
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must not exceed 500 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must not exceed 100 characters'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
});

export const getTransactionsSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().optional(),
  patientId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

/**
 * Patient Payment schemas
 */
export const createPatientPaymentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  treatmentId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  amount: positiveDecimalSchema,
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  date: z.string().datetime().optional(),
  concept: z
    .string()
    .min(3, 'Concept must be at least 3 characters')
    .max(200, 'Concept must not exceed 200 characters'),
  installmentId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  receiptNumber: z.string().max(50).optional(),
});

/**
 * Payment Plan schemas
 */
export const createPaymentPlanSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  treatmentId: z.string().uuid('Invalid treatment ID'),
  totalAmount: positiveDecimalSchema,
  totalInstallments: z
    .number()
    .int()
    .positive()
    .min(1, 'Must have at least 1 installment')
    .max(60, 'Cannot exceed 60 installments'),
  startDate: z.string().datetime().optional(),
  firstDueDate: z.string().datetime(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('MONTHLY'),
});

export const updatePaymentPlanSchema = z.object({
  status: z.nativeEnum(PaymentPlanStatus).optional(),
});

export const recordPaymentSchema = z.object({
  amount: positiveDecimalSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  receiptNumber: z.string().max(50).optional(),
});

/**
 * Expense schemas
 */
export const createExpenseSchema = z.object({
  date: z.string().datetime().optional(),
  amount: positiveDecimalSchema,
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must not exceed 500 characters'),
  supplier: z.string().max(200).optional(),
  invoiceNumber: z.string().max(50).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  recurring: z.boolean().default(false),
});

export const updateExpenseSchema = z.object({
  date: z.string().datetime().optional(),
  amount: positiveDecimalSchema.optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  description: z.string().min(3).max(500).optional(),
  supplier: z.string().max(200).optional(),
  invoiceNumber: z.string().max(50).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  recurring: z.boolean().optional(),
});

export const getExpensesSchema = z.object({
  category: z.nativeEnum(ExpenseCategory).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  recurring: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

/**
 * Report schemas
 */
export const monthlyBalanceSchema = z.object({
  month: z.string().transform(Number).pipe(z.number().int().min(1).max(12)),
  year: z.string().transform(Number).pipe(z.number().int().min(2000).max(2100)),
});

export const cashFlowSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

/**
 * ID parameter schemas
 */
export const transactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
});

export const paymentIdSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

export const paymentPlanIdSchema = z.object({
  id: z.string().uuid('Invalid payment plan ID'),
});

export const expenseIdSchema = z.object({
  id: z.string().uuid('Invalid expense ID'),
});

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
});

export const expenseCategoryParamSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
});

/**
 * ============================================
 * TYPESCRIPT INTERFACES
 * ============================================
 */

/**
 * Transaction interfaces
 */
export interface CreateTransactionData {
  date?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  paymentMethod?: PaymentMethod;
  patientId?: string;
  appointmentId?: string;
  invoiceNumber?: string;
  createdBy: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionListOptions {
  filters?: TransactionFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Patient Payment interfaces
 */
export interface CreatePatientPaymentData {
  patientId: string;
  treatmentId?: string;
  appointmentId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date?: string;
  concept: string;
  installmentId?: string;
  notes?: string;
  receiptNumber?: string;
  createdBy: string;
}

/**
 * Payment Plan interfaces
 */
export interface CreatePaymentPlanData {
  patientId: string;
  treatmentId: string;
  totalAmount: number;
  totalInstallments: number;
  startDate?: string;
  firstDueDate: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

export interface UpdatePaymentPlanData {
  status?: PaymentPlanStatus;
}

export interface RecordPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  date?: string;
  notes?: string;
  receiptNumber?: string;
  createdBy: string;
}

export interface InstallmentCalculation {
  number: number;
  amount: number;
  dueDate: Date;
}

/**
 * Expense interfaces
 */
export interface CreateExpenseData {
  date?: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  supplier?: string;
  invoiceNumber?: string;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  createdBy: string;
}

export interface UpdateExpenseData {
  date?: string;
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  supplier?: string;
  invoiceNumber?: string;
  paymentMethod?: PaymentMethod;
  recurring?: boolean;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  recurring?: boolean;
}

export interface ExpenseListOptions {
  filters?: ExpenseFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Financial Report interfaces
 */
export interface MonthlyBalance {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeSources: {
    patientPayments: number;
    otherIncome: number;
  };
  expensesByCategory: Record<string, number>;
}

export interface CashFlow {
  period: {
    start: Date;
    end: Date;
  };
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  closingBalance: number;
  transactions: any[];
}

export interface AccountsReceivable {
  patientId: string;
  patientName: string;
  totalDebt: number;
  overdueAmount: number;
  paymentPlans: any[];
  lastPaymentDate?: Date;
  daysOverdue: number;
}

export interface IncomeByTreatment {
  treatmentName: string;
  treatmentCode: string;
  totalIncome: number;
  numberOfTreatments: number;
  averagePrice: number;
}

/**
 * Paginated responses
 */
export interface PaginatedTransactionResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface PaginatedExpenseResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * ============================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ============================================
 */

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type GetTransactionsDTO = z.infer<typeof getTransactionsSchema>;
export type TransactionIdDTO = z.infer<typeof transactionIdSchema>;

export type CreatePatientPaymentDTO = z.infer<typeof createPatientPaymentSchema>;
export type PaymentIdDTO = z.infer<typeof paymentIdSchema>;

export type CreatePaymentPlanDTO = z.infer<typeof createPaymentPlanSchema>;
export type UpdatePaymentPlanDTO = z.infer<typeof updatePaymentPlanSchema>;
export type RecordPaymentDTO = z.infer<typeof recordPaymentSchema>;
export type PaymentPlanIdDTO = z.infer<typeof paymentPlanIdSchema>;

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
export type GetExpensesDTO = z.infer<typeof getExpensesSchema>;
export type ExpenseIdDTO = z.infer<typeof expenseIdSchema>;

export type MonthlyBalanceDTO = z.infer<typeof monthlyBalanceSchema>;
export type CashFlowDTO = z.infer<typeof cashFlowSchema>;
export type PatientIdParamDTO = z.infer<typeof patientIdParamSchema>;
export type ExpenseCategoryParamDTO = z.infer<typeof expenseCategoryParamSchema>;
