import { prisma } from '@config/database';
import {
  Transaction,
  PatientPayment,
  PaymentPlan,
  Installment,
  Expense,
  Prisma,
  InstallmentStatus,
  PaymentPlanStatus,
  TransactionType,
} from '@prisma/client';
import type {
  CreateTransactionData,
  TransactionListOptions,
  PaginatedTransactionResponse,
  CreatePatientPaymentData,
  CreatePaymentPlanData,
  UpdatePaymentPlanData,
  // RecordPaymentData,
  InstallmentCalculation,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseListOptions,
  PaginatedExpenseResponse,
} from '../types/accounting.types';

/**
 * Payment Plan with Installments
 */
export type PaymentPlanWithInstallments = PaymentPlan & {
  installments: Installment[];
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  treatment: {
    id: string;
    catalog: {
      name: string;
      code: string;
    };
  };
};

/**
 * Accounting Repository
 * Handles all database operations related to accounting
 */
export class AccountingRepository {
  // ============================================
  // TRANSACTION METHODS
  // ============================================

  /**
   * Find all transactions with optional filters and pagination
   */
  async findAllTransactions(
    options: TransactionListOptions = {}
  ): Promise<PaginatedTransactionResponse> {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
    } = options;

    const where: Prisma.TransactionWhereInput = {
      deletedAt: null,
      type: filters.type,
      category: filters.category,
      patientId: filters.patientId,
    };

    // Add date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * Find transaction by ID
   */
  async findTransactionById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create new transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find transactions by date range
   */
  async findTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(type && { type }),
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Soft delete transaction
   */
  async softDeleteTransaction(id: string): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============================================
  // PATIENT PAYMENT METHODS
  // ============================================

