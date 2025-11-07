import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { patientService } from '@services/patient.service';
import type {
  CreatePatientDTO,
  UpdatePatientDTO,
  SearchPatientsDTO,
  PatientListOptions,
} from '../types/patient.types';

/**
 * Patient Controller
 * Handles all HTTP requests related to patients
 */
export class PatientController {
  /**
   * Get all patients with optional filters and pagination
   * GET /api/v1/patients
   *
   * @query {SearchPatientsDTO} - Search and filter parameters
   * @returns {PaginatedPatientResponse} - List of patients with pagination
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchPatientsDTO;

    // Build options from query
    const options: PatientListOptions = {
      filters: {
        search: query.search,
        identification: query.identification,
        email: query.email,
        phone: query.phone,
        gender: query.gender,
        hasInsurance: query.hasInsurance,
        isActive: query.isActive,
      },
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
      sorting: {
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
      },
    };

    const result = await patientService.getAllPatients(options);

    return ResponseHelper.success(
      res,
      result,
      'Patients retrieved successfully'
    );
  });

  /**
   * Get patient by ID
   * GET /api/v1/patients/:id
   *
   * @param {string} id - Patient ID
   * @returns {PatientWithRelations} - Patient details with relations
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await patientService.getPatientById(id!);

    return ResponseHelper.success(
      res,
      patient,
      'Patient retrieved successfully'
    );
  });

  /**
   * Create new patient
   * POST /api/v1/patients
   *
   * @body {CreatePatientDTO} - Patient creation data
   * @returns {PatientWithRelations} - Created patient
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const data: CreatePatientDTO = req.body;

    const patient = await patientService.createPatient(data);

    return ResponseHelper.created(
      res,
      patient,
      'Patient created successfully'
    );
  });

  /**
   * Update patient by ID
   * PUT /api/v1/patients/:id
   *
   * @param {string} id - Patient ID
   * @body {UpdatePatientDTO} - Patient update data
   * @returns {PatientWithRelations} - Updated patient
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdatePatientDTO = req.body;

    const patient = await patientService.updatePatient(id!, data);

    return ResponseHelper.success(
      res,
      patient,
      'Patient updated successfully'
    );
  });

  /**
   * Delete patient by ID (soft delete)
   * DELETE /api/v1/patients/:id
   *
   * @param {string} id - Patient ID
   * @returns {void}
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await patientService.deletePatient(id!);

    return ResponseHelper.success(
      res,
      null,
      'Patient deleted successfully'
    );
  });

  /**
   * Restore soft-deleted patient
   * POST /api/v1/patients/:id/restore
   *
   * @param {string} id - Patient ID
   * @returns {PatientWithRelations} - Restored patient
   */
  restore = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await patientService.restorePatient(id!);

    return ResponseHelper.success(
      res,
      patient,
      'Patient restored successfully'
    );
  });

  /**
   * Activate patient account
   * POST /api/v1/patients/:id/activate
   *
   * @param {string} id - Patient ID
   * @returns {void}
   */
  activate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await patientService.activatePatient(id!);

    return ResponseHelper.success(
      res,
      null,
      'Patient activated successfully'
    );
  });

  /**
   * Deactivate patient account
   * POST /api/v1/patients/:id/deactivate
   *
   * @param {string} id - Patient ID
   * @returns {void}
   */
  deactivate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await patientService.deactivatePatient(id!);

    return ResponseHelper.success(
      res,
      null,
      'Patient deactivated successfully'
    );
  });

  /**
   * Get patient medical history
   * GET /api/v1/patients/:id/history
   *
   * @param {string} id - Patient ID
   * @returns {MedicalHistory[]} - Patient medical history
   */
  getMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const history = await patientService.getPatientMedicalHistory(id!);

    return ResponseHelper.success(
      res,
      history,
      'Medical history retrieved successfully'
    );
  });

  /**
   * Get patient appointments
   * GET /api/v1/patients/:id/appointments
   *
   * @param {string} id - Patient ID
   * @query {number} limit - Maximum number of appointments (default: 10)
   * @returns {Appointment[]} - Patient appointments
   */
  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const appointments = await patientService.getPatientAppointments(id!, limit);

    return ResponseHelper.success(
      res,
      appointments,
      'Appointments retrieved successfully'
    );
  });

  /**
   * Get patient treatments
   * GET /api/v1/patients/:id/treatments
   *
   * @param {string} id - Patient ID
   * @query {number} limit - Maximum number of treatments (default: 10)
   * @returns {Treatment[]} - Patient treatments
   */
  getTreatments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const treatments = await patientService.getPatientTreatments(id!, limit);

    return ResponseHelper.success(
      res,
      treatments,
      'Treatments retrieved successfully'
    );
  });

  /**
   * Get patient statistics
   * GET /api/v1/patients/:id/stats
   *
   * @param {string} id - Patient ID
   * @returns {Object} - Patient statistics
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const stats = await patientService.getPatientStats(id!);

    return ResponseHelper.success(
      res,
      stats,
      'Statistics retrieved successfully'
    );
  });

  /**
   * Search patients by name (autocomplete)
   * GET /api/v1/patients/search
   *
   * @query {string} q - Search query
   * @query {number} limit - Maximum results (default: 10)
   * @returns {Patient[]} - Matching patients
   */
  searchByName = catchAsync(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const patients = await patientService.searchPatientsByName(query, limit);

    return ResponseHelper.success(
      res,
      patients,
      'Patients found successfully'
    );
  });

  /**
   * Find patient by identification
   * GET /api/v1/patients/identification/:identification
   *
   * @param {string} identification - Patient identification number
   * @returns {Patient} - Patient details
   */
  findByIdentification = catchAsync(async (req: Request, res: Response) => {
    const { identification } = req.params;

    const patient = await patientService.findByIdentification(identification!);

    return ResponseHelper.success(
      res,
      patient,
      'Patient found successfully'
    );
  });

  /**
   * Get patients with upcoming appointments
   * GET /api/v1/patients/upcoming
   *
   * @query {number} days - Number of days to look ahead (default: 7)
   * @returns {Patient[]} - Patients with upcoming appointments
   */
  getUpcoming = catchAsync(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

    const patients = await patientService.getPatientsWithUpcomingAppointments(days);

    return ResponseHelper.success(
      res,
      patients,
      'Patients with upcoming appointments retrieved successfully'
    );
  });

  /**
   * Get dashboard statistics
   * GET /api/v1/patients/dashboard/stats
   *
   * @returns {Object} - Dashboard statistics
   */
  getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await patientService.getDashboardStats();

    return ResponseHelper.success(
      res,
      stats,
      'Dashboard statistics retrieved successfully'
    );
  });
}

// Export singleton instance
export const patientController = new PatientController();
export default patientController;
