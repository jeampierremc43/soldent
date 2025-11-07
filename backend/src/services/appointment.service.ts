import { ApiError } from '@utils/ApiError';
import { loggers } from '@utils/logger';
import { appointmentRepository } from '@repositories/appointment.repository';
import { AppointmentStatus, RecurrenceFrequency } from '@prisma/client';
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
  UpdateAppointmentStatusData,
  CreateRecurringAppointmentData,
  CheckAvailabilityData,
  GetAvailableSlotsData,
  ListAppointmentsFilters,
  AvailabilityResult,
  TimeSlot,
  AppointmentResponse,
  PaginatedAppointments,
  RecurringAppointmentResponse,
  CancelAppointmentData,
} from '../types/appointment.types';

/**
 * Appointment Service
 * Handles all business logic related to appointments
 */
export class AppointmentService {
  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if a time is within a range
   */
  private isTimeInRange(time: string, start: string, end: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  /**
   * Format appointment response
   */
  private formatAppointmentResponse(appointment: any): AppointmentResponse {
    return {
      id: appointment.id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      color: appointment.color,
      reminderSent: appointment.reminderSent,
      reminderSentAt: appointment.reminderSentAt,
      recurringAppointmentId: appointment.recurringAppointmentId,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  /**
   * List appointments with filters and pagination
   */
  async listAppointments(filters: ListAppointmentsFilters): Promise<PaginatedAppointments> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const { data, total } = await appointmentRepository.findAll(filters);

    return {
      data: data.map(this.formatAppointmentResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string): Promise<AppointmentResponse> {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    return this.formatAppointmentResponse(appointment);
  }

  /**
   * Create new appointment
   */
  async createAppointment(data: CreateAppointmentData): Promise<AppointmentResponse> {
    // Validate patient exists
    const patientExists = await appointmentRepository.patientExists(data.patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    // Validate doctor exists
    const doctorExists = await appointmentRepository.doctorExists(data.doctorId);
    if (!doctorExists) {
      throw ApiError.notFound('Doctor not found');
    }

    // Check availability
    const availability = await this.validateAvailability({
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
    });

    if (!availability.available) {
      throw ApiError.conflict(
        availability.reason || 'The selected time slot is not available'
      );
    }

    // Create appointment
    const appointment = await appointmentRepository.create(data);

    loggers.business('appointment_created', {
      appointmentId: appointment.id,
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.startTime,
    });

    return this.formatAppointmentResponse(appointment);
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    id: string,
    data: UpdateAppointmentData
  ): Promise<AppointmentResponse> {
    // Check if appointment exists
    const existingAppointment = await appointmentRepository.findById(id);
    if (!existingAppointment) {
      throw ApiError.notFound('Appointment not found');
    }

    // If changing date, time, or duration, validate availability
    if (data.date || data.startTime || data.duration) {
      const doctorId = data.doctorId || existingAppointment.doctorId;
      const date = data.date || existingAppointment.date;
      const startTime = data.startTime || existingAppointment.startTime;
      const duration = data.duration || existingAppointment.duration;

      const availability = await this.validateAvailability({
        doctorId,
        date,
        startTime,
        duration,
        excludeAppointmentId: id,
      });

      if (!availability.available) {
        throw ApiError.conflict(
          availability.reason || 'The selected time slot is not available'
        );
      }
    }

    // Update appointment
    const appointment = await appointmentRepository.update(id, data);

    loggers.business('appointment_updated', {
      appointmentId: id,
      changes: data,
    });

    return this.formatAppointmentResponse(appointment);
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string,
    data: UpdateAppointmentStatusData
  ): Promise<AppointmentResponse> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    const updated = await appointmentRepository.updateStatus(
      id,
      data.status,
      data.notes
    );

    loggers.business('appointment_status_updated', {
      appointmentId: id,
      oldStatus: appointment.status,
      newStatus: data.status,
    });

    return this.formatAppointmentResponse(updated);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    id: string,
    data: CancelAppointmentData
  ): Promise<AppointmentResponse> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw ApiError.badRequest('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot cancel a completed appointment');
    }

    const updated = await appointmentRepository.updateStatus(
      id,
      AppointmentStatus.CANCELLED,
      `Cancellation reason: ${data.reason}`
    );

    loggers.business('appointment_cancelled', {
      appointmentId: id,
      reason: data.reason,
    });

    return this.formatAppointmentResponse(updated);
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    await appointmentRepository.delete(id);

    loggers.business('appointment_deleted', {
      appointmentId: id,
    });
  }

  /**
   * Validate appointment availability
   */
  async validateAvailability(data: CheckAvailabilityData): Promise<AvailabilityResult> {
    const date = new Date(data.date);
    const dayOfWeek = date.getDay();

    // Calculate end time
    const endTime = this.minutesToTime(
      this.timeToMinutes(data.startTime) + data.duration
    );

    // 1. Check if doctor works on this day
    const workSchedule = await appointmentRepository.getWorkSchedule(
      data.doctorId,
      dayOfWeek
    );

    if (!workSchedule) {
      return {
        available: false,
        reason: 'Doctor does not work on this day',
      };
    }

    // 2. Check if appointment is within working hours
    if (
      !this.isTimeInRange(data.startTime, workSchedule.startTime, workSchedule.endTime) ||
      !this.isTimeInRange(endTime, workSchedule.startTime, workSchedule.endTime)
    ) {
      return {
        available: false,
        reason: `Doctor works from ${workSchedule.startTime} to ${workSchedule.endTime}`,
      };
    }

    // 3. Check if appointment overlaps with break time
    if (workSchedule.breakStart && workSchedule.breakEnd) {
      const overlapWithBreak =
        this.isTimeInRange(data.startTime, workSchedule.breakStart, workSchedule.breakEnd) ||
        this.isTimeInRange(endTime, workSchedule.breakStart, workSchedule.breakEnd) ||
        (this.timeToMinutes(data.startTime) <= this.timeToMinutes(workSchedule.breakStart) &&
          this.timeToMinutes(endTime) >= this.timeToMinutes(workSchedule.breakEnd));

      if (overlapWithBreak) {
        return {
          available: false,
          reason: `Break time from ${workSchedule.breakStart} to ${workSchedule.breakEnd}`,
        };
      }
    }

    // 4. Check for blocked times
    const blockedTimes = await appointmentRepository.getBlockedTimes(data.doctorId, date);
    for (const blocked of blockedTimes) {
      const overlapWithBlocked =
        this.isTimeInRange(data.startTime, blocked.startTime, blocked.endTime) ||
        this.isTimeInRange(endTime, blocked.startTime, blocked.endTime) ||
        (this.timeToMinutes(data.startTime) <= this.timeToMinutes(blocked.startTime) &&
          this.timeToMinutes(endTime) >= this.timeToMinutes(blocked.endTime));

      if (overlapWithBlocked) {
        return {
          available: false,
          reason: `Time blocked: ${blocked.reason}`,
        };
      }
    }

    // 5. Check for conflicting appointments
    const conflicts = await appointmentRepository.findConflicts(
      data.doctorId,
      date,
      data.startTime,
      endTime,
      data.excludeAppointmentId
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: 'Time slot conflicts with existing appointments',
        conflicts: conflicts.map((c) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          patient: `${c.patient.firstName} ${c.patient.lastName}`,
        })),
      };
    }

