import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { accountingService } from '@services/accounting.service';
import type {
  CreateTransactionDTO,
  GetTransactionsDTO,
  TransactionListOptions,
  CreatePatientPaymentDTO,
  CreatePaymentPlanDTO,
  UpdatePaymentPlanDTO,
  RecordPaymentDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  GetExpensesDTO,
  ExpenseListOptions,
  MonthlyBalanceDTO,
  CashFlowDTO,
} from '../types/accounting.types';

/**
 * Accounting Controller
 * Handles all HTTP requests related to accounting
 */
export class AccountingController {
  // ============================================
  // TRANSACTION ENDPOINTS
  // ============================================

  /**
   * Get all transactions with optional filters and pagination
   * GET /api/v1/accounting/transactions
   *
   * @query {GetTransactionsDTO} - Filter parameters
   * @returns {PaginatedTransactionResponse} - List of transactions
   */
  getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as GetTransactionsDTO;

    const options: TransactionListOptions = {
      filters: {
        type: query.type,
        category: query.category,
        patientId: query.patientId,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
    };

    const result = await accountingService.getAllTransactions(options);

    return ResponseHelper.success(
      res,
      result,
      'Transactions retrieved successfully'
    );
  });

  /**
   * Get transaction by ID
   * GET /api/v1/accounting/transactions/:id
   *
   * @param {string} id - Transaction ID
   * @returns {Transaction} - Transaction details
   */
  getTransactionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const transaction = await accountingService.getTransactionById(id!);

    return ResponseHelper.success(
      res,
      transaction,
      'Transaction retrieved successfully'
    );
  });

  /**
   * Create new transaction
   * POST /api/v1/accounting/transactions
   *
   * @body {CreateTransactionDTO} - Transaction creation data
   * @returns {Transaction} - Created transaction
   */
  createTransaction = catchAsync(async (req: Request, res: Response) => {
    const data: CreateTransactionDTO = req.body;
    const userId = req.user!.id;

    const transaction = await accountingService.createTransaction({
      ...data,
      createdBy: userId,
    });

    return ResponseHelper.created(
      res,
      transaction,
      'Transaction created successfully'
    );
  });

  /**
   * Delete transaction (soft delete)
   * DELETE /api/v1/accounting/transactions/:id
   *
   * @param {string} id - Transaction ID
   * @returns {Object} - Success message
   */
  deleteTransaction = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await accountingService.deleteTransaction(id!);

    return ResponseHelper.success(res, result, 'Transaction deleted successfully');
  });

  // ============================================
  // PATIENT PAYMENT ENDPOINTS
  // ============================================

  /**
   * Get payments by patient ID
   * GET /api/v1/accounting/patients/:patientId/payments
   *
   * @param {string} patientId - Patient ID
   * @returns {PatientPayment[]} - List of payments
   */
  getPaymentsByPatientId = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const payments = await accountingService.getPaymentsByPatientId(patientId!);

    return ResponseHelper.success(
      res,
      payments,
      'Patient payments retrieved successfully'
    );
  });

  /**
   * Get payment by ID
   * GET /api/v1/accounting/payments/:id
   *
   * @param {string} id - Payment ID
   * @returns {PatientPayment} - Payment details
   */
  getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const payment = await accountingService.getPaymentById(id!);

    return ResponseHelper.success(res, payment, 'Payment retrieved successfully');
  });

  /**
   * Create patient payment
   * POST /api/v1/accounting/patients/:patientId/payments
   *
   * @param {string} patientId - Patient ID
   * @body {CreatePatientPaymentDTO} - Payment creation data
   * @returns {PatientPayment} - Created payment
   */
  createPatientPayment = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const data: CreatePatientPaymentDTO = req.body;
    const userId = req.user!.id;

    const payment = await accountingService.createPatientPayment({
      ...data,
      patientId: patientId!,
      createdBy: userId,
    });

    return ResponseHelper.created(
      res,
      payment,
      'Patient payment created successfully'
    );
  });

  // ============================================
  // PAYMENT PLAN ENDPOINTS
  // ============================================

  /**
   * Get payment plans by patient ID
   * GET /api/v1/accounting/patients/:patientId/payment-plans
   *
   * @param {string} patientId - Patient ID
   * @returns {PaymentPlan[]} - List of payment plans
   */
  getPaymentPlansByPatientId = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const paymentPlans = await accountingService.getPaymentPlansByPatientId(
      patientId!
    );

    return ResponseHelper.success(
      res,
      paymentPlans,
      'Payment plans retrieved successfully'
    );
  });

  /**
   * Get payment plan by ID
   * GET /api/v1/accounting/payment-plans/:id
   *
   * @param {string} id - Payment plan ID
   * @returns {PaymentPlan} - Payment plan details
   */
  getPaymentPlanById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const paymentPlan = await accountingService.getPaymentPlanById(id!);

    return ResponseHelper.success(
      res,
      paymentPlan,
      'Payment plan retrieved successfully'
    );
  });

  /**
   * Create payment plan
   * POST /api/v1/accounting/patients/:patientId/payment-plans
   *
   * @param {string} patientId - Patient ID
   * @body {CreatePaymentPlanDTO} - Payment plan creation data
   * @returns {PaymentPlan} - Created payment plan
   */
  createPaymentPlan = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const data: CreatePaymentPlanDTO = req.body;

    const paymentPlan = await accountingService.createPaymentPlan({
      ...data,
      patientId: patientId!,
    });

    return ResponseHelper.created(
      res,
      paymentPlan,
      'Payment plan created successfully'
    );
  });

  /**
   * Update payment plan
   * PUT /api/v1/accounting/payment-plans/:id
   *
   * @param {string} id - Payment plan ID
   * @body {UpdatePaymentPlanDTO} - Payment plan update data
   * @returns {PaymentPlan} - Updated payment plan
   */
  updatePaymentPlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdatePaymentPlanDTO = req.body;

    const paymentPlan = await accountingService.updatePaymentPlan(id!, data);

    return ResponseHelper.success(
      res,
      paymentPlan,
      'Payment plan updated successfully'
    );
  });

  /**
   * Record payment for payment plan
   * POST /api/v1/accounting/payment-plans/:id/record-payment
   *
   * @param {string} id - Payment plan ID
   * @body {RecordPaymentDTO} - Payment data
   * @returns {Object} - Payment result
   */
  recordPayment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: RecordPaymentDTO = req.body;
    const userId = req.user!.id;

    const result = await accountingService.recordPayment(id!, {
      ...data,
      createdBy: userId,
    });

    return ResponseHelper.created(res, result, 'Payment recorded successfully');
  });

  /**
   * Get installments for payment plan
   * GET /api/v1/accounting/payment-plans/:id/installments
   *
   * @param {string} id - Payment plan ID
   * @returns {Installment[]} - List of installments
   */
  getInstallments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const installments = await accountingService.getInstallments(id!);

    return ResponseHelper.success(
      res,
      installments,
      'Installments retrieved successfully'
    );
  });

  /**
   * Get overdue installments
   * GET /api/v1/accounting/installments/overdue
   *
   * @returns {Installment[]} - List of overdue installments
   */
  getOverdueInstallments = catchAsync(async (_req: Request, res: Response) => {
    const installments = await accountingService.getOverdueInstallments();

    return ResponseHelper.success(
      res,
      installments,
      'Overdue installments retrieved successfully'
    );
  });

  // ============================================
  // EXPENSE ENDPOINTS
  // ============================================

  /**
   * Get all expenses with optional filters and pagination
   * GET /api/v1/accounting/expenses
   *
   * @query {GetExpensesDTO} - Filter parameters
   * @returns {PaginatedExpenseResponse} - List of expenses
   */
  getAllExpenses = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as GetExpensesDTO;

    const options: ExpenseListOptions = {
      filters: {
        category: query.category,
        startDate: query.startDate,
        endDate: query.endDate,
        recurring: query.recurring,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
    };

    const result = await accountingService.getAllExpenses(options);

    return ResponseHelper.success(res, result, 'Expenses retrieved successfully');
  });

  /**
   * Get expense by ID
   * GET /api/v1/accounting/expenses/:id
   *
   * @param {string} id - Expense ID
   * @returns {Expense} - Expense details
   */
  getExpenseById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const expense = await accountingService.getExpenseById(id!);

    return ResponseHelper.success(res, expense, 'Expense retrieved successfully');
  });

  /**
   * Create expense
   * POST /api/v1/accounting/expenses
   *
   * @body {CreateExpenseDTO} - Expense creation data
   * @returns {Expense} - Created expense
   */
  createExpense = catchAsync(async (req: Request, res: Response) => {
    const data: CreateExpenseDTO = req.body;
    const userId = req.user!.id;

    const expense = await accountingService.createExpense({
      ...data,
      createdBy: userId,
    });

    return ResponseHelper.created(res, expense, 'Expense created successfully');
  });

  /**
   * Update expense
   * PUT /api/v1/accounting/expenses/:id
   *
   * @param {string} id - Expense ID
   * @body {UpdateExpenseDTO} - Expense update data
   * @returns {Expense} - Updated expense
   */
  updateExpense = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateExpenseDTO = req.body;

    const expense = await accountingService.updateExpense(id!, data);

    return ResponseHelper.success(res, expense, 'Expense updated successfully');
  });

  /**
   * Get expenses by category
   * GET /api/v1/accounting/expenses/by-category/:category
   *
   * @param {string} category - Expense category
   * @returns {Expense[]} - List of expenses
   */
  getExpensesByCategory = catchAsync(async (req: Request, res: Response) => {
    const { category } = req.params;

    const expenses = await accountingService.getExpensesByCategory(category!);

    return ResponseHelper.success(
      res,
      expenses,
      'Expenses retrieved successfully'
    );
  });

  /**
   * Delete expense (soft delete)
   * DELETE /api/v1/accounting/expenses/:id
   *
   * @param {string} id - Expense ID
   * @returns {Object} - Success message
   */
  deleteExpense = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await accountingService.deleteExpense(id!);

    return ResponseHelper.success(res, result, 'Expense deleted successfully');
  });

  // ============================================
  // REPORT ENDPOINTS
  // ============================================

  /**
   * Get monthly balance report
   * GET /api/v1/accounting/reports/monthly?month=1&year=2025
   *
   * @query {MonthlyBalanceDTO} - Month and year
   * @returns {MonthlyBalance} - Monthly balance report
   */
  getMonthlyBalance = catchAsync(async (req: Request, res: Response) => {
    const { month, year } = req.query as unknown as MonthlyBalanceDTO;

    const report = await accountingService.getMonthlyBalance(
      Number(month),
      Number(year)
    );

    return ResponseHelper.success(
      res,
      report,
      'Monthly balance retrieved successfully'
    );
  });

  /**
   * Get cash flow report
   * GET /api/v1/accounting/reports/cash-flow?startDate=...&endDate=...
   *
   * @query {CashFlowDTO} - Date range
   * @returns {CashFlow} - Cash flow report
   */
  getCashFlow = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as unknown as CashFlowDTO;

    const report = await accountingService.getCashFlow(startDate, endDate);

    return ResponseHelper.success(res, report, 'Cash flow retrieved successfully');
  });

  /**
   * Get accounts receivable report
   * GET /api/v1/accounting/reports/accounts-receivable
   *
   * @returns {AccountsReceivable[]} - Accounts receivable report
   */
  getAccountsReceivable = catchAsync(async (_req: Request, res: Response) => {
    const report = await accountingService.getAccountsReceivable();

    return ResponseHelper.success(
      res,
      report,
      'Accounts receivable retrieved successfully'
    );
  });

  /**
   * Get income by treatment report
   * GET /api/v1/accounting/reports/income-by-treatment
   *
   * @returns {IncomeByTreatment[]} - Income by treatment report
   */
  getIncomeByTreatment = catchAsync(async (_req: Request, res: Response) => {
    const report = await accountingService.getIncomeByTreatment();

    return ResponseHelper.success(
      res,
      report,
      'Income by treatment retrieved successfully'
    );
  });

  /**
   * Get financial summary report
   * GET /api/v1/accounting/reports/financial?month=1&year=2025
   *
   * @query {MonthlyBalanceDTO} - Month and year
   * @returns {Object} - Financial summary
   */
  getFinancialReport = catchAsync(async (req: Request, res: Response) => {
    const { month, year } = req.query as unknown as MonthlyBalanceDTO;

    const report = await accountingService.getFinancialReport(
      Number(month),
      Number(year)
    );

    return ResponseHelper.success(
      res,
      report,
      'Financial report retrieved successfully'
    );
  });
}

// Export singleton instance
export const accountingController = new AccountingController();
export default accountingController;
