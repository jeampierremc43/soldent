import { Request, Response } from 'express';
import { catchAsync } from '@utils/catchAsync';
import { ResponseHelper } from '@utils/response';
import { authService } from '@services/auth.service';
import type {
  RegisterDTO,
  LoginDTO,
  RefreshTokenDTO,
  ChangePasswordDTO,
} from '../types/auth.types';
import { AuthRequest } from '@middleware/auth';

/**
 * Auth Controller
 * Handles all HTTP requests related to authentication
 */
export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   *
   * @body {RegisterDTO} - Registration data
   * @returns {AuthResponse} - User data and tokens
   */
  register = catchAsync(async (req: Request, res: Response) => {
    const data: RegisterDTO = req.body;

    const result = await authService.register(data);

    return ResponseHelper.created(
      res,
      result,
      'User registered successfully. Welcome!'
    );
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   *
   * @body {LoginDTO} - Login credentials
   * @returns {AuthResponse} - User data and tokens
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;

    const result = await authService.login(data);

    return ResponseHelper.success(
      res,
      result,
      'Login successful. Welcome back!'
    );
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   *
   * @body {RefreshTokenDTO} - Refresh token
   * @returns {AuthTokens} - New access and refresh tokens
   */
  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken }: RefreshTokenDTO = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    return ResponseHelper.success(
      res,
      tokens,
      'Token refreshed successfully'
    );
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   *
   * @requires Authentication
   * @returns {void}
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as AuthRequest;

    await authService.logout(user.id);

    return ResponseHelper.success(
      res,
      null,
      'Logout successful. See you soon!'
    );
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   *
   * @requires Authentication
   * @body {ChangePasswordDTO} - Password change data
   * @returns {void}
   */
  changePassword = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as AuthRequest;
    const data: ChangePasswordDTO = req.body;

    await authService.changePassword(user.id, data);

    return ResponseHelper.success(
      res,
      null,
      'Password changed successfully. Please login with your new password'
    );
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   *
   * @requires Authentication
   * @returns {UserProfile} - Current user profile with permissions
   */
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as AuthRequest;

    const profile = await authService.getProfile(user.id);

    return ResponseHelper.success(
      res,
      profile,
      'Profile retrieved successfully'
    );
  });

  /**
   * Validate token
   * GET /api/v1/auth/validate
   *
   * @requires Authentication
   * @returns {boolean} - Token validity status
   */
  validateToken = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as AuthRequest;

    return ResponseHelper.success(
      res,
      {
        valid: true,
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      'Token is valid'
    );
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   *
   * @body {ForgotPasswordDTO} - Email
   * @returns {void}
   */
  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.generatePasswordResetToken(email);

    // Always return success to prevent email enumeration
    return ResponseHelper.success(
      res,
      null,
      'If the email exists, a password reset link has been sent'
    );
  });

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   *
   * @body {ResetPasswordDTO} - Reset token and new password
   * @returns {void}
   */
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    return ResponseHelper.success(
      res,
      null,
      'Password reset successfully. You can now login with your new password'
    );
  });
}

// Export singleton instance
export const authController = new AuthController();
export default authController;
