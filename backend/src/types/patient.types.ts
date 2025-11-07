import { z } from 'zod';
import { commonSchemas } from '@middleware/validation';
import {
  Gender,
  IdentificationType,
  MaritalStatus,
  BloodType
} from '@prisma/client';

/**
 * ============================================
 * CUSTOM VALIDATION FUNCTIONS
 * ============================================
 */

/**
 * Validates Ecuadorian ID (Cédula)
 * 10 digits, with last digit being check digit
 */
const validateEcuadorianId = (id: string): boolean => {
  if (!/^\d{10}$/.test(id)) return false;

  const digits = id.split('').map(Number);
  const province = Number(id.substring(0, 2));

  // Province code must be between 01 and 24
  if (province < 1 || province > 24) return false;

  // Third digit must be less than 6 for natural persons
  if ((digits[2] ?? 0) >= 6) return false;

  // Verify check digit
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let product = (digits[i] ?? 0) * (coefficients[i] ?? 0);
    if (product >= 10) product -= 9;
    sum += product;
  }

  const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return checkDigit === (digits[9] ?? 0);
};

/**
 * ============================================
 * ZOD VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Ecuadorian ID validation schema
 */
export const ecuadorianIdSchema = z
  .string()
  .length(10, 'ID must be exactly 10 digits')
  .regex(/^\d{10}$/, 'ID must contain only numbers')
  .refine(validateEcuadorianId, {
    message: 'Invalid Ecuadorian ID number',
  });

/**
 * Phone number validation (Ecuador format)
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+593|0)[0-9]{9}$/, 'Invalid phone number. Format: 0987654321 or +593987654321');

/**
 * Date of birth validation
 * Must be at least 1 year old and no more than 150 years old
 */
export const dateOfBirthSchema = z
  .string()
  .datetime()
  .refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();

      // Calculate age more accurately
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= 1 && age <= 150;
    },
    {
      message: 'Patient must be between 1 and 150 years old',
    }
  );

/**
 * Emergency contact schema
 */
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  relationship: z
    .string()
    .min(2, 'Relationship must be at least 2 characters')
    .max(50, 'Relationship must not exceed 50 characters'),
  phone: phoneSchema,
  phone2: phoneSchema.optional(),
});

/**
 * Create patient schema
 */
export const createPatientSchema = z.object({
  // Personal information
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'First name must contain only letters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name must contain only letters'),
  dateOfBirth: dateOfBirthSchema,
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Invalid gender value' }),
  }),
  identification: ecuadorianIdSchema,
  identificationType: z.nativeEnum(IdentificationType).default(IdentificationType.CEDULA),

  // Contact information
  phone: phoneSchema,
  email: commonSchemas.email.optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  province: z.string().min(2).max(100).optional(),

  // Insurance information
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().max(100).optional(),
  insuranceNumber: z.string().max(50).optional(),

  // Additional information
  occupation: z.string().max(100).optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  bloodType: z.nativeEnum(BloodType).optional(),

  // Emergency contact
  emergencyContact: emergencyContactSchema.optional(),
});

/**
 * Update patient schema
 * All fields optional for partial updates
 */
export const updatePatientSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'First name must contain only letters')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name must contain only letters')
    .optional(),
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: z.nativeEnum(Gender).optional(),
  phone: phoneSchema.optional(),
  email: commonSchemas.email.optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  province: z.string().min(2).max(100).optional(),
  hasInsurance: z.boolean().optional(),
  insuranceProvider: z.string().max(100).optional(),
  insuranceNumber: z.string().max(50).optional(),
  occupation: z.string().max(100).optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  bloodType: z.nativeEnum(BloodType).optional(),
});

/**
 * Search/filter patients schema
 */
export const searchPatientsSchema = z.object({
  // Search by multiple criteria
  search: z.string().min(1).max(100).optional(), // Searches in name, identification, email
  identification: z.string().max(20).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),

  // Filters
  gender: z.nativeEnum(Gender).optional(),
  hasInsurance: z.string().transform((val) => val === 'true').optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),

  // Pagination
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),

  // Sorting
  sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'dateOfBirth']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Patient ID parameter schema
 */
export const patientIdSchema = z.object({
  id: z.string().uuid('Invalid patient ID format'),
});

/**
 * ============================================
 * TYPESCRIPT INTERFACES
 * ============================================
 */

/**
 * Emergency contact data
 */
export interface EmergencyContactData {
  name: string;
  relationship: string;
  phone: string;
  phone2?: string;
}

/**
 * Patient creation data
 */
export interface CreatePatientData {
  // Personal information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  identification: string;
  identificationType: IdentificationType;

  // Contact information
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;

  // Insurance information
  hasInsurance: boolean;
  insuranceProvider?: string;
  insuranceNumber?: string;

  // Additional information
  occupation?: string;
  maritalStatus?: MaritalStatus;
  bloodType?: BloodType;

  // Emergency contact
  emergencyContact?: EmergencyContactData;
}

/**
 * Patient update data
 */
export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  hasInsurance?: boolean;
  insuranceProvider?: string;
  insuranceNumber?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  bloodType?: BloodType;
}

/**
 * Patient search filters
 */
export interface PatientSearchFilters {
  search?: string;
  identification?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  hasInsurance?: boolean;
  isActive?: boolean;
}

/**
 * Patient list options
 */
export interface PatientListOptions {
  filters?: PatientSearchFilters;
  pagination?: {
    page: number;
    limit: number;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

/**
 * Paginated patient response
 */
export interface PaginatedPatientResponse {
  data: any[]; // Patient with relations
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Patient with basic relations
 */
export interface PatientWithRelations {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  identification: string;
  identificationType: IdentificationType;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  hasInsurance: boolean;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  occupation: string | null;
  maritalStatus: MaritalStatus | null;
  bloodType: BloodType | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  emergencyContacts?: EmergencyContactData[];
  appointmentsCount?: number;
  medicalHistoriesCount?: number;
}

/**
 * ============================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ============================================
 */

/**
 * Create patient DTO
 */
export type CreatePatientDTO = z.infer<typeof createPatientSchema>;

/**
 * Update patient DTO
 */
export type UpdatePatientDTO = z.infer<typeof updatePatientSchema>;

/**
 * Search patients DTO
 */
export type SearchPatientsDTO = z.infer<typeof searchPatientsSchema>;

/**
 * Patient ID DTO
 */
export type PatientIdDTO = z.infer<typeof patientIdSchema>;

/**
 * Emergency contact DTO
 */
export type EmergencyContactDTO = z.infer<typeof emergencyContactSchema>;