    return { available: true };
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  async getAvailableSlots(data: GetAvailableSlotsData): Promise<TimeSlot[]> {
    const date = new Date(data.date);
    const dayOfWeek = date.getDay();
    const slotDuration = data.duration || 30; // Default 30 minutes slots

    // Get work schedule
    const workSchedule = await appointmentRepository.getWorkSchedule(
      data.doctorId,
      dayOfWeek
    );

    if (!workSchedule) {
      return [];
    }

    // Get all appointments for the day
    const appointments = await appointmentRepository.findByDateRange(
      data.doctorId,
      date,
      date
    );

    // Get blocked times
    const blockedTimes = await appointmentRepository.getBlockedTimes(data.doctorId, date);

    // Generate all possible slots
    const slots: TimeSlot[] = [];
    const startMinutes = this.timeToMinutes(workSchedule.startTime);
    const endMinutes = this.timeToMinutes(workSchedule.endTime);

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const slotStartTime = this.minutesToTime(minutes);
      const slotEndTime = this.minutesToTime(minutes + slotDuration);

      // Skip if slot ends after work hours
      if (minutes + slotDuration > endMinutes) {
        break;
      }

      // Check if slot is during break
      if (workSchedule.breakStart && workSchedule.breakEnd) {
        const isDuringBreak =
          this.isTimeInRange(slotStartTime, workSchedule.breakStart, workSchedule.breakEnd) ||
          this.isTimeInRange(slotEndTime, workSchedule.breakStart, workSchedule.breakEnd);

        if (isDuringBreak) {
          slots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            available: false,
          });
          continue;
        }
      }

      // Check if slot is blocked
      let isBlocked = false;
      for (const blocked of blockedTimes) {
        if (
          this.isTimeInRange(slotStartTime, blocked.startTime, blocked.endTime) ||
          this.isTimeInRange(slotEndTime, blocked.startTime, blocked.endTime)
        ) {
          isBlocked = true;
          break;
        }
      }

      if (isBlocked) {
        slots.push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          available: false,
        });
        continue;
      }

      // Check if slot conflicts with appointments
      let conflictingAppointment = null;
      for (const apt of appointments) {
        const aptStartMinutes = this.timeToMinutes(apt.startTime);
        const aptEndMinutes = this.timeToMinutes(apt.endTime);

        if (
          (minutes >= aptStartMinutes && minutes < aptEndMinutes) ||
          (minutes + slotDuration > aptStartMinutes &&
            minutes + slotDuration <= aptEndMinutes) ||
          (minutes <= aptStartMinutes && minutes + slotDuration >= aptEndMinutes)
        ) {
          conflictingAppointment = apt;
          break;
        }
      }

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        available: !conflictingAppointment,
        appointmentId: conflictingAppointment?.id,
      });
    }

    return slots;
  }

  /**
   * Generate dates for recurring appointments
   */
  private generateRecurringDates(data: CreateRecurringAppointmentData): Date[] {
    const dates: Date[] = [];
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;
    const maxOccurrences = data.occurrences || 52; // Default max 52 occurrences

    let currentDate = new Date(startDate);
    let count = 0;

    while (count < maxOccurrences) {
      if (endDate && currentDate > endDate) {
        break;
      }

      // Check if date matches the pattern
      let shouldInclude = false;

      if (data.frequency === RecurrenceFrequency.DAILY) {
        shouldInclude = true;
      } else if (data.frequency === RecurrenceFrequency.WEEKLY) {
        if (data.daysOfWeek && data.daysOfWeek.includes(currentDate.getDay())) {
          shouldInclude = true;
        }
      } else if (data.frequency === RecurrenceFrequency.BIWEEKLY) {
        const weeksDiff = Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        if (
          weeksDiff % 2 === 0 &&
          data.daysOfWeek &&
          data.daysOfWeek.includes(currentDate.getDay())
        ) {
          shouldInclude = true;
        }
      } else if (data.frequency === RecurrenceFrequency.MONTHLY) {
        if (currentDate.getDate() === startDate.getDate()) {
          shouldInclude = true;
        }
      }

      if (shouldInclude) {
        dates.push(new Date(currentDate));
        count++;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Safety check to prevent infinite loops
      if (dates.length > 0) {
        const daysSinceStart =
          (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceStart > 365) {
          // Stop after 1 year
          break;
        }
      }
    }

    return dates;
  }

  /**
   * Create recurring appointments
   */
  async createRecurringAppointment(
    data: CreateRecurringAppointmentData
  ): Promise<RecurringAppointmentResponse> {
    // Validate patient exists
    const patientExists = await appointmentRepository.patientExists(data.patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    // Validate doctor exists
    const doctorExists = await appointmentRepository.doctorExists(data.doctorId);
    if (!doctorExists) {
      throw ApiError.notFound('Doctor not found');
    }

    // Generate dates for recurring pattern
    const dates = this.generateRecurringDates(data);

    if (dates.length === 0) {
      throw ApiError.badRequest('No valid dates generated for the recurring pattern');
    }

    // Validate availability for all dates
    const unavailableDates: string[] = [];
    for (const date of dates) {
      const availability = await this.validateAvailability({
        doctorId: data.doctorId,
        date,
        startTime: data.startTime,
        duration: data.duration,
      });

      if (!availability.available) {
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr) {
          unavailableDates.push(dateStr);
        }
      }
    }

    if (unavailableDates.length > 0) {
      throw ApiError.conflict(
        `Some dates are not available: ${unavailableDates.join(', ')}. Please adjust the pattern or exclude these dates.`
      );
    }

    // Create recurring appointment pattern
    const recurringAppointment = await appointmentRepository.createRecurringPattern(data);

    // Create individual appointments
    const appointments = dates.map((date) => ({
      date,
      patientId: data.patientId,
      doctorId: data.doctorId,
      startTime: data.startTime,
      duration: data.duration,
      type: data.type,
      reason: data.reason,
    }));

    const createdCount = await appointmentRepository.createRecurringAppointments(
      recurringAppointment.id,
      appointments
    );

    loggers.business('recurring_appointments_created', {
      recurringAppointmentId: recurringAppointment.id,
      appointmentsCreated: createdCount,
      patientId: data.patientId,
      doctorId: data.doctorId,
    });

    return {
      id: recurringAppointment.id,
      patientId: recurringAppointment.patientId,
      doctorId: recurringAppointment.doctorId,
      startTime: recurringAppointment.startTime,
      duration: recurringAppointment.duration,
      type: recurringAppointment.type,
      reason: recurringAppointment.reason,
      frequency: recurringAppointment.frequency,
      interval: recurringAppointment.interval,
      daysOfWeek: recurringAppointment.daysOfWeek,
      startDate: recurringAppointment.startDate,
      endDate: recurringAppointment.endDate,
      occurrences: recurringAppointment.occurrences,
      active: recurringAppointment.active,
      appointmentCount: createdCount,
      createdAt: recurringAppointment.createdAt,
      updatedAt: recurringAppointment.updatedAt,
    };
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
export default appointmentService;
