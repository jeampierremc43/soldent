import { prisma } from '@config/database';
import {
  Appointment,
  RecurringAppointment,
  AppointmentStatus,
  Prisma,
} from '@prisma/client';
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
  ListAppointmentsFilters,
  CreateRecurringAppointmentData,
} from '../types/appointment.types';

/**
 * Appointment with relations
 */
export type AppointmentWithRelations = Appointment & {
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
};

/**
 * Appointment Repository
 * Handles all database operations related to appointments
 */
export class AppointmentRepository {
  /**
   * Calculate end time based on start time and duration
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const parts = startTime.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Build where clause for filters
   */
  private buildWhereClause(filters: ListAppointmentsFilters): Prisma.AppointmentWhereInput {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    } else if (filters.startDate) {
      where.date = {
        gte: new Date(filters.startDate),
      };
    } else if (filters.endDate) {
      where.date = {
        lte: new Date(filters.endDate),
      };
    }

    return where;
  }

  /**
   * Find all appointments with filters and pagination
   */
  async findAll(
    filters: ListAppointmentsFilters = {}
  ): Promise<{
    data: AppointmentWithRelations[];
    total: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    // Determine order by
    const orderBy: Prisma.AppointmentOrderByWithRelationInput = {};
    if (filters.sortBy === 'date') {
      orderBy.date = filters.sortOrder || 'asc';
    } else if (filters.sortBy === 'startTime') {
      orderBy.startTime = filters.sortOrder || 'asc';
    } else if (filters.sortBy === 'createdAt') {
      orderBy.createdAt = filters.sortOrder || 'desc';
    } else {
      // Default sort by date and start time
      orderBy.date = 'asc';
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find appointment by ID
   */
  async findById(id: string): Promise<AppointmentWithRelations | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Create new appointment
   */
  async create(data: CreateAppointmentData): Promise<AppointmentWithRelations> {
    const endTime = this.calculateEndTime(data.startTime, data.duration);

    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime,
        duration: data.duration,
        type: data.type,
        reason: data.reason,
        notes: data.notes || null,
        color: data.color || null,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Update appointment
   */
  async update(
    id: string,
    data: UpdateAppointmentData
  ): Promise<AppointmentWithRelations> {
    const updateData: Prisma.AppointmentUpdateInput = {};

    if (data.patientId) {
      updateData.patient = { connect: { id: data.patientId } };
    }
    if (data.doctorId) {
      updateData.doctor = { connect: { id: data.doctorId } };
    }
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.duration) updateData.duration = data.duration;
    if (data.type) updateData.type = data.type;
    if (data.reason) updateData.reason = data.reason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.color !== undefined) updateData.color = data.color;

    // Recalculate end time if start time or duration changed
    if (data.startTime || data.duration) {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        select: { startTime: true, duration: true },
      });

      if (appointment) {
        const startTime = data.startTime || appointment.startTime;
        const duration = data.duration || appointment.duration;
        updateData.endTime = this.calculateEndTime(startTime, duration);
      }
    }

    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<AppointmentWithRelations> {
    const updateData: Prisma.AppointmentUpdateInput = { status };

    if (notes) {
      updateData.notes = notes;
    }

    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Delete appointment (soft delete - just cancel it)
   */
  async delete(id: string): Promise<AppointmentWithRelations> {
    return this.updateStatus(id, AppointmentStatus.CANCELLED);
  }

  /**
   * Find appointments by date range
   */
  async findByDateRange(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Find conflicting appointments
   * Returns appointments that overlap with the given time slot
   */
  async findConflicts(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<AppointmentWithRelations[]> {
    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const where: Prisma.AppointmentWhereInput = {
      doctorId,
      date: normalizedDate,
      status: {
        notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      },
      OR: [
        // New appointment starts during existing appointment
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        // New appointment ends during existing appointment
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        // New appointment completely contains existing appointment
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
      ],
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Create recurring appointment pattern
   */
  async createRecurringPattern(
    data: CreateRecurringAppointmentData
  ): Promise<RecurringAppointment> {
    return prisma.recurringAppointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        startTime: data.startTime,
        duration: data.duration,
        type: data.type,
        reason: data.reason,
        frequency: data.frequency,
        interval: data.interval,
        daysOfWeek: data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        occurrences: data.occurrences || null,
        active: true,
      },
    });
  }

  /**
   * Create multiple appointments from recurring pattern
   */
  async createRecurringAppointments(
    recurringAppointmentId: string,
    appointments: Array<{
      date: Date;
      patientId: string;
      doctorId: string;
      startTime: string;
      duration: number;
      type: any;
      reason: string;
    }>
  ): Promise<number> {
    if (appointments.length === 0) {
      return 0;
    }

    const firstAppointment = appointments[0];
    if (!firstAppointment) {
      return 0;
    }

    const endTime = this.calculateEndTime(
      firstAppointment.startTime,
      firstAppointment.duration
    );

    const result = await prisma.appointment.createMany({
      data: appointments.map((apt) => ({
        recurringAppointmentId,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        date: apt.date,
        startTime: apt.startTime,
        endTime,
        duration: apt.duration,
        type: apt.type,
        reason: apt.reason,
        status: AppointmentStatus.SCHEDULED,
      })),
    });

    return result.count;
  }

  /**
   * Get work schedule for a doctor on a specific day
   */
  async getWorkSchedule(doctorId: string, dayOfWeek: number) {
    return prisma.workSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });
  }

  /**
   * Get blocked times for a doctor on a specific date
   */
  async getBlockedTimes(doctorId: string, date: Date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return prisma.blockedTime.findMany({
      where: {
        doctorId,
        date: normalizedDate,
      },
    });
  }

  /**
   * Find recurring appointment by ID
   */
  async findRecurringById(id: string): Promise<RecurringAppointment | null> {
    return prisma.recurringAppointment.findUnique({
      where: { id },
    });
  }

  /**
   * Get appointments count for recurring pattern
   */
  async getRecurringAppointmentsCount(recurringAppointmentId: string): Promise<number> {
    return prisma.appointment.count({
      where: { recurringAppointmentId },
    });
  }

  /**
   * Check if patient exists
   */
  async patientExists(patientId: string): Promise<boolean> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    return patient !== null;
  }

  /**
   * Check if doctor exists
   */
  async doctorExists(doctorId: string): Promise<boolean> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true },
    });
    return doctor !== null;
  }
}

// Export singleton instance
export const appointmentRepository = new AppointmentRepository();
export default appointmentRepository;
