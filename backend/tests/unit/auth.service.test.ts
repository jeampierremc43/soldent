import { authService } from '@services/auth.service';
import { authRepository } from '@repositories/auth.repository';
import { ApiError } from '@utils/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@repositories/auth.repository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@utils/logger');

describe('AuthService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+593987654321',
    avatar: null,
    isActive: true,
    roleId: 'role-id-123',
    role: {
      id: 'role-id-123',
      name: 'receptionist',
      description: 'Receptionist role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRole = {
    id: 'role-id-123',
    name: 'receptionist',
    description: 'Default receptionist role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+593987654321',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      (authRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (authRepository.getDefaultRole as jest.Mock).mockResolvedValue(mockRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      (authRepository.createUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(authRepository.emailExists).toHaveBeenCalledWith(registerData.email);
      expect(authRepository.getDefaultRole).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(authRepository.createUser).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(registerData.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw conflict error if email already exists', async () => {
      // Arrange
      (authRepository.emailExists as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        ApiError.conflict('Email already registered')
      );
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (authRepository.findActiveUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (authRepository.updateLastLogin as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(authRepository.findActiveUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(authRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw unauthorized error if user not found', async () => {
      // Arrange
      (authRepository.findActiveUserByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        ApiError.unauthorized('Invalid email or password')
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error if password is invalid', async () => {
      // Arrange
      (authRepository.findActiveUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        ApiError.unauthorized('Invalid email or password')
      );
      expect(authRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should throw forbidden error if account is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      (authRepository.findActiveUserByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(ApiError);
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';
    const decodedToken = {
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role.name,
    };

    it('should successfully refresh token', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (authRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new-token');

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(authRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw unauthorized error if token is invalid', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        ApiError.unauthorized('Invalid or expired refresh token')
      );
    });

    it('should throw unauthorized error if user not found', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (authRepository.findUserById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        ApiError.unauthorized('Invalid refresh token')
      );
    });

    it('should throw forbidden error if user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      (authRepository.findUserById as jest.Mock).mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        ApiError.forbidden('Account is inactive')
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordData = {
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should successfully change password', async () => {
      // Arrange
      (authRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$newhash');
      (authRepository.updatePassword as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await authService.changePassword(mockUser.id, changePasswordData);

      // Assert
      expect(authRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordData.oldPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordData.newPassword, 10);
      expect(authRepository.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        '$2b$10$newhash'
      );
    });

    it('should throw not found error if user not found', async () => {
      // Arrange
      (authRepository.findUserById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.changePassword(mockUser.id, changePasswordData)
      ).rejects.toThrow(ApiError.notFound('User not found'));
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error if old password is incorrect', async () => {
      // Arrange
      (authRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.changePassword(mockUser.id, changePasswordData)
      ).rejects.toThrow(ApiError.unauthorized('Current password is incorrect'));
      expect(authRepository.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    const mockUserWithPermissions = {
      ...mockUser,
      role: {
        ...mockUser.role,
        permissions: [
          {
            id: 'perm-1',
            resource: 'patients',
            action: 'read',
            description: 'View patients',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    };

    it('should successfully get user profile', async () => {
      // Arrange
      (authRepository.findUserByIdWithPermissions as jest.Mock).mockResolvedValue(
        mockUserWithPermissions
      );

      // Act
      const result = await authService.getProfile(mockUser.id);

      // Assert
      expect(authRepository.findUserByIdWithPermissions).toHaveBeenCalledWith(mockUser.id);
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('role');
      expect(result.role).toHaveProperty('permissions');
    });

    it('should throw not found error if user not found', async () => {
      // Arrange
      (authRepository.findUserByIdWithPermissions as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getProfile(mockUser.id)).rejects.toThrow(
        ApiError.notFound('User not found')
      );
    });

    it('should throw forbidden error if account is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUserWithPermissions, isActive: false };
      (authRepository.findUserByIdWithPermissions as jest.Mock).mockResolvedValue(
        inactiveUser
      );

      // Act & Assert
      await expect(authService.getProfile(mockUser.id)).rejects.toThrow(
        ApiError.forbidden('Account is inactive')
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Arrange
      (authRepository.updateRefreshToken as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await authService.logout(mockUser.id);

      // Assert
      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, null);
    });
  });

  describe('validateToken', () => {
    const token = 'valid-token';
    const decodedToken = {
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role.name,
    };

    it('should successfully validate token', () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      // Act
      const result = authService.validateToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(decodedToken);
    });

    it('should throw unauthorized error for invalid token', () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => authService.validateToken(token)).toThrow(
        ApiError.unauthorized('Invalid or expired token')
      );
    });
  });
});
