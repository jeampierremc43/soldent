import { DentitionType, ToothStatus } from '@prisma/client';
import { OdontogramRepository } from '../repositories/odontogram.repository';
import type {
  OdontogramResponse,
  OdontogramWithTeethResponse,
  ToothResponse,
  CreateOdontogramDTO,
  UpdateOdontogramDTO,
  UpdateToothDTO,
  OdontogramComparisonResponse,
  ToothChange,
  ToothSurfacesResponse,
} from '../types/odontogram.types';
import {
  validateToothNumbersForType,
} from '../types/odontogram.types';

/**
 * Odontogram Service
 * Business logic for odontogram management
 */
export class OdontogramService {
  private repository: OdontogramRepository;

  constructor() {
    this.repository = new OdontogramRepository();
  }

  /**
   * ============================================
   * QUERY METHODS
   * ============================================
   */

  /**
   * Get all odontograms for a patient
   */
  async getOdontogramsByPatient(
    patientId: string,
    isCurrent?: boolean
  ): Promise<OdontogramResponse[]> {
    return this.repository.findByPatientId(patientId, isCurrent);
  }

  /**
   * Get current odontogram for a patient
   */
  async getCurrentOdontogram(patientId: string): Promise<OdontogramWithTeethResponse | null> {
    return this.repository.findCurrentByPatientId(patientId);
  }

  /**
   * Get odontogram by ID
   */
  async getOdontogramById(id: string): Promise<OdontogramWithTeethResponse | null> {
    return this.repository.findById(id);
  }

  /**
   * Get odontogram history (all versions)
   */
  async getOdontogramHistory(patientId: string): Promise<OdontogramResponse[]> {
    return this.repository.getHistory(patientId);
  }

  /**
   * ============================================
   * CREATE/UPDATE METHODS
   * ============================================
   */

  /**
   * Create new odontogram
   */
  async createOdontogram(
    patientId: string,
    doctorId: string,
    data: CreateOdontogramDTO
  ): Promise<OdontogramWithTeethResponse> {
    // Validate teeth numbers if provided
    if (data.teeth && data.teeth.length > 0) {
      this.validateTeeth(data.teeth, data.type);
    }

    // Create odontogram
    return this.repository.create(patientId, doctorId, data);
  }

  /**
   * Update odontogram (creates new version automatically)
   */
  async updateOdontogram(
    id: string,
    data: UpdateOdontogramDTO
  ): Promise<OdontogramWithTeethResponse> {
    // Verify odontogram exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error('Odontogram not found');
    }

