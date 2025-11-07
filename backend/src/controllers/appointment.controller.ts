import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { appointmentService } from '@services/appointment.service';
import type {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentStatusDTO,
  CreateRecurringAppointmentDTO,
  CheckAvailabilityDTO,
  GetAvailableSlotsDTO,
  ListAppointmentsDTO,
  CancelAppointmentDTO,
} from '../types/appointment.types';

/**
 * Appointment Controller
 * Handles all HTTP requests related to appointments
 */
export class AppointmentController {
  /**
   * List appointments with filters
   * GET /api/v1/appointments
   *
   * @query {ListAppointmentsDTO} - Filter and pagination parameters
   * @returns {PaginatedAppointments} - List of appointments with pagination
   */
  list = catchAsync(async (req: Request, res: Response) => {
    const filters: ListAppointmentsDTO = req.query as any;

    const result = await appointmentService.listAppointments(filters);

    return ResponseHelper.success(
      res,
      result,
      'Appointments retrieved successfully'
    );
  });

  /**
   * Get appointment by ID
   * GET /api/v1/appointments/:id
   *
   * @param {string} id - Appointment ID
   * @returns {AppointmentResponse} - Appointment details
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const appointment = await appointmentService.getAppointmentById(id!);

    return ResponseHelper.success(
      res,
      appointment,
      'Appointment retrieved successfully'
    );
  });

  /**
   * Create new appointment
   * POST /api/v1/appointments
   *
   * @body {CreateAppointmentDTO} - Appointment data
   * @returns {AppointmentResponse} 201 - Created appointment
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const data: CreateAppointmentDTO = req.body;

    const appointment = await appointmentService.createAppointment(data);

    return ResponseHelper.created(
      res,
      appointment,
      'Appointment created successfully'
    );
  });

  /**
   * Update appointment
   * PUT /api/v1/appointments/:id
   *
   * @param {string} id - Appointment ID
   * @body {UpdateAppointmentDTO} - Updated appointment data
   * @returns {AppointmentResponse} - Updated appointment
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateAppointmentDTO = req.body;

    const appointment = await appointmentService.updateAppointment(id!, data);

    return ResponseHelper.success(
      res,
      appointment,
      'Appointment updated successfully'
    );
  });

  /**
   * Update appointment status
   * PATCH /api/v1/appointments/:id/status
   *
   * @param {string} id - Appointment ID
   * @body {UpdateAppointmentStatusDTO} - New status and optional notes
   * @returns {AppointmentResponse} - Updated appointment
   */
  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateAppointmentStatusDTO = req.body;

    const appointment = await appointmentService.updateStatus(id!, data);

