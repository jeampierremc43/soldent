import { Response } from 'express';

/**
 * Standard API Response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Helper class for standardized API responses
 */
export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Success',
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send success response with pagination
   */
  static successWithPagination<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message?: string,
    statusCode = 200
  ): Response<ApiResponse<T[]>> {
    const response: ApiResponse<T[]> = {
      success: true,
      message: message || 'Success',
      data,
      meta: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: any[]
  ): Response {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }
}

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse pagination parameters from query
 */
export const parsePaginationParams = (
  query: any,
  defaultLimit = 20,
  maxLimit = 100
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit as string) || defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export default ResponseHelper;
