import { Router } from 'express';
import { accountingController } from '@controllers/accounting.controller';
import { authenticate, authorize } from '@middleware/auth';
import { validate } from '@middleware/validation';
import {
  createTransactionSchema,
  getTransactionsSchema,
  transactionIdSchema,
  createPatientPaymentSchema,
  paymentIdSchema,
  createPaymentPlanSchema,
  updatePaymentPlanSchema,
  recordPaymentSchema,
  paymentPlanIdSchema,
  createExpenseSchema,
  updateExpenseSchema,
  getExpensesSchema,
  expenseIdSchema,
  patientIdParamSchema,
  expenseCategoryParamSchema,
  monthlyBalanceSchema,
  cashFlowSchema,
} from '../types/accounting.types';

const router = Router();

/**
 * Accounting Routes
 * All routes require authentication
 * Base path: /api/v1/accounting
 */

// ============================================
// TRANSACTION ROUTES
// ============================================

/**
 * Get all transactions with filters and pagination
 * GET /transactions?type=INCOME&page=1&limit=10
 * Permissions: accounting:read
 */
router.get(
  '/transactions',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ query: getTransactionsSchema }),
  accountingController.getAllTransactions
);

/**
 * Create new transaction
 * POST /transactions
 * Permissions: accounting:create
 */
router.post(
  '/transactions',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({ body: createTransactionSchema }),
  accountingController.createTransaction
);

/**
 * Get transaction by ID
 * GET /transactions/:id
 * Permissions: accounting:read
 */
router.get(
  '/transactions/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: transactionIdSchema }),
  accountingController.getTransactionById
);

/**
 * Delete transaction (soft delete)
 * DELETE /transactions/:id
 * Permissions: accounting:delete (admin only)
 */
router.delete(
  '/transactions/:id',
  authenticate,
  authorize('admin'),
  validate({ params: transactionIdSchema }),
  accountingController.deleteTransaction
);

// ============================================
// PATIENT PAYMENT ROUTES
// ============================================

/**
 * Get payments by patient ID
 * GET /patients/:patientId/payments
 * Permissions: accounting:read
 */
router.get(
  '/patients/:patientId/payments',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdParamSchema }),
  accountingController.getPaymentsByPatientId
);

/**
 * Create patient payment
 * POST /patients/:patientId/payments
 * Permissions: accounting:create
 */
router.post(
  '/patients/:patientId/payments',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({
    params: patientIdParamSchema,
    body: createPatientPaymentSchema,
  }),
  accountingController.createPatientPayment
);

/**
 * Get payment by ID
 * GET /payments/:id
 * Permissions: accounting:read
 */
router.get(
  '/payments/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: paymentIdSchema }),
  accountingController.getPaymentById
);

// ============================================
// PAYMENT PLAN ROUTES
// ============================================

/**
 * Get payment plans by patient ID
 * GET /patients/:patientId/payment-plans
 * Permissions: accounting:read
 */
router.get(
  '/patients/:patientId/payment-plans',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdParamSchema }),
  accountingController.getPaymentPlansByPatientId
);

/**
 * Create payment plan
 * POST /patients/:patientId/payment-plans
 * Permissions: accounting:create
 */
router.post(
  '/patients/:patientId/payment-plans',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({
    params: patientIdParamSchema,
    body: createPaymentPlanSchema,
  }),
  accountingController.createPaymentPlan
);

/**
 * Get payment plan by ID
 * GET /payment-plans/:id
 * Permissions: accounting:read
 */
router.get(
  '/payment-plans/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: paymentPlanIdSchema }),
  accountingController.getPaymentPlanById
);

/**
 * Update payment plan
 * PUT /payment-plans/:id
 * Permissions: accounting:update
 */
router.put(
  '/payment-plans/:id',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({
    params: paymentPlanIdSchema,
    body: updatePaymentPlanSchema,
  }),
  accountingController.updatePaymentPlan
);

