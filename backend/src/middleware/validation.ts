import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { ApiError } from '@utils/ApiError';

/**
 * Validation source types
 */
type ValidationSource = 'body' | 'query' | 'params';

/**
 * Validation schemas interface
 */
interface ValidationSchemas {
  body?: AnyZodObject | z.ZodTypeAny;
  query?: AnyZodObject | z.ZodTypeAny;
  params?: AnyZodObject | z.ZodTypeAny;
}

/**
 * Format Zod validation errors
 */
const formatZodErrors = (error: ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
};

/**
 * Validate request using Zod schema
 */
export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate params
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        return next(ApiError.unprocessableEntity('Validation failed', errors));
      }
      next(error);
    }
  };
};

/**
 * Validate a single source (body, query, or params)
 */
export const validateSource = (schema: AnyZodObject | z.ZodTypeAny, source: ValidationSource = 'body') => {
  return validate({ [source]: schema });
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /**
   * ID parameter validation
   */
  id: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  /**
   * Pagination query validation
   */
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  /**
   * Search query validation
   */
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  }),

  /**
   * Date range query validation
   */
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  /**
   * Email validation
   */
  email: z.string().email('Invalid email address'),

  /**
   * Password validation
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  /**
   * Phone number validation (Ecuador format)
   */
  phone: z
    .string()
    .regex(/^(\+593|0)[0-9]{9}$/, 'Invalid phone number format')
    .optional(),

  /**
   * URL validation
   */
  url: z.string().url('Invalid URL format').optional(),
};

/**
 * Sanitize input by removing potentially dangerous characters
 */
export const sanitize = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitize(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Validate file upload
 */
export const validateFile = (
  allowedTypes: string[],
  maxSize: number
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const file = (req as any).file;

    if (!file) {
      return next(ApiError.badRequest('No file uploaded'));
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return next(
        ApiError.badRequest(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        )
      );
    }

    // Check file size
    if (file.size > maxSize) {
      return next(
        ApiError.badRequest(
          `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
        )
      );
    }

    next();
  };
};

export default validate;
