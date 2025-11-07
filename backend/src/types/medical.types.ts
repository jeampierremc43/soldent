import { z } from 'zod';
import {
  DiagnosisSeverity,
  TreatmentStatus,
  TreatmentPlanStatus,
  SmokingHabit,
  AlcoholConsumption
} from '@prisma/client';

/**
 * ============================================
 * CIE-10 VALIDATION
 * ============================================
 */

/**
 * Validar formato de código CIE-10
 * Formato: K00-K14 (odontología)
 */
export const cie10CodeSchema = z.string()
  .regex(/^K[0-1][0-9](\.[0-9])?$/, 'Invalid CIE-10 code format. Expected K00-K14')
  .refine((code) => {
    const category = code.substring(0, 3); // K00, K01, etc.
    const categoryNum = parseInt(category.substring(1));
    return categoryNum >= 0 && categoryNum <= 14;
  }, 'CIE-10 code must be in range K00-K14 for dental diagnoses');

/**
 * ============================================
 * MEDICAL HISTORY SCHEMAS
 * ============================================
 */

/**
 * Schema for creating medical history
 */
export const createMedicalHistorySchema = z.object({
  // Antecedentes médicos generales
  allergies: z.array(z.string()).optional(),
  chronicDiseases: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  previousSurgeries: z.array(z.string()).optional(),
  familyHistory: z.array(z.string()).optional(),

  // Antecedentes odontológicos
  lastDentalVisit: z.string().datetime().optional(),
  brushingFrequency: z.number().int().min(0).max(10).optional(),
  usesFloss: z.boolean().optional().default(false),
  usesMouthwash: z.boolean().optional().default(false),
  smokingHabit: z.nativeEnum(SmokingHabit).optional(),
  alcoholConsumption: z.nativeEnum(AlcoholConsumption).optional(),

  // Hábitos parafuncionales
  bruxism: z.boolean().optional().default(false),
  nailBiting: z.boolean().optional().default(false),

  // Embarazo (si aplica)
  isPregnant: z.boolean().optional().default(false),
  gestationWeeks: z.number().int().min(1).max(42).optional(),

  notes: z.string().optional(),
});

/**
 * Schema for updating medical history
 */
export const updateMedicalHistorySchema = createMedicalHistorySchema.partial();

/**
 * DTO Types
 */
export type CreateMedicalHistoryDTO = z.infer<typeof createMedicalHistorySchema>;
export type UpdateMedicalHistoryDTO = z.infer<typeof updateMedicalHistorySchema>;

/**
 * ============================================
 * DIAGNOSIS SCHEMAS
 * ============================================
 */

/**
 * Schema for creating diagnosis
 */
export const createDiagnosisSchema = z.object({
  cie10Code: cie10CodeSchema,
  toothNumber: z.string().optional(),
  description: z.string().optional(),
  severity: z.nativeEnum(DiagnosisSeverity).optional(),
  date: z.string().datetime().optional(), // ISO 8601 format
});

/**
 * Schema for querying diagnoses by CIE-10 code
 */
export const diagnosisByCIE10Schema = z.object({
  code: cie10CodeSchema,
});

/**
 * DTO Types
 */
export type CreateDiagnosisDTO = z.infer<typeof createDiagnosisSchema>;
export type DiagnosisByCIE10DTO = z.infer<typeof diagnosisByCIE10Schema>;

/**
 * ============================================
 * TREATMENT SCHEMAS
 * ============================================
 */

/**
 * Schema for creating treatment
 */
export const createTreatmentSchema = z.object({
  diagnosisId: z.string().uuid().optional(),
  catalogId: z.string().uuid(),
  toothNumber: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TreatmentStatus).optional().default(TreatmentStatus.PLANNED),
  cost: z.number().positive(),
  paid: z.number().min(0).optional().default(0),
  plannedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // If paid is provided, it cannot exceed cost
  if (data.paid !== undefined && data.cost !== undefined) {
    return data.paid <= data.cost;
  }
  return true;
}, {
  message: 'Paid amount cannot exceed total cost',
  path: ['paid'],
});

/**
 * Schema for updating treatment
 */
export const updateTreatmentSchema = z.object({
  diagnosisId: z.string().uuid().optional(),
  catalogId: z.string().uuid().optional(),
  toothNumber: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TreatmentStatus).optional(),
  cost: z.number().positive().optional(),
  paid: z.number().min(0).optional(),
  plannedDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Validate dates
  if (data.completedDate && data.status !== TreatmentStatus.COMPLETED) {
    return false;
  }
  return true;
}, {
  message: 'Completed date can only be set when status is COMPLETED',
  path: ['completedDate'],
});

