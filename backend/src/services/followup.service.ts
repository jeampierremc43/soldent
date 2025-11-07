import { ApiError } from '@utils/ApiError';
import logger from '@utils/logger';
import { followUpRepository } from '@repositories/followup.repository';
import { patientRepository } from '@repositories/patient.repository';
import { FollowUpStatus, Priority } from '@prisma/client';
import type {
  CreateFollowUpData,
  UpdateFollowUpData,
  FollowUpListOptions,
  PaginatedFollowUpResponse,
  FollowUpWithRelations,
  FollowUpDashboardStats,
  CreateNoteData,
  UpdateNoteData,
  NoteWithRelations,
} from '../types/followup.types';

/**
 * FollowUp Service
 * Handles all business logic related to follow-ups and patient notes
 */
export class FollowUpService {
  // ============================================
  // FOLLOW-UP OPERATIONS
  // ============================================

  /**
   * Get all follow-ups with optional filters and pagination
   * @param options - Filter, pagination and sorting options
   * @returns Paginated list of follow-ups
   */
  async getAllFollowUps(options: FollowUpListOptions = {}): Promise<PaginatedFollowUpResponse> {
    try {
      return await followUpRepository.findAll(options);
    } catch (error) {
      logger.error('Error fetching follow-ups', error);
      throw ApiError.internal('Failed to fetch follow-ups');
    }
  }

  /**
   * Get follow-up by ID
   * @param id - Follow-up ID
   * @returns Follow-up with patient
   */
  async getFollowUpById(id: string): Promise<FollowUpWithRelations> {
    const followUp = await followUpRepository.findById(id);

    if (!followUp) {
      throw ApiError.notFound('Follow-up not found');
    }

    return followUp as FollowUpWithRelations;
  }

  /**
   * Create new follow-up
   * @param data - Follow-up creation data
   * @returns Created follow-up
   */
  async createFollowUp(data: CreateFollowUpData): Promise<FollowUpWithRelations> {
    // Validate patient exists and is active
    const patient = await patientRepository.findById(data.patientId);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    if (!patient.isActive) {
      throw ApiError.badRequest('Cannot create follow-up for inactive patient');
    }

    // Validate due date is not in the past
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      throw ApiError.badRequest('Due date cannot be in the past');
    }

