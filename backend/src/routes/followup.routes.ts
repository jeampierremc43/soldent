import { Router } from 'express';
import { followUpController } from '@controllers/followup.controller';
import { authenticate, authorize } from '@middleware/auth';
import { validate } from '@middleware/validation';
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  searchFollowUpsSchema,
  followUpIdSchema,
  patientIdParamSchema,
  upcomingFollowUpsSchema,
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
} from '../types/followup.types';

const router = Router();

/**
 * FollowUp Routes
 * All routes require authentication
 * Base path: /api/v1/followups
 */

// ============================================
// SPECIAL ROUTES (must come before /:id)
// ============================================

/**
 * Get overdue follow-ups
 * GET /overdue
 * Permissions: followup:read
 */
router.get(
  '/overdue',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  followUpController.getOverdue
);

/**
 * Get upcoming follow-ups
 * GET /upcoming?days=7
 * Permissions: followup:read
 */
router.get(
  '/upcoming',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ query: upcomingFollowUpsSchema }),
  followUpController.getUpcoming
);

/**
 * Get dashboard statistics
 * GET /stats
 * Permissions: followup:read
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  followUpController.getStats
);

/**
 * Get follow-ups by priority
 * GET /priority/:priority
 * Permissions: followup:read
 */
router.get(
  '/priority/:priority',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  followUpController.getByPriority
);

// ============================================
// PATIENT NOTES ROUTES
// ============================================

/**
 * Get patient notes
 * GET /patients/:patientId/notes
 * Permissions: followup:read
 */
router.get(
  '/patients/:patientId/notes',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: patientIdParamSchema }),
  followUpController.getPatientNotes
);

/**
 * Create note for patient
 * POST /patients/:patientId/notes
 * Permissions: followup:create
 */
router.post(
  '/patients/:patientId/notes',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({
    params: patientIdParamSchema,
    body: createNoteSchema,
  }),
  followUpController.createPatientNote
);

/**
 * Get note by ID
 * GET /notes/:id
 * Permissions: followup:read
 */
router.get(
  '/notes/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: noteIdSchema }),
  followUpController.getNoteById
);

/**
 * Update note by ID
 * PUT /notes/:id
 * Permissions: followup:update
 */
router.put(
  '/notes/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({
    params: noteIdSchema,
    body: updateNoteSchema,
  }),
  followUpController.updateNote
);

/**
 * Delete note by ID
 * DELETE /notes/:id
 * Permissions: followup:delete
 */
router.delete(
  '/notes/:id',
  authenticate,
  authorize('admin', 'doctor'),
  validate({ params: noteIdSchema }),
  followUpController.deleteNote
);

// ============================================
// CRUD ROUTES
// ============================================

/**
 * Get all follow-ups with filters and pagination
 * GET /?page=1&limit=10&status=PENDING&priority=HIGH
 * Permissions: followup:read
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ query: searchFollowUpsSchema }),
  followUpController.getAll
);

/**
 * Create new follow-up
 * POST /
 * Permissions: followup:create
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ body: createFollowUpSchema }),
  followUpController.create
);

/**
 * Get follow-up by ID
 * GET /:id
 * Permissions: followup:read
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: followUpIdSchema }),
  followUpController.getById
);

/**
 * Update follow-up by ID
 * PUT /:id
 * Permissions: followup:update
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({
    params: followUpIdSchema,
    body: updateFollowUpSchema,
  }),
  followUpController.update
);

/**
 * Delete follow-up by ID
 * DELETE /:id
 * Permissions: followup:delete
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'doctor'),
  validate({ params: followUpIdSchema }),
  followUpController.delete
);

/**
 * Mark follow-up as completed
 * PATCH /:id/complete
 * Permissions: followup:update
 */
router.patch(
  '/:id/complete',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: followUpIdSchema }),
  followUpController.markAsCompleted
);

/**
 * Mark follow-up as cancelled
 * PATCH /:id/cancel
 * Permissions: followup:update
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('admin', 'doctor', 'receptionist'),
  validate({ params: followUpIdSchema }),
  followUpController.markAsCancelled
);

export default router;