    // Update (creates new version)
    return this.repository.update(id, data);
  }

  /**
   * Update specific tooth in odontogram
   */
  async updateTooth(
    odontogramId: string,
    toothNumber: string,
    data: UpdateToothDTO
  ): Promise<ToothResponse> {
    // Find tooth
    const tooth = await this.repository.findToothByNumber(odontogramId, toothNumber);

    if (!tooth) {
      throw new Error(`Tooth ${toothNumber} not found in odontogram`);
    }

    // Validate surfaces if provided
    if (data.surfaces) {
      this.validateSurfaces(data.surfaces);
    }

    // Update tooth
    return this.repository.updateTooth(tooth.id, data);
  }

  /**
   * Create new version from existing odontogram
   */
  async createNewVersion(
    patientId: string,
    doctorId: string,
    previousOdontogramId: string
  ): Promise<OdontogramWithTeethResponse> {
    return this.repository.createNewVersion(patientId, doctorId, previousOdontogramId);
  }

  /**
   * ============================================
   * COMPARISON METHODS
   * ============================================
   */

  /**
   * Compare two odontogram versions
   */
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<OdontogramComparisonResponse> {
    // Get both versions
    const v1 = await this.repository.findById(version1Id);
    const v2 = await this.repository.findById(version2Id);

    if (!v1 || !v2) {
      throw new Error('One or both odontogram versions not found');
    }

    // Verify they belong to same patient
    if (v1.patientId !== v2.patientId) {
      throw new Error('Odontograms must belong to the same patient');
    }

    // Compare teeth
    const changes: ToothChange[] = [];
    const modifiedTeeth = new Set<string>();
    let statusChanges = 0;
    let surfaceChanges = 0;

    // Create maps for easy lookup
    const v1TeethMap = new Map(v1.teeth.map((t) => [t.toothNumber, t]));
    const v2TeethMap = new Map(v2.teeth.map((t) => [t.toothNumber, t]));

    // Compare each tooth
    for (const toothNumber of v1TeethMap.keys()) {
      const tooth1 = v1TeethMap.get(toothNumber)!;
      const tooth2 = v2TeethMap.get(toothNumber);

      if (!tooth2) {
        continue;
      }

      // Compare status
      if (tooth1.status !== tooth2.status) {
        changes.push({
          toothNumber,
          field: 'status',
          oldValue: tooth1.status,
          newValue: tooth2.status,
        });
        modifiedTeeth.add(toothNumber);
        statusChanges++;
      }

      // Compare surfaces
      const surfaceChanges1 = this.compareSurfaces(
        toothNumber,
        tooth1.surfaces,
        tooth2.surfaces
      );
      if (surfaceChanges1.length > 0) {
        changes.push(...surfaceChanges1);
        modifiedTeeth.add(toothNumber);
        surfaceChanges += surfaceChanges1.length;
      }

      // Compare notes
      if (tooth1.notes !== tooth2.notes) {
        changes.push({
          toothNumber,
          field: 'notes',
          oldValue: tooth1.notes,
          newValue: tooth2.notes,
        });
        modifiedTeeth.add(toothNumber);
      }
    }

    return {
      version1: {
        id: v1.id,
        patientId: v1.patientId,
        date: v1.date,
        version: v1.version,
        type: v1.type,
        generalNotes: v1.generalNotes,
        isCurrent: v1.isCurrent,
        createdAt: v1.createdAt,
        updatedAt: v1.updatedAt,
      },
      version2: {
        id: v2.id,
        patientId: v2.patientId,
        date: v2.date,
        version: v2.version,
        type: v2.type,
        generalNotes: v2.generalNotes,
        isCurrent: v2.isCurrent,
        createdAt: v2.createdAt,
        updatedAt: v2.updatedAt,
      },
      changes,
      summary: {
        totalChanges: changes.length,
        teethModified: modifiedTeeth.size,
        statusChanges,
        surfaceChanges,
      },
    };
  }

  /**
   * ============================================
   * VALIDATION METHODS
   * ============================================
   */

  /**
   * Validate teeth data
   */
  private validateTeeth(
    teeth: Array<{ toothNumber: string; [key: string]: any }>,
    type: DentitionType
  ): void {
    // Check for duplicates
    const toothNumbers = teeth.map((t) => t.toothNumber);
    const duplicates = toothNumbers.filter(
      (num, index) => toothNumbers.indexOf(num) !== index
    );

    if (duplicates.length > 0) {
      throw new Error(`Duplicate tooth numbers found: ${duplicates.join(', ')}`);
    }

    // Validate tooth numbers for dentition type
    const isValid = validateToothNumbersForType(toothNumbers, type);

    if (!isValid) {
      throw new Error(
        `Invalid tooth numbers for dentition type ${type}. ` +
          `Permanent: 11-48, Temporary: 51-85`
      );
    }

    // Validate each tooth's surfaces
    teeth.forEach((tooth) => {
      if (tooth.surfaces) {
        this.validateSurfaces(tooth.surfaces);
      }
    });
  }

  /**
   * Validate tooth surfaces
   */
  private validateSurfaces(surfaces: any): void {
    const validSurfaces = ['O', 'M', 'D', 'V', 'L', 'P'];
    const providedSurfaces = Object.keys(surfaces);

    const invalidSurfaces = providedSurfaces.filter(
      (s) => !validSurfaces.includes(s)
    );

    if (invalidSurfaces.length > 0) {
      throw new Error(
        `Invalid surfaces: ${invalidSurfaces.join(', ')}. ` +
          `Valid surfaces are: O, M, D, V, L, P`
      );
    }

    // Validate each surface condition
    providedSurfaces.forEach((surface) => {
      const condition = surfaces[surface];
      if (condition && condition.status) {
        if (!Object.values(ToothStatus).includes(condition.status)) {
          throw new Error(
            `Invalid status for surface ${surface}: ${condition.status}`
          );
        }
      }
    });
  }

  /**
   * Compare surfaces between two teeth
   */
  private compareSurfaces(
    toothNumber: string,
    surfaces1?: ToothSurfacesResponse,
    surfaces2?: ToothSurfacesResponse
  ): ToothChange[] {
    const changes: ToothChange[] = [];

    if (!surfaces1 && !surfaces2) {
      return changes;
    }

    const allSurfaces = ['O', 'M', 'D', 'V', 'L', 'P'];

    for (const surface of allSurfaces) {
      const s1 = surfaces1?.[surface as keyof ToothSurfacesResponse];
      const s2 = surfaces2?.[surface as keyof ToothSurfacesResponse];

      // Compare status
      if (s1?.status !== s2?.status) {
        changes.push({
          toothNumber,
          field: `surface.${surface}.status`,
          oldValue: s1?.status,
          newValue: s2?.status,
        });
      }

      // Compare notes
      if (s1?.notes !== s2?.notes) {
        changes.push({
          toothNumber,
          field: `surface.${surface}.notes`,
          oldValue: s1?.notes,
          newValue: s2?.notes,
        });
      }
    }

    return changes;
  }

  /**
   * ============================================
   * UTILITY METHODS
   * ============================================
   */

  /**
   * Check if patient has any odontogram
   */
  async hasOdontogram(patientId: string): Promise<boolean> {
    return this.repository.hasOdontogram(patientId);
  }

  /**
   * Get statistics for an odontogram
   */
  async getOdontogramStatistics(odontogramId: string): Promise<{
    total: number;
    healthy: number;
    caries: number;
    filled: number;
    missing: number;
    other: number;
  }> {
    const odontogram = await this.repository.findById(odontogramId);

    if (!odontogram) {
      throw new Error('Odontogram not found');
    }

    const stats = {
      total: odontogram.teeth.length,
      healthy: 0,
      caries: 0,
      filled: 0,
      missing: 0,
      other: 0,
    };

    odontogram.teeth.forEach((tooth) => {
      switch (tooth.status) {
        case ToothStatus.HEALTHY:
          stats.healthy++;
          break;
        case ToothStatus.CARIES:
          stats.caries++;
          break;
        case ToothStatus.FILLED:
          stats.filled++;
          break;
        case ToothStatus.MISSING:
          stats.missing++;
          break;
        default:
          stats.other++;
      }
    });

    return stats;
  }
}

const odontogramService = new OdontogramService();
export { odontogramService };
export default odontogramService;
