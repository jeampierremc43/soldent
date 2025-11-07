import { ApiError } from '@utils/ApiError';
import { loggers } from '@utils/logger';
import logger from '@utils/logger';
import { patientRepository } from '@repositories/patient.repository';
import type {
  CreatePatientData,
  UpdatePatientData,
  PatientListOptions,
  PaginatedPatientResponse,
  PatientWithRelations,
} from '../types/patient.types';

/**
 * Patient Service
 * Handles all business logic related to patients
 */
export class PatientService {
  /**
   * Get all patients with optional filters and pagination
   * @param options - Filter, pagination and sorting options
   * @returns Paginated list of patients
   */
  async getAllPatients(options: PatientListOptions = {}): Promise<PaginatedPatientResponse> {
    try {
      return await patientRepository.findAll(options);
    } catch (error) {
      logger.error('Error fetching patients', error);
      throw ApiError.internal('Failed to fetch patients');
    }
  }

  /**
   * Get patient by ID
   * @param id - Patient ID
   * @returns Patient with relations
   */
  async getPatientById(id: string): Promise<PatientWithRelations> {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    return patient as PatientWithRelations;
  }

  /**
   * Create new patient
   * @param data - Patient creation data
   * @returns Created patient
   */
  async createPatient(data: CreatePatientData): Promise<PatientWithRelations> {
    // Validate identification uniqueness
    const identificationExists = await patientRepository.identificationExists(
      data.identification
    );

    if (identificationExists) {
      throw ApiError.conflict(
        'A patient with this identification number already exists'
      );
    }

    // Validate email uniqueness if provided
    if (data.email) {
      const emailExists = await patientRepository.emailExists(data.email);
      if (emailExists) {
        throw ApiError.conflict('A patient with this email already exists');
      }
    }

    // Validate insurance data consistency
    if (data.hasInsurance) {
      if (!data.insuranceProvider) {
        throw ApiError.badRequest(
          'Insurance provider is required when patient has insurance'
        );
      }
    }

    // Validate age based on date of birth
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 0 || age > 150) {
      throw ApiError.badRequest('Invalid date of birth');
    }