    return ResponseHelper.success(
      res,
      appointment,
      'Appointment status updated successfully'
    );
  });

  /**
   * Cancel appointment
   * POST /api/v1/appointments/:id/cancel
   *
   * @param {string} id - Appointment ID
   * @body {CancelAppointmentDTO} - Cancellation reason
   * @returns {AppointmentResponse} - Cancelled appointment
   */
  cancel = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: CancelAppointmentDTO = req.body;

    const appointment = await appointmentService.cancelAppointment(id!, data);

    return ResponseHelper.success(
      res,
      appointment,
      'Appointment cancelled successfully'
    );
  });

  /**
   * Delete appointment
   * DELETE /api/v1/appointments/:id
   *
   * @param {string} id - Appointment ID
   * @returns {void} 200 - Appointment deleted
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await appointmentService.deleteAppointment(id!);

    return ResponseHelper.success(
      res,
      null,
      'Appointment deleted successfully'
    );
  });

  /**
   * Check appointment availability
   * POST /api/v1/appointments/check-availability
   *
   * @body {CheckAvailabilityDTO} - Availability check parameters
   * @returns {AvailabilityResult} - Availability status and details
   */
  checkAvailability = catchAsync(async (req: Request, res: Response) => {
    const data: CheckAvailabilityDTO = req.body;

    const result = await appointmentService.validateAvailability(data);

    return ResponseHelper.success(
      res,
      result,
      result.available
        ? 'Time slot is available'
        : 'Time slot is not available'
    );
  });

  /**
   * Get available time slots
   * GET /api/v1/appointments/available-slots
   *
   * @query {GetAvailableSlotsDTO} - Query parameters
   * @returns {TimeSlot[]} - List of available time slots
   */
  getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const data: GetAvailableSlotsDTO = req.query as any;

    const slots = await appointmentService.getAvailableSlots(data);

    return ResponseHelper.success(
      res,
      slots,
      'Available slots retrieved successfully'
    );
  });

  /**
   * Create recurring appointments
   * POST /api/v1/appointments/recurring
   *
   * @body {CreateRecurringAppointmentDTO} - Recurring appointment pattern
   * @returns {RecurringAppointmentResponse} 201 - Created recurring appointment with count
   */
  createRecurring = catchAsync(async (req: Request, res: Response) => {
    const data: CreateRecurringAppointmentDTO = req.body;

    const result = await appointmentService.createRecurringAppointment(data);

    return ResponseHelper.created(
      res,
      result,
      `Recurring appointment created successfully. ${result.appointmentCount} appointments generated.`
    );
  });

  /**
   * Get appointments for a specific date range (calendar view)
   * GET /api/v1/appointments/calendar
   *
   * @query {startDate, endDate, doctorId?} - Date range and optional doctor filter
   * @returns {AppointmentResponse[]} - List of appointments in date range
   */
  getCalendarView = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate, doctorId } = req.query;

    const filters: ListAppointmentsDTO = {
      startDate: startDate as string,
      endDate: endDate as string,
      doctorId: doctorId as string | undefined,
      limit: 1000, // Get all appointments in range
      sortBy: 'date',
      sortOrder: 'asc',
    };

    const result = await appointmentService.listAppointments(filters);

    return ResponseHelper.success(
      res,
      result.data,
      'Calendar appointments retrieved successfully'
    );
  });

  /**
   * Get today's appointments
   * GET /api/v1/appointments/today
   *
   * @query {doctorId?} - Optional doctor filter
   * @returns {AppointmentResponse[]} - List of today's appointments
   */
  getTodayAppointments = catchAsync(async (req: Request, res: Response) => {
    const { doctorId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filters: ListAppointmentsDTO = {
      date: today.toISOString().split('T')[0],
      doctorId: doctorId as string | undefined,
      sortBy: 'startTime',
      sortOrder: 'asc',
    };

    const result = await appointmentService.listAppointments(filters);

    return ResponseHelper.success(
      res,
      result.data,
      "Today's appointments retrieved successfully"
    );
  });

  /**
   * Get upcoming appointments
   * GET /api/v1/appointments/upcoming
   *
   * @query {doctorId?, patientId?, limit?} - Filters
   * @returns {AppointmentResponse[]} - List of upcoming appointments
   */
  getUpcomingAppointments = catchAsync(async (req: Request, res: Response) => {
    const { doctorId, patientId, limit } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filters: ListAppointmentsDTO = {
      startDate: today.toISOString().split('T')[0],
      doctorId: doctorId as string | undefined,
      patientId: patientId as string | undefined,
      limit: limit ? parseInt(limit as string) : 10,
      sortBy: 'date',
      sortOrder: 'asc',
    };

    const result = await appointmentService.listAppointments(filters);

    return ResponseHelper.success(
      res,
      result.data,
      'Upcoming appointments retrieved successfully'
    );
  });

  /**
   * Get appointment statistics
   * GET /api/v1/appointments/stats
   *
   * @query {startDate?, endDate?, doctorId?} - Date range and filters
   * @returns {AppointmentStats} - Statistics summary
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate, doctorId } = req.query;

    const filters: ListAppointmentsDTO = {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      doctorId: doctorId as string | undefined,
      limit: 10000, // Get all for stats
    };

    const result = await appointmentService.listAppointments(filters);

    // Calculate statistics
    const stats = {
      total: result.pagination.total,
      scheduled: result.data.filter((a) => a.status === 'SCHEDULED').length,
      confirmed: result.data.filter((a) => a.status === 'CONFIRMED').length,
      inProgress: result.data.filter((a) => a.status === 'IN_PROGRESS').length,
      completed: result.data.filter((a) => a.status === 'COMPLETED').length,
      cancelled: result.data.filter((a) => a.status === 'CANCELLED').length,
      noShow: result.data.filter((a) => a.status === 'NO_SHOW').length,
      byType: {
        consultation: result.data.filter((a) => a.type === 'CONSULTATION').length,
        treatment: result.data.filter((a) => a.type === 'TREATMENT').length,
        followUp: result.data.filter((a) => a.type === 'FOLLOW_UP').length,
        emergency: result.data.filter((a) => a.type === 'EMERGENCY').length,
        cleaning: result.data.filter((a) => a.type === 'CLEANING').length,
        checkup: result.data.filter((a) => a.type === 'CHECKUP').length,
      },
    };

    return ResponseHelper.success(
      res,
      stats,
      'Appointment statistics retrieved successfully'
    );
  });
}

// Export singleton instance
export const appointmentController = new AppointmentController();
export default appointmentController;