  /**
   * Find payments by patient ID
   */
  async findPaymentsByPatientId(patientId: string): Promise<PatientPayment[]> {
    return prisma.patientPayment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        treatment: {
          include: {
            catalog: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        installment: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find payment by ID
   */
  async findPaymentById(id: string): Promise<PatientPayment | null> {
    return prisma.patientPayment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
          },
        },
        treatment: {
          include: {
            catalog: true,
          },
        },
        installment: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Create patient payment
   */
  async createPatientPayment(
    data: CreatePatientPaymentData
  ): Promise<PatientPayment> {
    return prisma.patientPayment.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        treatment: {
          include: {
            catalog: true,
          },
        },
      },
    });
  }

  /**
   * Update patient payment
   */
  async updatePatientPayment(
    id: string,
    data: Partial<PatientPayment>
  ): Promise<PatientPayment> {
    return prisma.patientPayment.update({
      where: { id },
      data,
    });
  }

  // ============================================
  // PAYMENT PLAN METHODS
  // ============================================

  /**
   * Find payment plans by patient ID
   */
  async findPaymentPlansByPatientId(
    patientId: string
  ): Promise<PaymentPlanWithInstallments[]> {
    return prisma.paymentPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: {
          orderBy: { number: 'asc' },
          include: {
            payments: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        treatment: {
          include: {
            catalog: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find payment plan by ID
   */
  async findPaymentPlanById(
    id: string
  ): Promise<PaymentPlanWithInstallments | null> {
    return prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        installments: {
          orderBy: { number: 'asc' },
          include: {
            payments: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
        treatment: {
          include: {
            catalog: {
              select: {
                name: true,
                code: true,
                description: true,
              },
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create payment plan with installments
   */
  async createPaymentPlan(
    planData: CreatePaymentPlanData,
    installments: InstallmentCalculation[]
  ): Promise<PaymentPlanWithInstallments> {
    return prisma.paymentPlan.create({
      data: {
        patientId: planData.patientId,
        treatmentId: planData.treatmentId,
        totalAmount: planData.totalAmount,
        paidAmount: 0,
        balance: planData.totalAmount,
        startDate: planData.startDate ? new Date(planData.startDate) : new Date(),
        status: PaymentPlanStatus.ACTIVE,
        installments: {
          create: installments.map((inst) => ({
            number: inst.number,
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: InstallmentStatus.PENDING,
          })),
        },
      },
      include: {
        installments: {
          orderBy: { number: 'asc' },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        treatment: {
          include: {
            catalog: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update payment plan
   */
  async updatePaymentPlan(
    id: string,
    data: UpdatePaymentPlanData
  ): Promise<PaymentPlan> {
    return prisma.paymentPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Update payment plan balance
   */
  async updatePaymentPlanBalance(
    id: string,
    paidAmount: number,
    balance: number
  ): Promise<PaymentPlan> {
    return prisma.paymentPlan.update({
      where: { id },
      data: {
        paidAmount,
        balance,
        status:
          balance <= 0
            ? PaymentPlanStatus.COMPLETED
            : PaymentPlanStatus.ACTIVE,
      },
    });
  }

  /**
   * Get overdue installments
   */
  async getOverdueInstallments(): Promise<Installment[]> {
    const today = new Date();

    return prisma.installment.findMany({
      where: {
        status: InstallmentStatus.PENDING,
        dueDate: {
          lt: today,
        },
      },
      include: {
        paymentPlan: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
            treatment: {
              include: {
                catalog: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Mark installments as overdue
   */
  async markInstallmentsAsOverdue(ids: string[]): Promise<void> {
    await prisma.installment.updateMany({
      where: {
        id: { in: ids },
        status: InstallmentStatus.PENDING,
      },
      data: {
        status: InstallmentStatus.OVERDUE,
      },
    });
  }

  /**
   * Get next pending installment for payment plan
   */
  async getNextPendingInstallment(
    paymentPlanId: string
  ): Promise<Installment | null> {
    return prisma.installment.findFirst({
      where: {
        paymentPlanId,
        status: {
          in: [InstallmentStatus.PENDING, InstallmentStatus.OVERDUE],
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  // ============================================
  // INSTALLMENT METHODS
  // ============================================

  /**
   * Mark installment as paid
   */
  async markInstallmentAsPaid(
    id: string,
    paidDate: Date
  ): Promise<Installment> {
    return prisma.installment.update({
      where: { id },
      data: {
        status: InstallmentStatus.PAID,
        paidDate,
      },
    });
  }

  /**
   * Get installments by payment plan ID
   */
  async getInstallmentsByPaymentPlanId(
    paymentPlanId: string
  ): Promise<Installment[]> {
    return prisma.installment.findMany({
      where: { paymentPlanId },
      orderBy: { number: 'asc' },
      include: {
        payments: true,
      },
    });
  }

  // ============================================
  // EXPENSE METHODS
  // ============================================

  /**
   * Find all expenses with optional filters and pagination
   */
  async findAllExpenses(
    options: ExpenseListOptions = {}
  ): Promise<PaginatedExpenseResponse> {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
    } = options;

    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      category: filters.category,
      recurring: filters.recurring,
    };

    // Add date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * Find expense by ID
   */
  async findExpenseById(id: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Create expense
   */
  async createExpense(data: CreateExpenseData): Promise<Expense> {
    return prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
    return prisma.expense.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find expenses by category
   */
  async findExpensesByCategory(category: string): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: {
        deletedAt: null,
        category: category as any,
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Soft delete expense
   */
  async softDeleteExpense(id: string): Promise<Expense> {
    return prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============================================
  // REPORT METHODS
  // ============================================

  /**
   * Get monthly balance
   */
  async getMonthlyBalance(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get income transactions
    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        type: TransactionType.INCOME,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get patient payments
    const patientPayments = await prisma.patientPayment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalPatientPayments = patientPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const totalOtherIncome = incomeTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

    const totalIncome = totalPatientPayments + totalOtherIncome;

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      month,
      year,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      incomeSources: {
        patientPayments: totalPatientPayments,
        otherIncome: totalOtherIncome,
      },
      expensesByCategory,
    };
  }

  /**
   * Get cash flow
   */
  async getCashFlow(startDate: Date, endDate: Date) {
    const transactions = await this.findTransactionsByDateRange(
      startDate,
      endDate
    );

    const payments = await prisma.patientPayment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        treatment: {
          include: {
            catalog: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome =
      transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0) +
      payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpenses =
      transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0) +
      expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      openingBalance: 0, // This could be calculated from previous periods
      totalIncome,
      totalExpenses,
      closingBalance: totalIncome - totalExpenses,
      transactions: [...transactions, ...payments, ...expenses],
    };
  }

  /**
   * Get accounts receivable
   */
  async getAccountsReceivable() {
    const paymentPlans = await prisma.paymentPlan.findMany({
      where: {
        status: {
          in: [PaymentPlanStatus.ACTIVE],
        },
        balance: {
          gt: 0,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        installments: {
          where: {
            status: {
              in: [InstallmentStatus.PENDING, InstallmentStatus.OVERDUE],
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return paymentPlans.map((plan) => {
      const overdueInstallments = plan.installments.filter(
        (inst) => inst.status === InstallmentStatus.OVERDUE
      );

      const overdueAmount = overdueInstallments.reduce(
        (sum, inst) => sum + Number(inst.amount),
        0
      );

      const oldestOverdue = overdueInstallments[0];
      const daysOverdue = oldestOverdue
        ? Math.floor(
            (new Date().getTime() - oldestOverdue.dueDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        patientId: plan.patient.id,
        patientName: `${plan.patient.firstName} ${plan.patient.lastName}`,
        totalDebt: Number(plan.balance),
        overdueAmount,
        paymentPlans: [plan],
        daysOverdue,
      };
    });
  }

  /**
   * Get income by treatment
   */
  async getIncomeByTreatment() {
    const treatments = await prisma.treatment.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        catalog: {
          select: {
            name: true,
            code: true,
          },
        },
        payments: true,
      },
    });

    // Group by treatment catalog
    const grouped = treatments.reduce((acc, treatment) => {
      const key = treatment.catalogId;
      if (!acc[key]) {
        acc[key] = {
          treatmentName: treatment.catalog.name,
          treatmentCode: treatment.catalog.code,
          totalIncome: 0,
          numberOfTreatments: 0,
        };
      }

      const paid = treatment.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );

      acc[key].totalIncome += paid;
      acc[key].numberOfTreatments += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      averagePrice: item.totalIncome / item.numberOfTreatments,
    }));
  }
}

// Export singleton instance
export const accountingRepository = new AccountingRepository();
export default accountingRepository;
