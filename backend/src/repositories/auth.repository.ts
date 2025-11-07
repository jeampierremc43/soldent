import { prisma } from '@config/database';
import { User, Role, Permission } from '@prisma/client';
import type { RegisterData } from '../types/auth.types';

/**
 * User with role relation
 */
export type UserWithRole = User & {
  role: Role;
};

/**
 * User with full role details including permissions
 */
export type UserWithFullRole = User & {
  role: Role & {
    permissions: Permission[];
  };
};

/**
 * Auth Repository
 * Handles all database operations related to authentication
 */
export class AuthRepository {
  /**
   * Find user by email
   * @param email - User email
   * @returns User with role or null if not found
   */
  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User with role or null if not found
   */
  async findUserById(id: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  /**
   * Find user by ID with full details
   * Includes role and permissions
   * @param id - User ID
   * @returns User with full role details or null if not found
   */
  async findUserByIdWithPermissions(id: string): Promise<UserWithFullRole | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  /**
   * Check if email already exists
   * @param email - User email
   * @returns true if email exists, false otherwise
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Create new user
   * @param data - Registration data with hashed password
   * @param roleId - Role ID for the user
   * @returns Created user with role
   */
  async createUser(
    data: RegisterData & { password: string },
    roleId: string
  ): Promise<UserWithRole> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param hashedPassword - New hashed password
   * @returns Updated user
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Update refresh token
   * Note: In production, store refresh tokens in a separate table
   * This is a simplified implementation
   * @param userId - User ID
   * @param _refreshToken - Refresh token (null to invalidate) - currently unused
   * @returns Updated user
   */
  async updateRefreshToken(userId: string, _refreshToken: string | null): Promise<User> {
    // For now, we're not storing refresh tokens in the User model
    // In production, create a separate RefreshToken table
    // This method is a placeholder for future implementation
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
  }

  /**
   * Get default role for new users
   * Returns the 'receptionist' role by default
   * @returns Default role
   */
  async getDefaultRole(): Promise<Role> {
    let role = await prisma.role.findUnique({
      where: { name: 'receptionist' },
    });

    // If receptionist role doesn't exist, try to find any role
    if (!role) {
      role = await prisma.role.findFirst();
    }

    // If no roles exist, create a default one
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: 'receptionist',
          description: 'Default receptionist role',
        },
      });
    }

    return role;
  }

  /**
   * Get role by name
   * @param name - Role name
   * @returns Role or null if not found
   */
  async getRoleByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Update user's last login timestamp
   * @param userId - User ID
   * @returns Updated user
   */
  async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Deactivate user account
   * @param userId - User ID
   * @returns Updated user
   */
  async deactivateUser(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  /**
   * Activate user account
   * @param userId - User ID
   * @returns Updated user
   */
  async activateUser(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  /**
   * Find active user by email
   * Only returns user if account is active
   * @param email - User email
   * @returns Active user with role or null
   */
  async findActiveUserByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findFirst({
      where: {
        email,
        isActive: true,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Count users by role
   * @param roleId - Role ID
   * @returns Number of users with the role
   */
  async countUsersByRole(roleId: string): Promise<number> {
    return prisma.user.count({
      where: { roleId },
    });
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();
export default authRepository;
