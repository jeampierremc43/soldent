import { prisma } from '@config/database';
import { Patient, EmergencyContact, MedicalHistory, Prisma } from '@prisma/client';
import type {
  CreatePatientData,
  UpdatePatientData,
  PatientListOptions,
  PaginatedPatientResponse,
} from '../types/patient.types';

/**
 * Patient with emergency contacts
 */
export type PatientWithEmergencyContact = Patient & {
  emergencyContacts: EmergencyContact[];
};

/**
 * Patient with full relations
 */
export type PatientWithFullRelations = Patient & {
  emergencyContacts: EmergencyContact[];
  medicalHistories: MedicalHistory[];
  _count: {
    appointments: number;
    treatments: number;
  };
};

/**
 * Patient Repository
 * Handles all database operations related to patients
 */
export class PatientRepository {
  /**
   * Find all patients with optional filters and pagination
   * @param options - Filter, pagination and sorting options
   * @returns Paginated list of patients
   */
  async findAll(options: PatientListOptions = {}): Promise<PaginatedPatientResponse> {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
      sorting = { sortBy: 'createdAt', sortOrder: 'desc' },
    } = options;

    // Build where clause
    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      isActive: filters.isActive !== undefined ? filters.isActive : undefined,
      gender: filters.gender,
      hasInsurance: filters.hasInsurance,
    };

    // Add search conditions
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { identification: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Add specific filters
    if (filters.identification) {
      where.identification = { contains: filters.identification, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters.phone) {
      where.phone = { contains: filters.phone, mode: 'insensitive' };
    }

    // Calculate pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.PatientOrderByWithRelationInput = {
      [sorting.sortBy || 'createdAt']: sorting.sortOrder || 'desc',
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          emergencyContacts: true,
          _count: {
            select: {
              appointments: true,
              medicalHistories: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * Find patient by ID with all relations
   * @param id - Patient ID
   * @returns Patient with relations or null
   */
  async findById(id: string): Promise<PatientWithFullRelations | null> {
    return prisma.patient.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        emergencyContacts: true,
        medicalHistories: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            appointments: true,
            treatments: true,
            diagnoses: true,
          },
        },
      },
    });
  }

  /**
   * Find patient by identification number
   * @param identification - Patient identification
   * @returns Patient or null
   */
  async findByIdentification(identification: string): Promise<Patient | null> {
    return prisma.patient.findFirst({
      where: {
        identification,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if identification already exists
   * @param identification - Identification number
   * @param excludeId - Patient ID to exclude from check (for updates)
   * @returns true if exists, false otherwise
   */
  async identificationExists(
    identification: string,
    excludeId?: string
  ): Promise<boolean> {
    const patient = await prisma.patient.findFirst({
      where: {
        identification,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    return !!patient;
  }

  /**
   * Check if email already exists
   * @param email - Email address
   * @param excludeId - Patient ID to exclude from check (for updates)
   * @returns true if exists, false otherwise
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const patient = await prisma.patient.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    return !!patient;
  }

  /**
   * Create new patient
   * @param data - Patient creation data
   * @returns Created patient with emergency contact
   */
  async create(data: CreatePatientData): Promise<PatientWithEmergencyContact> {
    const { emergencyContact, ...patientData } = data;

    return prisma.patient.create({
      data: {
        ...patientData,
        dateOfBirth: new Date(patientData.dateOfBirth),
        ...(emergencyContact && {
          emergencyContacts: {
            create: emergencyContact,
          },
        }),
      },
      include: {
        emergencyContacts: true,
      },
    });
  }

  /**
   * Update patient by ID
   * @param id - Patient ID
   * @param data - Patient update data
   * @returns Updated patient with emergency contacts
   */
  async update(
    id: string,
    data: UpdatePatientData
  ): Promise<PatientWithEmergencyContact> {
    return prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      },
      include: {
        emergencyContacts: true,
      },
    });
  }

  /**
   * Soft delete patient by ID
   * Sets deletedAt timestamp and deactivates account
   * @param id - Patient ID
   * @returns Deleted patient
   */
  async delete(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  /**
   * Hard delete patient (use with caution)
   * Permanently removes patient from database
   * @param id - Patient ID
   * @returns Deleted patient
   */
  async hardDelete(id: string): Promise<Patient> {
    return prisma.patient.delete({
      where: { id },
    });
  }

  /**
   * Restore soft-deleted patient
   * @param id - Patient ID
   * @returns Restored patient
   */
  async restore(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  }

  /**
   * Activate patient account
   * @param id - Patient ID
   * @returns Updated patient
   */
  async activate(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate patient account
   * @param id - Patient ID
   * @returns Updated patient
   */
  async deactivate(id: string): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get patient medical history
   * @param patientId - Patient ID
   * @returns Medical history records
   */
  async getMedicalHistory(patientId: string): Promise<MedicalHistory[]> {
    return prisma.medicalHistory.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get patient appointments
   * @param patientId - Patient ID
   * @param limit - Maximum number of appointments to return
   * @returns Patient appointments
   */
  async getAppointments(patientId: string, limit = 10) {
    return prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get patient treatments
   * @param patientId - Patient ID
   * @param limit - Maximum number of treatments to return
   * @returns Patient treatments
   */
  async getTreatments(patientId: string, limit = 10) {
    return prisma.treatment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        catalog: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get patient statistics
   * @param patientId - Patient ID
   * @returns Patient statistics
   */
  async getPatientStats(patientId: string) {
    const [appointmentsCount, treatmentsCount, totalPaid, totalBalance] =
      await Promise.all([
        prisma.appointment.count({ where: { patientId } }),
        prisma.treatment.count({ where: { patientId } }),
        prisma.patientPayment.aggregate({
          where: { patientId },
          _sum: { amount: true },
        }),
        prisma.treatment.aggregate({
          where: { patientId },
          _sum: { balance: true },
        }),
      ]);

    return {
      appointmentsCount,
      treatmentsCount,
      totalPaid: totalPaid._sum.amount || 0,
      totalBalance: totalBalance._sum.balance || 0,
    };
  }

  /**
   * Count total active patients
   * @returns Number of active patients
   */
  async countActive(): Promise<number> {
    return prisma.patient.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Count patients by gender
   * @returns Object with count by gender
   */
  async countByGender() {
    return prisma.patient.groupBy({
      by: ['gender'],
      where: {
        isActive: true,
        deletedAt: null,
      },
      _count: true,
    });
  }

  /**
   * Get patients with upcoming appointments
   * @param days - Number of days to look ahead
   * @returns Patients with appointments
   */
  async getWithUpcomingAppointments(days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return prisma.patient.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        appointments: {
          some: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            status: 'SCHEDULED',
          },
        },
      },
      include: {
        appointments: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            status: 'SCHEDULED',
          },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  /**
   * Search patients by name (autocomplete)
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching patients
   */
  async searchByName(query: string, limit = 10): Promise<Patient[]> {
    return prisma.patient.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  /**
   * Add emergency contact to patient
   * @param patientId - Patient ID
   * @param data - Emergency contact data
   * @returns Created emergency contact
   */
  async addEmergencyContact(
    patientId: string,
    data: Omit<EmergencyContact, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>
  ): Promise<EmergencyContact> {
    return prisma.emergencyContact.create({
      data: {
        ...data,
        patientId,
      },
    });
  }

  /**
   * Update emergency contact
   * @param id - Emergency contact ID
   * @param data - Update data
   * @returns Updated emergency contact
   */
  async updateEmergencyContact(
    id: string,
    data: Partial<Omit<EmergencyContact, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>>
  ): Promise<EmergencyContact> {
    return prisma.emergencyContact.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete emergency contact
   * @param id - Emergency contact ID
   * @returns Deleted emergency contact
   */
  async deleteEmergencyContact(id: string): Promise<EmergencyContact> {
    return prisma.emergencyContact.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const patientRepository = new PatientRepository();
export default patientRepository;
