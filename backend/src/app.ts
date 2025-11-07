import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { env, isDev } from '@config/env';
import corsMiddleware from '@middleware/cors';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/logger';
import { apiLimiter } from '@middleware/rateLimiter';
import routes from '@routes/index';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // ==========================================
  // Security Middleware
  // ==========================================

  /**
   * Helmet - Security headers
   * Protects against common vulnerabilities
   */
  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginEmbedderPolicy: isDev ? false : undefined,
    })
  );

  /**
   * CORS - Cross-Origin Resource Sharing
   */
  app.use(corsMiddleware);

  // ==========================================
  // Request Processing Middleware
  // ==========================================

  /**
   * Body parser - Parse JSON and URL-encoded bodies
   */
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  /**
   * Compression - Compress responses
   */
  app.use(compression());

  /**
   * Request logging
   */
  app.use(requestLogger);

  // ==========================================
  // Rate Limiting
  // ==========================================

  /**
   * Apply rate limiting to all API routes
   * Prevents abuse and DDoS attacks
   */
  if (!isDev) {
    app.use(`${env.API_PREFIX}/${env.API_VERSION}`, apiLimiter);
  }

  // ==========================================
  // API Routes
  // ==========================================

  /**
   * Mount API routes
   */
  app.use(`${env.API_PREFIX}/${env.API_VERSION}`, routes);

  /**
   * Root endpoint
   */
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Soldent API is running',
      version: env.API_VERSION,
      documentation: `${env.API_PREFIX}/${env.API_VERSION}/docs`,
      health: `${env.API_PREFIX}/${env.API_VERSION}/health`,
    });
  });

  /**
   * Health check endpoint (outside API version)
   */
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================

  /**
   * 404 Not Found handler
   * Must be after all routes
   */
  app.use(notFoundHandler);

  /**
   * Global error handler
   * Must be last middleware
   */
  app.use(errorHandler);

  return app;
};

// ==========================================
// Create app instance
// ==========================================

const app = createApp();

// ==========================================
// Export app
// ==========================================

export { app };
export default app;
