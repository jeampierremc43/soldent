import { Router } from 'express';
import { appointmentController } from '@controllers/appointment.controller';
import { validate, commonSchemas } from '@middleware/validation';
import { authenticate } from '@middleware/auth';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  createRecurringAppointmentSchema,
  checkAvailabilitySchema,
  getAvailableSlotsSchema,
  listAppointmentsSchema,
  cancelAppointmentSchema,
} from '../types/appointment.types';

const router = Router();

/**
 * ============================================
 * AUTHENTICATION REQUIRED FOR ALL ROUTES
 * ============================================
 */
router.use(authenticate);

/**
 * ============================================
 * UTILITY ROUTES (Order matters - specific before general)
 * ============================================
 */

/**
 * Check appointment availability
 * POST /api/v1/appointments/check-availability
 *
 * @requires Authentication
 * @permission appointment:read
 * @body {CheckAvailabilityDTO}
 * @returns {AvailabilityResult} 200 - Availability status
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Doctor not found
 */
router.post(
  '/check-availability',
  validate({ body: checkAvailabilitySchema }),
  appointmentController.checkAvailability
);

/**
 * Get available time slots
 * GET /api/v1/appointments/available-slots
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {GetAvailableSlotsDTO}
 * @returns {TimeSlot[]} 200 - List of available slots
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Doctor not found or doesn't work on this day
 */
router.get(
  '/available-slots',
  validate({ query: getAvailableSlotsSchema }),
  appointmentController.getAvailableSlots
);

/**
 * Create recurring appointments
 * POST /api/v1/appointments/recurring
 *
 * @requires Authentication
 * @permission appointment:create
 * @body {CreateRecurringAppointmentDTO}
 * @returns {RecurringAppointmentResponse} 201 - Created recurring pattern
 * @returns {ApiError} 400 - Validation error or no valid dates
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Patient or doctor not found
 * @returns {ApiError} 409 - Some dates not available
 */
router.post(
  '/recurring',
  validate({ body: createRecurringAppointmentSchema as any }),
  appointmentController.createRecurring
);

/**
 * Get calendar view of appointments
 * GET /api/v1/appointments/calendar
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {startDate, endDate, doctorId?}
 * @returns {AppointmentResponse[]} 200 - Appointments in date range
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 */
router.get('/calendar', appointmentController.getCalendarView);

/**
 * Get today's appointments
 * GET /api/v1/appointments/today
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {doctorId?}
 * @returns {AppointmentResponse[]} 200 - Today's appointments
 * @returns {ApiError} 401 - Not authenticated
 */
router.get('/today', appointmentController.getTodayAppointments);

/**
 * Get upcoming appointments
 * GET /api/v1/appointments/upcoming
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {doctorId?, patientId?, limit?}
 * @returns {AppointmentResponse[]} 200 - Upcoming appointments
 * @returns {ApiError} 401 - Not authenticated
 */
router.get('/upcoming', appointmentController.getUpcomingAppointments);

/**
 * Get appointment statistics
 * GET /api/v1/appointments/stats
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {startDate?, endDate?, doctorId?}
 * @returns {AppointmentStats} 200 - Statistics summary
 * @returns {ApiError} 401 - Not authenticated
 */
router.get('/stats', appointmentController.getStats);

/**
 * ============================================
 * CRUD ROUTES
 * ============================================
 */

/**
 * List appointments with filters
 * GET /api/v1/appointments
 *
 * @requires Authentication
 * @permission appointment:read
 * @query {ListAppointmentsDTO}
 * @returns {PaginatedAppointments} 200 - List of appointments with pagination
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 */
router.get(
  '/',
  validate({ query: listAppointmentsSchema as any }),
  appointmentController.list
);

/**
 * Create new appointment
 * POST /api/v1/appointments
 *
 * @requires Authentication
 * @permission appointment:create
 * @body {CreateAppointmentDTO}
 * @returns {AppointmentResponse} 201 - Created appointment
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Patient or doctor not found
 * @returns {ApiError} 409 - Time slot not available or conflicts
 */
router.post(
  '/',
  validate({ body: createAppointmentSchema }),
  appointmentController.create
);

/**
 * Get appointment by ID
 * GET /api/v1/appointments/:id
 *
 * @requires Authentication
 * @permission appointment:read
 * @param {string} id - Appointment ID (UUID)
 * @returns {AppointmentResponse} 200 - Appointment details
 * @returns {ApiError} 400 - Invalid ID format
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Appointment not found
 */
router.get(
  '/:id',
  validate({ params: commonSchemas.id }),
  appointmentController.getById
);

/**
 * Update appointment
 * PUT /api/v1/appointments/:id
 *
 * @requires Authentication
 * @permission appointment:update
 * @param {string} id - Appointment ID (UUID)
 * @body {UpdateAppointmentDTO}
 * @returns {AppointmentResponse} 200 - Updated appointment
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Appointment not found
 * @returns {ApiError} 409 - Time slot not available
 */
