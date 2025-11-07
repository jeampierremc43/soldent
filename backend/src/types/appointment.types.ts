import { z } from 'zod';
import { AppointmentType, AppointmentStatus, RecurrenceFrequency } from '@prisma/client';

/**
 * ============================================
 * ZOD VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Time validation schema
 * Format: "HH:MM" (24-hour format)
 */
const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM (24-hour format)');

/**
 * Date validation schema
 * Must be a valid ISO date string
 */
const dateSchema = z
  .string()
  .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'));

/**
 * Duration validation
 * Must be a positive number (in minutes)
 */
const durationSchema = z
  .number()
  .int('Duration must be an integer')
  .positive('Duration must be positive')
  .min(5, 'Duration must be at least 5 minutes')
  .max(480, 'Duration must not exceed 8 hours');

/**
 * Create appointment schema
 * Validates data for creating a new appointment
 */
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: dateSchema,
  startTime: timeSchema,
  duration: durationSchema,
  type: z.nativeEnum(AppointmentType, {
    errorMap: () => ({ message: 'Invalid appointment type' }),
  }),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex color (e.g., #FF5733)')
    .optional(),
});

/**
 * Update appointment schema
 * All fields are optional for partial updates
 */
export const updateAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID').optional(),
  doctorId: z.string().uuid('Invalid doctor ID').optional(),
  date: dateSchema.optional(),
  startTime: timeSchema.optional(),
  duration: durationSchema.optional(),
  type: z
    .nativeEnum(AppointmentType, {
      errorMap: () => ({ message: 'Invalid appointment type' }),
    })
    .optional(),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex color (e.g., #FF5733)')
    .optional(),
});

/**
 * Update appointment status schema
 */
export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus, {
    errorMap: () => ({ message: 'Invalid appointment status' }),
  }),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

/**
 * Recurring appointment schema
 * Validates data for creating recurring appointments
 */
export const createRecurringAppointmentSchema = z
  .object({
    patientId: z.string().uuid('Invalid patient ID'),
    doctorId: z.string().uuid('Invalid doctor ID'),
    startTime: timeSchema,
    duration: durationSchema,
    type: z.nativeEnum(AppointmentType, {
      errorMap: () => ({ message: 'Invalid appointment type' }),
    }),
    reason: z
      .string()
      .min(3, 'Reason must be at least 3 characters')
      .max(500, 'Reason must not exceed 500 characters'),
    // Recurrence pattern
    frequency: z.nativeEnum(RecurrenceFrequency, {
      errorMap: () => ({ message: 'Invalid recurrence frequency' }),
    }),
    interval: z
      .number()
      .int('Interval must be an integer')
      .positive('Interval must be positive')
      .min(1, 'Interval must be at least 1')
      .max(30, 'Interval must not exceed 30')
      .default(1),
    daysOfWeek: z
      .array(
        z
          .number()
          .int('Day must be an integer')
          .min(0, 'Day must be between 0 (Sunday) and 6 (Saturday)')
          .max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)')
      )
      .optional(),
    startDate: dateSchema,
    endDate: dateSchema.optional(),
    occurrences: z
      .number()
      .int('Occurrences must be an integer')
      .positive('Occurrences must be positive')
      .max(52, 'Occurrences must not exceed 52')
      .optional(),
  })
  .refine((data) => data.endDate || data.occurrences, {
    message: 'Either endDate or occurrences must be provided',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.frequency === RecurrenceFrequency.WEEKLY && !data.daysOfWeek?.length) {
        return false;
      }
      return true;
    },
    {
      message: 'Days of week are required for weekly frequency',
      path: ['daysOfWeek'],
    }
  );

/**
 * Check availability schema
 * Validates data for checking appointment availability
 */
export const checkAvailabilitySchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: dateSchema,
  startTime: timeSchema,
  duration: durationSchema,
  excludeAppointmentId: z.string().uuid('Invalid appointment ID').optional(),
});

