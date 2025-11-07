import { PrismaClient, Prisma } from '@prisma/client';
import { isDev } from './env';

/**
 * PrismaClient options configuration
 */
const prismaOptions: Prisma.PrismaClientOptions = {
  log: isDev
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: 'pretty',
};

/**
 * Global Prisma Client instance
 * Prevents multiple instances in development due to hot-reloading
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton
 * Reuses the same instance across hot-reloads in development
 */
export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (isDev) {
  global.prisma = prisma;
}

/**
 * Connect to database
 * @throws Error if connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from database
 * Should be called when shutting down the server
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

/**
 * Health check for database connection
 * @returns Promise<boolean> true if database is connected
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Execute database operations in a transaction
 * @param callback - Function containing database operations
 * @returns Result of the transaction
 */
export const transaction = async <T>(
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};

export default prisma;
