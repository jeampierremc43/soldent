import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import logger from '@utils/logger';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { isDev } from '@config/env';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: any[];
  stack?: string;
  timestamp: string;
}

/**
 * Convert Prisma errors to ApiError
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): ApiError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return ApiError.conflict(`A record with this ${field} already exists`);

    case 'P2025':
      // Record not found
      return ApiError.notFound('Record not found');

    case 'P2003':
      // Foreign key constraint violation
      return ApiError.badRequest('Invalid reference to related record');

    case 'P2014':
      // Required relation violation
      return ApiError.badRequest('The change violates a required relation');

    case 'P2016':
      // Query interpretation error
      return ApiError.badRequest('Query interpretation error');

    default:
      logger.error('Unhandled Prisma error:', { code: error.code, meta: error.meta });
      return ApiError.internal('Database error occurred');
  }
};

/**
 * Convert Zod validation errors to ApiError
 */
const handleZodError = (error: ZodError): ApiError => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return ApiError.unprocessableEntity('Validation failed', errors);
};

/**
 * Convert JWT errors to ApiError
 */
const handleJWTError = (error: Error): ApiError => {
  if (error.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expired');
  }
  return ApiError.unauthorized('Authentication failed');
};

/**
 * Format error response
 */
const formatErrorResponse = (error: ApiError): ErrorResponse => {
  return {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    ...(error.errors && { errors: error.errors }),
    ...(isDev && error.stack && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Log error with appropriate level
 */
const logError = (error: Error, req: Request): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
  };

  if (error instanceof ApiError && error.isOperational) {
    logger.warn('Operational error:', errorInfo);
  } else {
    logger.error('Programming error:', errorInfo);
  }
};

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ApiError;

  // Convert known errors to ApiError
  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = ApiError.badRequest(err.message);
  } else if (err.name === 'CastError') {
    error = ApiError.badRequest('Invalid data format');
  } else {
    // Unknown error - treat as internal server error
    error = ApiError.internal(isDev ? err.message : 'Something went wrong');
    error.stack = err.stack;
  }

  // Log the error
  logError(error, req);

  // Send error response
  const response = formatErrorResponse(error);
  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 - Not Found
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Route ${req.method} ${req.url} not found`);
  next(error);
};

/**
 * Handle uncaught errors in async functions
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, _res, next)).catch(next);
  };
};

export default errorHandler;