router.put(
  '/:id',
  validate({
    params: commonSchemas.id,
    body: updateAppointmentSchema,
  }),
  appointmentController.update
);

/**
 * Update appointment status
 * PATCH /api/v1/appointments/:id/status
 *
 * @requires Authentication
 * @permission appointment:update
 * @param {string} id - Appointment ID (UUID)
 * @body {UpdateAppointmentStatusDTO}
 * @returns {AppointmentResponse} 200 - Updated appointment
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Appointment not found
 */
router.patch(
  '/:id/status',
  validate({
    params: commonSchemas.id,
    body: updateAppointmentStatusSchema,
  }),
  appointmentController.updateStatus
);

/**
 * Cancel appointment
 * POST /api/v1/appointments/:id/cancel
 *
 * @requires Authentication
 * @permission appointment:update
 * @param {string} id - Appointment ID (UUID)
 * @body {CancelAppointmentDTO}
 * @returns {AppointmentResponse} 200 - Cancelled appointment
 * @returns {ApiError} 400 - Validation error or already cancelled/completed
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Appointment not found
 */
router.post(
  '/:id/cancel',
  validate({
    params: commonSchemas.id,
    body: cancelAppointmentSchema,
  }),
  appointmentController.cancel
);

/**
 * Delete appointment
 * DELETE /api/v1/appointments/:id
 *
 * @requires Authentication
 * @permission appointment:delete
 * @param {string} id - Appointment ID (UUID)
 * @returns {void} 200 - Appointment deleted
 * @returns {ApiError} 400 - Invalid ID format
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 404 - Appointment not found
 */
router.delete(
  '/:id',
  validate({ params: commonSchemas.id }),
  appointmentController.delete
);

/**
 * ============================================
 * ROUTE DOCUMENTATION
 * ============================================
 *
 * All routes require authentication and return standardized JSON responses.
 *
 * Required Permissions:
 * - appointment:read   - View appointments
 * - appointment:create - Create appointments (including recurring)
 * - appointment:update - Update appointments, status, and cancel
 * - appointment:delete - Delete appointments
 *
 * Success Response Format:
 * {
 *   "success": true,
 *   "message": "Success message",
 *   "data": { ... },
 *   "timestamp": "2025-01-01T00:00:00.000Z"
 * }
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "message": "Error message",
 *   "statusCode": 400,
 *   "errors": [ ... ] (optional),
 *   "timestamp": "2025-01-01T00:00:00.000Z"
 * }
 *
 * Authentication:
 * - All routes require a valid JWT token in the Authorization header
 * - Format: "Authorization: Bearer <token>"
 *
 * Common Status Codes:
 * - 200: Success
 * - 201: Created
 * - 400: Bad Request (validation error)
 * - 401: Unauthorized (not authenticated)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found
 * - 409: Conflict (time slot not available)
 * - 422: Unprocessable Entity (validation failed)
 * - 500: Internal Server Error
 *
 * Appointment Status Flow:
 * SCHEDULED -> CONFIRMED -> IN_PROGRESS -> COMPLETED
 *     |            |              |
 *     v            v              v
 * CANCELLED   CANCELLED      CANCELLED
 *     |            |              |
 *     v            v              v
 * NO_SHOW      NO_SHOW        NO_SHOW
 *
 * Appointment Types:
 * - CONSULTATION: Initial consultation
 * - TREATMENT: Treatment session
 * - FOLLOW_UP: Follow-up appointment
 * - EMERGENCY: Emergency visit
 * - CLEANING: Dental cleaning
 * - CHECKUP: Regular checkup
 *
 * Recurrence Frequencies:
 * - DAILY: Every day
 * - WEEKLY: Every week (specify days of week)
 * - BIWEEKLY: Every two weeks (specify days of week)
 * - MONTHLY: Every month (same day of month)
 *
 * Time Format:
 * - Use 24-hour format: "HH:MM" (e.g., "09:00", "14:30")
 * - All times are in local timezone
 *
 * Date Format:
 * - Use ISO 8601 format: "YYYY-MM-DD" or full ISO datetime
 * - Example: "2025-01-15" or "2025-01-15T09:00:00.000Z"
 *
 * Duration:
 * - Specified in minutes
 * - Minimum: 5 minutes
 * - Maximum: 480 minutes (8 hours)
 * - Common durations: 15, 30, 45, 60 minutes
 *
 * Availability Validation:
 * The system validates:
 * 1. Doctor works on the specified day
 * 2. Time is within doctor's working hours
 * 3. Time doesn't overlap with break time
 * 4. Time is not blocked (vacations, etc.)
 * 5. No conflicting appointments exist
 *
 * Recurring Appointments:
 * - Generate multiple appointments based on a pattern
 * - All generated appointments are validated for availability
 * - If any date is unavailable, the entire operation fails
 * - Maximum 52 occurrences per pattern
 * - Can specify end date OR number of occurrences
 * - For weekly/biweekly, must specify days of week (0=Sunday, 6=Saturday)
 */

export default router;
