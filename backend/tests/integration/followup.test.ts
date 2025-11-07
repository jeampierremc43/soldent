import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';
import { FollowUpStatus, Priority, Gender, IdentificationType } from '@prisma/client';

/**
 * FollowUp Integration Tests
 * Tests all follow-up and note endpoints with real database interactions
 */
describe('FollowUp Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testRoleId: string;
  let testPatientId: string;
  let testFollowUpId: string;
  let testNoteId: string;

  const testUser = {
    email: 'followup.test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    roleId: '',
  };

  const testPatient = {
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: new Date('1985-03-20'),
    gender: Gender.FEMALE,
    identification: '0987654321',
    identificationType: IdentificationType.CEDULA,
    phone: '+593987654321',
    email: 'maria.garcia@example.com',
  };

  const validFollowUpData = {
    patientId: '',
    title: 'Control post-tratamiento',
    description: 'Verificar evolución después de la extracción dental',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    priority: Priority.MEDIUM,
  };

  const validNoteData = {
    title: 'Observación importante',
    content: 'El paciente presenta alergia a la penicilina. Usar alternativas.',
    isPinned: true,
  };

  /**
   * Setup: Create test user, patient, and authenticate
   */
  beforeAll(async () => {
    // Create test role
    const role = await prisma.role.upsert({
      where: { name: 'doctor' },
      update: {},
      create: {
        name: 'doctor',
        description: 'Test doctor role',
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
      data: testPatient,
    });
    testPatientId = patient.id;
    validFollowUpData.patientId = patient.id;

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
   * Cleanup: Delete test data after each test
   */
  afterEach(async () => {
    if (testFollowUpId) {
      await prisma.followUp.deleteMany({
        where: { id: testFollowUpId },
      });
      testFollowUpId = '';
    }

    if (testNoteId) {
      await prisma.note.deleteMany({
        where: { id: testNoteId },
      });
      testNoteId = '';
    }
  });

  /**
   * Final cleanup
   */
  afterAll(async () => {
    // Delete all test follow-ups
    await prisma.followUp.deleteMany({
      where: { patientId: testPatientId },
    });

    // Delete all test notes
    await prisma.note.deleteMany({
      where: { patientId: testPatientId },
    });

    // Delete test patient
    if (testPatientId) {
      await prisma.patient.delete({ where: { id: testPatientId } });
    }

    // Delete test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }

    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * CREATE FOLLOW-UP ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/followups', () => {
    it('should successfully create a new follow-up', async () => {
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(validFollowUpData.title);
      expect(response.body.data.patientId).toBe(validFollowUpData.patientId);
      expect(response.body.data.status).toBe(FollowUpStatus.PENDING);
      expect(response.body.data.priority).toBe(validFollowUpData.priority);
      expect(response.body.data).toHaveProperty('patient');

      testFollowUpId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/followups')
        .send(validFollowUpData)
        .expect(401);
    });

    it('should return 422 for invalid data', async () => {
      const invalidData = {
        ...validFollowUpData,
        title: 'AB', // Too short
      };

      await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });

    it('should return 400 for due date in the past', async () => {
      const invalidData = {
        ...validFollowUpData,
        dueDate: new Date('2020-01-01').toISOString(), // Past date
      };

      await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });

    it('should return 404 for non-existent patient', async () => {
      const invalidData = {
        ...validFollowUpData,
        patientId: '00000000-0000-0000-0000-000000000000',
      };

      await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(404);
    });
  });

  /**
   * ==========================================
   * GET FOLLOW-UPS ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/followups', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should get all follow-ups with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should filter follow-ups by status', async () => {
      const response = await request(app)
        .get('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: FollowUpStatus.PENDING })
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      response.body.data.data.forEach((followUp: any) => {
        expect(followUp.status).toBe(FollowUpStatus.PENDING);
      });
    });

    it('should filter follow-ups by priority', async () => {
      const response = await request(app)
        .get('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ priority: Priority.MEDIUM })
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      response.body.data.data.forEach((followUp: any) => {
        expect(followUp.priority).toBe(Priority.MEDIUM);
      });
    });

    it('should filter follow-ups by patient', async () => {
      const response = await request(app)
        .get('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ patientId: testPatientId })
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      response.body.data.data.forEach((followUp: any) => {
        expect(followUp.patientId).toBe(testPatientId);
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/followups')
        .expect(401);
    });
  });

  /**
   * ==========================================
   * GET FOLLOW-UP BY ID ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/followups/:id', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should get follow-up by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/followups/${testFollowUpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(testFollowUpId);
      expect(response.body.data.title).toBe(validFollowUpData.title);
      expect(response.body.data).toHaveProperty('patient');
    });

    it('should return 404 for non-existent follow-up', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .get(`/api/v1/followups/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 422 for invalid UUID format', async () => {
      await request(app)
        .get('/api/v1/followups/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });
  });

  /**
   * ==========================================
   * UPDATE FOLLOW-UP ENDPOINT TESTS
   * ==========================================
   */
  describe('PUT /api/v1/followups/:id', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should successfully update follow-up', async () => {
      const updateData = {
        title: 'Control actualizado',
        priority: Priority.HIGH,
      };

      const response = await request(app)
        .put(`/api/v1/followups/${testFollowUpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent follow-up', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .put(`/api/v1/followups/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test' })
        .expect(404);
    });
  });

  /**
   * ==========================================
   * MARK AS COMPLETED ENDPOINT TESTS
   * ==========================================
   */
  describe('PATCH /api/v1/followups/:id/complete', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should mark follow-up as completed', async () => {
      const response = await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe(FollowUpStatus.COMPLETED);
      expect(response.body.data.completedAt).not.toBeNull();
    });

    it('should return 400 when already completed', async () => {
      // Complete first time
      await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to complete again
      await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  /**
   * ==========================================
   * MARK AS CANCELLED ENDPOINT TESTS
   * ==========================================
   */
  describe('PATCH /api/v1/followups/:id/cancel', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should mark follow-up as cancelled', async () => {
      const response = await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe(FollowUpStatus.CANCELLED);
    });

    it('should return 400 when already cancelled', async () => {
      // Cancel first time
      await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to cancel again
      await request(app)
        .patch(`/api/v1/followups/${testFollowUpId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  /**
   * ==========================================
   * GET OVERDUE FOLLOW-UPS TESTS
   * ==========================================
   */
  describe('GET /api/v1/followups/overdue', () => {
    it('should get overdue follow-ups', async () => {
      const response = await request(app)
        .get('/api/v1/followups/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  /**
   * ==========================================
   * GET UPCOMING FOLLOW-UPS TESTS
   * ==========================================
   */
  describe('GET /api/v1/followups/upcoming', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should get upcoming follow-ups', async () => {
      const response = await request(app)
        .get('/api/v1/followups/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ days: 7 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  /**
   * ==========================================
   * GET DASHBOARD STATS TESTS
   * ==========================================
   */
  describe('GET /api/v1/followups/stats', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/followups/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('overdue');
      expect(response.body.data).toHaveProperty('byPriority');
    });
  });

  /**
   * ==========================================
   * DELETE FOLLOW-UP ENDPOINT TESTS
   * ==========================================
   */
  describe('DELETE /api/v1/followups/:id', () => {
    beforeEach(async () => {
      // Create test follow-up
      const response = await request(app)
        .post('/api/v1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validFollowUpData);

      testFollowUpId = response.body.data.id;
    });

    it('should successfully delete follow-up', async () => {
      const response = await request(app)
        .delete(`/api/v1/followups/${testFollowUpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify it's deleted
      await request(app)
        .get(`/api/v1/followups/${testFollowUpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      testFollowUpId = ''; // Clear to avoid cleanup error
    });

    it('should return 404 for non-existent follow-up', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app)
        .delete(`/api/v1/followups/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  /**
   * ==========================================
   * PATIENT NOTES TESTS
   * ==========================================
   */
  describe('Patient Notes', () => {
    describe('POST /api/v1/followups/patients/:patientId/notes', () => {
      it('should create a new note for patient', async () => {
        const response = await request(app)
          .post(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.title).toBe(validNoteData.title);
        expect(response.body.data.content).toBe(validNoteData.content);
        expect(response.body.data.isPinned).toBe(validNoteData.isPinned);
        expect(response.body.data).toHaveProperty('patient');
        expect(response.body.data).toHaveProperty('author');

        testNoteId = response.body.data.id;
      });

      it('should return 404 for non-existent patient', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';

        await request(app)
          .post(`/api/v1/followups/patients/${fakeId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData)
          .expect(404);
      });
    });

    describe('GET /api/v1/followups/patients/:patientId/notes', () => {
      beforeEach(async () => {
        // Create test note
        const response = await request(app)
          .post(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData);

        testNoteId = response.body.data.id;
      });

      it('should get all patient notes', async () => {
        const response = await request(app)
          .get(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/followups/notes/:id', () => {
      beforeEach(async () => {
        // Create test note
        const response = await request(app)
          .post(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData);

        testNoteId = response.body.data.id;
      });

      it('should get note by ID', async () => {
        const response = await request(app)
          .get(`/api/v1/followups/notes/${testNoteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.id).toBe(testNoteId);
      });
    });

    describe('PUT /api/v1/followups/notes/:id', () => {
      beforeEach(async () => {
        // Create test note
        const response = await request(app)
          .post(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData);

        testNoteId = response.body.data.id;
      });

      it('should update note', async () => {
        const updateData = {
          content: 'Contenido actualizado de la nota',
          isPinned: false,
        };

        const response = await request(app)
          .put(`/api/v1/followups/notes/${testNoteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.content).toBe(updateData.content);
        expect(response.body.data.isPinned).toBe(updateData.isPinned);
      });
    });

    describe('DELETE /api/v1/followups/notes/:id', () => {
      beforeEach(async () => {
        // Create test note
        const response = await request(app)
          .post(`/api/v1/followups/patients/${testPatientId}/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(validNoteData);

        testNoteId = response.body.data.id;
      });

      it('should delete note', async () => {
        const response = await request(app)
          .delete(`/api/v1/followups/notes/${testNoteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);

        // Verify it's deleted
        await request(app)
          .get(`/api/v1/followups/notes/${testNoteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        testNoteId = ''; // Clear to avoid cleanup error
      });
    });
  });
});
