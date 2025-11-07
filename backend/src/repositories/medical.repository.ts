import { prisma } from '@config/database';
import { Prisma } from '@prisma/client';
import type {
  MedicalHistoryResponse,
  DiagnosisResponse,
  TreatmentResponse,
  TreatmentPlanResponse,
  CreateMedicalHistoryDTO,
  UpdateMedicalHistoryDTO,
  CreateDiagnosisDTO,
  CreateTreatmentDTO,
  UpdateTreatmentDTO,
  CreateTreatmentPlanDTO,
  UpdateTreatmentPlanDTO,
} from '../types/medical.types';

/**
 * Medical Repository
 * Handles all database operations for medical records
 */
export class MedicalRepository {
  /**
   * ============================================
   * MEDICAL HISTORY METHODS
   * ============================================
   */

  /**
   * Find medical history by patient ID
   */
  async findMedicalHistoryByPatientId(patientId: string): Promise<MedicalHistoryResponse | null> {
    const history = await prisma.medicalHistory.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (!history) {
      return null;
    }

    return this.formatMedicalHistory(history);
  }

  /**
   * Create medical history for a patient
   */
  async createMedicalHistory(
    patientId: string,
    data: CreateMedicalHistoryDTO
  ): Promise<MedicalHistoryResponse> {
    const history = await prisma.medicalHistory.create({
      data: {
        patientId,
        allergies: data.allergies ? JSON.stringify(data.allergies) : null,
        chronicDiseases: data.chronicDiseases ? JSON.stringify(data.chronicDiseases) : null,
        currentMedications: data.currentMedications ? JSON.stringify(data.currentMedications) : null,
        previousSurgeries: data.previousSurgeries ? JSON.stringify(data.previousSurgeries) : null,
        familyHistory: data.familyHistory ? JSON.stringify(data.familyHistory) : null,
        lastDentalVisit: data.lastDentalVisit ? new Date(data.lastDentalVisit) : null,
        brushingFrequency: data.brushingFrequency,
        usesFloss: data.usesFloss ?? false,
        usesMouthwash: data.usesMouthwash ?? false,
        smokingHabit: data.smokingHabit,
        alcoholConsumption: data.alcoholConsumption,
        bruxism: data.bruxism ?? false,
        nailBiting: data.nailBiting ?? false,
        isPregnant: data.isPregnant ?? false,
        gestationWeeks: data.gestationWeeks,
        notes: data.notes,
      },
    });

    return this.formatMedicalHistory(history);
  }

  /**
   * Update medical history
   */
  async updateMedicalHistory(
    id: string,
    data: UpdateMedicalHistoryDTO
  ): Promise<MedicalHistoryResponse> {
    const updateData: Prisma.MedicalHistoryUpdateInput = {};

    if (data.allergies !== undefined) {
      updateData.allergies = data.allergies ? JSON.stringify(data.allergies) : null;
    }
    if (data.chronicDiseases !== undefined) {
      updateData.chronicDiseases = data.chronicDiseases ? JSON.stringify(data.chronicDiseases) : null;
    }
    if (data.currentMedications !== undefined) {
      updateData.currentMedications = data.currentMedications ? JSON.stringify(data.currentMedications) : null;
    }
    if (data.previousSurgeries !== undefined) {
      updateData.previousSurgeries = data.previousSurgeries ? JSON.stringify(data.previousSurgeries) : null;
    }
    if (data.familyHistory !== undefined) {
      updateData.familyHistory = data.familyHistory ? JSON.stringify(data.familyHistory) : null;
    }
    if (data.lastDentalVisit !== undefined) {
      updateData.lastDentalVisit = data.lastDentalVisit ? new Date(data.lastDentalVisit) : null;
    }
    if (data.brushingFrequency !== undefined) updateData.brushingFrequency = data.brushingFrequency;
    if (data.usesFloss !== undefined) updateData.usesFloss = data.usesFloss;
    if (data.usesMouthwash !== undefined) updateData.usesMouthwash = data.usesMouthwash;
    if (data.smokingHabit !== undefined) updateData.smokingHabit = data.smokingHabit;
    if (data.alcoholConsumption !== undefined) updateData.alcoholConsumption = data.alcoholConsumption;
    if (data.bruxism !== undefined) updateData.bruxism = data.bruxism;
    if (data.nailBiting !== undefined) updateData.nailBiting = data.nailBiting;
    if (data.isPregnant !== undefined) updateData.isPregnant = data.isPregnant;
    if (data.gestationWeeks !== undefined) updateData.gestationWeeks = data.gestationWeeks;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const history = await prisma.medicalHistory.update({
      where: { id },
      data: updateData,
    });

    return this.formatMedicalHistory(history);
  }

