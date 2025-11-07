import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '@utils/ApiError';
import { catchAsync } from '@utils/catchAsync';
import { env } from '@config/env';
import { prisma } from '@config/database';
import { loggers } from '@utils/logger';

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Extract token from request headers
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Verify JWT token
 */
const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    if (error?.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    throw ApiError.unauthorized('Token verification failed');
  }
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  // Extract token from header
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthorized('No token provided');
  }

  // Verify token
  const decoded = verifyToken(token);

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          name: true,
        },
      },
      isActive: true,
    },
  });

  if (!user) {
    loggers.security('Invalid token - user not found', 'medium', {
      userId: decoded.userId,
      email: decoded.email,
    });
    throw ApiError.unauthorized('User not found');
  }

  if (!user.isActive) {
    loggers.security('Inactive user attempted access', 'medium', {
      userId: user.id,
      email: user.email,
    });
    throw ApiError.forbidden('Account is inactive');
  }

  // Attach user to request
  (req as AuthRequest).user = {
    ...user,
    role: user.role.name,
  };

  next();
});

/**
 * Authorization Middleware Factory
 * Checks if user has required role(s)
 *
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!roles.includes(authReq.user.role)) {
      loggers.security('Unauthorized access attempt', 'high', {
        userId: authReq.user.id,
        userRole: authReq.user.role,
        requiredRoles: roles,
        endpoint: req.path,
      });

      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  });
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            name: true,
          },
        },
        isActive: true,
      },
    });

    if (user && user.isActive) {
      (req as AuthRequest).user = {
        ...user,
        role: user.role.name,
      };
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
});

/**
 * Check if user owns the resource
 * Compares user ID with resource owner ID
 */
export const checkOwnership = (resourceIdParam = 'id') => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const resourceId = req.params[resourceIdParam];
    const userId = authReq.user.id;

    // Admin can access any resource
    if (authReq.user.role === 'admin' || authReq.user.role === 'super_admin') {
      return next();
    }

    // Check ownership - resource ID must match user ID
    if (resourceId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  });
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload as any, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload as any, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export default authenticate;
