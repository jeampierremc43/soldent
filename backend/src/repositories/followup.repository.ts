import { prisma } from '@config/database';
import { FollowUp, Note, Prisma, FollowUpStatus, Priority } from '@prisma/client';
import type {
  CreateFollowUpData,
  UpdateFollowUpData,
  FollowUpListOptions,
  PaginatedFollowUpResponse,
  CreateNoteData,
  UpdateNoteData,
} from '../types/followup.types';

/**
 * FollowUp with patient relation
 */
export type FollowUpWithPatient = FollowUp & {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
    phone: string;
    email: string | null;
  };
};

/**
 * Note with relations
 */
export type NoteWithRelations = Note & {
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
};

/**
 * FollowUp Repository
 * Handles all database operations related to follow-ups and notes
 */
export class FollowUpRepository {
  // ============================================
  // FOLLOW-UP OPERATIONS
  // ============================================

  /**
   * Find all follow-ups with optional filters and pagination
   * @param options - Filter, pagination and sorting options
   * @returns Paginated list of follow-ups
   */
  async findAll(options: FollowUpListOptions = {}): Promise<PaginatedFollowUpResponse> {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
      sorting = { sortBy: 'dueDate', sortOrder: 'asc' },
    } = options;

    // Build where clause
    const where: Prisma.FollowUpWhereInput = {
      patientId: filters.patientId,
      status: filters.status,
      priority: filters.priority,
    };

    // Add search conditions
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Add date range filters
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    // Calculate pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.FollowUpOrderByWithRelationInput = {
      [sorting.sortBy || 'dueDate']: sorting.sortOrder || 'asc',
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              identification: true,
              phone: true,
              email: true,
            },
          },
        },
      }),
      prisma.followUp.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * Find follow-up by ID
   * @param id - Follow-up ID
   * @returns Follow-up with patient or null
   */
  async findById(id: string): Promise<FollowUpWithPatient | null> {
    return prisma.followUp.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create new follow-up
   * @param data - Follow-up creation data
   * @returns Created follow-up with patient
   */
  async create(data: CreateFollowUpData): Promise<FollowUpWithPatient> {
    return prisma.followUp.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        status: FollowUpStatus.PENDING,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update follow-up by ID
   * @param id - Follow-up ID
   * @param data - Follow-up update data
   * @returns Updated follow-up with patient
   */
  async update(id: string, data: UpdateFollowUpData): Promise<FollowUpWithPatient> {
    return prisma.followUp.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete follow-up by ID (soft delete not implemented in schema, so hard delete)
   * @param id - Follow-up ID
   * @returns Deleted follow-up
   */
  async delete(id: string): Promise<FollowUp> {
    return prisma.followUp.delete({
      where: { id },
    });
  }

  /**
   * Mark follow-up as completed
   * @param id - Follow-up ID
   * @returns Updated follow-up
   */
  async markAsCompleted(id: string): Promise<FollowUpWithPatient> {
    return prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Mark follow-up as cancelled
   * @param id - Follow-up ID
   * @returns Updated follow-up
   */
  async markAsCancelled(id: string): Promise<FollowUpWithPatient> {
    return prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.CANCELLED,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find overdue follow-ups
   * @returns List of overdue follow-ups
   */
  async findOverdue(): Promise<FollowUpWithPatient[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return prisma.followUp.findMany({
      where: {
        dueDate: {
          lt: today,
        },
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find upcoming follow-ups (next N days)
   * @param days - Number of days to look ahead (default: 7)
   * @returns List of upcoming follow-ups
   */
  async findUpcoming(days = 7): Promise<FollowUpWithPatient[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    return prisma.followUp.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: endDate,
        },
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find follow-ups by priority
   * @param priority - Priority level
   * @returns List of follow-ups
   */
  async findByPriority(priority: Priority): Promise<FollowUpWithPatient[]> {
    return prisma.followUp.findMany({
      where: {
        priority,
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            identification: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Count follow-ups by status
   * @returns Object with count by status
   */
  async countByStatus() {
    const counts = await prisma.followUp.groupBy({
      by: ['status'],
      _count: true,
    });

    return counts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<FollowUpStatus, number>);
  }

  /**
   * Count follow-ups by priority
   * @returns Object with count by priority
   */
  async countByPriority() {
    const counts = await prisma.followUp.groupBy({
      by: ['priority'],
      where: {
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
      _count: true,
    });

    return counts.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {} as Record<Priority, number>);
  }

  /**
   * Count overdue follow-ups
   * @returns Number of overdue follow-ups
   */
  async countOverdue(): Promise<number> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return prisma.followUp.count({
      where: {
        dueDate: {
          lt: today,
        },
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
    });
  }

  /**
   * Count upcoming follow-ups this week
   * @returns Number of upcoming follow-ups
   */
  async countUpcomingThisWeek(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    return prisma.followUp.count({
      where: {
        dueDate: {
          gte: today,
          lte: endOfWeek,
        },
        status: {
          in: [FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
        },
      },
    });
  }

  // ============================================
  // NOTE OPERATIONS
  // ============================================

  /**
   * Find notes by patient ID
   * @param patientId - Patient ID
   * @returns List of patient notes
   */
  async findNotesByPatientId(patientId: string): Promise<NoteWithRelations[]> {
    return prisma.note.findMany({
      where: { patientId },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find note by ID
   * @param id - Note ID
   * @returns Note with relations or null
   */
  async findNoteById(id: string): Promise<NoteWithRelations | null> {
    return prisma.note.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create new note
   * @param data - Note creation data
   * @returns Created note with relations
   */
  async createNote(data: CreateNoteData): Promise<NoteWithRelations> {
    return prisma.note.create({
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update note by ID
   * @param id - Note ID
   * @param data - Note update data
   * @returns Updated note with relations
   */
  async updateNote(id: string, data: UpdateNoteData): Promise<NoteWithRelations> {
    return prisma.note.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete note by ID
   * @param id - Note ID
   * @returns Deleted note
   */
  async deleteNote(id: string): Promise<Note> {
    return prisma.note.delete({
      where: { id },
    });
  }

  /**
   * Count notes by patient ID
   * @param patientId - Patient ID
   * @returns Number of notes
   */
  async countNotesByPatientId(patientId: string): Promise<number> {
    return prisma.note.count({
      where: { patientId },
    });
  }
}

// Export singleton instance
export const followUpRepository = new FollowUpRepository();
export default followUpRepository;
