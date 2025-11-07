import { prisma } from '@config/database';
import { DentitionType, Prisma } from '@prisma/client';
import type {
  OdontogramResponse,
  OdontogramWithTeethResponse,
  ToothResponse,
  CreateOdontogramDTO,
  UpdateOdontogramDTO,
  UpdateToothDTO,
  ToothSurfacesResponse,
} from '../types/odontogram.types';
import { getAllToothNumbers } from '../types/odontogram.types';

/**
 * Odontogram Repository
 * Handles all database operations for odontograms and teeth
 */
export class OdontogramRepository {
  /**
   * ============================================
   * ODONTOGRAM QUERY METHODS
   * ============================================
   */

  /**
   * Find all odontograms for a patient (with optional filter)
   */
  async findByPatientId(
    patientId: string,
    isCurrent?: boolean
  ): Promise<OdontogramResponse[]> {
    const where: Prisma.OdontogramWhereInput = { patientId };

    if (isCurrent !== undefined) {
      where.isCurrent = isCurrent;
    }

    const odontograms = await prisma.odontogram.findMany({
      where,
      orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
    });

    return odontograms.map((o) => this.formatOdontogram(o));
  }

  /**
   * Find current odontogram for a patient
   */
  async findCurrentByPatientId(patientId: string): Promise<OdontogramWithTeethResponse | null> {
    const odontogram = await prisma.odontogram.findFirst({
      where: {
        patientId,
        isCurrent: true,
      },
      include: {
        teeth: {
          orderBy: { toothNumber: 'asc' },
        },
      },
    });

    if (!odontogram) {
      return null;
    }

    return this.formatOdontogramWithTeeth(odontogram);
  }

  /**
   * Find odontogram by ID with teeth
   */
  async findById(id: string): Promise<OdontogramWithTeethResponse | null> {
    const odontogram = await prisma.odontogram.findUnique({
      where: { id },
      include: {
        teeth: {
          orderBy: { toothNumber: 'asc' },
        },
      },
    });

    if (!odontogram) {
      return null;
    }

    return this.formatOdontogramWithTeeth(odontogram);
  }

  /**
   * Find tooth by ID
   */
  async findToothById(toothId: string): Promise<ToothResponse | null> {
    const tooth = await prisma.tooth.findUnique({
      where: { id: toothId },
    });

    if (!tooth) {
      return null;
    }

    return this.formatTooth(tooth);
  }

  /**
   * Find tooth by odontogram and tooth number
   */
  async findToothByNumber(
    odontogramId: string,
    toothNumber: string
  ): Promise<ToothResponse | null> {
    const tooth = await prisma.tooth.findUnique({
      where: {
        odontogramId_toothNumber: {
          odontogramId,
          toothNumber,
        },
      },
    });

    if (!tooth) {
      return null;
    }

    return this.formatTooth(tooth);
  }

  /**
   * ============================================
   * ODONTOGRAM CREATE/UPDATE METHODS
   * ============================================
   */

  /**
   * Create new odontogram with teeth
   */
  async create(
    patientId: string,
    _doctorId: string,
    data: CreateOdontogramDTO
  ): Promise<OdontogramWithTeethResponse> {
    // Get next version number
    const latestVersion = await this.getLatestVersion(patientId);
    const newVersion = latestVersion + 1;

    // Mark all existing odontograms as non-current
    await this.setAsNonCurrent(patientId);

    // Generate teeth if not provided
    const teethData = data.teeth && data.teeth.length > 0
      ? data.teeth
      : this.generateTeethData(data.type);

    // Create odontogram with teeth
    const odontogram = await prisma.odontogram.create({
      data: {
        patientId,
        version: newVersion,
        type: data.type,
        generalNotes: data.generalNotes,
        isCurrent: true,
        teeth: {
          create: teethData.map((tooth) => ({
            toothNumber: tooth.toothNumber,
            status: tooth.status,
            surfaces: tooth.surfaces ? JSON.stringify(tooth.surfaces) : null,
            notes: tooth.notes,
          })),
        },
      },
      include: {
        teeth: {
          orderBy: { toothNumber: 'asc' },
        },
      },
    });

    return this.formatOdontogramWithTeeth(odontogram);
  }

  /**
   * Update odontogram (creates new version)
   */
  async update(
    id: string,
    data: UpdateOdontogramDTO
  ): Promise<OdontogramWithTeethResponse> {
    // Get current odontogram
    const current = await prisma.odontogram.findUnique({
      where: { id },
      include: { teeth: true },
    });

    if (!current) {
      throw new Error('Odontogram not found');
    }

    // Mark all existing as non-current
    await this.setAsNonCurrent(current.patientId);

    // Create new version with updated data
    const newVersion = current.version + 1;

    const odontogram = await prisma.odontogram.create({
      data: {
        patientId: current.patientId,
        version: newVersion,
        type: current.type,
        generalNotes: data.generalNotes ?? current.generalNotes,
        isCurrent: true,
        teeth: {
          create: current.teeth.map((tooth) => ({
            toothNumber: tooth.toothNumber,
            status: tooth.status,
            surfaces: tooth.surfaces,
            notes: tooth.notes,
          })),
        },
      },
      include: {
        teeth: {
          orderBy: { toothNumber: 'asc' },
        },
      },
    });

    return this.formatOdontogramWithTeeth(odontogram);
  }

