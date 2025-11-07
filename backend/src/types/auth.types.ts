import { z } from 'zod';
import { commonSchemas } from '@middleware/validation';

/**
 * ============================================
 * ZOD VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Register schema
 * Validates user registration data
 */
export const registerSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'First name must contain only letters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name must contain only letters'),
  phone: z
    .string()
    .regex(/^(\+593|0)[0-9]{9}$/, 'Invalid phone number format')
    .optional(),
});

/**
 * Login schema
 * Validates user login credentials
 */
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token schema
 * Validates refresh token request
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Change password schema
 * Validates password change request
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

/**
 * Forgot password schema
 * Validates forgot password request
 */
export const forgotPasswordSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Reset password schema
 * Validates password reset request
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: commonSchemas.password,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * ============================================
 * TYPESCRIPT INTERFACES
 * ============================================
 */

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * User login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Tokens returned after authentication
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth response with user data and tokens
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
    isActive: boolean;
    createdAt: Date;
  };
  tokens: AuthTokens;
}

/**
 * User profile response
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: Array<{
      id: string;
      resource: string;
      action: string;
      description: string | null;
    }>;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Change password data
 */
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Forgot password data
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Reset password data
 */
export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * ============================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ============================================
 */

/**
 * Register DTO
 * Inferred from Zod schema
 */
export type RegisterDTO = z.infer<typeof registerSchema>;

/**
 * Login DTO
 * Inferred from Zod schema
 */
export type LoginDTO = z.infer<typeof loginSchema>;

/**
 * Refresh token DTO
 * Inferred from Zod schema
 */
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

/**
 * Change password DTO
 * Inferred from Zod schema
 */
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

/**
 * Forgot password DTO
 * Inferred from Zod schema
 */
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password DTO
 * Inferred from Zod schema
 */
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

/**
 * ============================================
 * UTILITY TYPES
 * ============================================
 */

/**
 * User data without sensitive fields
 */
export type SafeUser = Omit<UserProfile, 'password'>;

/**
 * JWT token payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload extends JwtPayload {
  tokenId: string;
}
