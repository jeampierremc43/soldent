/**
 * Common types and interfaces
 */

/**
 * User roles enum
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DENTIST = 'DENTIST',
  RECEPTIONIST = 'RECEPTIONIST',
  PATIENT = 'PATIENT',
}

/**
 * API Response types
 */
export interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: ValidationError[];
  stack?: string;
  timestamp: string;
}

/**
 * Pagination types
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Filter and sort parameters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query parameters
 */
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

/**
 * JWT Token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Service response pattern
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Database transaction result
 */
export type TransactionResult<T> = T | null;

/**
 * Audit fields
 */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

/**
 * Base entity interface
 */
export interface BaseEntity extends AuditFields {
  id: string;
}

/**
 * File upload metadata
 */
export interface FileMetadata {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
}

/**
 * Email template data
 */
export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Notification data
 */
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    redis?: 'connected' | 'disconnected';
  };
}

/**
 * Configuration types
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  apiPrefix: string;
}

export interface DatabaseConfig {
  url: string;
  poolMin?: number;
  poolMax?: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface CORSConfig {
  origin: string;
  credentials: boolean;
}

/**
 * Common entity filters
 */
export type EntityFilter<T> = {
  [K in keyof T]?: T[K] | { contains?: string; in?: T[K][]; not?: T[K] };
};

/**
 * Prisma where clause type helper
 */
export type WhereClause<T> = {
  [K in keyof T]?: any;
} & {
  AND?: WhereClause<T>[];
  OR?: WhereClause<T>[];
  NOT?: WhereClause<T>;
};

/**
 * Re-export appointment types
 */
export * from './appointment.types';

/**
 * Re-export auth types
 */
export * from './auth.types';

/**
 * Re-export odontogram types
 */
export * from './odontogram.types';

export default {};
