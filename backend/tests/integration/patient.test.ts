import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';
import { Gender, IdentificationType } from '@prisma/client';

/**
 * Patient Integration Tests
 * Tests all patient endpoints with real database interactions
 */
describe('Patient Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testRoleId: string;
  let testPatientId: string;

  const testUser = {
    email: 'patient.test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    roleId: '',
  };

  const validPatientData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1990-05-15T00:00:00.000Z',
    gender: Gender.MALE,
    identification: '1234567890', // Valid Ecuadorian ID format for testing
    identificationType: IdentificationType.CEDULA,
    phone: '+593987654321',
    email: 'juan.perez@example.com',
    address: 'Av. 12 de Octubre y Colón',
    city: 'Quito',
    province: 'Pichincha',
    hasInsurance: false,
    emergencyContact: {
      name: 'María Pérez',
      relationship: 'Hermana',
      phone: '+593987654322',
    },
  };

  /**
   * Setup: Create test user and authenticate
   */
  beforeAll(async () => {
    // Create test role
    const role = await prisma.role.upsert({
      where: { name: 'receptionist' },
      update: {},
      create: {
        name: 'receptionist',
        description: 'Test receptionist role',
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
   * Cleanup: Delete test patient after each test
   */
  afterEach(async () => {
    if (testPatientId) {
      await prisma.patient.deleteMany({
        where: {
          OR: [
            { id: testPatientId },
            { identification: validPatientData.identification },
            { email: validPatientData.email },
          ],
        },
      });
      testPatientId = '';
    }
  });

  /**
   * Final cleanup
   */
  afterAll(async () => {
    // Delete test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }

    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * CREATE PATIENT ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/patients', () => {
    it('should successfully create a new patient', async () => {
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(validPatientData.firstName);
      expect(response.body.data.lastName).toBe(validPatientData.lastName);
      expect(response.body.data.identification).toBe(validPatientData.identification);
      expect(response.body.data.emergencyContacts).toHaveLength(1);

      testPatientId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/patients')
        .send(validPatientData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        ...validPatientData,
        firstName: 'A', // Too short
      };

      await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });

    it('should return 409 for duplicate identification', async () => {
      // Create first patient
      const firstResponse = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = firstResponse.body.data.id;

      // Try to create duplicate
      await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData)
        .expect(409);
    });

    it('should return 400 for invalid Ecuadorian ID', async () => {
      const invalidIdData = {
        ...validPatientData,
        identification: '9999999999', // Invalid check digit
      };

      await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidIdData)
        .expect(422);
    });

    it('should return 400 for invalid phone format', async () => {
      const invalidPhoneData = {
        ...validPatientData,
        phone: '123456', // Invalid format
      };

      await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPhoneData)
        .expect(422);
    });

    it('should return 400 for invalid email', async () => {
      const invalidEmailData = {
        ...validPatientData,
        email: 'not-an-email',
      };

      await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEmailData)
        .expect(422);
    });
  });

  /**
   * ==========================================
   * GET PATIENTS ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/patients', () => {
    beforeEach(async () => {
      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    it('should get all patients with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should filter patients by search term', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Juan' })
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].firstName).toContain('Juan');
    });

    it('should filter patients by gender', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ gender: Gender.MALE })
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].gender).toBe(Gender.MALE);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/patients')
        .expect(401);
    });
  });

  /**
   * ==========================================
   * GET PATIENT BY ID ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/patients/:id', () => {
    beforeEach(async () => {
      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    it('should get patient by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(testPatientId);
      expect(response.body.data.firstName).toBe(validPatientData.firstName);
      expect(response.body.data).toHaveProperty('emergencyContacts');
      expect(response.body.data).toHaveProperty('_count');
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .get('/api/v1/patients/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });
  });

  /**
   * ==========================================
   * UPDATE PATIENT ENDPOINT TESTS
   * ==========================================
   */
  describe('PUT /api/v1/patients/:id', () => {
    beforeEach(async () => {
      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    it('should successfully update patient', async () => {
      const updateData = {
        firstName: 'Carlos',
        phone: '+593987654323',
      };

      const response = await request(app)
        .put(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.lastName).toBe(validPatientData.lastName); // Unchanged
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .put(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Test' })
        .expect(404);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'not-an-email',
      };

      await request(app)
        .put(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });
  });

  /**
   * ==========================================
   * DELETE PATIENT ENDPOINT TESTS
   * ==========================================
   */
  describe('DELETE /api/v1/patients/:id', () => {
    beforeEach(async () => {
      // Create admin user for delete operations
      const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
          name: 'admin',
          description: 'Admin role',
        },
      });

      const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin.test@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Test',
          roleId: adminRole.id,
        },
      });

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin.test@example.com',
          password: 'AdminPass123!',
        });

      authToken = loginResponse.body.data.tokens.accessToken;

      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    afterEach(async () => {
      // Cleanup admin user
      await prisma.user.deleteMany({
        where: { email: 'admin.test@example.com' },
      });
    });

    it('should successfully delete patient (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify patient is soft deleted
      const deletedPatient = await prisma.patient.findUnique({
        where: { id: testPatientId },
      });

      expect(deletedPatient).not.toBeNull();
      expect(deletedPatient?.deletedAt).not.toBeNull();
      expect(deletedPatient?.isActive).toBe(false);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .delete(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  /**
   * ==========================================
   * GET PATIENT MEDICAL HISTORY TESTS
   * ==========================================
   */
  describe('GET /api/v1/patients/:id/history', () => {
    beforeEach(async () => {
      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    it('should get patient medical history', async () => {
      const response = await request(app)
        .get(`/api/v1/patients/${testPatientId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/api/v1/patients/${fakeId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  /**
   * ==========================================
   * SEARCH PATIENTS TESTS
   * ==========================================
   */
  describe('GET /api/v1/patients/search', () => {
    beforeEach(async () => {
      // Create test patient
      const response = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatientData);

      testPatientId = response.body.data.id;
    });

    it('should search patients by name', async () => {
      const response = await request(app)
        .get('/api/v1/patients/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Juan' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/v1/patients/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'NonExistentName' })
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
