import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';
import {
  Gender,
  IdentificationType,
  TransactionType,
  PaymentMethod,
  ExpenseCategory,
  TreatmentStatus,
} from '@prisma/client';

/**
 * Accounting Integration Tests
 * Tests all accounting endpoints with real database interactions
 */
describe('Accounting Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testRoleId: string;
  let testPatientId: string;
  let testTreatmentId: string;
  let testPaymentPlanId: string;
  let testTransactionId: string;
  let testExpenseId: string;
  let testTreatmentCatalogId: string;

  const testUser = {
    email: 'accounting.test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Admin',
    roleId: '',
  };

  const validPatientData = {
    firstName: 'Carlos',
    lastName: 'González',
    dateOfBirth: '1985-03-20T00:00:00.000Z',
    gender: Gender.MALE,
    identification: '1234567890',
    identificationType: IdentificationType.CEDULA,
    phone: '+593987654321',
  };

  /**
   * Setup: Create test user, patient, and authenticate
   */
  beforeAll(async () => {
    // Create admin role
    const role = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Test admin role',
      },
    });
    testRoleId = role.id;
    testUser.roleId = role.id;

    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        roleId: testRoleId,
      },
    });
    testUserId = user.id;

    // Create test patient
    const patient = await prisma.patient.create({
      data: validPatientData,
    });
    testPatientId = patient.id;

    // Create treatment catalog
    const catalog = await prisma.treatmentCatalog.create({
      data: {
        code: 'TEST001',
        name: 'Test Treatment',
        description: 'Test treatment for accounting tests',
        category: 'General',
        baseCost: 500,
        duration: 30,
      },
    });
    testTreatmentCatalogId = catalog.id;

    // Create test treatment
    const treatment = await prisma.treatment.create({
      data: {
        patientId: testPatientId,
        doctorId: testUserId,
        catalogId: testTreatmentCatalogId,
        status: TreatmentStatus.COMPLETED,
        cost: 500,
        balance: 500,
      },
    });
    testTreatmentId = treatment.id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.data.tokens.accessToken;
  });

  /**
   * Cleanup after each test
   */
  afterEach(async () => {
    // Clean up test data
    if (testTransactionId) {
      await prisma.transaction.deleteMany({
        where: { id: testTransactionId },
      });
      testTransactionId = '';
    }

    if (testExpenseId) {
      await prisma.expense.deleteMany({
        where: { id: testExpenseId },
      });
      testExpenseId = '';
    }
  });

  /**
   * Final cleanup
   */
  afterAll(async () => {
    // Delete payment plans and installments
    if (testPaymentPlanId) {
      await prisma.installment.deleteMany({
        where: { paymentPlanId: testPaymentPlanId },
      });
      await prisma.paymentPlan.deleteMany({
        where: { id: testPaymentPlanId },
      });
    }

    // Delete patient payments
    await prisma.patientPayment.deleteMany({
      where: { patientId: testPatientId },
    });

    // Delete transactions
    await prisma.transaction.deleteMany({
      where: { createdBy: testUserId },
    });

    // Delete expenses
    await prisma.expense.deleteMany({
      where: { createdBy: testUserId },
    });

    // Delete treatment
    if (testTreatmentId) {
      await prisma.treatment.delete({
        where: { id: testTreatmentId },
      });
    }

    // Delete treatment catalog
    if (testTreatmentCatalogId) {
      await prisma.treatmentCatalog.delete({
        where: { id: testTreatmentCatalogId },
      });
    }

    // Delete patient
    if (testPatientId) {
      await prisma.patient.delete({
        where: { id: testPatientId },
      });
    }

    // Delete test user
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }

    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * TRANSACTION ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/accounting/transactions', () => {
    it('should successfully create a new transaction', async () => {
      const transactionData = {
        type: TransactionType.INCOME,
        amount: 150,
        description: 'Test income transaction',
        category: 'Services',
        paymentMethod: PaymentMethod.CASH,
      };

      const response = await request(app)
        .post('/api/v1/accounting/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe(transactionData.type);
      expect(Number(response.body.data.amount)).toBe(transactionData.amount);

      testTransactionId = response.body.data.id;
    });

    it('should return 400 for invalid amount', async () => {
      const invalidData = {
        type: TransactionType.INCOME,
        amount: -50, // Negative amount
        description: 'Invalid transaction',
        category: 'Test',
      };

      await request(app)
        .post('/api/v1/accounting/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/v1/accounting/transactions', () => {
    beforeAll(async () => {
      // Create test transaction
      const transaction = await prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: 100,
          description: 'Test transaction for listing',
          category: 'Test',
          createdBy: testUserId,
        },
      });
      testTransactionId = transaction.id;
    });

    it('should successfully retrieve transactions', async () => {
      const response = await request(app)
        .get('/api/v1/accounting/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/v1/accounting/transactions?type=INCOME')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].type).toBe(TransactionType.INCOME);
    });
  });

  /**
   * ==========================================
   * PAYMENT PLAN ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/accounting/patients/:patientId/payment-plans', () => {
    it('should successfully create a payment plan with installments', async () => {
      const today = new Date();
      const firstDueDate = new Date(today.setDate(today.getDate() + 30));

      const paymentPlanData = {
        treatmentId: testTreatmentId,
        totalAmount: 500,
        totalInstallments: 5,
        firstDueDate: firstDueDate.toISOString(),
        frequency: 'MONTHLY',
      };

      const response = await request(app)
        .post(`/api/v1/accounting/patients/${testPatientId}/payment-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentPlanData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(Number(response.body.data.totalAmount)).toBe(
        paymentPlanData.totalAmount
      );
      expect(response.body.data.installments).toHaveLength(
        paymentPlanData.totalInstallments
      );

      // Verify installments sum equals total amount
      const installmentsSum = response.body.data.installments.reduce(
        (sum: number, inst: any) => sum + Number(inst.amount),
        0
      );
      expect(installmentsSum).toBe(paymentPlanData.totalAmount);

      testPaymentPlanId = response.body.data.id;
    });

    it('should return 400 for invalid installment count', async () => {
      const invalidData = {
        treatmentId: testTreatmentId,
        totalAmount: 500,
        totalInstallments: 0, // Invalid
        firstDueDate: new Date().toISOString(),
        frequency: 'MONTHLY',
      };

      await request(app)
        .post(`/api/v1/accounting/patients/${testPatientId}/payment-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/v1/accounting/payment-plans/:id/record-payment', () => {
    beforeAll(async () => {
      // Create payment plan for payment recording tests
      const today = new Date();
      const firstDueDate = new Date(today.setDate(today.getDate() + 30));

      const paymentPlanData = {
        treatmentId: testTreatmentId,
        totalAmount: 300,
        totalInstallments: 3,
        firstDueDate: firstDueDate.toISOString(),
        frequency: 'MONTHLY',
      };

      const response = await request(app)
        .post(`/api/v1/accounting/patients/${testPatientId}/payment-plans`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentPlanData);

      testPaymentPlanId = response.body.data.id;
    });

    it('should successfully record a payment for payment plan', async () => {
      const paymentData = {
        amount: 100,
        paymentMethod: PaymentMethod.CASH,
        notes: 'First installment payment',
      };

      const response = await request(app)
        .post(
          `/api/v1/accounting/payment-plans/${testPaymentPlanId}/record-payment`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('installment');
      expect(response.body.data).toHaveProperty('updatedBalance');
      expect(response.body.data.updatedBalance).toBe(200); // 300 - 100
    });

    it('should return 400 when payment exceeds balance', async () => {
      const invalidPayment = {
        amount: 500, // Exceeds remaining balance
        paymentMethod: PaymentMethod.CASH,
      };

      await request(app)
        .post(
          `/api/v1/accounting/payment-plans/${testPaymentPlanId}/record-payment`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayment)
        .expect(400);
    });
  });

  describe('GET /api/v1/accounting/payment-plans/:id/installments', () => {
    it('should retrieve installments for payment plan', async () => {
      if (!testPaymentPlanId) {
        // Create payment plan if not exists
        const today = new Date();
        const firstDueDate = new Date(today.setDate(today.getDate() + 30));

        const response = await request(app)
          .post(`/api/v1/accounting/patients/${testPatientId}/payment-plans`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            treatmentId: testTreatmentId,
            totalAmount: 300,
            totalInstallments: 3,
            firstDueDate: firstDueDate.toISOString(),
            frequency: 'MONTHLY',
          });

        testPaymentPlanId = response.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/accounting/payment-plans/${testPaymentPlanId}/installments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  /**
   * ==========================================
   * PATIENT PAYMENT ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/accounting/patients/:patientId/payments', () => {
    it('should successfully create a patient payment', async () => {
      const paymentData = {
        treatmentId: testTreatmentId,
        amount: 150,
        paymentMethod: PaymentMethod.CARD,
        concept: 'Partial treatment payment',
      };

      const response = await request(app)
        .post(`/api/v1/accounting/patients/${testPatientId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(Number(response.body.data.amount)).toBe(paymentData.amount);
      expect(response.body.data.concept).toBe(paymentData.concept);
    });
  });

  describe('GET /api/v1/accounting/patients/:patientId/payments', () => {
    beforeAll(async () => {
      // Create test payment
      await prisma.patientPayment.create({
        data: {
          patientId: testPatientId,
          treatmentId: testTreatmentId,
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
          concept: 'Test payment',
          createdBy: testUserId,
        },
      });
    });

    it('should retrieve patient payments', async () => {
      const response = await request(app)
        .get(`/api/v1/accounting/patients/${testPatientId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  /**
   * ==========================================
   * EXPENSE ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/accounting/expenses', () => {
    it('should successfully create an expense', async () => {
      const expenseData = {
        amount: 200,
        category: ExpenseCategory.SUPPLIES,
        description: 'Medical supplies purchase',
        paymentMethod: PaymentMethod.TRANSFER,
        recurring: false,
      };

      const response = await request(app)
        .post('/api/v1/accounting/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(Number(response.body.data.amount)).toBe(expenseData.amount);
      expect(response.body.data.category).toBe(expenseData.category);

      testExpenseId = response.body.data.id;
    });
  });

  describe('GET /api/v1/accounting/expenses', () => {
    beforeAll(async () => {
      // Create test expense
      const expense = await prisma.expense.create({
        data: {
          amount: 150,
          category: ExpenseCategory.RENT,
          description: 'Monthly rent',
          paymentMethod: PaymentMethod.TRANSFER,
          recurring: true,
          createdBy: testUserId,
        },
      });
      testExpenseId = expense.id;
    });

    it('should retrieve expenses', async () => {
      const response = await request(app)
        .get('/api/v1/accounting/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should filter expenses by category', async () => {
      const response = await request(app)
        .get(`/api/v1/accounting/expenses?category=${ExpenseCategory.RENT}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
    });
  });

  /**
   * ==========================================
   * FINANCIAL REPORTS ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/accounting/reports/monthly', () => {
    it('should retrieve monthly balance report', async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const response = await request(app)
        .get(`/api/v1/accounting/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('month');
      expect(response.body.data).toHaveProperty('year');
      expect(response.body.data).toHaveProperty('totalIncome');
      expect(response.body.data).toHaveProperty('totalExpenses');
      expect(response.body.data).toHaveProperty('netIncome');
      expect(response.body.data).toHaveProperty('incomeSources');
      expect(response.body.data).toHaveProperty('expensesByCategory');
    });
  });

  describe('GET /api/v1/accounting/reports/cash-flow', () => {
    it('should retrieve cash flow report', async () => {
      const today = new Date();
      const startDate = new Date(today.setDate(1)).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(
          `/api/v1/accounting/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('totalIncome');
      expect(response.body.data).toHaveProperty('totalExpenses');
      expect(response.body.data).toHaveProperty('closingBalance');
    });
  });

  describe('GET /api/v1/accounting/reports/accounts-receivable', () => {
    it('should retrieve accounts receivable report', async () => {
      const response = await request(app)
        .get('/api/v1/accounting/reports/accounts-receivable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/accounting/reports/financial', () => {
    it('should retrieve financial summary report', async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const response = await request(app)
        .get(`/api/v1/accounting/reports/financial?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('balance');
      expect(response.body.data).toHaveProperty('receivables');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  /**
   * ==========================================
   * OVERDUE INSTALLMENTS TESTS
   * ==========================================
   */
  describe('GET /api/v1/accounting/installments/overdue', () => {
    it('should retrieve overdue installments', async () => {
      const response = await request(app)
        .get('/api/v1/accounting/installments/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  /**
   * ==========================================
   * AUTHORIZATION TESTS
   * ==========================================
   */
  describe('Authorization Tests', () => {
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/accounting/transactions')
        .expect(401);
    });

    it('should allow admin to access financial reports', async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      await request(app)
        .get(`/api/v1/accounting/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
