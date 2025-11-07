import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env, isDev } from '@config/env';
import path from 'path';

/**
 * Custom log format with timestamp and colorization
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format for development with colors
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Daily rotate file transport configuration
 */
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(env.LOG_FILE_PATH, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

/**
 * Error log file transport
 */
const errorFileTransport = new DailyRotateFile({
  filename: path.join(env.LOG_FILE_PATH, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat,
});

/**
 * Winston Logger configuration
 */
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'soldent-api' },
  transports: [
    // File transports
    fileRotateTransport,
    errorFileTransport,
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(env.LOG_FILE_PATH, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(env.LOG_FILE_PATH, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

/**
 * Add console transport in development
 */
if (isDev) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Stream for Morgan HTTP logger
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Helper methods for structured logging
 */
export const loggers = {
  /**
   * Log API request
   */
  request: (method: string, url: string, statusCode: number, responseTime: number, userId?: string) => {
    logger.info('API Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
    });
  },

  /**
   * Log database query
   */
  query: (query: string, duration: number) => {
    logger.debug('Database Query', {
      query: query.substring(0, 200),
      duration: `${duration}ms`,
    });
  },

  /**
   * Log authentication events
   */
  auth: (event: string, userId: string, success: boolean, details?: Record<string, any>) => {
    logger.info('Authentication Event', {
      event,
      userId,
      success,
      ...details,
    });
  },

  /**
   * Log business events
   */
  business: (event: string, details: Record<string, any>) => {
    logger.info('Business Event', {
      event,
      ...details,
    });
  },

  /**
   * Log security events
   */
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, any>) => {
    logger.warn('Security Event', {
      event,
      severity,
      ...details,
    });
  },
};

export default logger;