    try {
      const patient = await patientRepository.create(data);

      logger.info('Patient created successfully', {
        patientId: patient.id,
        identification: patient.identification,
      });

      return patient as PatientWithRelations;
    } catch (error) {
      logger.error('Error creating patient', error);
      throw ApiError.internal('Failed to create patient');
    }
  }

  /**
   * Update patient by ID
   * @param id - Patient ID
   * @param data - Patient update data
   * @returns Updated patient
   */
  async updatePatient(
    id: string,
    data: UpdatePatientData
  ): Promise<PatientWithRelations> {
    // Check if patient exists
    const existingPatient = await patientRepository.findById(id);

    if (!existingPatient) {
      throw ApiError.notFound('Patient not found');
    }

    // Validate email uniqueness if being updated
    if (data.email) {
      const emailExists = await patientRepository.emailExists(data.email, id);
      if (emailExists) {
        throw ApiError.conflict('A patient with this email already exists');
      }
    }

    // Validate insurance data consistency
    if (data.hasInsurance !== undefined) {
      if (data.hasInsurance && !data.insuranceProvider && !existingPatient.insuranceProvider) {
        throw ApiError.badRequest(
          'Insurance provider is required when patient has insurance'
        );
      }
    }

    // Validate date of birth if being updated
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 0 || age > 150) {
        throw ApiError.badRequest('Invalid date of birth');
      }
    }

    try {
      const patient = await patientRepository.update(id, data);

      logger.info('Patient updated successfully', {
        patientId: patient.id,
        identification: patient.identification,
      });

      return patient as PatientWithRelations;
    } catch (error) {
      logger.error('Error updating patient', error);
      throw ApiError.internal('Failed to update patient');
    }
  }

  /**
   * Delete patient by ID (soft delete)
   * @param id - Patient ID
   */
  async deletePatient(id: string): Promise<void> {
    // Check if patient exists
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    // Check for active appointments
    const upcomingAppointments = await patientRepository.getAppointments(id, 1);

    if (upcomingAppointments.length > 0) {
      const hasActiveAppointments = upcomingAppointments.some(
        (apt) => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
      );

      if (hasActiveAppointments) {
        throw ApiError.badRequest(
          'Cannot delete patient with active appointments. Please cancel or complete appointments first.'
        );
      }
    }

    try {
      await patientRepository.delete(id);

      logger.info('Patient deleted successfully', {
        patientId: id,
        identification: patient.identification,
      });

      loggers.security('Patient record deleted', 'low', {
        patientId: id,
        identification: patient.identification,
      });
    } catch (error) {
      logger.error('Error deleting patient', error);
      throw ApiError.internal('Failed to delete patient');
    }
  }

  /**
   * Restore soft-deleted patient
   * @param id - Patient ID
   * @returns Restored patient
   */
  async restorePatient(id: string): Promise<PatientWithRelations> {
    try {
      const patient = await patientRepository.restore(id);

      logger.info('Patient restored successfully', {
        patientId: patient.id,
      });

      return patient as PatientWithRelations;
    } catch (error) {
      logger.error('Error restoring patient', error);
      throw ApiError.internal('Failed to restore patient');
    }
  }

  /**
   * Activate patient account
   * @param id - Patient ID
   */
  async activatePatient(id: string): Promise<void> {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    if (patient.isActive) {
      throw ApiError.badRequest('Patient is already active');
    }

    try {
      await patientRepository.activate(id);

      logger.info('Patient activated successfully', {
        patientId: id,
      });
    } catch (error) {
      logger.error('Error activating patient', error);
      throw ApiError.internal('Failed to activate patient');
    }
  }

  /**
   * Deactivate patient account
   * @param id - Patient ID
   */
  async deactivatePatient(id: string): Promise<void> {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    if (!patient.isActive) {
      throw ApiError.badRequest('Patient is already inactive');
    }

    try {
      await patientRepository.deactivate(id);

      logger.info('Patient deactivated successfully', {
        patientId: id,
      });
    } catch (error) {
      logger.error('Error deactivating patient', error);
      throw ApiError.internal('Failed to deactivate patient');
    }
  }

  /**
   * Get patient medical history
   * @param id - Patient ID
   * @returns Medical history records
   */
  async getPatientMedicalHistory(id: string) {
    // Check if patient exists
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      const medicalHistory = await patientRepository.getMedicalHistory(id);

      return medicalHistory;
    } catch (error) {
      logger.error('Error fetching medical history', error);
      throw ApiError.internal('Failed to fetch medical history');
    }
  }

  /**
   * Get patient appointments
   * @param id - Patient ID
   * @param limit - Maximum number of appointments
   * @returns Patient appointments
   */
  async getPatientAppointments(id: string, limit = 10) {
    // Check if patient exists
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await patientRepository.getAppointments(id, limit);
    } catch (error) {
      logger.error('Error fetching appointments', error);
      throw ApiError.internal('Failed to fetch appointments');
    }
  }

  /**
   * Get patient treatments
   * @param id - Patient ID
   * @param limit - Maximum number of treatments
   * @returns Patient treatments
   */
  async getPatientTreatments(id: string, limit = 10) {
    // Check if patient exists
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await patientRepository.getTreatments(id, limit);
    } catch (error) {
      logger.error('Error fetching treatments', error);
      throw ApiError.internal('Failed to fetch treatments');
    }
  }

  /**
   * Get patient statistics
   * @param id - Patient ID
   * @returns Patient statistics
   */
  async getPatientStats(id: string) {
    // Check if patient exists
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    try {
      return await patientRepository.getPatientStats(id);
    } catch (error) {
      logger.error('Error fetching patient statistics', error);
      throw ApiError.internal('Failed to fetch patient statistics');
    }
  }

  /**
   * Search patients by name (autocomplete)
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching patients
   */
  async searchPatientsByName(query: string, limit = 10) {
    if (!query || query.trim().length < 2) {
      throw ApiError.badRequest('Search query must be at least 2 characters');
    }

    try {
      return await patientRepository.searchByName(query.trim(), limit);
    } catch (error) {
      logger.error('Error searching patients', error);
      throw ApiError.internal('Failed to search patients');
    }
  }

  /**
   * Find patient by identification
   * @param identification - Patient identification number
   * @returns Patient or null
   */
  async findByIdentification(identification: string) {
    try {
      const patient = await patientRepository.findByIdentification(identification);

      if (!patient) {
        throw ApiError.notFound('Patient not found with this identification');
      }

      return patient;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error finding patient by identification', error);
      throw ApiError.internal('Failed to find patient');
    }
  }

  /**
   * Get patients with upcoming appointments
   * @param days - Number of days to look ahead
   * @returns Patients with appointments
   */
  async getPatientsWithUpcomingAppointments(days = 7) {
    try {
      return await patientRepository.getWithUpcomingAppointments(days);
    } catch (error) {
      logger.error('Error fetching patients with upcoming appointments', error);
      throw ApiError.internal('Failed to fetch patients');
    }
  }

  /**
   * Get dashboard statistics
   * @returns Statistics for dashboard
   */
  async getDashboardStats() {
    try {
      const [totalActive, genderDistribution] = await Promise.all([
        patientRepository.countActive(),
        patientRepository.countByGender(),
      ]);

      return {
        totalActive,
        genderDistribution,
      };
    } catch (error) {
      logger.error('Error fetching dashboard statistics', error);
      throw ApiError.internal('Failed to fetch statistics');
    }
  }

  /**
   * Validate patient can be assigned to appointment
   * @param patientId - Patient ID
   * @param appointmentDate - Appointment date
   * @returns true if valid, throws error otherwise
   */
  async validateForAppointment(patientId: string, appointmentDate: Date): Promise<boolean> {
    const patient = await patientRepository.findById(patientId);

    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    if (!patient.isActive) {
      throw ApiError.badRequest('Cannot create appointment for inactive patient');
    }

    // Check patient age
    const birthDate = new Date(patient.dateOfBirth);
    const age = appointmentDate.getFullYear() - birthDate.getFullYear();

    if (age < 1) {
      throw ApiError.badRequest('Patient must be at least 1 year old for appointments');
    }

    return true;
  }
}

// Export singleton instance
export const patientService = new PatientService();
export default patientService;
