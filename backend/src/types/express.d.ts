import { JwtPayload } from '@middleware/auth';

/**
 * Extend Express Request interface
 * Adds custom properties to the Request object
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user information
       */
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };

      /**
       * Request ID for tracking
       */
      id?: string;

      /**
       * File upload (for single file)
       */
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };

      /**
       * Multiple file uploads
       */
      files?:
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | Express.Multer.File[];
    }
  }
}

export {};
