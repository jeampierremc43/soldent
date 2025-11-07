import { Router } from 'express';
import { medicalController } from '@controllers/medical.controller';
import { validate } from '@middleware/validation';
import { authenticate, authorize } from '@middleware/auth';
import {
  createMedicalHistorySchema,
  updateMedicalHistorySchema,
  createDiagnosisSchema,
  createTreatmentSchema,
  updateTreatmentSchema,
  createTreatmentPlanSchema,
  updateTreatmentPlanSchema,
} from '../types/medical.types';

const router = Router();

/**
 * ============================================
 * AUTHENTICATION & AUTHORIZATION
 * ============================================
 *
 * All routes require authentication.
 * Most routes require 'doctor' or 'admin' roles.
 * Read operations can be accessed by 'receptionist' role.
 */

/**
 * ============================================
 * MEDICAL HISTORY ROUTES
 * ============================================
 */

/**
 * Get medical history for a patient
 * GET /api/v1/medical/patients/:patientId/medical-history
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param patientId - Patient UUID
 * @returns {MedicalHistoryResponse} 200 - Medical history
 * @returns {ApiError} 404 - Patient not found
 */
router.get(
  '/patients/:patientId/medical-history',
  authenticate,
  medicalController.getMedicalHistory
);

/**
 * Create medical history for a patient
 * POST /api/v1/medical/patients/:patientId/medical-history
 *
 * @requires Authentication
 * @requires Permission: medical:create
 * @requires Role: doctor or admin
 * @param patientId - Patient UUID
 * @body {CreateMedicalHistoryDTO}
 * @returns {MedicalHistoryResponse} 201 - Medical history created
 * @returns {ApiError} 404 - Patient not found
 * @returns {ApiError} 409 - Medical history already exists
 */
router.post(
  '/patients/:patientId/medical-history',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: createMedicalHistorySchema }),
  medicalController.createMedicalHistory
);

/**
 * Update medical history
 * PUT /api/v1/medical/medical-history/:id
 *
 * @requires Authentication
 * @requires Permission: medical:update
 * @requires Role: doctor or admin
 * @param id - Medical history UUID
 * @body {UpdateMedicalHistoryDTO}
 * @returns {MedicalHistoryResponse} 200 - Medical history updated
 * @returns {ApiError} 404 - Medical history not found
 */
router.put(
  '/medical-history/:id',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: updateMedicalHistorySchema }),
  medicalController.updateMedicalHistory
);

/**
 * ============================================
 * DIAGNOSIS ROUTES
 * ============================================
 */

/**
 * Get all diagnoses for a patient
 * GET /api/v1/medical/patients/:patientId/diagnoses
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param patientId - Patient UUID
 * @returns {DiagnosisResponse[]} 200 - List of diagnoses
 * @returns {ApiError} 404 - Patient not found
 */
router.get(
  '/patients/:patientId/diagnoses',
  authenticate,
  medicalController.getDiagnoses
);

/**
 * Get diagnosis by ID
 * GET /api/v1/medical/diagnoses/:id
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param id - Diagnosis UUID
 * @returns {DiagnosisResponse} 200 - Diagnosis details
 * @returns {ApiError} 404 - Diagnosis not found
 */
router.get(
  '/diagnoses/:id',
  authenticate,
  medicalController.getDiagnosisById
);

/**
 * Create diagnosis with CIE-10 validation
 * POST /api/v1/medical/patients/:patientId/diagnoses
 *
 * @requires Authentication
 * @requires Permission: medical:create
 * @requires Role: doctor or admin
 * @param patientId - Patient UUID
 * @body {CreateDiagnosisDTO}
 * @returns {DiagnosisResponse} 201 - Diagnosis created
 * @returns {ApiError} 404 - Patient not found
 * @returns {ApiError} 400 - Invalid CIE-10 code
 */
router.post(
  '/patients/:patientId/diagnoses',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: createDiagnosisSchema }),
  medicalController.createDiagnosis
);

/**
 * Get diagnoses by CIE-10 code
 * GET /api/v1/medical/diagnoses/by-code/:code
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param code - CIE-10 code (e.g., K02.1)
 * @returns {DiagnosisResponse[]} 200 - List of diagnoses
 */
router.get(
  '/diagnoses/by-code/:code',
  authenticate,
  medicalController.getDiagnosesByCIE10Code
);

/**
 * ============================================
 * TREATMENT ROUTES
 * ============================================
 */

/**
 * Get all treatments for a patient
 * GET /api/v1/medical/patients/:patientId/treatments
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param patientId - Patient UUID
 * @returns {TreatmentResponse[]} 200 - List of treatments
 * @returns {ApiError} 404 - Patient not found
 */
router.get(
  '/patients/:patientId/treatments',
  authenticate,
  medicalController.getTreatments
);

/**
 * Get treatment by ID
 * GET /api/v1/medical/treatments/:id
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param id - Treatment UUID
 * @returns {TreatmentResponse} 200 - Treatment details
 * @returns {ApiError} 404 - Treatment not found
 */
router.get(
  '/treatments/:id',
  authenticate,
  medicalController.getTreatmentById
);

