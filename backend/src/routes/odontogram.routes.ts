import { Router } from 'express';
import { odontogramController } from '@controllers/odontogram.controller';
import { validate } from '@middleware/validation';
import { authenticate, authorize } from '@middleware/auth';
import {
  createOdontogramSchema,
  updateOdontogramSchema,
  updateToothSchema,
  odontogramQuerySchema,
  compareVersionsSchema,
} from '../types/odontogram.types';

const router = Router();

/**
 * ============================================
 * AUTHENTICATION & AUTHORIZATION
 * ============================================
 *
 * All routes require authentication.
 * Create/Update routes require 'doctor' or 'admin' roles.
 * Read operations can be accessed by 'receptionist' role.
 */

/**
 * ============================================
 * ODONTOGRAM QUERY ROUTES
 * ============================================
 */

/**
 * Get all odontograms for a patient (including history)
 * GET /api/v1/odontograms/patients/:patientId/odontograms
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @param patientId - Patient UUID
 * @query isCurrent - Filter by current status (true/false)
 * @returns {OdontogramResponse[]} 200 - List of odontograms
 * @returns {ApiError} 404 - Patient not found
 *
 * Query Parameters:
 * - isCurrent: true/false (optional) - Filter by current odontogram
 *
 * Example: GET /api/v1/odontograms/patients/123/odontograms?isCurrent=true
 */
router.get(
  '/patients/:patientId/odontograms',
  authenticate,
  validate({ query: odontogramQuerySchema }),
  odontogramController.getOdontograms
);

/**
 * Get current odontogram for a patient
 * GET /api/v1/odontograms/patients/:patientId/odontograms/current
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @param patientId - Patient UUID
 * @returns {OdontogramWithTeethResponse} 200 - Current odontogram with teeth
 * @returns {ApiError} 404 - Patient not found or no current odontogram
 */
router.get(
  '/patients/:patientId/odontograms/current',
  authenticate,
  odontogramController.getCurrentOdontogram
);

/**
 * Get odontogram by ID with teeth
 * GET /api/v1/odontograms/:id
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @param id - Odontogram UUID
 * @returns {OdontogramWithTeethResponse} 200 - Odontogram with teeth
 * @returns {ApiError} 404 - Odontogram not found
 */
router.get(
  '/:id',
  authenticate,
  odontogramController.getOdontogramById
);

/**
 * Get odontogram history (all versions)
 * GET /api/v1/odontograms/:id/history
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @param id - Odontogram UUID (any version)
 * @returns {OdontogramResponse[]} 200 - All versions of odontograms
 * @returns {ApiError} 404 - Odontogram not found
 */
router.get(
  '/:id/history',
  authenticate,
  odontogramController.getOdontogramHistory
);

/**
 * Get odontogram statistics
 * GET /api/v1/odontograms/:id/statistics
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @param id - Odontogram UUID
 * @returns {OdontogramStatistics} 200 - Statistics (healthy, caries, filled, etc.)
 * @returns {ApiError} 404 - Odontogram not found
 */
router.get(
  '/:id/statistics',
  authenticate,
  odontogramController.getOdontogramStatistics
);

/**
 * Compare two odontogram versions
 * GET /api/v1/odontograms/compare?v1=...&v2=...
 *
 * @requires Authentication
 * @requires Permission: odontogram:read
 * @query v1 - First odontogram UUID
 * @query v2 - Second odontogram UUID
 * @returns {OdontogramComparisonResponse} 200 - Comparison with changes
 * @returns {ApiError} 400 - Missing v1 or v2 parameters
 * @returns {ApiError} 404 - One or both odontograms not found
 * @returns {ApiError} 400 - Odontograms belong to different patients
 *
 * Example: GET /api/v1/odontograms/compare?v1=uuid1&v2=uuid2
 */
router.get(
  '/compare',
  authenticate,
  validate({ query: compareVersionsSchema }),
  odontogramController.compareVersions
);

/**
 * ============================================
 * ODONTOGRAM CREATE/UPDATE ROUTES
 * ============================================
 */

/**
 * Create new odontogram for a patient
 * POST /api/v1/odontograms/patients/:patientId/odontograms
 *
 * @requires Authentication
 * @requires Permission: odontogram:create
 * @requires Role: doctor or admin
 * @param patientId - Patient UUID
 * @body {CreateOdontogramDTO}
 * @returns {OdontogramWithTeethResponse} 201 - Odontogram created
 * @returns {ApiError} 404 - Patient not found
 * @returns {ApiError} 400 - Invalid teeth numbers or surfaces
 *
 * Body:
 * {
 *   "type": "PERMANENT" | "TEMPORARY" | "MIXED",
 *   "generalNotes": "Optional notes",
 *   "teeth": [ // Optional - if not provided, all teeth are generated as HEALTHY
 *     {
 *       "toothNumber": "11", // FDI notation
 *       "status": "HEALTHY",
 *       "surfaces": {
 *         "O": { "status": "CARIES", "notes": "..." },
 *         "M": { "status": "FILLED", "notes": "..." }
 *       },
 *       "notes": "..."
 *     }
 *   ]
 * }
 *
 * Notes:
 * - Creates version 1 automatically
 * - Marks previous odontograms as non-current
 * - Validates FDI tooth numbers (11-48 for permanent, 51-85 for temporary)
 * - Validates surfaces (O, M, D, V, L, P)
 * - If teeth not provided, generates all teeth as HEALTHY (32 or 20 depending on type)
 */
