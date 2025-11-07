import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { validate, validateSource } from '@middleware/validation';
import { authenticate } from '@middleware/auth';
import { authLimiter, registerLimiter, passwordResetLimiter } from '@middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../types/auth.types';

const router = Router();

/**
 * ============================================
 * PUBLIC ROUTES (No authentication required)
 * ============================================
 */

/**
 * Register new user
 * POST /api/v1/auth/register
 *
 * @body {RegisterDTO}
 * @returns {AuthResponse} 201 - User created with tokens
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 409 - Email already exists
 * @returns {ApiError} 429 - Too many requests
 *
 * Rate limit: 3 requests per hour per IP
 */
router.post(
  '/register',
  registerLimiter,
  validate({ body: registerSchema }),
  authController.register
);

/**
 * Login user
 * POST /api/v1/auth/login
 *
 * @body {LoginDTO}
 * @returns {AuthResponse} 200 - Login successful with tokens
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Invalid credentials
 * @returns {ApiError} 403 - Account inactive
 * @returns {ApiError} 429 - Too many requests
 *
 * Rate limit: 5 requests per 15 minutes per IP
 */
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login
);

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 *
 * @body {RefreshTokenDTO}
 * @returns {AuthTokens} 200 - New tokens generated
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Invalid or expired refresh token
 * @returns {ApiError} 403 - Account inactive
 *
 * No rate limit (token validation is sufficient)
 */
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  authController.refreshToken
);

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 *
 * @body {ForgotPasswordDTO}
 * @returns {void} 200 - Reset email sent (always returns success)
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 429 - Too many requests
 *
 * Rate limit: 3 requests per hour per IP
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password
 *
 * @body {ResetPasswordDTO}
 * @returns {void} 200 - Password reset successful
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Invalid or expired token
 * @returns {ApiError} 404 - User not found
 * @returns {ApiError} 429 - Too many requests
 *
 * Rate limit: 3 requests per hour per IP
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  validateSource(resetPasswordSchema as any, 'body'),
  authController.resetPassword
);

/**
 * ============================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================
 */

/**
 * Get current user profile
 * GET /api/v1/auth/me
 *
 * @requires Authentication
 * @returns {UserProfile} 200 - User profile with permissions
 * @returns {ApiError} 401 - Not authenticated
 * @returns {ApiError} 403 - Account inactive
 * @returns {ApiError} 404 - User not found
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * Validate current token
 * GET /api/v1/auth/validate
 *
 * @requires Authentication
 * @returns {TokenValidation} 200 - Token is valid
 * @returns {ApiError} 401 - Invalid or expired token
 * @returns {ApiError} 403 - Account inactive
 */
router.get('/validate', authenticate, authController.validateToken);

/**
 * Logout user
 * POST /api/v1/auth/logout
 *
 * @requires Authentication
 * @returns {void} 200 - Logout successful
 * @returns {ApiError} 401 - Not authenticated
 */
router.post('/logout', authenticate, authController.logout);

/**
 * Change password
 * POST /api/v1/auth/change-password
 *
 * @requires Authentication
 * @body {ChangePasswordDTO}
 * @returns {void} 200 - Password changed successfully
 * @returns {ApiError} 400 - Validation error
 * @returns {ApiError} 401 - Current password incorrect or not authenticated
 * @returns {ApiError} 404 - User not found
 */
router.post(
  '/change-password',
  authenticate,
  validateSource(changePasswordSchema as any, 'body'),
  authController.changePassword
);

/**
 * ============================================
 * ROUTE DOCUMENTATION
 * ============================================
 *
 * All routes return standardized JSON responses:
 *
 * Success Response:
 * {
 *   "success": true,
 *   "message": "Success message",
 *   "data": { ... },
 *   "timestamp": "2025-01-01T00:00:00.000Z"
 * }
 *
 * Error Response:
 * {
 *   "success": false,
 *   "message": "Error message",
 *   "statusCode": 400,
 *   "errors": [ ... ] (optional),
 *   "timestamp": "2025-01-01T00:00:00.000Z"
 * }
 *
 * Authentication:
 * - Protected routes require a valid JWT token in the Authorization header
 * - Format: "Authorization: Bearer <token>"
 *
 * Rate Limiting:
 * - Register: 3 requests/hour per IP
 * - Login: 5 requests/15min per IP
 * - Password Reset: 3 requests/hour per IP
 * - Other routes: Standard API rate limits apply
 */

export default router;
