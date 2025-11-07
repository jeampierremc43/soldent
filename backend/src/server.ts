import http from 'http';
import app from './app';
import { env, isDev } from '@config/env';
import { connectDatabase, disconnectDatabase } from '@config/database';
import logger from '@utils/logger';

/**
 * Normalize port value
 */
const normalizePort = (val: string | number): number => {
  const port = typeof val === 'string' ? parseInt(val, 10) : val;

  if (isNaN(port) || port < 0) {
    throw new Error(`Invalid port: ${val}`);
  }

  return port;
};

/**
 * Get port from environment
 */
const PORT = normalizePort(env.PORT);

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Server error handler
 */
const onError = (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Server listening handler
 */
const onListening = (): void => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;

  logger.info(`🚀 Server is running on ${bind}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 API URL: http://localhost:${PORT}${env.API_PREFIX}/${env.API_VERSION}`);
  logger.info(`💚 Health check: http://localhost:${PORT}${env.API_PREFIX}/${env.API_VERSION}/health`);

  if (isDev) {
    logger.info(`🔧 Development mode enabled`);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connection
      await disconnectDatabase();

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('⚠️  Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDatabase();

    // Start listening
    server.listen(PORT);
    server.on('error', onError);
    server.on('listening', onListening);

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Initialize and start the server
 */
startServer();

/**
 * Export server for testing
 */
export default server;
