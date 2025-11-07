import cors, { CorsOptions } from 'cors';
import { env } from '@config/env';

/**
 * Parse CORS origins from environment variable
 */
const parseOrigins = (origins: string): string[] => {
  return origins.split(',').map((origin) => origin.trim());
};

/**
 * CORS configuration
 */
const corsOptions: CorsOptions = {
  // Allow specified origins
  origin: (origin, callback) => {
    const allowedOrigins = parseOrigins(env.CORS_ORIGIN);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },

  // Allow credentials (cookies, authorization headers, etc.)
  credentials: env.CORS_CREDENTIALS,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],

  // Exposed headers
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
  ],

  // Cache preflight requests for 24 hours
  maxAge: 86400,

  // Pass the CORS preflight response to the next handler
  preflightContinue: false,

  // Provide a status code to use for successful OPTIONS requests
  optionsSuccessStatus: 204,
};

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Development CORS (allow all origins)
 */
export const devCorsMiddleware = cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

export default corsMiddleware;
