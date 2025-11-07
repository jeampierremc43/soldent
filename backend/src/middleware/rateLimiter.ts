import rateLimit from 'express-rate-limit';
import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';

/**
 * General API rate limiter
 * Limits requests from a single IP
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests('Too many requests, please try again later');
    res.status(error.statusCode).json(error.toJSON());
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: false,
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests(
      'Too many authentication attempts. Please try again after 15 minutes'
    );
    res.status(error.statusCode).json(error.toJSON());
  },
});

/**
 * Rate limiter for password reset endpoints
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later',
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests(
      'Too many password reset attempts. Please try again in an hour'
    );
    res.status(error.statusCode).json(error.toJSON());
  },
});

/**
 * Rate limiter for registration endpoint
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP, please try again later',
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests(
      'Too many registration attempts. Please try again in an hour'
    );
    res.status(error.statusCode).json(error.toJSON());
  },
});

/**
 * Rate limiter for file upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many file uploads, please try again later',
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests('Upload limit exceeded. Please try again later');
    res.status(error.statusCode).json(error.toJSON());
  },
});

export default apiLimiter;