/**
 * Record payment for payment plan
 * POST /payment-plans/:id/record-payment
 * Permissions: accounting:create
 */
router.post(
  '/payment-plans/:id/record-payment',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({
    params: paymentPlanIdSchema,
    body: recordPaymentSchema,
  }),
  accountingController.recordPayment
);

/**
 * Get installments for payment plan
 * GET /payment-plans/:id/installments
 * Permissions: accounting:read
 */
router.get(
  '/payment-plans/:id/installments',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: paymentPlanIdSchema }),
  accountingController.getInstallments
);

/**
 * Get overdue installments
 * GET /installments/overdue
 * Permissions: accounting:read
 */
router.get(
  '/installments/overdue',
  authenticate,
  authorize('admin', 'receptionist'),
  accountingController.getOverdueInstallments
);

// ============================================
// EXPENSE ROUTES
// ============================================

/**
 * Get all expenses with filters and pagination
 * GET /expenses?category=SUPPLIES&page=1&limit=10
 * Permissions: accounting:read
 */
router.get(
  '/expenses',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({ query: getExpensesSchema }),
  accountingController.getAllExpenses
);

/**
 * Create expense
 * POST /expenses
 * Permissions: accounting:create
 */
router.post(
  '/expenses',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({ body: createExpenseSchema }),
  accountingController.createExpense
);

/**
 * Get expense by ID
 * GET /expenses/:id
 * Permissions: accounting:read
 */
router.get(
  '/expenses/:id',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({ params: expenseIdSchema }),
  accountingController.getExpenseById
);

/**
 * Update expense
 * PUT /expenses/:id
 * Permissions: accounting:update
 */
router.put(
  '/expenses/:id',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({
    params: expenseIdSchema,
    body: updateExpenseSchema,
  }),
  accountingController.updateExpense
);

/**
 * Delete expense (soft delete)
 * DELETE /expenses/:id
 * Permissions: accounting:delete (admin only)
 */
router.delete(
  '/expenses/:id',
  authenticate,
  authorize('admin'),
  validate({ params: expenseIdSchema }),
  accountingController.deleteExpense
);

/**
 * Get expenses by category
 * GET /expenses/by-category/:category
 * Permissions: accounting:read
 */
router.get(
  '/expenses/by-category/:category',
  authenticate,
  authorize('admin', 'receptionist'),
  validate({ params: expenseCategoryParamSchema }),
  accountingController.getExpensesByCategory
);

// ============================================
// REPORT ROUTES (Admin only)
// ============================================

/**
 * Get monthly balance report
 * GET /reports/monthly?month=1&year=2025
 * Permissions: admin only
 */
router.get(
  '/reports/monthly',
  authenticate,
  authorize('admin'),
  validate({ query: monthlyBalanceSchema }),
  accountingController.getMonthlyBalance
);

/**
 * Get cash flow report
 * GET /reports/cash-flow?startDate=...&endDate=...
 * Permissions: admin only
 */
router.get(
  '/reports/cash-flow',
  authenticate,
  authorize('admin'),
  validate({ query: cashFlowSchema }),
  accountingController.getCashFlow
);

/**
 * Get accounts receivable report
 * GET /reports/accounts-receivable
 * Permissions: admin only
 */
router.get(
  '/reports/accounts-receivable',
  authenticate,
  authorize('admin'),
  accountingController.getAccountsReceivable
);

/**
 * Get income by treatment report
 * GET /reports/income-by-treatment
 * Permissions: admin only
 */
router.get(
  '/reports/income-by-treatment',
  authenticate,
  authorize('admin'),
  accountingController.getIncomeByTreatment
);

/**
 * Get financial summary report
 * GET /reports/financial?month=1&year=2025
 * Permissions: admin only
 */
router.get(
  '/reports/financial',
  authenticate,
  authorize('admin'),
  validate({ query: monthlyBalanceSchema }),
  accountingController.getFinancialReport
);

export default router;
