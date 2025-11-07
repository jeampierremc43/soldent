import { Router, Request, Response } from 'express';
import { env } from '@config/env';
import { checkDatabaseHealth } from '@config/database';
import { ResponseHelper } from '@utils/response';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
  };
}

const router = Router();

/**
 * Health check endpoint
 * GET /api/v1/health
 */
router.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  const healthCheck: HealthCheckResponse = {
    status: dbHealth ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbHealth ? 'connected' : 'disconnected',
    },
  };

  const statusCode = dbHealth ? 200 : 503;

  return res.status(statusCode).json(healthCheck);
});

/**
 * API info endpoint
 * GET /api/v1/
 */
router.get('/', (_req: Request, res: Response) => {
  return ResponseHelper.success(res, {
    name: 'Soldent API',
    version: env.API_VERSION,
    description: 'Dental clinic management system API',
    endpoints: {
      health: `${env.API_PREFIX}/${env.API_VERSION}/health`,
      docs: `${env.API_PREFIX}/${env.API_VERSION}/docs`,
    },
  });
});

/**
 * API version endpoint
 * GET /api/v1/version
 */
router.get('/version', (_req: Request, res: Response) => {
  return ResponseHelper.success(res, {
    version: env.API_VERSION,
    nodeVersion: process.version,
    environment: env.NODE_ENV,
  });
});

/**
 * Mount feature routes here
 * Example:
 * router.use('/auth', authRoutes);
 * router.use('/users', userRoutes);
 * router.use('/patients', patientRoutes);
 * router.use('/appointments', appointmentRoutes);
 * router.use('/treatments', treatmentRoutes);
 * router.use('/invoices', invoiceRoutes);
 */

// Import routes
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import medicalRoutes from './medical.routes';
import appointmentRoutes from './appointment.routes';
import odontogramRoutes from './odontogram.routes';
import followupRoutes from './followup.routes';
import accountingRoutes from './accounting.routes';
// import userRoutes from './user.routes';
// import treatmentRoutes from './treatment.routes';
// import invoiceRoutes from './invoice.routes';

// Mount routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/medical', medicalRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/odontograms', odontogramRoutes);
router.use('/followups', followupRoutes);
router.use('/accounting', accountingRoutes);
// router.use('/users', authenticate, userRoutes);
// router.use('/treatments', authenticate, treatmentRoutes);
// router.use('/invoices', authenticate, invoiceRoutes);

export default router;
