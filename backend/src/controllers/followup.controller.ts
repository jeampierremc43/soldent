import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { followUpService } from '@services/followup.service';
import { Priority } from '@prisma/client';
import { AuthRequest } from '@middleware/auth';
import type {
  CreateFollowUpDTO,
  UpdateFollowUpDTO,
  SearchFollowUpsDTO,
  FollowUpListOptions,
  CreateNoteDTO,
  UpdateNoteDTO,
} from '../types/followup.types';

/**
 * FollowUp Controller
 * Handles all HTTP requests related to follow-ups and patient notes
 */
export class FollowUpController {
  // ============================================
  // FOLLOW-UP ENDPOINTS
  // ============================================

  /**
   * Get all follow-ups with optional filters and pagination
   * GET /api/v1/followups
   *
   * @query {SearchFollowUpsDTO} - Search and filter parameters
   * @returns {PaginatedFollowUpResponse} - List of follow-ups with pagination
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchFollowUpsDTO;

    // Build options from query
    const options: FollowUpListOptions = {
      filters: {
        patientId: query.patientId,
        status: query.status,
        priority: query.priority,
        search: query.search,
        dueDateFrom: query.dueDateFrom,
        dueDateTo: query.dueDateTo,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
      sorting: {
        sortBy: query.sortBy || 'dueDate',
        sortOrder: query.sortOrder || 'asc',
      },
    };

    const result = await followUpService.getAllFollowUps(options);

    return ResponseHelper.success(
      res,
      result,
      'Follow-ups retrieved successfully'
    );
  });

  /**
   * Get follow-up by ID
   * GET /api/v1/followups/:id
   *
   * @param {string} id - Follow-up ID
   * @returns {FollowUpWithRelations} - Follow-up details with patient
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const followUp = await followUpService.getFollowUpById(id!);

    return ResponseHelper.success(
      res,
      followUp,
      'Follow-up retrieved successfully'
    );
  });

  /**
   * Create new follow-up
   * POST /api/v1/followups
   *
   * @body {CreateFollowUpDTO} - Follow-up creation data
   * @returns {FollowUpWithRelations} - Created follow-up
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const data: CreateFollowUpDTO = req.body;

    const followUp = await followUpService.createFollowUp(data);

    return ResponseHelper.created(
      res,
      followUp,
      'Follow-up created successfully'
    );
  });

  /**
   * Update follow-up by ID
   * PUT /api/v1/followups/:id
   *
   * @param {string} id - Follow-up ID
   * @body {UpdateFollowUpDTO} - Follow-up update data
   * @returns {FollowUpWithRelations} - Updated follow-up
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateFollowUpDTO = req.body;

    const followUp = await followUpService.updateFollowUp(id!, data);

    return ResponseHelper.success(
      res,
      followUp,
      'Follow-up updated successfully'
    );
  });

  /**
   * Delete follow-up by ID
   * DELETE /api/v1/followups/:id
   *
   * @param {string} id - Follow-up ID
   * @returns {void}
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await followUpService.deleteFollowUp(id!);

    return ResponseHelper.success(
      res,
      null,
      'Follow-up deleted successfully'
    );
  });

  /**
   * Mark follow-up as completed
   * PATCH /api/v1/followups/:id/complete
   *
   * @param {string} id - Follow-up ID
   * @returns {FollowUpWithRelations} - Updated follow-up
   */
  markAsCompleted = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const followUp = await followUpService.markAsCompleted(id!);