/**
 * Get available slots schema
 * Validates query parameters for getting available time slots
 */
export const getAvailableSlotsSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: dateSchema,
  duration: durationSchema.default(30),
});

/**
 * List appointments filter schema
 * Validates query parameters for listing appointments
 */
export const listAppointmentsSchema = z
  .object({
    // Filters
    doctorId: z.string().uuid('Invalid doctor ID').optional(),
    patientId: z.string().uuid('Invalid patient ID').optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    type: z.nativeEnum(AppointmentType).optional(),
    date: dateSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),

    // Pagination
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive().max(100))
      .optional(),
    sortBy: z.enum(['date', 'startTime', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

/**
 * Cancel appointment schema
 */
export const cancelAppointmentSchema = z.object({
  reason: z
    .string()
    .min(3, 'Cancellation reason must be at least 3 characters')
    .max(500, 'Cancellation reason must not exceed 500 characters'),
});

/**
 * ============================================
 * TYPESCRIPT INTERFACES
 * ============================================
 */

/**
 * Create appointment data
 */
export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  date: string | Date;
  startTime: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  notes?: string;
  color?: string;
}

/**
 * Update appointment data
 */
export interface UpdateAppointmentData {
  patientId?: string;
  doctorId?: string;
  date?: string | Date;
  startTime?: string;
  duration?: number;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
  color?: string;
}

/**
 * Update appointment status data
 */
export interface UpdateAppointmentStatusData {
  status: AppointmentStatus;
  notes?: string;
}

/**
 * Create recurring appointment data
 */
export interface CreateRecurringAppointmentData {
  patientId: string;
  doctorId: string;
  startTime: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  startDate: string | Date;
  endDate?: string | Date;
  occurrences?: number;
}

/**
 * Check availability data
 */
export interface CheckAvailabilityData {
  doctorId: string;
  date: string | Date;
  startTime: string;
  duration: number;
  excludeAppointmentId?: string;
}

/**
 * Availability result
 */
export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  conflicts?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    patient: string;
  }>;
}

/**
 * Time slot
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointmentId?: string;
}

/**
 * Get available slots data
 */
export interface GetAvailableSlotsData {
  doctorId: string;
  date: string | Date;
  duration?: number;
}

/**
 * List appointments filters
 */
export interface ListAppointmentsFilters {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  date?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'startTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Appointment response with relations
 */
export interface AppointmentResponse {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  color: string | null;
  reminderSent: boolean;
  reminderSentAt: Date | null;
  recurringAppointmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recurring appointment response
 */
export interface RecurringAppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: string | null;
  startDate: Date;
  endDate: Date | null;
  occurrences: number | null;
  active: boolean;
  appointmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cancel appointment data
 */
export interface CancelAppointmentData {
  reason: string;
}

/**
 * ============================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ============================================
 */

/**
 * Create appointment DTO
 */
export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>;

/**
 * Update appointment DTO
 */
export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>;

/**
 * Update appointment status DTO
 */
export type UpdateAppointmentStatusDTO = z.infer<typeof updateAppointmentStatusSchema>;

/**
 * Create recurring appointment DTO
 */
export type CreateRecurringAppointmentDTO = z.infer<typeof createRecurringAppointmentSchema>;

/**
 * Check availability DTO
 */
export type CheckAvailabilityDTO = z.infer<typeof checkAvailabilitySchema>;

/**
 * Get available slots DTO
 */
export type GetAvailableSlotsDTO = z.infer<typeof getAvailableSlotsSchema>;

/**
 * List appointments DTO
 */
export type ListAppointmentsDTO = z.infer<typeof listAppointmentsSchema>;

/**
 * Cancel appointment DTO
 */
export type CancelAppointmentDTO = z.infer<typeof cancelAppointmentSchema>;

/**
 * ============================================
 * UTILITY TYPES
 * ============================================
 */

/**
 * Pagination result
 */
export interface PaginatedAppointments {
  data: AppointmentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
