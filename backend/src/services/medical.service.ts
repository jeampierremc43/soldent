import { ApiError } from '@utils/ApiError';
import logger from '@utils/logger';
import { medicalRepository } from '@repositories/medical.repository';
import type {
  MedicalHistoryResponse,
  DiagnosisResponse,
  TreatmentResponse,
  TreatmentPlanResponse,
  CompleteMedicalHistoryResponse,
  CreateMedicalHistoryDTO,
  UpdateMedicalHistoryDTO,
  CreateDiagnosisDTO,
  CreateTreatmentDTO,
  UpdateTreatmentDTO,
  CreateTreatmentPlanDTO,
  UpdateTreatmentPlanDTO,
} from '../types/medical.types';
import { TreatmentStatus } from '@prisma/client';

/**
 * Medical Service
 * Handles business logic for medical records, diagnoses, treatments, and treatment plans
 */
export class MedicalService {
  /**
   * ============================================
   * MEDICAL HISTORY METHODS
   * ============================================
   */

  /**
   * Get medical history for a patient
   */
  async getMedicalHistory(patientId: string): Promise<MedicalHistoryResponse | null> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const history = await medicalRepository.findMedicalHistoryByPatientId(patientId);

    logger.info('Retrieved medical history', {
      patientId,
      hasHistory: !!history,
    });