    try {
      const followUp = await followUpRepository.create(data);

      logger.info('Follow-up created successfully', {
        followUpId: followUp.id,
        patientId: followUp.patientId,
        dueDate: followUp.dueDate,
      });

      return followUp as FollowUpWithRelations;
    } catch (error) {
      logger.error('Error creating follow-up', error);
      throw ApiError.internal('Failed to create follow-up');
    }
  }

  /**
   * Update follow-up by ID
   * @param id - Follow-up ID
   * @param data - Follow-up update data
   * @returns Updated follow-up
   */
  async updateFollowUp(
    id: string,
    data: UpdateFollowUpData
  ): Promise<FollowUpWithRelations> {
    // Check if follow-up exists
    const existingFollowUp = await followUpRepository.findById(id);

    if (!existingFollowUp) {
      throw ApiError.notFound('Follow-up not found');
    }

    // Validate status change
    if (data.status) {
      // Cannot change status of completed or cancelled follow-ups
      if (
        existingFollowUp.status === FollowUpStatus.COMPLETED ||
        existingFollowUp.status === FollowUpStatus.CANCELLED
      ) {
        throw ApiError.badRequest(
          `Cannot update a ${existingFollowUp.status.toLowerCase()} follow-up. Create a new one instead.`
        );
      }

      // If marking as completed, set completedAt
      if (data.status === FollowUpStatus.COMPLETED) {
        // Use markAsCompleted method instead
        return this.markAsCompleted(id);
      }

      // If marking as cancelled, use markAsCancelled method instead
      if (data.status === FollowUpStatus.CANCELLED) {
        return this.markAsCancelled(id);
      }
    }

    // Validate due date if being updated
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        throw ApiError.badRequest('Due date cannot be in the past');
      }
    }

    try {
      const followUp = await followUpRepository.update(id, data);

      logger.info('Follow-up updated successfully', {
        followUpId: followUp.id,
        patientId: followUp.patientId,
      });

      return followUp as FollowUpWithRelations;
    } catch (error) {
      logger.error('Error updating follow-up', error);
      throw ApiError.internal('Failed to update follow-up');
    }
  }

  /**
   * Delete follow-up by ID
   * @param id - Follow-up ID
   */
  async deleteFollowUp(id: string): Promise<void> {
    // Check if follow-up exists
    const followUp = await followUpRepository.findById(id);

    if (!followUp) {
      throw ApiError.notFound('Follow-up not found');
    }

    try {
      await followUpRepository.delete(id);

      logger.info('Follow-up deleted successfully', {
        followUpId: id,
        patientId: followUp.patientId,
      });
    } catch (error) {
      logger.error('Error deleting follow-up', error);
      throw ApiError.internal('Failed to delete follow-up');
    }
  }

  /**
   * Mark follow-up as completed
   * @param id - Follow-up ID
   * @returns Updated follow-up
   */
  async markAsCompleted(id: string): Promise<FollowUpWithRelations> {
    // Check if follow-up exists
    const existingFollowUp = await followUpRepository.findById(id);

    if (!existingFollowUp) {
      throw ApiError.notFound('Follow-up not found');
    }

    // Validate current status
    if (existingFollowUp.status === FollowUpStatus.COMPLETED) {
      throw ApiError.badRequest('Follow-up is already completed');
    }

    if (existingFollowUp.status === FollowUpStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot complete a cancelled follow-up');
    }

    try {
      const followUp = await followUpRepository.markAsCompleted(id);

      logger.info('Follow-up marked as completed', {
        followUpId: followUp.id,
        patientId: followUp.patientId,
      });

      return followUp as FollowUpWithRelations;
    } catch (error) {
      logger.error('Error marking follow-up as completed', error);
      throw ApiError.internal('Failed to complete follow-up');
    }
  }

  /**
   * Mark follow-up as cancelled
   * @param id - Follow-up ID
   * @returns Updated follow-up
   */
  async markAsCancelled(id: string): Promise<FollowUpWithRelations> {
    // Check if follow-up exists
    const existingFollowUp = await followUpRepository.findById(id);

    if (!existingFollowUp) {
      throw ApiError.notFound('Follow-up not found');
    }

    // Validate current status
    if (existingFollowUp.status === FollowUpStatus.CANCELLED) {
      throw ApiError.badRequest('Follow-up is already cancelled');
    }

    if (existingFollowUp.status === FollowUpStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot cancel a completed follow-up');
    }

    try {
      const followUp = await followUpRepository.markAsCancelled(id);

      logger.info('Follow-up marked as cancelled', {
        followUpId: followUp.id,
        patientId: followUp.patientId,
      });

      return followUp as FollowUpWithRelations;
    } catch (error) {
      logger.error('Error marking follow-up as cancelled', error);
      throw ApiError.internal('Failed to cancel follow-up');
    }
  }

  /**
   * Get overdue follow-ups
   * @returns List of overdue follow-ups
   */
  async getOverdueFollowUps(): Promise<FollowUpWithRelations[]> {
    try {
      return await followUpRepository.findOverdue() as FollowUpWithRelations[];
    } catch (error) {
      logger.error('Error fetching overdue follow-ups', error);
      throw ApiError.internal('Failed to fetch overdue follow-ups');
    }
  }

  /**
   * Get upcoming follow-ups (next N days)
   * @param days - Number of days to look ahead (default: 7)
   * @returns List of upcoming follow-ups
   */
  async getUpcomingFollowUps(days = 7): Promise<FollowUpWithRelations[]> {
    if (days < 1 || days > 365) {
      throw ApiError.badRequest('Days must be between 1 and 365');
    }

    try {
      return await followUpRepository.findUpcoming(days) as FollowUpWithRelations[];
    } catch (error) {
      logger.error('Error fetching upcoming follow-ups', error);
      throw ApiError.internal('Failed to fetch upcoming follow-ups');
    }
  }

  /**
   * Get follow-ups by priority
   * @param priority - Priority level
   * @returns List of follow-ups
   */
  async getFollowUpsByPriority(priority: Priority): Promise<FollowUpWithRelations[]> {
    try {
      return await followUpRepository.findByPriority(priority) as FollowUpWithRelations[];
    } catch (error) {
      logger.error('Error fetching follow-ups by priority', error);
      throw ApiError.internal('Failed to fetch follow-ups');
    }
  }

  /**
   * Get dashboard statistics
   * @returns Dashboard statistics
   */
  async getDashboardStats(): Promise<FollowUpDashboardStats> {
    try {
      const [countsByStatus, countsByPriority, overdueCount, upcomingCount] = await Promise.all([
        followUpRepository.countByStatus(),
        followUpRepository.countByPriority(),
        followUpRepository.countOverdue(),
        followUpRepository.countUpcomingThisWeek(),
      ]);

      // Calculate total
      const total = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);

      // Initialize all statuses with 0
      const stats: FollowUpDashboardStats = {
        total,
        pending: countsByStatus[FollowUpStatus.PENDING] || 0,
        inProgress: countsByStatus[FollowUpStatus.IN_PROGRESS] || 0,
        completed: countsByStatus[FollowUpStatus.COMPLETED] || 0,
        cancelled: countsByStatus[FollowUpStatus.CANCELLED] || 0,
        overdue: overdueCount,
        byPriority: {
          [Priority.LOW]: countsByPriority[Priority.LOW] || 0,
          [Priority.MEDIUM]: countsByPriority[Priority.MEDIUM] || 0,
          [Priority.HIGH]: countsByPriority[Priority.HIGH] || 0,
          [Priority.URGENT]: countsByPriority[Priority.URGENT] || 0,
        },
        upcomingThisWeek: upcomingCount,
      };

      return stats;
    } catch (error) {
      logger.error('Error fetching dashboard statistics', error);
      throw ApiError.internal('Failed to fetch statistics');
    }
  }

  // ============================================
  // NOTE OPERATIONS
  // ============================================

  /**
   * Get patient notes
   * @param patientId - Patient ID
   * @returns List of patient notes
   */
  async getPatientNotes(patientId: string): Promise<NoteWithRelations[]> {
    // Validate patient exists
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await followUpRepository.findNotesByPatientId(patientId);
    } catch (error) {
      logger.error('Error fetching patient notes', error);
      throw ApiError.internal('Failed to fetch notes');
    }
  }

  /**
   * Get note by ID
   * @param id - Note ID
   * @returns Note with relations
   */
  async getNoteById(id: string): Promise<NoteWithRelations> {
    const note = await followUpRepository.findNoteById(id);

    if (!note) {
      throw ApiError.notFound('Note not found');
    }

    return note;
  }

  /**
   * Add note to patient
   * @param patientId - Patient ID
   * @param authorId - Author user ID
   * @param data - Note data
   * @returns Created note
   */
  async addNote(
    patientId: string,
    authorId: string,
    data: { title?: string; content: string; isPinned: boolean }
  ): Promise<NoteWithRelations> {
    // Validate patient exists
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      const noteData: CreateNoteData = {
        patientId,
        authorId,
        title: data.title,
        content: data.content,
        isPinned: data.isPinned,
      };

      const note = await followUpRepository.createNote(noteData);

      logger.info('Note created successfully', {
        noteId: note.id,
        patientId: note.patientId,
        authorId: note.authorId,
      });

      return note;
    } catch (error) {
      logger.error('Error creating note', error);
      throw ApiError.internal('Failed to create note');
    }
  }

  /**
   * Update note
   * @param id - Note ID
   * @param data - Note update data
   * @returns Updated note
   */
  async updateNote(id: string, data: UpdateNoteData): Promise<NoteWithRelations> {
    // Check if note exists
    const existingNote = await followUpRepository.findNoteById(id);

    if (!existingNote) {
      throw ApiError.notFound('Note not found');
    }

    try {
      const note = await followUpRepository.updateNote(id, data);

      logger.info('Note updated successfully', {
        noteId: note.id,
        patientId: note.patientId,
      });

      return note;
    } catch (error) {
      logger.error('Error updating note', error);
      throw ApiError.internal('Failed to update note');
    }
  }

  /**
   * Delete note
   * @param id - Note ID
   */
  async deleteNote(id: string): Promise<void> {
    // Check if note exists
    const note = await followUpRepository.findNoteById(id);

    if (!note) {
      throw ApiError.notFound('Note not found');
    }

    try {
      await followUpRepository.deleteNote(id);

      logger.info('Note deleted successfully', {
        noteId: id,
        patientId: note.patientId,
      });
    } catch (error) {
      logger.error('Error deleting note', error);
      throw ApiError.internal('Failed to delete note');
    }
  }
}

// Export singleton instance
export const followUpService = new FollowUpService();
export default followUpService;
