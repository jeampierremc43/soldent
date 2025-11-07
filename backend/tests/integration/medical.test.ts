import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';

/**
 * Medical Integration Tests
 * Tests all medical record endpoints with real database interactions
 */
describe('Medical Integration Tests', () => {
  let testPatientId: string;
  let testDoctorId: string;
  let testRoleId: string;
  let authToken: string;
  let medicalHistoryId: string;
  let diagnosisId: string;
  let treatmentId: string;
  let treatmentPlanId: string;
  let catalogId: string;
  let cie10Code: string;

  const testDoctor = {
    email: 'doctor.medical.test@example.com',
    password: 'DoctorPass123!',
    firstName: 'Test',
    lastName: 'Doctor',
    phone: '+593987654321',
  };

  const testPatient = {
    firstName: 'Medical',
    lastName: 'Test Patient',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'MALE',
    identification: '1234567890',
    identificationType: 'CEDULA',
    phone: '+593999999999',
    email: 'patient.medical.test@example.com',
  };

  /**
   * Setup: Create test doctor, patient, catalog, and CIE-10 code
   */
  beforeAll(async () => {
    // Create doctor role
    const role = await prisma.role.upsert({
      where: { name: 'doctor' },
      update: {},
      create: {
        name: 'doctor',
        description: 'Test doctor role',
      },
    });
    testRoleId = role.id;

    // Create test doctor
    const hashedPassword = await bcrypt.hash(testDoctor.password, 10);
    const doctor = await prisma.user.create({
      data: {
        email: testDoctor.email,
        password: hashedPassword,
        firstName: testDoctor.firstName,
        lastName: testDoctor.lastName,
        phone: testDoctor.phone,
        roleId: testRoleId,
      },
    });
    testDoctorId = doctor.id;

    // Create test patient
    const patient = await prisma.patient.create({
      data: testPatient,
    });
    testPatientId = patient.id;

    // Create CIE-10 code
    const cie10 = await prisma.cIE10Code.upsert({
      where: { code: 'K02.1' },
      update: {},
      create: {
        code: 'K02.1',
        name: 'Caries de la dentina',
        category: 'K02: Caries dental',
        chapter: 'K00-K14: Enfermedades de la cavidad bucal',
        description: 'Caries que afecta la dentina',
      },
    });
    cie10Code = cie10.code;

    // Create treatment catalog
    const catalog = await prisma.treatmentCatalog.create({
      data: {
        code: 'RES-001',
        name: 'Restauración con resina',
        description: 'Restauración dental con resina compuesta',
        category: 'Restauraciones',
        baseCost: 50.00,
        duration: 60,
      },
    });
    catalogId = catalog.id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testDoctor.email,
        password: testDoctor.password,
      });

    authToken = loginResponse.body.data.tokens.accessToken;
  });

  /**
   * Cleanup: Delete all test data
   */
  afterAll(async () => {
    // Delete in order of dependencies
    await prisma.treatment.deleteMany({ where: { patientId: testPatientId } });
    await prisma.treatmentPlan.deleteMany({ where: { patientId: testPatientId } });
    await prisma.diagnosis.deleteMany({ where: { patientId: testPatientId } });
    await prisma.medicalHistory.deleteMany({ where: { patientId: testPatientId } });
    await prisma.patient.deleteMany({ where: { id: testPatientId } });
    await prisma.user.deleteMany({ where: { id: testDoctorId } });
    await prisma.treatmentCatalog.deleteMany({ where: { id: catalogId } });
    await prisma.cIE10Code.deleteMany({ where: { code: cie10Code } });
    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * MEDICAL HISTORY ENDPOINT TESTS
   * ==========================================
   */
  describe('Medical History Endpoints', () => {
    describe('POST /api/v1/medical/patients/:patientId/medical-history', () => {
      it('should create medical history for a patient', async () => {
        const medicalHistoryData = {
          allergies: ['Penicilina', 'Polen'],
          chronicDiseases: ['Diabetes'],
          currentMedications: ['Metformina 500mg'],
          brushingFrequency: 3,
          usesFloss: true,
          usesMouthwash: true,
          smokingHabit: 'NEVER',
          alcoholConsumption: 'OCCASIONAL',
          bruxism: false,
          nailBiting: false,
          notes: 'Patient is compliant with oral hygiene',
        };

        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/medical-history`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(medicalHistoryData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.patientId).toBe(testPatientId);
        expect(response.body.data.allergies).toEqual(medicalHistoryData.allergies);
        expect(response.body.data.chronicDiseases).toEqual(medicalHistoryData.chronicDiseases);
        expect(response.body.data.brushingFrequency).toBe(3);

        medicalHistoryId = response.body.data.id;
      });

      it('should return 409 if medical history already exists', async () => {
        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/medical-history`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            allergies: ['Test'],
          })
          .expect(409);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('already has medical history');
      });

      it('should return 404 for non-existent patient', async () => {
        const fakePatientId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
          .post(`/api/v1/medical/patients/${fakePatientId}/medical-history`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            allergies: ['Test'],
          })
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/medical-history`)
          .send({})
          .expect(401);
      });
    });

    describe('GET /api/v1/medical/patients/:patientId/medical-history', () => {
      it('should get medical history for a patient', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/patients/${testPatientId}/medical-history`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.patientId).toBe(testPatientId);
      });
    });

    describe('PUT /api/v1/medical/medical-history/:id', () => {
      it('should update medical history', async () => {
        const updateData = {
          brushingFrequency: 4,
          notes: 'Updated notes',
        };

        const response = await request(app)
          .put(`/api/v1/medical/medical-history/${medicalHistoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.brushingFrequency).toBe(4);
        expect(response.body.data.notes).toBe('Updated notes');
      });
    });
  });

  /**
   * ==========================================
   * DIAGNOSIS ENDPOINT TESTS
   * ==========================================
   */
  describe('Diagnosis Endpoints', () => {
    describe('POST /api/v1/medical/patients/:patientId/diagnoses', () => {
      it('should create diagnosis with valid CIE-10 code', async () => {
        const diagnosisData = {
          cie10Code: 'K02.1',
          toothNumber: '16',
          description: 'Caries profunda en primer molar superior derecho',
          severity: 'MODERATE',
        };

        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/diagnoses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(diagnosisData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.cie10Code).toBe('K02.1');
        expect(response.body.data.cie10Name).toBe('Caries de la dentina');
        expect(response.body.data.toothNumber).toBe('16');

        diagnosisId = response.body.data.id;
      });

      it('should return 400 for invalid CIE-10 code format', async () => {
        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/diagnoses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cie10Code: 'INVALID',
            description: 'Test',
          })
          .expect(422);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should return 400 for CIE-10 code not in catalog', async () => {
        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/diagnoses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cie10Code: 'K05.9',
            description: 'Test',
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('not found in catalog');
      });

      it('should return 404 for non-existent patient', async () => {
        const fakePatientId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
          .post(`/api/v1/medical/patients/${fakePatientId}/diagnoses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cie10Code: 'K02.1',
          })
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('GET /api/v1/medical/patients/:patientId/diagnoses', () => {
      it('should get all diagnoses for a patient', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/patients/${testPatientId}/diagnoses`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/medical/diagnoses/:id', () => {
      it('should get diagnosis by ID', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/diagnoses/${diagnosisId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.id).toBe(diagnosisId);
      });

      it('should return 404 for non-existent diagnosis', async () => {
        const fakeDiagnosisId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
          .get(`/api/v1/medical/diagnoses/${fakeDiagnosisId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('GET /api/v1/medical/diagnoses/by-code/:code', () => {
      it('should get diagnoses by CIE-10 code', async () => {
        const response = await request(app)
          .get('/api/v1/medical/diagnoses/by-code/K02.1')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  /**
   * ==========================================
   * TREATMENT ENDPOINT TESTS
   * ==========================================
   */
  describe('Treatment Endpoints', () => {
    describe('POST /api/v1/medical/patients/:patientId/treatments', () => {
      it('should create treatment linked to diagnosis', async () => {
        const treatmentData = {
          diagnosisId,
          catalogId,
          toothNumber: '16',
          description: 'Restauración con resina compuesta',
          status: 'PLANNED',
          cost: 50.00,
          paid: 25.00,
          plannedDate: new Date().toISOString(),
        };

        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(treatmentData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.diagnosisId).toBe(diagnosisId);
        expect(response.body.data.cost).toBe(50);
        expect(response.body.data.paid).toBe(25);
        expect(response.body.data.balance).toBe(25);

        treatmentId = response.body.data.id;
      });

      it('should return 400 if paid exceeds cost', async () => {
        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            catalogId,
            cost: 50.00,
            paid: 100.00,
          })
          .expect(422);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should return 400 for invalid catalog', async () => {
        const fakeCatalogId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            catalogId: fakeCatalogId,
            cost: 50.00,
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should return 400 for diagnosis from different patient', async () => {
        // Create another patient
        const anotherPatient = await prisma.patient.create({
          data: {
            ...testPatient,
            identification: '0987654321',
            email: 'another.patient@example.com',
          },
        });

        const response = await request(app)
          .post(`/api/v1/medical/patients/${anotherPatient.id}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            diagnosisId, // This diagnosis belongs to testPatient
            catalogId,
            cost: 50.00,
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('does not belong to this patient');

        // Cleanup
        await prisma.patient.delete({ where: { id: anotherPatient.id } });
      });
    });

    describe('GET /api/v1/medical/patients/:patientId/treatments', () => {
      it('should get all treatments for a patient', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/patients/${testPatientId}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/medical/treatments/:id', () => {
      it('should get treatment by ID', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/treatments/${treatmentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.id).toBe(treatmentId);
      });
    });

    describe('PUT /api/v1/medical/treatments/:id', () => {
      it('should update treatment', async () => {
        const updateData = {
          status: 'COMPLETED',
          paid: 50.00,
          completedDate: new Date().toISOString(),
        };

        const response = await request(app)
          .put(`/api/v1/medical/treatments/${treatmentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.status).toBe('COMPLETED');
        expect(response.body.data.paid).toBe(50);
        expect(response.body.data.balance).toBe(0);
      });

      it('should return 400 if paid exceeds cost', async () => {
        const response = await request(app)
          .put(`/api/v1/medical/treatments/${treatmentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            paid: 100.00,
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('GET /api/v1/medical/diagnoses/:diagnosisId/treatments', () => {
      it('should get treatments by diagnosis ID', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/diagnoses/${diagnosisId}/treatments`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  /**
   * ==========================================
   * TREATMENT PLAN ENDPOINT TESTS
   * ==========================================
   */
  describe('Treatment Plan Endpoints', () => {
    describe('POST /api/v1/medical/patients/:patientId/treatment-plans', () => {
      it('should create treatment plan', async () => {
        const planData = {
          title: 'Plan de tratamiento integral',
          description: 'Incluye restauraciones y limpieza',
          totalCost: 500.00,
          status: 'DRAFT',
        };

        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/treatment-plans`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(planData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.title).toBe(planData.title);
        expect(response.body.data.totalCost).toBe(500);

        treatmentPlanId = response.body.data.id;
      });

      it('should return 422 for invalid total cost', async () => {
        const response = await request(app)
          .post(`/api/v1/medical/patients/${testPatientId}/treatment-plans`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Plan',
            totalCost: -10,
          })
          .expect(422);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('GET /api/v1/medical/patients/:patientId/treatment-plans', () => {
      it('should get all treatment plans for a patient', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/patients/${testPatientId}/treatment-plans`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/medical/treatment-plans/:id', () => {
      it('should get treatment plan by ID', async () => {
        const response = await request(app)
          .get(`/api/v1/medical/treatment-plans/${treatmentPlanId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.id).toBe(treatmentPlanId);
      });
    });

    describe('PUT /api/v1/medical/treatment-plans/:id', () => {
      it('should update treatment plan', async () => {
        const updateData = {
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
        };

        const response = await request(app)
          .put(`/api/v1/medical/treatment-plans/${treatmentPlanId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.status).toBe('APPROVED');
      });
    });
  });

  /**
   * ==========================================
   * COMPLETE HISTORY ENDPOINT TEST
   * ==========================================
   */
  describe('GET /api/v1/medical/patients/:patientId/complete-history', () => {
    it('should get complete medical history', async () => {
      const response = await request(app)
        .get(`/api/v1/medical/patients/${testPatientId}/complete-history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('medicalHistory');
      expect(response.body.data).toHaveProperty('diagnoses');
      expect(response.body.data).toHaveProperty('treatments');
      expect(response.body.data).toHaveProperty('treatmentPlans');
      expect(Array.isArray(response.body.data.diagnoses)).toBe(true);
      expect(Array.isArray(response.body.data.treatments)).toBe(true);
      expect(Array.isArray(response.body.data.treatmentPlans)).toBe(true);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakePatientId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/medical/patients/${fakePatientId}/complete-history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