/**
 * Create treatment linked to diagnosis
 * POST /api/v1/medical/patients/:patientId/treatments
 *
 * @requires Authentication
 * @requires Permission: medical:create
 * @requires Role: doctor or admin
 * @param patientId - Patient UUID
 * @body {CreateTreatmentDTO}
 * @returns {TreatmentResponse} 201 - Treatment created
 * @returns {ApiError} 404 - Patient or catalog not found
 * @returns {ApiError} 400 - Invalid diagnosis or payment
 */
router.post(
  '/patients/:patientId/treatments',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: createTreatmentSchema }),
  medicalController.createTreatment
);

/**
 * Update treatment
 * PUT /api/v1/medical/treatments/:id
 *
 * @requires Authentication
 * @requires Permission: medical:update
 * @requires Role: doctor or admin
 * @param id - Treatment UUID
 * @body {UpdateTreatmentDTO}
 * @returns {TreatmentResponse} 200 - Treatment updated
 * @returns {ApiError} 404 - Treatment not found
 * @returns {ApiError} 400 - Invalid payment or dates
 */
router.put(
  '/treatments/:id',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: updateTreatmentSchema }),
  medicalController.updateTreatment
);

/**
 * Get treatments by diagnosis ID
 * GET /api/v1/medical/diagnoses/:diagnosisId/treatments
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param diagnosisId - Diagnosis UUID
 * @returns {TreatmentResponse[]} 200 - List of treatments
 */
router.get(
  '/diagnoses/:diagnosisId/treatments',
  authenticate,
  medicalController.getTreatmentsByDiagnosisId
);

/**
 * ============================================
 * TREATMENT PLAN ROUTES
 * ============================================
 */

/**
 * Get all treatment plans for a patient
 * GET /api/v1/medical/patients/:patientId/treatment-plans
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param patientId - Patient UUID
 * @returns {TreatmentPlanResponse[]} 200 - List of treatment plans
 * @returns {ApiError} 404 - Patient not found
 */
router.get(
  '/patients/:patientId/treatment-plans',
  authenticate,
  medicalController.getTreatmentPlans
);

/**
 * Get treatment plan by ID
 * GET /api/v1/medical/treatment-plans/:id
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param id - Treatment plan UUID
 * @returns {TreatmentPlanResponse} 200 - Treatment plan details
 * @returns {ApiError} 404 - Treatment plan not found
 */
router.get(
  '/treatment-plans/:id',
  authenticate,
  medicalController.getTreatmentPlanById
);

/**
 * Create treatment plan
 * POST /api/v1/medical/patients/:patientId/treatment-plans
 *
 * @requires Authentication
 * @requires Permission: medical:create
 * @requires Role: doctor or admin
 * @param patientId - Patient UUID
 * @body {CreateTreatmentPlanDTO}
 * @returns {TreatmentPlanResponse} 201 - Treatment plan created
 * @returns {ApiError} 404 - Patient not found
 */
router.post(
  '/patients/:patientId/treatment-plans',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: createTreatmentPlanSchema }),
  medicalController.createTreatmentPlan
);

/**
 * Update treatment plan
 * PUT /api/v1/medical/treatment-plans/:id
 *
 * @requires Authentication
 * @requires Permission: medical:update
 * @requires Role: doctor or admin
 * @param id - Treatment plan UUID
 * @body {UpdateTreatmentPlanDTO}
 * @returns {TreatmentPlanResponse} 200 - Treatment plan updated
 * @returns {ApiError} 404 - Treatment plan not found
 */
router.put(
  '/treatment-plans/:id',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: updateTreatmentPlanSchema }),
  medicalController.updateTreatmentPlan
);

/**
 * ============================================
 * COMPLETE HISTORY ROUTE
 * ============================================
 */

/**
 * Get complete medical history for a patient
 * GET /api/v1/medical/patients/:patientId/complete-history
 *
 * @requires Authentication
 * @requires Permission: medical:read
 * @param patientId - Patient UUID
 * @returns {CompleteMedicalHistoryResponse} 200 - Complete medical history
 * @returns {ApiError} 404 - Patient not found
 *
 * Returns:
 * - Medical history (general and dental)
 * - All diagnoses with CIE-10 codes
 * - All treatments with status and payments
 * - All treatment plans
 */
router.get(
  '/patients/:patientId/complete-history',
  authenticate,
  medicalController.getCompleteHistory
);

/**
 * ============================================
 * ROUTE DOCUMENTATION
 * ============================================
 *
 * Permissions Required:
 * - medical:read - View medical records
 * - medical:create - Create diagnoses, treatments, plans
 * - medical:update - Update medical records
 *
 * Roles:
 * - admin: Full access to all medical operations
 * - doctor: Can create and update medical records
 * - receptionist: Read-only access to medical records
 *
 * All responses follow the standard format:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... },
 *   "timestamp": "..."
 * }
 *
 * CIE-10 Validation:
 * - All diagnosis codes must be in range K00-K14 (dental)
 * - Codes must exist in the CIE10Code catalog
 * - Format: K00.0 to K14.9
 */

export default router;
