import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variables schema validation using Zod
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_MIN: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  DATABASE_POOL_MAX: z.string().transform(Number).pipe(z.number().min(1)).optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10).max(15)).default('10'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('combined'),
  LOG_FILE_PATH: z.string().default('./logs'),

  // File Upload
  UPLOAD_MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('5242880'), // 5MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf'),
  UPLOAD_PATH: z.string().default('./uploads'),

  // Email (optional)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  EMAIL_SECURE: z.string().transform(val => val === 'true').optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Redis (optional)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  REDIS_TTL: z.string().transform(Number).pipe(z.number().positive()).optional(),

  // Appointment Settings
  DEFAULT_APPOINTMENT_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('30'),
  MIN_ADVANCE_BOOKING_HOURS: z.string().transform(Number).pipe(z.number().positive()).default('1'),
  MAX_ADVANCE_BOOKING_DAYS: z.string().transform(Number).pipe(z.number().positive()).default('90'),
  APPOINTMENT_BUFFER_MINUTES: z.string().transform(Number).pipe(z.number().min(0)).default('5'),

  // Billing
  CURRENCY: z.string().default('USD'),
  TAX_RATE: z.string().transform(Number).pipe(z.number().min(0).max(1)).default('0.12'),
  TAX_APPLIES_TO_SERVICES: z.string().transform(val => val === 'true').default('false'),

  // Feature Flags
  FEATURE_REGISTRATION_ENABLED: z.string().transform(val => val === 'true').default('true'),
  FEATURE_EMAIL_VERIFICATION: z.string().transform(val => val === 'true').default('false'),
  FEATURE_TWO_FACTOR_AUTH: z.string().transform(val => val === 'true').default('false'),
  FEATURE_ONLINE_BOOKING: z.string().transform(val => val === 'true').default('true'),
});

/**
 * Validates and parses environment variables
 * Throws an error if validation fails
 */
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper to check if we're in production
export const isProd = env.NODE_ENV === 'production';

// Helper to check if we're in development
export const isDev = env.NODE_ENV === 'development';

// Helper to check if we're in test environment
export const isTest = env.NODE_ENV === 'test';