router.post(
  '/patients/:patientId/odontograms',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: createOdontogramSchema }),
  odontogramController.createOdontogram
);

/**
 * Update odontogram (creates new version automatically)
 * PUT /api/v1/odontograms/:id
 *
 * @requires Authentication
 * @requires Permission: odontogram:update
 * @requires Role: doctor or admin
 * @param id - Odontogram UUID
 * @body {UpdateOdontogramDTO}
 * @returns {OdontogramWithTeethResponse} 200 - New version created
 * @returns {ApiError} 404 - Odontogram not found
 *
 * Body:
 * {
 *   "generalNotes": "Updated notes"
 * }
 *
 * Notes:
 * - Creates a new version automatically (immutable versioning)
 * - Increments version number
 * - Copies all teeth from previous version
 * - Marks previous version as non-current
 */
router.put(
  '/:id',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: updateOdontogramSchema }),
  odontogramController.updateOdontogram
);

/**
 * Update specific tooth in odontogram
 * PATCH /api/v1/odontograms/:id/teeth/:toothNumber
 *
 * @requires Authentication
 * @requires Permission: odontogram:update
 * @requires Role: doctor or admin
 * @param id - Odontogram UUID
 * @param toothNumber - FDI tooth number (e.g., "11", "51")
 * @body {UpdateToothDTO}
 * @returns {ToothResponse} 200 - Tooth updated
 * @returns {ApiError} 404 - Odontogram or tooth not found
 * @returns {ApiError} 400 - Invalid surfaces
 *
 * Body:
 * {
 *   "status": "CARIES",
 *   "surfaces": {
 *     "O": { "status": "CARIES", "notes": "Deep caries" },
 *     "M": { "status": "HEALTHY" }
 *   },
 *   "notes": "Requires treatment"
 * }
 *
 * Notes:
 * - Updates tooth in-place (does not create new version)
 * - Validates tooth number exists in odontogram
 * - Validates surfaces (O, M, D, V, L, P)
 * - All fields are optional
 */
router.patch(
  '/:id/teeth/:toothNumber',
  authenticate,
  authorize('doctor', 'admin'),
  validate({ body: updateToothSchema }),
  odontogramController.updateTooth
);

/**
 * Create new version from existing odontogram
 * POST /api/v1/odontograms/:id/new-version
 *
 * @requires Authentication
 * @requires Permission: odontogram:create
 * @requires Role: doctor or admin
 * @param id - Odontogram UUID (to copy from)
 * @returns {OdontogramWithTeethResponse} 201 - New version created
 * @returns {ApiError} 404 - Odontogram not found
 *
 * Notes:
 * - Creates exact copy with incremented version number
 * - Copies all teeth with current status
 * - Marks previous version as non-current
 * - Useful for periodic checkups
 */
router.post(
  '/:id/new-version',
  authenticate,
  authorize('doctor', 'admin'),
  odontogramController.createNewVersion
);

/**
 * ============================================
 * ROUTE DOCUMENTATION
 * ============================================
 *
 * Permissions Required:
 * - odontogram:read - View odontograms
 * - odontogram:create - Create new odontograms
 * - odontogram:update - Update odontograms and teeth
 *
 * Roles:
 * - admin: Full access to all odontogram operations
 * - doctor: Can create and update odontograms
 * - receptionist: Read-only access to odontograms
 *
 * All responses follow the standard format:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... },
 *   "timestamp": "..."
 * }
 *
 * FDI Notation:
 * - Permanent teeth (adults): 11-18, 21-28, 31-38, 41-48 (32 teeth)
 * - Temporary teeth (children): 51-55, 61-65, 71-75, 81-85 (20 teeth)
 * - Mixed dentition: Can contain both permanent and temporary teeth
 *
 * Dental Surfaces:
 * - O: Oclusal (occlusal/chewing surface)
 * - M: Mesial (toward the center)
 * - D: Distal (away from the center)
 * - V: Vestibular (toward cheeks/lips)
 * - L: Lingual (toward the tongue)
 * - P: Palatina (palate - upper teeth only)
 *
 * Tooth Status:
 * - HEALTHY: Healthy tooth
 * - CARIES: Caries/cavity
 * - FILLED: Filled/restored
 * - MISSING: Missing tooth
 * - FRACTURED: Fractured tooth
 * - CROWN: Crown
 * - IMPLANT: Implant
 * - ROOT_CANAL: Root canal treatment
 * - EXTRACTION: Marked for extraction
 * - BRIDGE: Bridge
 * - TEMPORARY: Temporary restoration
 *
 * Versioning:
 * - Odontograms are immutable (never modified in-place)
 * - Each update creates a new version
 * - Version numbers increment automatically
 * - Only one odontogram can be marked as "current" per patient
 * - History is preserved for auditing and comparison
 */

export default router;