  /**
   * ============================================
   * DIAGNOSIS METHODS
   * ============================================
   */

  /**
   * Find all diagnoses for a patient
   */
  async findDiagnosesByPatientId(patientId: string): Promise<DiagnosisResponse[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cie10: {
          select: {
            code: true,
            name: true,
            category: true,
            chapter: true,
          },
        },
        treatments: {
          include: {
            catalog: {
              select: {
                id: true,
                code: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return diagnoses.map(d => this.formatDiagnosis(d));
  }

  /**
   * Find diagnosis by ID
   */
  async findDiagnosisById(id: string): Promise<DiagnosisResponse | null> {
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cie10: {
          select: {
            code: true,
            name: true,
            category: true,
            chapter: true,
          },
        },
        treatments: {
          include: {
            catalog: {
              select: {
                id: true,
                code: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return diagnosis ? this.formatDiagnosis(diagnosis) : null;
  }

  /**
   * Create diagnosis
   */
  async createDiagnosis(
    patientId: string,
    doctorId: string,
    data: CreateDiagnosisDTO
  ): Promise<DiagnosisResponse> {
    // Get CIE-10 code details
    const cie10 = await prisma.cIE10Code.findUnique({
      where: { code: data.cie10Code },
    });

    if (!cie10) {
      throw new Error(`CIE-10 code ${data.cie10Code} not found in catalog`);
    }

    const diagnosis = await prisma.diagnosis.create({
      data: {
        patientId,
        doctorId,
        date: data.date ? new Date(data.date) : new Date(),
        cie10Code: data.cie10Code,
        cie10Name: cie10.name,
        toothNumber: data.toothNumber,
        description: data.description,
        severity: data.severity,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cie10: {
          select: {
            code: true,
            name: true,
            category: true,
            chapter: true,
          },
        },
      },
    });

    return this.formatDiagnosis(diagnosis);
  }

  /**
   * Find diagnoses by CIE-10 code
   */
  async findDiagnosesByCIE10Code(code: string): Promise<DiagnosisResponse[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { cie10Code: code },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cie10: {
          select: {
            code: true,
            name: true,
            category: true,
            chapter: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return diagnoses.map(d => this.formatDiagnosis(d));
  }

  /**
   * Find CIE-10 code by code
   */
  async findCIE10Code(code: string) {
    return prisma.cIE10Code.findUnique({
      where: { code },
    });
  }

  /**
   * ============================================
   * TREATMENT METHODS
   * ============================================
   */

  /**
   * Find all treatments for a patient
   */
  async findTreatmentsByPatientId(patientId: string): Promise<TreatmentResponse[]> {
    const treatments = await prisma.treatment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        catalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        diagnosis: {
          include: {
            cie10: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return treatments.map(t => this.formatTreatment(t));
  }

  /**
   * Find treatment by ID
   */
  async findTreatmentById(id: string): Promise<TreatmentResponse | null> {
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        catalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        diagnosis: {
          include: {
            cie10: true,
          },
        },
      },
    });

    return treatment ? this.formatTreatment(treatment) : null;
  }

  /**
   * Create treatment
   */
  async createTreatment(
    patientId: string,
    doctorId: string,
    data: CreateTreatmentDTO
  ): Promise<TreatmentResponse> {
    const paid = data.paid ?? 0;
    const balance = data.cost - paid;

    const treatment = await prisma.treatment.create({
      data: {
        patientId,
        doctorId,
        diagnosisId: data.diagnosisId,
        catalogId: data.catalogId,
        toothNumber: data.toothNumber,
        description: data.description,
        status: data.status ?? 'PLANNED',
        cost: data.cost,
        paid,
        balance,
        plannedDate: data.plannedDate ? new Date(data.plannedDate) : null,
        notes: data.notes,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        catalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        diagnosis: {
          include: {
            cie10: true,
          },
        },
      },
    });

    return this.formatTreatment(treatment);
  }

  /**
   * Update treatment
   */
  async updateTreatment(id: string, data: UpdateTreatmentDTO): Promise<TreatmentResponse> {
    // First get current treatment to calculate balance
    const current = await prisma.treatment.findUnique({
      where: { id },
    });

    if (!current) {
      throw new Error('Treatment not found');
    }

    const cost = data.cost ?? current.cost;
    const paid = data.paid ?? current.paid;
    const balance = Number(cost) - Number(paid);

    const updateData: Prisma.TreatmentUpdateInput = {
      balance,
    };

    if (data.diagnosisId !== undefined) {
      updateData.diagnosis = data.diagnosisId ? { connect: { id: data.diagnosisId } } : { disconnect: true };
    }
    if (data.catalogId !== undefined) {
      updateData.catalog = { connect: { id: data.catalogId } };
    }
    if (data.toothNumber !== undefined) updateData.toothNumber = data.toothNumber;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.paid !== undefined) updateData.paid = data.paid;
    if (data.plannedDate !== undefined) {
      updateData.plannedDate = data.plannedDate ? new Date(data.plannedDate) : null;
    }
    if (data.completedDate !== undefined) {
      updateData.completedDate = data.completedDate ? new Date(data.completedDate) : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    const treatment = await prisma.treatment.update({
      where: { id },
      data: updateData,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        catalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        diagnosis: {
          include: {
            cie10: true,
          },
        },
      },
    });

    return this.formatTreatment(treatment);
  }

  /**
   * Find treatments by diagnosis ID
   */
  async findTreatmentsByDiagnosisId(diagnosisId: string): Promise<TreatmentResponse[]> {
    const treatments = await prisma.treatment.findMany({
      where: { diagnosisId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        catalog: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        diagnosis: {
          include: {
            cie10: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return treatments.map(t => this.formatTreatment(t));
  }

  /**
   * ============================================
   * TREATMENT PLAN METHODS
   * ============================================
   */

  /**
   * Find all treatment plans for a patient
   */
  async findTreatmentPlansByPatientId(patientId: string): Promise<TreatmentPlanResponse[]> {
    const plans = await prisma.treatmentPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map(plan => ({
      ...plan,
      totalCost: Number(plan.totalCost),
    }));
  }

  /**
   * Find treatment plan by ID
   */
  async findTreatmentPlanById(id: string): Promise<TreatmentPlanResponse | null> {
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!plan) return null;

    return {
      ...plan,
      totalCost: Number(plan.totalCost),
    };
  }

  /**
   * Create treatment plan
   */
  async createTreatmentPlan(
    patientId: string,
    data: CreateTreatmentPlanDTO
  ): Promise<TreatmentPlanResponse> {
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId,
        title: data.title,
        description: data.description,
        totalCost: data.totalCost,
        status: data.status ?? 'DRAFT',
        pdfUrl: data.pdfUrl,
      },
    });

    return {
      ...plan,
      totalCost: Number(plan.totalCost),
    };
  }

  /**
   * Update treatment plan
   */
  async updateTreatmentPlan(
    id: string,
    data: UpdateTreatmentPlanDTO
  ): Promise<TreatmentPlanResponse> {
    const updateData: Prisma.TreatmentPlanUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
    if (data.approvedAt !== undefined) {
      updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    }

    const plan = await prisma.treatmentPlan.update({
      where: { id },
      data: updateData,
    });

    return {
      ...plan,
      totalCost: Number(plan.totalCost),
    };
  }

  /**
   * ============================================
   * UTILITY METHODS
   * ============================================
   */

  /**
   * Check if patient exists
   */
  async patientExists(patientId: string): Promise<boolean> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    return !!patient;
  }

  /**
   * Check if treatment catalog exists
   */
  async treatmentCatalogExists(catalogId: string): Promise<boolean> {
    const catalog = await prisma.treatmentCatalog.findUnique({
      where: { id: catalogId },
    });
    return !!catalog;
  }

  /**
   * Check if CIE-10 code exists
   */
  async cie10CodeExists(code: string): Promise<boolean> {
    const cie10 = await prisma.cIE10Code.findUnique({
      where: { code },
    });
    return !!cie10;
  }

  /**
   * ============================================
   * FORMAT METHODS
   * ============================================
   */

  /**
   * Format medical history (parse JSON fields)
   */
  private formatMedicalHistory(history: any): MedicalHistoryResponse {
    return {
      ...history,
      allergies: history.allergies ? JSON.parse(history.allergies) : null,
      chronicDiseases: history.chronicDiseases ? JSON.parse(history.chronicDiseases) : null,
      currentMedications: history.currentMedications ? JSON.parse(history.currentMedications) : null,
      previousSurgeries: history.previousSurgeries ? JSON.parse(history.previousSurgeries) : null,
      familyHistory: history.familyHistory ? JSON.parse(history.familyHistory) : null,
    };
  }

  /**
   * Format diagnosis
   */
  private formatDiagnosis(diagnosis: any): DiagnosisResponse {
    return {
      ...diagnosis,
      treatments: diagnosis.treatments?.map((t: any) => this.formatTreatment(t)),
    };
  }

  /**
   * Format treatment
   */
  private formatTreatment(treatment: any): TreatmentResponse {
    return {
      ...treatment,
      cost: Number(treatment.cost),
      paid: Number(treatment.paid),
      balance: Number(treatment.balance),
      diagnosis: treatment.diagnosis ? this.formatDiagnosis(treatment.diagnosis) : undefined,
    };
  }
}

// Export singleton instance
export const medicalRepository = new MedicalRepository();
export default medicalRepository;
