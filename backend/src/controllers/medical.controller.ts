import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { medicalService } from '@services/medical.service';
import { AuthRequest } from '@middleware/auth';
import type {
  CreateMedicalHistoryDTO,
  UpdateMedicalHistoryDTO,
  CreateDiagnosisDTO,
  CreateTreatmentDTO,
  UpdateTreatmentDTO,
  CreateTreatmentPlanDTO,
  UpdateTreatmentPlanDTO,
} from '../types/medical.types';

/**
 * Medical Controller
 * Handles all HTTP requests related to medical records
 */
export class MedicalController {
  /**
   * ============================================
   * MEDICAL HISTORY ENDPOINTS
   * ============================================
   */

  /**
   * Get medical history for a patient
   * GET /api/v1/medical/patients/:patientId/medical-history
   */
  getMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const history = await medicalService.getMedicalHistory(patientId!);

    if (!history) {
      return ResponseHelper.success(
        res,
        null,
        'No medical history found for this patient'
      );
    }

    return ResponseHelper.success(
      res,
      history,
      'Medical history retrieved successfully'
    );
  });

  /**
   * Create medical history for a patient
   * POST /api/v1/medical/patients/:patientId/medical-history
   */
  createMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const data: CreateMedicalHistoryDTO = req.body;

    const history = await medicalService.createMedicalHistory(patientId!, data);

    return ResponseHelper.created(
      res,
      history,
      'Medical history created successfully'
    );
  });

  /**
   * Update medical history
   * PUT /api/v1/medical/medical-history/:id
   */
  updateMedicalHistory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateMedicalHistoryDTO = req.body;

    const history = await medicalService.updateMedicalHistory(id!, data);

    return ResponseHelper.success(
      res,
      history,
      'Medical history updated successfully'
    );
  });

  /**
   * ============================================
   * DIAGNOSIS ENDPOINTS
   * ============================================
   */

  /**
   * Get all diagnoses for a patient
   * GET /api/v1/medical/patients/:patientId/diagnoses
   */
  getDiagnoses = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const diagnoses = await medicalService.getDiagnoses(patientId!);

    return ResponseHelper.success(
      res,
      diagnoses,
      `Retrieved ${diagnoses.length} diagnosis/es`
    );
  });

  /**
   * Get diagnosis by ID
   * GET /api/v1/medical/diagnoses/:id
   */
  getDiagnosisById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const diagnosis = await medicalService.getDiagnosisById(id!);

    return ResponseHelper.success(
      res,
      diagnosis,
      'Diagnosis retrieved successfully'
    );
  });

  /**
   * Create diagnosis with CIE-10 validation
   * POST /api/v1/medical/patients/:patientId/diagnoses
   */
  createDiagnosis = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { user } = req as AuthRequest;
    const data: CreateDiagnosisDTO = req.body;

    const diagnosis = await medicalService.createDiagnosis(
      patientId!,
      user.id,
      data
    );

    return ResponseHelper.created(
      res,
      diagnosis,
      'Diagnosis created successfully'
    );
  });

  /**
   * Get diagnoses by CIE-10 code
   * GET /api/v1/medical/diagnoses/by-code/:code
   */
  getDiagnosesByCIE10Code = catchAsync(async (req: Request, res: Response) => {
    const { code } = req.params;

    const diagnoses = await medicalService.getDiagnosesByCIE10Code(code!);

    return ResponseHelper.success(
      res,
      diagnoses,
      `Retrieved ${diagnoses.length} diagnosis/es with CIE-10 code ${code}`
    );
  });

  /**
   * ============================================
   * TREATMENT ENDPOINTS
   * ============================================
   */

  /**
   * Get all treatments for a patient
   * GET /api/v1/medical/patients/:patientId/treatments
   */
  getTreatments = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const treatments = await medicalService.getTreatments(patientId!);

    return ResponseHelper.success(
      res,
      treatments,
      `Retrieved ${treatments.length} treatment(s)`
    );
  });

  /**
   * Get treatment by ID
   * GET /api/v1/medical/treatments/:id
   */
  getTreatmentById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const treatment = await medicalService.getTreatmentById(id!);

    return ResponseHelper.success(
      res,
      treatment,
      'Treatment retrieved successfully'
    );
  });

  /**
   * Create treatment linked to diagnosis
   * POST /api/v1/medical/patients/:patientId/treatments
   */
  createTreatment = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { user } = req as AuthRequest;
    const data: CreateTreatmentDTO = req.body;

    const treatment = await medicalService.createTreatment(
      patientId!,
      user.id,
      data
    );

    return ResponseHelper.created(
      res,
      treatment,
      'Treatment created successfully'
    );
  });

  /**
   * Update treatment
   * PUT /api/v1/medical/treatments/:id
   */
  updateTreatment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateTreatmentDTO = req.body;

    const treatment = await medicalService.updateTreatment(id!, data);

    return ResponseHelper.success(
      res,
      treatment,
      'Treatment updated successfully'
    );
  });

  /**
   * Get treatments by diagnosis ID
   * GET /api/v1/medical/diagnoses/:diagnosisId/treatments
   */
  getTreatmentsByDiagnosisId = catchAsync(async (req: Request, res: Response) => {
    const { diagnosisId } = req.params;

    const treatments = await medicalService.getTreatmentsByDiagnosisId(diagnosisId!);

    return ResponseHelper.success(
      res,
      treatments,
      `Retrieved ${treatments.length} treatment(s) for diagnosis`
    );
  });

  /**
   * ============================================
   * TREATMENT PLAN ENDPOINTS
   * ============================================
   */

  /**
   * Get all treatment plans for a patient
   * GET /api/v1/medical/patients/:patientId/treatment-plans
   */
  getTreatmentPlans = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const plans = await medicalService.getTreatmentPlans(patientId!);

    return ResponseHelper.success(
      res,
      plans,
      `Retrieved ${plans.length} treatment plan(s)`
    );
  });

  /**
   * Get treatment plan by ID
   * GET /api/v1/medical/treatment-plans/:id
   */
  getTreatmentPlanById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const plan = await medicalService.getTreatmentPlanById(id!);

    return ResponseHelper.success(
      res,
      plan,
      'Treatment plan retrieved successfully'
    );
  });

  /**
   * Create treatment plan
   * POST /api/v1/medical/patients/:patientId/treatment-plans
   */
  createTreatmentPlan = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const data: CreateTreatmentPlanDTO = req.body;

    const plan = await medicalService.createTreatmentPlan(patientId!, data);

    return ResponseHelper.created(
      res,
      plan,
      'Treatment plan created successfully'
    );
  });

  /**
   * Update treatment plan
   * PUT /api/v1/medical/treatment-plans/:id
   */
  updateTreatmentPlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: UpdateTreatmentPlanDTO = req.body;

    const plan = await medicalService.updateTreatmentPlan(id!, data);

    return ResponseHelper.success(
      res,
      plan,
      'Treatment plan updated successfully'
    );
  });

  /**
   * ============================================
   * COMPLETE HISTORY ENDPOINT
   * ============================================
   */

  /**
   * Get complete medical history for a patient
   * GET /api/v1/medical/patients/:patientId/complete-history
   */
  getCompleteHistory = catchAsync(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    const history = await medicalService.getCompleteHistory(patientId!);

    return ResponseHelper.success(
      res,
      history,
      'Complete medical history retrieved successfully'
    );
  });
}

// Export singleton instance
export const medicalController = new MedicalController();
export default medicalController;
