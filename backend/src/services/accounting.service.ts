import { ApiError } from '@utils/ApiError';
import logger from '@utils/logger';
import { accountingRepository } from '@repositories/accounting.repository';
import { prisma } from '@config/database';
import { TransactionType, InstallmentStatus } from '@prisma/client';
import type {
  CreateTransactionData,
  TransactionListOptions,
  PaginatedTransactionResponse,
  CreatePatientPaymentData,
  CreatePaymentPlanData,
  UpdatePaymentPlanData,
  RecordPaymentData,
  InstallmentCalculation,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseListOptions,
  PaginatedExpenseResponse,
  MonthlyBalance,
  CashFlow,
  AccountsReceivable,
  IncomeByTreatment,
} from '../types/accounting.types';

/**
 * Accounting Service
 * Handles all business logic related to accounting
 */
export class AccountingService {
  // ============================================
  // TRANSACTION METHODS
  // ============================================

  /**
   * Get all transactions with optional filters and pagination
   */
  async getAllTransactions(
    options: TransactionListOptions = {}
  ): Promise<PaginatedTransactionResponse> {
    try {
      return await accountingRepository.findAllTransactions(options);
    } catch (error) {
      logger.error('Error fetching transactions', error);
      throw ApiError.internal('Failed to fetch transactions');
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    const transaction = await accountingRepository.findTransactionById(id);

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    return transaction;
  }

  /**
   * Create new transaction
   */
  async createTransaction(data: CreateTransactionData) {
    // Validate amount is positive
    if (data.amount <= 0) {
      throw ApiError.badRequest('Amount must be positive');
    }

    // Validate patient exists if patientId provided
    if (data.patientId) {
      const patient = await prisma.patient.findFirst({
        where: { id: data.patientId, deletedAt: null },
      });

      if (!patient) {
        throw ApiError.notFound('Patient not found');
      }
    }

    try {
      const transaction = await accountingRepository.createTransaction(data);

      logger.info('Transaction created successfully', {
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
      });

      return transaction;
    } catch (error) {
      logger.error('Error creating transaction', error);
      throw ApiError.internal('Failed to create transaction');
    }
  }

  /**
   * Delete transaction (soft delete)
   */
  async deleteTransaction(id: string) {
    const transaction = await accountingRepository.findTransactionById(id);

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    try {
      await accountingRepository.softDeleteTransaction(id);

      logger.info('Transaction deleted successfully', {
        transactionId: id,
      });

      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      logger.error('Error deleting transaction', error);
      throw ApiError.internal('Failed to delete transaction');
    }
  }

  // ============================================
  // PATIENT PAYMENT METHODS
  // ============================================

  /**
   * Get payments by patient ID
   */
  async getPaymentsByPatientId(patientId: string) {
    // Validate patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await accountingRepository.findPaymentsByPatientId(patientId);
    } catch (error) {
      logger.error('Error fetching patient payments', error);
      throw ApiError.internal('Failed to fetch patient payments');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string) {
    const payment = await accountingRepository.findPaymentById(id);

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    return payment;
  }

  /**
   * Create patient payment
   */
  async createPatientPayment(data: CreatePatientPaymentData) {
    // Validate amount is positive
    if (data.amount <= 0) {
      throw ApiError.badRequest('Amount must be positive');
    }

    // Validate patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, deletedAt: null },
    });

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    // Validate treatment exists if provided
    if (data.treatmentId) {
      const treatment = await prisma.treatment.findUnique({
        where: { id: data.treatmentId },
      });

      if (!treatment) {
        throw ApiError.notFound('Treatment not found');
      }

      // Update treatment balance
      const newBalance = Number(treatment.balance) - data.amount;
      const newPaid = Number(treatment.paid) + data.amount;

      await prisma.treatment.update({
        where: { id: data.treatmentId },
        data: {
          paid: newPaid,
          balance: Math.max(0, newBalance),
        },
      });
    }

