import { Router } from 'express';
import { patientController } from '@controllers/patient.controller';
import { authenticate, authorize } from '@middleware/auth';
import { validate } from '@middleware/validation';
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
  patientIdSchema,
} from '../types/patient.types';

const router = Router();

/**
 * Patient Routes
 * All routes require authentication
 * Base path: /api/v1/patients
 */

// ============================================
// PUBLIC SEARCH ROUTES (require authentication only)
// ============================================

/**
 * Search patients by name (autocomplete)
 * GET /search?q=searchterm&limit=10
 * Permissions: patients:read
 */
router.get(
  '/search',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  patientController.searchByName
);

/**
 * Get patients with upcoming appointments
 * GET /upcoming?days=7
 * Permissions: patients:read
 */
router.get(
  '/upcoming',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  patientController.getUpcoming
);

/**
 * Get dashboard statistics
 * GET /dashboard/stats
 * Permissions: patients:read
 */
router.get(
  '/dashboard/stats',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  patientController.getDashboardStats
);

/**
 * Find patient by identification
 * GET /identification/:identification
 * Permissions: patients:read
 */
router.get(
  '/identification/:identification',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  patientController.findByIdentification
);

// ============================================
// CRUD ROUTES
// ============================================

/**
 * Get all patients with filters and pagination
 * GET /?page=1&limit=10&search=john&gender=MALE
 * Permissions: patients:read
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ query: searchPatientsSchema }),
  patientController.getAll
);

/**
 * Create new patient
 * POST /
 * Permissions: patients:create
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ body: createPatientSchema }),
  patientController.create
);

/**
 * Get patient by ID
 * GET /:id
 * Permissions: patients:read
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdSchema }),
  patientController.getById
);

/**
 * Update patient by ID
 * PUT /:id
 * Permissions: patients:update
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({
    params: patientIdSchema,
    body: updatePatientSchema,
  }),
  patientController.update
);

/**
 * Delete patient by ID (soft delete)
 * DELETE /:id
 * Permissions: patients:delete
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'), // Only admins can delete
  validate({ params: patientIdSchema }),
  patientController.delete
);

// ============================================
// PATIENT SPECIFIC ROUTES
// ============================================

/**
 * Get patient medical history
 * GET /:id/history
 * Permissions: patients:read
 */
router.get(
  '/:id/history',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdSchema }),
  patientController.getMedicalHistory
);

/**
 * Get patient appointments
 * GET /:id/appointments?limit=10
 * Permissions: patients:read
 */
router.get(
  '/:id/appointments',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdSchema }),
  patientController.getAppointments
);

/**
 * Get patient treatments
 * GET /:id/treatments?limit=10
 * Permissions: patients:read
 */
router.get(
  '/:id/treatments',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdSchema }),
  patientController.getTreatments
);

/**
 * Get patient statistics
 * GET /:id/stats
 * Permissions: patients:read
 */
router.get(
  '/:id/stats',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdSchema }),
  patientController.getStats
);

/**
 * Restore soft-deleted patient
 * POST /:id/restore
 * Permissions: patients:delete (admin only)
 */
router.post(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  validate({ params: patientIdSchema }),
  patientController.restore
);

/**
 * Activate patient account
 * POST /:id/activate
 * Permissions: patients:update
 */
router.post(
  '/:id/activate',
  authenticate,
  authorize('admin'),
  validate({ params: patientIdSchema }),
  patientController.activate
);

/**
 * Deactivate patient account
 * POST /:id/deactivate
 * Permissions: patients:update
 */
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('admin'),
  validate({ params: patientIdSchema }),
  patientController.deactivate
);

export default router;
