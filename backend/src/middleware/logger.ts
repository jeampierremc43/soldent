import { Request, Response, NextFunction } from 'express';
import logger, { loggers } from '@utils/logger';

/**
 * Request logging middleware
 * Logs incoming requests and their responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log request
  logger.http(`Incoming ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  });

  // Capture response
  const originalSend = res.send;

  res.send = function (data): Response {
    const responseTime = Date.now() - startTime;

    // Log response
    loggers.request(req.method, req.url, res.statusCode, responseTime, (req as any).user?.id);

    // Restore original send function
    res.send = originalSend;
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Morgan-compatible format function
 */
export const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

export default requestLogger;
