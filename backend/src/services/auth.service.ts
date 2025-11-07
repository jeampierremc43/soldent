import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';
import { loggers } from '@utils/logger';
import { authRepository } from '@repositories/auth.repository';
import type {
  RegisterData,
  LoginData,
  AuthResponse,
  AuthTokens,
  UserProfile,
  ChangePasswordData,
  JwtPayload,
} from '../types/auth.types';

/**
 * Auth Service
 * Handles all business logic related to authentication
 */
export class AuthService {
  private readonly bcryptRounds = env.BCRYPT_ROUNDS;
  private readonly jwtSecret = env.JWT_SECRET;
  private readonly jwtExpiresIn = env.JWT_EXPIRES_IN;
  private readonly jwtRefreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;

  /**
   * Register a new user
   * @param data - Registration data
   * @returns Auth response with user and tokens
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if email already exists
    const emailExists = await authRepository.emailExists(data.email);
    if (emailExists) {
      loggers.security('Registration attempt with existing email', 'low', {
        email: data.email,
      });
      throw ApiError.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Get default role for new users
    const defaultRole = await authRepository.getDefaultRole();

    // Create user
    const user = await authRepository.createUser(
      {
        ...data,
        password: hashedPassword,
      },
      defaultRole.id
    );

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Log successful registration
    loggers.auth('user_registered', user.id, true, {
      email: user.email,
      role: user.role.name,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user
   * @param data - Login credentials
   * @returns Auth response with user and tokens
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user by email
    const user = await authRepository.findActiveUserByEmail(data.email);

    if (!user) {
      loggers.security('Login attempt with non-existent email', 'medium', {
        email: data.email,
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      loggers.security('Login attempt with invalid password', 'medium', {
        email: data.email,
        userId: user.id,
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      loggers.security('Login attempt with inactive account', 'medium', {
        email: data.email,
        userId: user.id,
      });
      throw ApiError.forbidden('Account is inactive. Please contact support');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Log successful login
    loggers.auth('user_login', user.id, true, {
      email: user.email,
      role: user.role.name,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @returns New tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken) as JwtPayload;

      // Find user
      const user = await authRepository.findUserById(decoded.userId);

      if (!user) {
        loggers.security('Refresh token used for non-existent user', 'high', {
          userId: decoded.userId,
        });
        throw ApiError.unauthorized('Invalid refresh token');
      }

      if (!user.isActive) {
        loggers.security('Refresh token used for inactive user', 'medium', {
          userId: user.id,
          email: user.email,
        });
        throw ApiError.forbidden('Account is inactive');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role.name,
      });

      loggers.auth('token_refreshed', user.id, true, {
        email: user.email,
      });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      loggers.security('Invalid refresh token attempt', 'medium', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   * Invalidates refresh token
   * @param userId - User ID
   */
  async logout(userId: string): Promise<void> {
    // In a production app with refresh token storage,
    // we would invalidate the refresh token here
    await authRepository.updateRefreshToken(userId, null);

    loggers.auth('user_logout', userId, true, {});
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param data - Password change data
   */
  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    // Find user
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await this.verifyPassword(data.oldPassword, user.password);

    if (!isOldPasswordValid) {
      loggers.security('Password change attempt with invalid old password', 'medium', {
        userId,
        email: user.email,
      });
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(data.newPassword);

    // Update password
    await authRepository.updatePassword(userId, hashedPassword);

    loggers.auth('password_changed', userId, true, {
      email: user.email,
    });

    loggers.security('Password changed successfully', 'low', {
      userId,
      email: user.email,
    });
  }

  /**
   * Get user profile
   * @param userId - User ID
   * @returns User profile with permissions
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await authRepository.findUserByIdWithPermissions(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is inactive');
    }

    // Return user without password
    const { password: _, ...profile } = user;

    return profile as UserProfile;
  }

  /**
   * Validate token
   * @param token - JWT token
   * @returns Decoded token payload
   */
  validateToken(token: string): JwtPayload {
    try {
      return this.verifyToken(token) as JwtPayload;
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify password against hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns true if password matches, false otherwise
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh tokens
   * @param payload - Token payload
   * @returns Auth tokens
   */
  private generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload as object, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload as object, this.jwtSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify JWT token
   * @param token - JWT token
   * @returns Decoded payload
   */
  private verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token');
      }
      throw ApiError.unauthorized('Token verification failed');
    }
  }

  /**
   * Generate password reset token
   * @param email - User email
   * @returns Reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      loggers.security('Password reset requested for non-existent email', 'low', {
        email,
      });
      // Return a fake token to prevent email enumeration
      return 'fake-token';
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      this.jwtSecret,
      { expiresIn: '1h' }
    );

    loggers.auth('password_reset_requested', user.id, true, {
      email: user.email,
    });

    return resetToken;
  }

  /**
   * Reset password with token
   * @param token - Reset token
   * @param newPassword - New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload & { type: string };

      if (decoded.type !== 'password_reset') {
        throw ApiError.unauthorized('Invalid reset token');
      }

      const user = await authRepository.findUserById(decoded.userId);

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await authRepository.updatePassword(user.id, hashedPassword);

      loggers.auth('password_reset', user.id, true, {
        email: user.email,
      });

      loggers.security('Password reset successfully', 'low', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      loggers.security('Invalid password reset token', 'medium', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw ApiError.unauthorized('Invalid or expired reset token');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