    return ResponseHelper.success(
      res,
      followUp,
      'Follow-up marked as completed'
    );
  });

  /**
   * Mark follow-up as cancelled
   * PATCH /api/v1/followups/:id/cancel
   *
   * @param {string} id - Follow-up ID
   * @returns {FollowUpWithRelations} - Updated follow-up
   */
  markAsCancelled = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const followUp = await followUpService.markAsCancelled(id!);

    return ResponseHelper.success(
      res,
      followUp,
      'Follow-up marked as cancelled'
    );
  });

  /**
   * Get overdue follow-ups
   * GET /api/v1/followups/overdue
   *
   * @returns {FollowUpWithRelations[]} - List of overdue follow-ups
   */
  getOverdue = catchAsync(async (_req: Request, res: Response) => {
    const followUps = await followUpService.getOverdueFollowUps();

    return ResponseHelper.success(
      res,
      followUps,
      'Overdue follow-ups retrieved successfully'
    );
  });

  /**
   * Get upcoming follow-ups
   * GET /api/v1/followups/upcoming?days=7
   *
   * @query {number} days - Number of days to look ahead (default: 7)
   * @returns {FollowUpWithRelations[]} - List of upcoming follow-ups
   */
  getUpcoming = catchAsync(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

    const followUps = await followUpService.getUpcomingFollowUps(days);

    return ResponseHelper.success(
      res,
      followUps,
      'Upcoming follow-ups retrieved successfully'
    );
  });

  /**
   * Get follow-ups by priority
   * GET /api/v1/followups/priority/:priority
   *
   * @param {Priority} priority - Priority level
   * @returns {FollowUpWithRelations[]} - List of follow-ups
   */
  getByPriority = catchAsync(async (req: Request, res: Response) => {
    const { priority } = req.params;

    const followUps = await followUpService.getFollowUpsByPriority(priority as Priority);

    return ResponseHelper.success(
      res,
      followUps,
      'Follow-ups retrieved successfully'
    );
  });

  /**
   * Get dashboard statistics
   * GET /api/v1/followups/stats
   *
   * @returns {FollowUpDashboardStats} - Dashboard statistics
   */
  getStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await followUpService.getDashboardStats();

    return ResponseHelper.success(
      res,
      stats,
      'Statistics retrieved successfully'
    );
  });

  // ============================================
  // NOTE ENDPOINTS
  // ============================================

  /**
   * Get patient notes
   * GET /api/v1/followups/patients/:patientId/notes
   *
   * @param {string} patientId - Patient ID
   * @returns {NoteWithRelations[]} - List of patient notes
   */
  getPatientNotes = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const notes = await followUpService.getPatientNotes(patientId!);

    return ResponseHelper.success(
      res,
      notes,
      'Notes retrieved successfully'
    );
  });

  /**
   * Create note for patient
   * POST /api/v1/followups/patients/:patientId/notes
   *
   * @param {string} patientId - Patient ID
   * @body {CreateNoteDTO} - Note creation data
   * @returns {NoteWithRelations} - Created note
   */
  createPatientNote = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const data: CreateNoteDTO = req.body;
    const authReq = req as AuthRequest;
    const authorId = authReq.user?.id;

    if (!authorId) {
      return ResponseHelper.error(res, 'User not authenticated', 401);
    }

    const note = await followUpService.addNote(patientId!, authorId, data);

    return ResponseHelper.created(
      res,
      note,
      'Note created successfully'
    );
  });

  /**
   * Get note by ID
   * GET /api/v1/followups/notes/:id
   *
   * @param {string} id - Note ID
   * @returns {NoteWithRelations} - Note details
   */
  getNoteById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const note = await followUpService.getNoteById(id!);

    return ResponseHelper.success(
      res,
      note,
      'Note retrieved successfully'
    );
  });

  /**
   * Update note by ID
   * PUT /api/v1/followups/notes/:id
   *
   * @param {string} id - Note ID
   * @body {UpdateNoteDTO} - Note update data
   * @returns {NoteWithRelations} - Updated note
   */
  updateNote = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateNoteDTO = req.body;

    const note = await followUpService.updateNote(id!, data);

    return ResponseHelper.success(
      res,
      note,
      'Note updated successfully'
    );
  });

  /**
   * Delete note by ID
   * DELETE /api/v1/followups/notes/:id
   *
   * @param {string} id - Note ID
   * @returns {void}
   */
  deleteNote = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await followUpService.deleteNote(id!);

    return ResponseHelper.success(
      res,
      null,
      'Note deleted successfully'
    );
  });
}

// Export singleton instance
export const followUpController = new FollowUpController();
export default followUpController;