  /**
   * Update specific tooth
   */
  async updateTooth(toothId: string, data: UpdateToothDTO): Promise<ToothResponse> {
    const updateData: Prisma.ToothUpdateInput = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.surfaces !== undefined) {
      updateData.surfaces = data.surfaces ? JSON.stringify(data.surfaces) : null;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const tooth = await prisma.tooth.update({
      where: { id: toothId },
      data: updateData,
    });

    return this.formatTooth(tooth);
  }

  /**
   * Create new version from existing odontogram
   */
  async createNewVersion(
    patientId: string,
    _doctorId: string,
    previousOdontogramId: string
  ): Promise<OdontogramWithTeethResponse> {
    // Get previous odontogram
    const previous = await prisma.odontogram.findUnique({
      where: { id: previousOdontogramId },
      include: { teeth: true },
    });

    if (!previous || previous.patientId !== patientId) {
      throw new Error('Previous odontogram not found or does not belong to patient');
    }

    // Mark all existing as non-current
    await this.setAsNonCurrent(patientId);

    // Create new version
    const newVersion = previous.version + 1;

    const odontogram = await prisma.odontogram.create({
      data: {
        patientId,
        version: newVersion,
        type: previous.type,
        generalNotes: previous.generalNotes,
        isCurrent: true,
        teeth: {
          create: previous.teeth.map((tooth) => ({
            toothNumber: tooth.toothNumber,
            status: tooth.status,
            surfaces: tooth.surfaces,
            notes: tooth.notes,
          })),
        },
      },
      include: {
        teeth: {
          orderBy: { toothNumber: 'asc' },
        },
      },
    });

    return this.formatOdontogramWithTeeth(odontogram);
  }

  /**
   * ============================================
   * UTILITY METHODS
   * ============================================
   */

  /**
   * Set all odontograms of a patient as non-current
   */
  async setAsNonCurrent(patientId: string): Promise<void> {
    await prisma.odontogram.updateMany({
      where: {
        patientId,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });
  }

  /**
   * Get latest version number for a patient
   */
  async getLatestVersion(patientId: string): Promise<number> {
    const latest = await prisma.odontogram.findFirst({
      where: { patientId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return latest?.version ?? 0;
  }

  /**
   * Generate teeth data based on dentition type
   */
  generateTeethData(type: DentitionType): Array<{
    toothNumber: string;
    status: 'HEALTHY';
    surfaces?: any;
    notes?: string;
  }> {
    const toothNumbers = getAllToothNumbers(type);

    return toothNumbers.map((toothNumber) => ({
      toothNumber,
      status: 'HEALTHY' as const,
    }));
  }

  /**
   * Check if odontogram exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.odontogram.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check if patient has any odontogram
   */
  async hasOdontogram(patientId: string): Promise<boolean> {
    const count = await prisma.odontogram.count({
      where: { patientId },
    });

    return count > 0;
  }

  /**
   * Get odontogram history (all versions)
   */
  async getHistory(patientId: string): Promise<OdontogramResponse[]> {
    const odontograms = await prisma.odontogram.findMany({
      where: { patientId },
      orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
    });

    return odontograms.map((o) => this.formatOdontogram(o));
  }

  /**
   * ============================================
   * FORMATTING METHODS
   * ============================================
   */

  /**
   * Format odontogram response
   */
  private formatOdontogram(odontogram: any): OdontogramResponse {
    return {
      id: odontogram.id,
      patientId: odontogram.patientId,
      date: odontogram.date.toISOString(),
      version: odontogram.version,
      type: odontogram.type,
      generalNotes: odontogram.generalNotes ?? undefined,
      isCurrent: odontogram.isCurrent,
      createdAt: odontogram.createdAt.toISOString(),
      updatedAt: odontogram.updatedAt.toISOString(),
    };
  }

  /**
   * Format odontogram with teeth response
   */
  private formatOdontogramWithTeeth(odontogram: any): OdontogramWithTeethResponse {
    return {
      ...this.formatOdontogram(odontogram),
      teeth: odontogram.teeth.map((tooth: any) => this.formatTooth(tooth)),
    };
  }

  /**
   * Format tooth response
   */
  private formatTooth(tooth: any): ToothResponse {
    let surfaces: ToothSurfacesResponse | undefined;

    if (tooth.surfaces) {
      try {
        surfaces = JSON.parse(tooth.surfaces);
      } catch (error) {
        surfaces = undefined;
      }
    }

    return {
      id: tooth.id,
      odontogramId: tooth.odontogramId,
      toothNumber: tooth.toothNumber,
      status: tooth.status,
      surfaces,
      notes: tooth.notes ?? undefined,
      createdAt: tooth.createdAt.toISOString(),
      updatedAt: tooth.updatedAt.toISOString(),
    };
  }
}

export default new OdontogramRepository();