    try {
      const payment = await accountingRepository.createPatientPayment(data);

      // Create income transaction
      await accountingRepository.createTransaction({
        type: TransactionType.INCOME,
        amount: data.amount,
        description: `Payment: ${data.concept}`,
        category: 'Patient Payment',
        paymentMethod: data.paymentMethod,
        patientId: data.patientId,
        createdBy: data.createdBy,
        date: data.date,
      });

      logger.info('Patient payment created successfully', {
        paymentId: payment.id,
        patientId: data.patientId,
        amount: data.amount,
      });

      return payment;
    } catch (error) {
      logger.error('Error creating patient payment', error);
      throw ApiError.internal('Failed to create patient payment');
    }
  }

  // ============================================
  // PAYMENT PLAN METHODS
  // ============================================

  /**
   * Calculate installments for payment plan
   */
  private calculateInstallments(
    totalAmount: number,
    totalInstallments: number,
    firstDueDate: Date,
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  ): InstallmentCalculation[] {
    const installments: InstallmentCalculation[] = [];
    const baseAmount = Math.floor((totalAmount * 100) / totalInstallments) / 100;
    let remainingAmount = totalAmount;

    // Calculate interval in days
    const intervalDays =
      frequency === 'WEEKLY' ? 7 : frequency === 'BIWEEKLY' ? 14 : 30;

    for (let i = 1; i <= totalInstallments; i++) {
      let amount: number;

      // Last installment gets the remaining balance to ensure exact total
      if (i === totalInstallments) {
        amount = remainingAmount;
      } else {
        amount = baseAmount;
        remainingAmount -= baseAmount;
      }

      // Calculate due date
      const dueDate = new Date(firstDueDate);
      dueDate.setDate(dueDate.getDate() + (i - 1) * intervalDays);

      installments.push({
        number: i,
        amount,
        dueDate,
      });
    }

    return installments;
  }

  /**
   * Create payment plan
   */
  async createPaymentPlan(data: CreatePaymentPlanData) {
    // Validate amount is positive
    if (data.totalAmount <= 0) {
      throw ApiError.badRequest('Total amount must be positive');
    }

    // Validate installments
    if (data.totalInstallments < 1 || data.totalInstallments > 60) {
      throw ApiError.badRequest('Total installments must be between 1 and 60');
    }

    // Validate patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, deletedAt: null },
    });

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    // Validate treatment exists
    const treatment = await prisma.treatment.findUnique({
      where: { id: data.treatmentId },
    });

    if (!treatment) {
      throw ApiError.notFound('Treatment not found');
    }

    // Validate first due date is not in the past
    const firstDueDate = new Date(data.firstDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (firstDueDate < today) {
      throw ApiError.badRequest('First due date cannot be in the past');
    }

    try {
      // Calculate installments
      const installments = this.calculateInstallments(
        data.totalAmount,
        data.totalInstallments,
        firstDueDate,
        data.frequency
      );

      // Verify installments sum equals total amount
      const installmentsSum = installments.reduce(
        (sum, inst) => sum + inst.amount,
        0
      );

      if (Math.abs(installmentsSum - data.totalAmount) > 0.01) {
        throw ApiError.internal('Installments calculation error');
      }

      // Create payment plan with installments
      const paymentPlan = await accountingRepository.createPaymentPlan(
        data,
        installments
      );

      logger.info('Payment plan created successfully', {
        paymentPlanId: paymentPlan.id,
        patientId: data.patientId,
        totalAmount: data.totalAmount,
        installments: data.totalInstallments,
      });

      return paymentPlan;
    } catch (error) {
      logger.error('Error creating payment plan', error);
      throw ApiError.internal('Failed to create payment plan');
    }
  }

  /**
   * Get payment plans by patient ID
   */
  async getPaymentPlansByPatientId(patientId: string) {
    // Validate patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await accountingRepository.findPaymentPlansByPatientId(patientId);
    } catch (error) {
      logger.error('Error fetching payment plans', error);
      throw ApiError.internal('Failed to fetch payment plans');
    }
  }

  /**
   * Get payment plan by ID
   */
  async getPaymentPlanById(id: string) {
    const paymentPlan = await accountingRepository.findPaymentPlanById(id);

    if (!paymentPlan) {
      throw ApiError.notFound('Payment plan not found');
    }

    return paymentPlan;
  }

  /**
   * Update payment plan
   */
  async updatePaymentPlan(id: string, data: UpdatePaymentPlanData) {
    const paymentPlan = await accountingRepository.findPaymentPlanById(id);

    if (!paymentPlan) {
      throw ApiError.notFound('Payment plan not found');
    }

    try {
      const updated = await accountingRepository.updatePaymentPlan(id, data);

      logger.info('Payment plan updated successfully', {
        paymentPlanId: id,
      });

      return updated;
    } catch (error) {
      logger.error('Error updating payment plan', error);
      throw ApiError.internal('Failed to update payment plan');
    }
  }

  /**
   * Record payment for payment plan
   */
  async recordPayment(paymentPlanId: string, paymentData: RecordPaymentData) {
    // Validate amount is positive
    if (paymentData.amount <= 0) {
      throw ApiError.badRequest('Payment amount must be positive');
    }

    // Get payment plan
    const paymentPlan = await accountingRepository.findPaymentPlanById(
      paymentPlanId
    );

    if (!paymentPlan) {
      throw ApiError.notFound('Payment plan not found');
    }

    // Validate payment does not exceed balance
    if (paymentData.amount > Number(paymentPlan.balance)) {
      throw ApiError.badRequest(
        `Payment amount ($${paymentData.amount}) exceeds remaining balance ($${paymentPlan.balance})`
      );
    }

    // Get next pending installment
    const nextInstallment =
      await accountingRepository.getNextPendingInstallment(paymentPlanId);

    if (!nextInstallment) {
      throw ApiError.badRequest('No pending installments found');
    }

    try {
      // Create patient payment
      const payment = await accountingRepository.createPatientPayment({
        patientId: paymentPlan.patientId,
        treatmentId: paymentPlan.treatmentId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        date: paymentData.date,
        concept: `Payment for installment #${nextInstallment.number}`,
        installmentId: nextInstallment.id,
        notes: paymentData.notes,
        receiptNumber: paymentData.receiptNumber,
        createdBy: paymentData.createdBy,
      });

      // Mark installment as paid if full amount
      if (paymentData.amount >= Number(nextInstallment.amount)) {
        await accountingRepository.markInstallmentAsPaid(
          nextInstallment.id,
          paymentData.date ? new Date(paymentData.date) : new Date()
        );
      }

      // Update payment plan balance
      const newPaidAmount = Number(paymentPlan.paidAmount) + paymentData.amount;
      const newBalance = Number(paymentPlan.balance) - paymentData.amount;

      await accountingRepository.updatePaymentPlanBalance(
        paymentPlanId,
        newPaidAmount,
        Math.max(0, newBalance)
      );

      // Create income transaction
      await accountingRepository.createTransaction({
        type: TransactionType.INCOME,
        amount: paymentData.amount,
        description: `Payment plan installment #${nextInstallment.number}`,
        category: 'Payment Plan',
        paymentMethod: paymentData.paymentMethod,
        patientId: paymentPlan.patientId,
        createdBy: paymentData.createdBy,
        date: paymentData.date,
      });

      logger.info('Payment recorded successfully', {
        paymentPlanId,
        installmentNumber: nextInstallment.number,
        amount: paymentData.amount,
      });

      return {
        payment,
        installment: nextInstallment,
        updatedBalance: Math.max(0, newBalance),
      };
    } catch (error) {
      logger.error('Error recording payment', error);
      throw ApiError.internal('Failed to record payment');
    }
  }

  /**
   * Get installments for payment plan
   */
  async getInstallments(paymentPlanId: string) {
    const paymentPlan = await accountingRepository.findPaymentPlanById(
      paymentPlanId
    );

    if (!paymentPlan) {
      throw ApiError.notFound('Payment plan not found');
    }

    try {
      return await accountingRepository.getInstallmentsByPaymentPlanId(
        paymentPlanId
      );
    } catch (error) {
      logger.error('Error fetching installments', error);
      throw ApiError.internal('Failed to fetch installments');
    }
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments() {
    try {
      const overdueInstallments =
        await accountingRepository.getOverdueInstallments();

      // Mark as overdue
      const pendingIds = overdueInstallments
        .filter((inst) => inst.status === InstallmentStatus.PENDING)
        .map((inst) => inst.id);

      if (pendingIds.length > 0) {
        await accountingRepository.markInstallmentsAsOverdue(pendingIds);
      }

      return overdueInstallments;
    } catch (error) {
      logger.error('Error fetching overdue installments', error);
      throw ApiError.internal('Failed to fetch overdue installments');
    }
  }

  // ============================================
  // EXPENSE METHODS
  // ============================================

  /**
   * Get all expenses with optional filters and pagination
   */
  async getAllExpenses(
    options: ExpenseListOptions = {}
  ): Promise<PaginatedExpenseResponse> {
    try {
      return await accountingRepository.findAllExpenses(options);
    } catch (error) {
      logger.error('Error fetching expenses', error);
      throw ApiError.internal('Failed to fetch expenses');
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string) {
    const expense = await accountingRepository.findExpenseById(id);

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    return expense;
  }

  /**
   * Create expense
   */
  async createExpense(data: CreateExpenseData) {
    // Validate amount is positive
    if (data.amount <= 0) {
      throw ApiError.badRequest('Amount must be positive');
    }

    try {
      const expense = await accountingRepository.createExpense(data);

      // Create expense transaction
      await accountingRepository.createTransaction({
        type: TransactionType.EXPENSE,
        amount: data.amount,
        description: data.description,
        category: data.category,
        paymentMethod: data.paymentMethod,
        createdBy: data.createdBy,
        date: data.date,
        invoiceNumber: data.invoiceNumber,
      });

      logger.info('Expense created successfully', {
        expenseId: expense.id,
        category: expense.category,
        amount: expense.amount,
      });

      return expense;
    } catch (error) {
      logger.error('Error creating expense', error);
      throw ApiError.internal('Failed to create expense');
    }
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, data: UpdateExpenseData) {
    const expense = await accountingRepository.findExpenseById(id);

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Validate amount is positive if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw ApiError.badRequest('Amount must be positive');
    }

    try {
      const updated = await accountingRepository.updateExpense(id, data);

      logger.info('Expense updated successfully', {
        expenseId: id,
      });

      return updated;
    } catch (error) {
      logger.error('Error updating expense', error);
      throw ApiError.internal('Failed to update expense');
    }
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(category: string) {
    try {
      return await accountingRepository.findExpensesByCategory(category);
    } catch (error) {
      logger.error('Error fetching expenses by category', error);
      throw ApiError.internal('Failed to fetch expenses by category');
    }
  }

  /**
   * Delete expense (soft delete)
   */
  async deleteExpense(id: string) {
    const expense = await accountingRepository.findExpenseById(id);

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    try {
      await accountingRepository.softDeleteExpense(id);

      logger.info('Expense deleted successfully', {
        expenseId: id,
      });

      return { message: 'Expense deleted successfully' };
    } catch (error) {
      logger.error('Error deleting expense', error);
      throw ApiError.internal('Failed to delete expense');
    }
  }

  // ============================================
  // REPORT METHODS
  // ============================================

  /**
   * Get monthly balance report
   */
  async getMonthlyBalance(month: number, year: number): Promise<MonthlyBalance> {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw ApiError.badRequest('Month must be between 1 and 12');
    }

    if (year < 2000 || year > 2100) {
      throw ApiError.badRequest('Invalid year');
    }

    try {
      return await accountingRepository.getMonthlyBalance(month, year);
    } catch (error) {
      logger.error('Error generating monthly balance', error);
      throw ApiError.internal('Failed to generate monthly balance');
    }
  }

  /**
   * Get cash flow report
   */
  async getCashFlow(startDate: string, endDate: string): Promise<CashFlow> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start > end) {
      throw ApiError.badRequest('Start date must be before end date');
    }

    try {
      return await accountingRepository.getCashFlow(start, end);
    } catch (error) {
      logger.error('Error generating cash flow', error);
      throw ApiError.internal('Failed to generate cash flow');
    }
  }

  /**
   * Get accounts receivable report
   */
  async getAccountsReceivable(): Promise<AccountsReceivable[]> {
    try {
      return await accountingRepository.getAccountsReceivable();
    } catch (error) {
      logger.error('Error generating accounts receivable', error);
      throw ApiError.internal('Failed to generate accounts receivable');
    }
  }

  /**
   * Get income by treatment report
   */
  async getIncomeByTreatment(): Promise<IncomeByTreatment[]> {
    try {
      return await accountingRepository.getIncomeByTreatment();
    } catch (error) {
      logger.error('Error generating income by treatment', error);
      throw ApiError.internal('Failed to generate income by treatment');
    }
  }

  /**
   * Get financial summary report
   */
  async getFinancialReport(month: number, year: number) {
    try {
      const monthlyBalance = await this.getMonthlyBalance(month, year);
      const accountsReceivable = await this.getAccountsReceivable();

      const totalReceivable = accountsReceivable.reduce(
        (sum, account) => sum + account.totalDebt,
        0
      );

      const totalOverdue = accountsReceivable.reduce(
        (sum, account) => sum + account.overdueAmount,
        0
      );

      return {
        period: {
          month,
          year,
        },
        balance: monthlyBalance,
        receivables: {
          total: totalReceivable,
          overdue: totalOverdue,
          accounts: accountsReceivable.length,
        },
        summary: {
          revenue: monthlyBalance.totalIncome,
          expenses: monthlyBalance.totalExpenses,
          profit: monthlyBalance.netIncome,
          profitMargin:
            monthlyBalance.totalIncome > 0
              ? (monthlyBalance.netIncome / monthlyBalance.totalIncome) * 100
              : 0,
        },
      };
    } catch (error) {
      logger.error('Error generating financial report', error);
      throw ApiError.internal('Failed to generate financial report');
    }
  }
}

// Export singleton instance
export const accountingService = new AccountingService();
export default accountingService;
