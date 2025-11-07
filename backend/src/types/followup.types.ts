import { z } from 'zod';
import { FollowUpStatus, Priority } from '@prisma/client';

/**
 * ============================================
 * ZOD VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Create Follow-Up schema
 */
export const createFollowUpSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  dueDate: z
    .string()
    .datetime()
    .refine(
      (date) => {
        const dueDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate >= today;
      },
      {
        message: 'Due date cannot be in the past',
      }
    ),
  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: 'Invalid priority value' }),
  }).default(Priority.MEDIUM),
});

/**
 * Update Follow-Up schema
 */
export const updateFollowUpSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  dueDate: z
    .string()
    .datetime()
    .refine(
      (date) => {
        const dueDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate >= today;
      },
      {
        message: 'Due date cannot be in the past',
      }
    )
    .optional(),
  status: z.nativeEnum(FollowUpStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
});

/**
 * Search/filter follow-ups schema
 */
export const searchFollowUpsSchema = z.object({
  // Search by criteria
  patientId: z.string().uuid().optional(),
  status: z.nativeEnum(FollowUpStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  search: z.string().min(1).max(100).optional(), // Searches in title, description

  // Date filters
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),

  // Pagination
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),

  // Sorting
  sortBy: z.enum(['dueDate', 'createdAt', 'priority', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Follow-Up ID parameter schema
 */
export const followUpIdSchema = z.object({
  id: z.string().uuid('Invalid follow-up ID format'),
});

/**
 * Patient ID parameter schema
 */
export const patientIdParamSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
});

/**
 * Upcoming follow-ups query schema
 */
export const upcomingFollowUpsSchema = z.object({
  days: z.string().transform(Number).pipe(z.number().int().positive().max(365)).optional(),
});

/**
 * Create Note schema
 */
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must not exceed 5000 characters'),
  isPinned: z.boolean().default(false),
});

/**
 * Update Note schema
 */
export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must not exceed 5000 characters')
    .optional(),
  isPinned: z.boolean().optional(),
});

/**
 * Note ID parameter schema
 */
export const noteIdSchema = z.object({
  id: z.string().uuid('Invalid note ID format'),
});

/**
 * ============================================
 * TYPESCRIPT INTERFACES
 * ============================================
 */

/**
 * Follow-Up creation data
 */
export interface CreateFollowUpData {
  patientId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
}

/**
 * Follow-Up update data
 */
export interface UpdateFollowUpData {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: FollowUpStatus;
  priority?: Priority;
}

/**
 * Follow-Up search filters
 */
export interface FollowUpSearchFilters {
  patientId?: string;
  status?: FollowUpStatus;
  priority?: Priority;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

/**
 * Follow-Up list options
 */
export interface FollowUpListOptions {
  filters?: FollowUpSearchFilters;
  pagination?: {
    page: number;
    limit: number;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

/**
 * Paginated follow-up response
 */
export interface PaginatedFollowUpResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Follow-Up with relations
 */
export interface FollowUpWithRelations {
  id: string;
  patientId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  status: FollowUpStatus;
  priority: Priority;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
    phone: string;
  };
}

/**
 * Dashboard statistics
 */
export interface FollowUpDashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  byPriority: {
    [key in Priority]: number;
  };
  upcomingThisWeek: number;
}

/**
 * Note creation data
 */
export interface CreateNoteData {
  patientId: string;
  authorId: string;
  title?: string;
  content: string;
  isPinned: boolean;
}

/**
 * Note update data
 */
export interface UpdateNoteData {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

/**
 * Note with relations
 */
export interface NoteWithRelations {
  id: string;
  patientId: string;
  authorId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * ============================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ============================================
 */

/**
 * Create follow-up DTO
 */
export type CreateFollowUpDTO = z.infer<typeof createFollowUpSchema>;

/**
 * Update follow-up DTO
 */
export type UpdateFollowUpDTO = z.infer<typeof updateFollowUpSchema>;

/**
 * Search follow-ups DTO
 */
export type SearchFollowUpsDTO = z.infer<typeof searchFollowUpsSchema>;

/**
 * Follow-Up ID DTO
 */
export type FollowUpIdDTO = z.infer<typeof followUpIdSchema>;

/**
 * Patient ID param DTO
 */
export type PatientIdParamDTO = z.infer<typeof patientIdParamSchema>;

/**
 * Upcoming follow-ups DTO
 */
export type UpcomingFollowUpsDTO = z.infer<typeof upcomingFollowUpsSchema>;

/**
 * Create note DTO
 */
export type CreateNoteDTO = z.infer<typeof createNoteSchema>;

/**
 * Update note DTO
 */
export type UpdateNoteDTO = z.infer<typeof updateNoteSchema>;

/**
 * Note ID DTO
 */
export type NoteIdDTO = z.infer<typeof noteIdSchema>;