/**
 * Schema for querying treatments by diagnosis
 */
export const treatmentsByDiagnosisSchema = z.object({
  diagnosisId: z.string().uuid(),
});

/**
 * DTO Types
 */
export type CreateTreatmentDTO = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentDTO = z.infer<typeof updateTreatmentSchema>;
export type TreatmentsByDiagnosisDTO = z.infer<typeof treatmentsByDiagnosisSchema>;

/**
 * ============================================
 * TREATMENT PLAN SCHEMAS
 * ============================================
 */

/**
 * Schema for creating treatment plan
 */
export const createTreatmentPlanSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  totalCost: z.number().positive(),
  status: z.nativeEnum(TreatmentPlanStatus).optional().default(TreatmentPlanStatus.DRAFT),
  pdfUrl: z.string().url().optional(),
});

/**
 * Schema for updating treatment plan
 */
export const updateTreatmentPlanSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  totalCost: z.number().positive().optional(),
  status: z.nativeEnum(TreatmentPlanStatus).optional(),
  pdfUrl: z.string().url().optional(),
  approvedAt: z.string().datetime().optional(),
}).refine((data) => {
  // If status is APPROVED, must have approvedAt
  if (data.status === TreatmentPlanStatus.APPROVED && !data.approvedAt) {
    return false;
  }
  return true;
}, {
  message: 'Approved date is required when status is APPROVED',
  path: ['approvedAt'],
});

/**
 * DTO Types
 */
export type CreateTreatmentPlanDTO = z.infer<typeof createTreatmentPlanSchema>;
export type UpdateTreatmentPlanDTO = z.infer<typeof updateTreatmentPlanSchema>;

/**
 * ============================================
 * RESPONSE TYPES
 * ============================================
 */

/**
 * Medical History Response
 */
export interface MedicalHistoryResponse {
  id: string;
  patientId: string;
  allergies: string[] | null;
  chronicDiseases: string[] | null;
  currentMedications: string[] | null;
  previousSurgeries: string[] | null;
  familyHistory: string[] | null;
  lastDentalVisit: Date | null;
  brushingFrequency: number | null;
  usesFloss: boolean;
  usesMouthwash: boolean;
  smokingHabit: SmokingHabit | null;
  alcoholConsumption: AlcoholConsumption | null;
  bruxism: boolean;
  nailBiting: boolean;
  isPregnant: boolean;
  gestationWeeks: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Diagnosis Response
 */
export interface DiagnosisResponse {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  cie10Code: string;
  cie10Name: string;
  toothNumber: string | null;
  description: string | null;
  severity: DiagnosisSeverity | null;
  createdAt: Date;
  updatedAt: Date;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  cie10?: {
    code: string;
    name: string;
    category: string;
    chapter: string;
  };
  treatments?: TreatmentResponse[];
}

/**
 * Treatment Response
 */
export interface TreatmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosisId: string | null;
  appointmentId: string | null;
  catalogId: string;
  toothNumber: string | null;
  description: string | null;
  status: TreatmentStatus;
  cost: number;
  paid: number;
  balance: number;
  plannedDate: Date | null;
  completedDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  catalog?: {
    id: string;
    code: string;
    name: string;
    category: string;
  };
  diagnosis?: DiagnosisResponse;
}

/**
 * Treatment Plan Response
 */
export interface TreatmentPlanResponse {
  id: string;
  patientId: string;
  title: string;
  description: string | null;
  totalCost: number;
  status: TreatmentPlanStatus;
  pdfUrl: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Complete Medical History Response (all data for a patient)
 */
export interface CompleteMedicalHistoryResponse {
  medicalHistory: MedicalHistoryResponse | null;
  diagnoses: DiagnosisResponse[];
  treatments: TreatmentResponse[];
  treatmentPlans: TreatmentPlanResponse[];
}

/**
 * ============================================
 * VALIDATION HELPERS
 * ============================================
 */

/**
 * Validate if a CIE-10 code is valid for dentistry (K00-K14)
 */
export const isValidDentalCIE10Code = (code: string): boolean => {
  try {
    cie10CodeSchema.parse(code);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract category from CIE-10 code
 * Example: "K02.1" -> "K02"
 */
export const extractCIE10Category = (code: string): string => {
  return code.substring(0, 3);
};

/**
 * Check if treatment is fully paid
 */
export const isTreatmentFullyPaid = (treatment: { cost: number; paid: number }): boolean => {
  return treatment.paid >= treatment.cost;
};

/**
 * Calculate treatment balance
 */
export const calculateTreatmentBalance = (treatment: { cost: number; paid: number }): number => {
  return treatment.cost - treatment.paid;
};
