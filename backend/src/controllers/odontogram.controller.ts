import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { odontogramService } from '@services/odontogram.service';
import { AuthRequest } from '@middleware/auth';
import type {
  CreateOdontogramDTO,
  UpdateOdontogramDTO,
  UpdateToothDTO,
} from '../types/odontogram.types';

/**
 * Odontogram Controller
 * Handles all HTTP requests related to odontograms
 */
export class OdontogramController {
  /**
   * ============================================
   * ODONTOGRAM QUERY ENDPOINTS
   * ============================================
   */

  /**
   * Get all odontograms for a patient (including history)
   * GET /api/v1/odontograms/patients/:patientId/odontograms
   */
  getOdontograms = catchAsync(async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const { isCurrent } = req.query;

    let isCurrentFilter: boolean | undefined;
    if (isCurrent === 'true') {
      isCurrentFilter = true;
    } else if (isCurrent === 'false') {
      isCurrentFilter = false;
    }

    const odontograms = await odontogramService.getOdontogramsByPatient(
      patientId,
      isCurrentFilter
    );

    return ResponseHelper.success(
      res,
      odontograms,
      `Retrieved ${odontograms.length} odontogram(s)`
    );
  });

  /**
   * Get current odontogram for a patient
   * GET /api/v1/odontograms/patients/:patientId/odontograms/current
   */
  getCurrentOdontogram = catchAsync(async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;

    const odontogram = await odontogramService.getCurrentOdontogram(patientId);

    if (!odontogram) {
      return ResponseHelper.success(
        res,
        null,
        'No current odontogram found for this patient'
      );
    }

    return ResponseHelper.success(
      res,
      odontogram,
      'Current odontogram retrieved successfully'
    );
  });

  /**
   * Get odontogram by ID with teeth
   * GET /api/v1/odontograms/:id
   */
  getOdontogramById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const odontogram = await odontogramService.getOdontogramById(id);

    if (!odontogram) {
      return ResponseHelper.error(res, 'Odontogram not found', 404);
    }

    return ResponseHelper.success(
      res,
      odontogram,
      'Odontogram retrieved successfully'
    );
  });

  /**
   * Get odontogram history (all versions)
   * GET /api/v1/odontograms/:id/history
   */
  getOdontogramHistory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    // First get the odontogram to get patient ID
    const odontogram = await odontogramService.getOdontogramById(id);

    if (!odontogram) {
      return ResponseHelper.error(res, 'Odontogram not found', 404);
    }

    const history = await odontogramService.getOdontogramHistory(odontogram.patientId);

    return ResponseHelper.success(
      res,
      history,
      `Retrieved ${history.length} version(s)`
    );
  });

  /**
   * Get odontogram statistics
   * GET /api/v1/odontograms/:id/statistics
   */
  getOdontogramStatistics = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const stats = await odontogramService.getOdontogramStatistics(id);

    return ResponseHelper.success(
      res,
      stats,
      'Statistics retrieved successfully'
    );
  });

  /**
   * Compare two odontogram versions
   * GET /api/v1/odontograms/compare?v1=...&v2=...
   */
  compareVersions = catchAsync(async (req: Request, res: Response) => {
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      return ResponseHelper.error(
        res,
        'Both v1 and v2 query parameters are required',
        400
      );
    }

    const comparison = await odontogramService.compareVersions(
      v1 as string,
      v2 as string
    );

    return ResponseHelper.success(
      res,
      comparison,
      'Comparison completed successfully'
    );
  });

  /**
   * ============================================
   * ODONTOGRAM CREATE/UPDATE ENDPOINTS
   * ============================================
   */

  /**
   * Create new odontogram for a patient
   * POST /api/v1/odontograms/patients/:patientId/odontograms
   */
  createOdontogram = catchAsync(async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const { user } = req as AuthRequest;
    const data: CreateOdontogramDTO = req.body;

    const odontogram = await odontogramService.createOdontogram(
      patientId,
      user.id,
      data
    );

    return ResponseHelper.created(
      res,
      odontogram,
      'Odontogram created successfully'
    );
  });

  /**
   * Update odontogram (creates new version automatically)
   * PUT /api/v1/odontograms/:id
   */
  updateOdontogram = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data: UpdateOdontogramDTO = req.body;

    const odontogram = await odontogramService.updateOdontogram(id, data);

    return ResponseHelper.success(
      res,
      odontogram,
      'Odontogram updated successfully (new version created)'
    );
  });

  /**
   * Update specific tooth in odontogram
   * PATCH /api/v1/odontograms/:id/teeth/:toothNumber
   */
  updateTooth = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const toothNumber = req.params.toothNumber as string;
    const data: UpdateToothDTO = req.body;

    const tooth = await odontogramService.updateTooth(id, toothNumber, data);

    return ResponseHelper.success(
      res,
      tooth,
      `Tooth ${toothNumber} updated successfully`
    );
  });

  /**
   * Create new version from existing odontogram
   * POST /api/v1/odontograms/:id/new-version
   */
  createNewVersion = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { user } = req as AuthRequest;

    // Get current odontogram to extract patient ID
    const current = await odontogramService.getOdontogramById(id);

    if (!current) {
      return ResponseHelper.error(res, 'Odontogram not found', 404);
    }

    const newVersion = await odontogramService.createNewVersion(
      current.patientId,
      user.id,
      id
    );

    return ResponseHelper.created(
      res,
      newVersion,
      'New odontogram version created successfully'
    );
  });
}

export const odontogramController = new OdontogramController();
