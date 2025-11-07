/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Custom API Error class
 * Extends the native Error class with additional properties for HTTP responses
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  /**
   * Creates an ApiError instance
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param isOperational - Whether the error is operational (expected) or a programming error
   * @param errors - Additional error details (e.g., validation errors)
   * @param stack - Stack trace (optional, will be generated if not provided)
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: any[],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Factory method for Bad Request (400) errors
   */
  static badRequest(message: string, errors?: any[]): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, true, errors);
  }

  /**
   * Factory method for Unauthorized (401) errors
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  /**
   * Factory method for Forbidden (403) errors
   */
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  /**
   * Factory method for Not Found (404) errors
   */
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  /**
   * Factory method for Conflict (409) errors
   */
  static conflict(message: string): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message);
  }

  /**
   * Factory method for Unprocessable Entity (422) errors
   */
  static unprocessableEntity(message: string, errors?: any[]): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, true, errors);
  }

  /**
   * Factory method for Too Many Requests (429) errors
   */
  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message);
  }

  /**
   * Factory method for Internal Server Error (500) errors
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, false);
  }

  /**
   * Factory method for Service Unavailable (503) errors
   */
  static serviceUnavailable(message = 'Service unavailable'): ApiError {
    return new ApiError(HttpStatus.SERVICE_UNAVAILABLE, message);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

export default ApiError;