    return history;
  }

  /**
   * Create medical history for a patient
   */
  async createMedicalHistory(
    patientId: string,
    data: CreateMedicalHistoryDTO
  ): Promise<MedicalHistoryResponse> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    // Check if patient already has medical history
    const existing = await medicalRepository.findMedicalHistoryByPatientId(patientId);
    if (existing) {
      throw ApiError.conflict('Patient already has medical history. Use update endpoint instead');
    }

    const history = await medicalRepository.createMedicalHistory(patientId, data);

    logger.info('Created medical history', {
      patientId,
      historyId: history.id,
    });

    return history;
  }

  /**
   * Update medical history
   */
  async updateMedicalHistory(
    id: string,
    data: UpdateMedicalHistoryDTO
  ): Promise<MedicalHistoryResponse> {
    const history = await medicalRepository.updateMedicalHistory(id, data);

    logger.info('Updated medical history', {
      historyId: id,
      patientId: history.patientId,
    });

    return history;
  }

  /**
   * ============================================
   * DIAGNOSIS METHODS
   * ============================================
   */

  /**
   * Get all diagnoses for a patient
   */
  async getDiagnoses(patientId: string): Promise<DiagnosisResponse[]> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const diagnoses = await medicalRepository.findDiagnosesByPatientId(patientId);

    logger.info('Retrieved diagnoses', {
      patientId,
      count: diagnoses.length,
    });

    return diagnoses;
  }

  /**
   * Get diagnosis by ID
   */
  async getDiagnosisById(id: string): Promise<DiagnosisResponse> {
    const diagnosis = await medicalRepository.findDiagnosisById(id);

    if (!diagnosis) {
      throw ApiError.notFound('Diagnosis not found');
    }

    logger.info('Retrieved diagnosis', {
      diagnosisId: id,
      patientId: diagnosis.patientId,
    });

    return diagnosis;
  }

  /**
   * Create diagnosis with CIE-10 validation
   */
  async createDiagnosis(
    patientId: string,
    doctorId: string,
    data: CreateDiagnosisDTO
  ): Promise<DiagnosisResponse> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    // Verify CIE-10 code exists
    const cie10Exists = await medicalRepository.cie10CodeExists(data.cie10Code);
    if (!cie10Exists) {
      throw ApiError.badRequest(
        `CIE-10 code ${data.cie10Code} not found in catalog. Please ensure the code is valid and exists in the database.`
      );
    }

    const diagnosis = await medicalRepository.createDiagnosis(patientId, doctorId, data);

    logger.info('Created diagnosis', {
      diagnosisId: diagnosis.id,
      patientId,
      cie10Code: data.cie10Code,
      doctorId,
    });

    return diagnosis;
  }

  /**
   * Get diagnoses by CIE-10 code
   */
  async getDiagnosesByCIE10Code(code: string): Promise<DiagnosisResponse[]> {
    const diagnoses = await medicalRepository.findDiagnosesByCIE10Code(code);

    logger.info('Retrieved diagnoses by CIE-10', {
      code,
      count: diagnoses.length,
    });

    return diagnoses;
  }

  /**
   * ============================================
   * TREATMENT METHODS
   * ============================================
   */

  /**
   * Get all treatments for a patient
   */
  async getTreatments(patientId: string): Promise<TreatmentResponse[]> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const treatments = await medicalRepository.findTreatmentsByPatientId(patientId);

    logger.info('Retrieved treatments', {
      patientId,
      count: treatments.length,
    });

    return treatments;
  }

  /**
   * Get treatment by ID
   */
  async getTreatmentById(id: string): Promise<TreatmentResponse> {
    const treatment = await medicalRepository.findTreatmentById(id);

    if (!treatment) {
      throw ApiError.notFound('Treatment not found');
    }

    logger.info('Retrieved treatment', {
      treatmentId: id,
      patientId: treatment.patientId,
    });

    return treatment;
  }

  /**
   * Create treatment linked to diagnosis
   */
  async createTreatment(
    patientId: string,
    doctorId: string,
    data: CreateTreatmentDTO
  ): Promise<TreatmentResponse> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    // Verify diagnosis exists if provided
    if (data.diagnosisId) {
      const diagnosis = await medicalRepository.findDiagnosisById(data.diagnosisId);
      if (!diagnosis) {
        throw ApiError.notFound('Diagnosis not found');
      }
      // Verify diagnosis belongs to the same patient
      if (diagnosis.patientId !== patientId) {
        throw ApiError.badRequest('Diagnosis does not belong to this patient');
      }
    }

    // Verify treatment catalog exists
    const catalogExists = await medicalRepository.treatmentCatalogExists(data.catalogId);
    if (!catalogExists) {
      throw ApiError.notFound('Treatment catalog item not found');
    }

    // Validate payment
    if (data.paid && data.paid > data.cost) {
      throw ApiError.badRequest('Paid amount cannot exceed total cost');
    }

    const treatment = await medicalRepository.createTreatment(patientId, doctorId, data);

    logger.info('Created treatment', {
      treatmentId: treatment.id,
      patientId,
      doctorId,
      catalogId: data.catalogId,
      diagnosisId: data.diagnosisId,
    });

    return treatment;
  }

  /**
   * Update treatment
   */
  async updateTreatment(
    id: string,
    data: UpdateTreatmentDTO
  ): Promise<TreatmentResponse> {
    // Verify treatment exists
    const existing = await medicalRepository.findTreatmentById(id);
    if (!existing) {
      throw ApiError.notFound('Treatment not found');
    }

    // Verify diagnosis exists if being updated
    if (data.diagnosisId !== undefined && data.diagnosisId) {
      const diagnosis = await medicalRepository.findDiagnosisById(data.diagnosisId);
      if (!diagnosis) {
        throw ApiError.notFound('Diagnosis not found');
      }
      // Verify diagnosis belongs to the same patient
      if (diagnosis.patientId !== existing.patientId) {
        throw ApiError.badRequest('Diagnosis does not belong to this patient');
      }
    }

    // Verify treatment catalog if being updated
    if (data.catalogId) {
      const catalogExists = await medicalRepository.treatmentCatalogExists(data.catalogId);
      if (!catalogExists) {
        throw ApiError.notFound('Treatment catalog item not found');
      }
    }

    // Validate payment if being updated
    const newCost = data.cost ?? existing.cost;
    const newPaid = data.paid ?? existing.paid;
    if (Number(newPaid) > Number(newCost)) {
      throw ApiError.badRequest('Paid amount cannot exceed total cost');
    }

    // Auto-set completed date when status changes to COMPLETED
    if (data.status === TreatmentStatus.COMPLETED && !data.completedDate && !existing.completedDate) {
      data.completedDate = new Date().toISOString();
    }

    const treatment = await medicalRepository.updateTreatment(id, data);

    logger.info('Updated treatment', {
      treatmentId: id,
      patientId: treatment.patientId,
    });

    return treatment;
  }

  /**
   * Get treatments by diagnosis ID
   */
  async getTreatmentsByDiagnosisId(diagnosisId: string): Promise<TreatmentResponse[]> {
    const treatments = await medicalRepository.findTreatmentsByDiagnosisId(diagnosisId);

    logger.info('Retrieved treatments by diagnosis', {
      diagnosisId,
      count: treatments.length,
    });

    return treatments;
  }

  /**
   * ============================================
   * TREATMENT PLAN METHODS
   * ============================================
   */

  /**
   * Get all treatment plans for a patient
   */
  async getTreatmentPlans(patientId: string): Promise<TreatmentPlanResponse[]> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const plans = await medicalRepository.findTreatmentPlansByPatientId(patientId);

    logger.info('Retrieved treatment plans', {
      patientId,
      count: plans.length,
    });

    return plans;
  }

  /**
   * Get treatment plan by ID
   */
  async getTreatmentPlanById(id: string): Promise<TreatmentPlanResponse> {
    const plan = await medicalRepository.findTreatmentPlanById(id);

    if (!plan) {
      throw ApiError.notFound('Treatment plan not found');
    }

    logger.info('Retrieved treatment plan', {
      planId: id,
      patientId: plan.patientId,
    });

    return plan;
  }

  /**
   * Create treatment plan
   */
  async createTreatmentPlan(
    patientId: string,
    data: CreateTreatmentPlanDTO
  ): Promise<TreatmentPlanResponse> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const plan = await medicalRepository.createTreatmentPlan(patientId, data);

    logger.info('Created treatment plan', {
      planId: plan.id,
      patientId,
      totalCost: plan.totalCost,
    });

    return plan;
  }

  /**
   * Update treatment plan
   */
  async updateTreatmentPlan(
    id: string,
    data: UpdateTreatmentPlanDTO
  ): Promise<TreatmentPlanResponse> {
    // Verify plan exists
    const existing = await medicalRepository.findTreatmentPlanById(id);
    if (!existing) {
      throw ApiError.notFound('Treatment plan not found');
    }

    const plan = await medicalRepository.updateTreatmentPlan(id, data);

    logger.info('Updated treatment plan', {
      planId: id,
      patientId: plan.patientId,
    });

    return plan;
  }

  /**
   * ============================================
   * COMPLETE HISTORY METHOD
   * ============================================
   */

  /**
   * Get complete medical history for a patient
   * Includes medical history, diagnoses, treatments, and treatment plans
   */
  async getCompleteHistory(patientId: string): Promise<CompleteMedicalHistoryResponse> {
    // Verify patient exists
    const patientExists = await medicalRepository.patientExists(patientId);
    if (!patientExists) {
      throw ApiError.notFound('Patient not found');
    }

    const [medicalHistory, diagnoses, treatments, treatmentPlans] = await Promise.all([
      medicalRepository.findMedicalHistoryByPatientId(patientId),
      medicalRepository.findDiagnosesByPatientId(patientId),
      medicalRepository.findTreatmentsByPatientId(patientId),
      medicalRepository.findTreatmentPlansByPatientId(patientId),
    ]);

    logger.info('Retrieved complete medical history', {
      patientId,
      hasHistory: !!medicalHistory,
      diagnosesCount: diagnoses.length,
      treatmentsCount: treatments.length,
      plansCount: treatmentPlans.length,
    });

    return {
      medicalHistory,
      diagnoses,
      treatments,
      treatmentPlans,
    };
  }
}

// Export singleton instance
export const medicalService = new MedicalService();
export default medicalService;
