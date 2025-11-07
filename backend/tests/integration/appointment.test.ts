import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';
import { AppointmentStatus, AppointmentType, RecurrenceFrequency } from '@prisma/client';

/**
 * Appointment Integration Tests
 * Tests all appointment endpoints with real database interactions
 */
describe('Appointment Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testDoctorId: string;
  let testPatientId: string;
  let testRoleId: string;
  let testAppointmentId: string;
  let testWorkScheduleId: string;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const testAppointment = {
    patientId: '',
    doctorId: '',
    date: tomorrow.toISOString().split('T')[0],
    startTime: '10:00',
    duration: 30,
    type: AppointmentType.CONSULTATION,
    reason: 'Regular checkup',
    notes: 'Patient has no allergies',
  };

  /**
   * Setup: Create test data before all tests
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

    // Create test doctor user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const doctor = await prisma.user.create({
      data: {
        email: 'test.doctor@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Doctor',
        phone: '+593987654321',
        roleId: testRoleId,
      },
    });
    testDoctorId = doctor.id;
    testUserId = doctor.id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test.doctor@example.com',
        password: 'TestPassword123!',
      });
    authToken = loginResponse.body.data.tokens.accessToken;

    // Create test patient
    const patient = await prisma.patient.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        identification: '1234567890',
        phone: '+593991234567',
        email: 'john.doe@example.com',
      },
    });
    testPatientId = patient.id;

    // Create work schedule for tomorrow
    const dayOfWeek = tomorrow.getDay();
    const workSchedule = await prisma.workSchedule.create({
      data: {
        doctorId: testDoctorId,
        dayOfWeek,
        startTime: '08:00',
        endTime: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isActive: true,
      },
    });
    testWorkScheduleId = workSchedule.id;

    // Set patient and doctor IDs in test data
    testAppointment.patientId = testPatientId;
    testAppointment.doctorId = testDoctorId;
  });

  /**
   * Cleanup: Delete test appointment after each test
   */
  afterEach(async () => {
    if (testAppointmentId) {
      await prisma.appointment.deleteMany({
        where: { id: testAppointmentId },
      });
      testAppointmentId = '';
    }
  });

  /**
   * Final cleanup: Delete all test data
   */
  afterAll(async () => {
    // Delete appointments
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { patientId: testPatientId },
          { doctorId: testDoctorId },
        ],
      },
    });

    // Delete work schedules
    await prisma.workSchedule.deleteMany({
      where: { id: testWorkScheduleId },
    });

    // Delete patient
    await prisma.patient.deleteMany({
      where: { id: testPatientId },
    });

    // Delete user
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });

    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * CREATE APPOINTMENT TESTS
   * ==========================================
   */
  describe('POST /api/v1/appointments', () => {
    it('should create a new appointment successfully', async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.patientId).toBe(testPatientId);
      expect(response.body.data.doctorId).toBe(testDoctorId);
      expect(response.body.data.startTime).toBe('10:00');
      expect(response.body.data.endTime).toBe('10:30');
      expect(response.body.data.duration).toBe(30);
      expect(response.body.data.status).toBe(AppointmentStatus.SCHEDULED);

      testAppointmentId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/appointments')
        .send(testAppointment)
        .expect(401);
    });

    it('should return 404 for non-existent patient', async () => {
      const invalidData = {
        ...testAppointment,
        patientId: '00000000-0000-0000-0000-000000000000',
      };

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Patient not found');
    });

    it('should return 404 for non-existent doctor', async () => {
      const invalidData = {
        ...testAppointment,
        doctorId: '00000000-0000-0000-0000-000000000000',
      };

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Doctor not found');
    });

    it('should return 422 for invalid time format', async () => {
      const invalidData = {
        ...testAppointment,
        startTime: '25:00', // Invalid hour
      };

      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });

    it('should return 422 for invalid duration', async () => {
      const invalidData = {
        ...testAppointment,
        duration: 2, // Less than minimum (5 minutes)
      };

      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
    });

    it('should return 409 for conflicting appointment', async () => {
      // Create first appointment
      const firstResponse = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment)
        .expect(201);

      testAppointmentId = firstResponse.body.data.id;

      // Try to create conflicting appointment
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available');
    });

    it('should return 409 for appointment during break time', async () => {
      const breakTimeData = {
        ...testAppointment,
        startTime: '12:00', // During break (12:00-13:00)
      };

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(breakTimeData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Break time');
    });

    it('should return 409 for appointment outside working hours', async () => {
      const outsideHoursData = {
        ...testAppointment,
        startTime: '20:00', // After 18:00
      };

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(outsideHoursData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('works from');
    });
  });

  /**
   * ==========================================
   * LIST APPOINTMENTS TESTS
   * ==========================================
   */
  describe('GET /api/v1/appointments', () => {
    beforeEach(async () => {
      // Create test appointment
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should list appointments with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter appointments by doctor', async () => {
      const response = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ doctorId: testDoctorId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].doctorId).toBe(testDoctorId);
    });

    it('should filter appointments by patient', async () => {
      const response = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ patientId: testPatientId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].patientId).toBe(testPatientId);
    });

    it('should filter appointments by status', async () => {
      const response = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: AppointmentStatus.SCHEDULED })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((apt: any) => {
        expect(apt.status).toBe(AppointmentStatus.SCHEDULED);
      });
    });
  });

  /**
   * ==========================================
   * GET APPOINTMENT BY ID TESTS
   * ==========================================
   */
  describe('GET /api/v1/appointments/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should get appointment by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAppointmentId);
      expect(response.body.data).toHaveProperty('patient');
      expect(response.body.data).toHaveProperty('doctor');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/v1/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .get('/api/v1/appointments/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });
  });

  /**
   * ==========================================
   * UPDATE APPOINTMENT TESTS
   * ==========================================
   */
  describe('PUT /api/v1/appointments/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should update appointment successfully', async () => {
      const updateData = {
        startTime: '11:00',
        duration: 45,
        notes: 'Updated notes',
      };

      const response = await request(app)
        .put(`/api/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startTime).toBe('11:00');
      expect(response.body.data.endTime).toBe('11:45');
      expect(response.body.data.duration).toBe(45);
      expect(response.body.data.notes).toBe('Updated notes');
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .put('/api/v1/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Test' })
        .expect(404);
    });
  });

  /**
   * ==========================================
   * UPDATE APPOINTMENT STATUS TESTS
   * ==========================================
   */
  describe('PATCH /api/v1/appointments/:id/status', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should update appointment status', async () => {
      const response = await request(app)
        .patch(`/api/v1/appointments/${testAppointmentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: AppointmentStatus.CONFIRMED })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should return 422 for invalid status', async () => {
      await request(app)
        .patch(`/api/v1/appointments/${testAppointmentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(422);
    });
  });

  /**
   * ==========================================
   * CANCEL APPOINTMENT TESTS
   * ==========================================
   */
  describe('POST /api/v1/appointments/:id/cancel', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should cancel appointment with reason', async () => {
      const response = await request(app)
        .post(`/api/v1/appointments/${testAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Patient requested cancellation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should return 400 when cancelling already cancelled appointment', async () => {
      // Cancel first time
      await request(app)
        .post(`/api/v1/appointments/${testAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' });

      // Try to cancel again
      const response = await request(app)
        .post(`/api/v1/appointments/${testAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * ==========================================
   * CHECK AVAILABILITY TESTS
   * ==========================================
   */
  describe('POST /api/v1/appointments/check-availability', () => {
    it('should return available for valid time slot', async () => {
      const availabilityData = {
        doctorId: testDoctorId,
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        duration: 30,
      };

      const response = await request(app)
        .post('/api/v1/appointments/check-availability')
        .set('Authorization', `Bearer ${authToken}`)
        .send(availabilityData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });

    it('should return unavailable for conflicting time slot', async () => {
      // Create appointment first
      const createResponse = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = createResponse.body.data.id;

      // Check same time slot
      const availabilityData = {
        doctorId: testDoctorId,
        date: testAppointment.date,
        startTime: testAppointment.startTime,
        duration: testAppointment.duration,
      };

      const response = await request(app)
        .post('/api/v1/appointments/check-availability')
        .set('Authorization', `Bearer ${authToken}`)
        .send(availabilityData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(false);
      expect(response.body.data.reason).toBeDefined();
    });
  });

  /**
   * ==========================================
   * GET AVAILABLE SLOTS TESTS
   * ==========================================
   */
  describe('GET /api/v1/appointments/available-slots', () => {
    it('should return available time slots', async () => {
      const response = await request(app)
        .get('/api/v1/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          doctorId: testDoctorId,
          date: tomorrow.toISOString().split('T')[0],
          duration: 30,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const slot = response.body.data[0];
      expect(slot).toHaveProperty('startTime');
      expect(slot).toHaveProperty('endTime');
      expect(slot).toHaveProperty('available');
    });

    it('should mark occupied slots as unavailable', async () => {
      // Create appointment
      const createResponse = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = createResponse.body.data.id;

      // Get available slots
      const response = await request(app)
        .get('/api/v1/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          doctorId: testDoctorId,
          date: tomorrow.toISOString().split('T')[0],
          duration: 30,
        })
        .expect(200);

      // Find the slot at 10:00 and verify it's unavailable
      const occupiedSlot = response.body.data.find(
        (slot: any) => slot.startTime === '10:00'
      );
      expect(occupiedSlot).toBeDefined();
      expect(occupiedSlot.available).toBe(false);
    });
  });

  /**
   * ==========================================
   * DELETE APPOINTMENT TESTS
   * ==========================================
   */
  describe('DELETE /api/v1/appointments/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testAppointment);
      testAppointmentId = response.body.data.id;
    });

    it('should delete appointment successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify appointment is deleted
      await request(app)
        .get(`/api/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .delete('/api/v1/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
