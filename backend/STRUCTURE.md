# Backend Structure Documentation

## Overview

This document describes the complete structure of the Soldent backend API, including all files created, their purposes, and how they work together.

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma Client configuration
│   │   └── env.ts                # Environment variables validation (Zod)
│   │
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication & authorization
│   │   ├── cors.ts               # CORS configuration
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   ├── logger.ts             # Request logging middleware
│   │   ├── rateLimiter.ts       # Rate limiting (general & specific)
│   │   └── validation.ts         # Zod validation middleware
│   │
│   ├── utils/
│   │   ├── ApiError.ts           # Custom error class
│   │   ├── catchAsync.ts         # Async error wrapper
│   │   ├── logger.ts             # Winston logger configuration
│   │   └── response.ts           # Standardized API responses
│   │
│   ├── types/
│   │   ├── express.d.ts          # Express type extensions
│   │   └── index.ts              # Shared TypeScript types
│   │
│   ├── controllers/
│   │   └── index.ts              # Controllers barrel file (empty)
│   │
│   ├── services/
│   │   └── index.ts              # Services barrel file (empty)
│   │
│   ├── repositories/
│   │   └── index.ts              # Repositories barrel file (empty)
│   │
│   ├── routes/
│   │   └── index.ts              # Main router with health endpoints
│   │
│   ├── app.ts                    # Express app configuration
│   └── server.ts                 # Server entry point
│
├── tests/
│   └── setup.ts                  # Jest test setup
│
├── prisma/
│   └── schema.prisma             # Database schema (already exists)
│
├── .editorconfig                 # Editor configuration
├── .env.example                  # Environment variables template
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── .prettierrc                   # Prettier configuration
├── jest.config.js                # Jest testing configuration
├── nodemon.json                  # Nodemon configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # Project documentation
├── tsconfig.json                 # TypeScript configuration
└── STRUCTURE.md                  # This file
```

## Core Files Description

### Configuration Layer (`src/config/`)

#### `database.ts`
- Prisma Client singleton configuration
- Database connection/disconnection helpers
- Health check functionality
- Transaction wrapper
- Prevents multiple instances in development

#### `env.ts`
- Environment variables validation using Zod
- Type-safe environment configuration
- Required variables enforcement
- Default values for optional variables
- Helper functions: `isProd`, `isDev`, `isTest`

### Middleware Layer (`src/middleware/`)

#### `auth.ts`
- JWT authentication middleware
- Role-based authorization
- Optional authentication
- Token generation helpers
- User verification from database
- Security logging for unauthorized access

#### `cors.ts`
- CORS configuration
- Origin whitelist validation
- Credentials support
- Methods and headers configuration
- Development CORS (allow all)

#### `errorHandler.ts`
- Global error handling middleware
- Converts errors to ApiError format
- Handles Prisma errors
- Handles Zod validation errors
- Handles JWT errors
- 404 Not Found handler
- Error logging with appropriate severity

#### `logger.ts`
- Request logging middleware
- Response time tracking
- User ID tracking for authenticated requests

#### `rateLimiter.ts`
- General API rate limiting
- Authentication endpoint limiting (anti-brute force)
- Password reset limiting
- Registration limiting
- File upload limiting

#### `validation.ts`
- Zod schema validation middleware
- Validates body, query, and params
- Common validation schemas (id, pagination, search, etc.)
- Input sanitization
- File upload validation

### Utilities Layer (`src/utils/`)

#### `ApiError.ts`
- Custom error class extending Error
- HTTP status codes enum
- Factory methods for common errors:
  - badRequest (400)
  - unauthorized (401)
  - forbidden (403)
  - notFound (404)
  - conflict (409)
  - unprocessableEntity (422)
  - tooManyRequests (429)
  - internal (500)
  - serviceUnavailable (503)
- JSON serialization
- Stack trace in development

#### `catchAsync.ts`
- Wrapper for async route handlers
- Catches errors and forwards to error handler
- Eliminates try-catch boilerplate

#### `logger.ts`
- Winston logger configuration
- Daily rotating file transport
- Separate error logs
- Console output in development
- Structured logging helpers:
  - `loggers.request()` - API requests
  - `loggers.query()` - Database queries
  - `loggers.auth()` - Authentication events
  - `loggers.business()` - Business events
  - `loggers.security()` - Security events

#### `response.ts`
- Standardized API response helpers
- Success responses
- Paginated responses
- Error responses
- Pagination calculation utilities
- Query parameter parsing

### Type Definitions (`src/types/`)

#### `express.d.ts`
- Extends Express Request interface
- Adds `user` property for authenticated requests
- Adds file upload types

#### `index.ts`
- Common TypeScript types
- UserRole enum
- API response interfaces
- Pagination interfaces
- Validation error interfaces
- Service response patterns
- Database transaction types
- Configuration types

### Application Layer

#### `app.ts`
- Express application setup
- Middleware configuration:
  - Security (Helmet)
  - CORS
  - Body parsing
  - Compression
  - Request logging
  - Rate limiting
- Route mounting
- Error handling
- Health check endpoints

#### `server.ts`
- HTTP server creation
- Database connection on startup
- Graceful shutdown handling
- Signal handlers (SIGTERM, SIGINT)
- Uncaught exception handling
- Unhandled rejection handling
- Server error handling

### Routes Layer (`src/routes/`)

#### `index.ts`
- Main router
- Health check endpoints:
  - `GET /api/v1/health` - Detailed health with database
  - `GET /api/v1/` - API information
  - `GET /api/v1/version` - API version
- Placeholder comments for feature routes

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured:
  - `@config/*` → `src/config/*`
  - `@middleware/*` → `src/middleware/*`
  - `@controllers/*` → `src/controllers/*`
  - `@services/*` → `src/services/*`
  - `@repositories/*` → `src/repositories/*`
  - `@utils/*` → `src/utils/*`
  - `@types/*` → `src/types/*`
  - `@routes/*` → `src/routes/*`
- ES2022 target
- Source maps enabled

### Development Tools

#### `nodemon.json`
- Watches `src/` directory
- Auto-restart on `.ts` and `.json` changes
- Uses ts-node with tsconfig-paths
- 1 second delay

#### `jest.config.js`
- ts-jest preset
- Path aliases mapped
- Coverage configuration
- Test setup file
- 10 second timeout

#### `.eslintrc.json`
- TypeScript ESLint parser
- Recommended rules
- Custom rules for code quality

#### `.prettierrc`
- Code formatting rules
- 100 character line width
- Single quotes
- Semicolons

#### `.editorconfig`
- Cross-editor consistency
- 2 space indentation
- LF line endings
- UTF-8 encoding

## Package Scripts

```json
{
  "dev": "nodemon",                          // Development server
  "build": "tsc",                            // Build for production
  "start": "node dist/server.js",            // Production server
  "prisma:generate": "prisma generate",      // Generate Prisma Client
  "prisma:migrate": "prisma migrate dev",    // Run migrations
  "prisma:studio": "prisma studio",          // Open Prisma Studio
  "prisma:push": "prisma db push",           // Push schema changes
  "prisma:seed": "ts-node prisma/seed.ts",   // Seed database
  "lint": "eslint . --ext .ts",              // Run linter
  "lint:fix": "eslint . --ext .ts --fix",    // Fix linting issues
  "test": "jest",                            // Run tests
  "test:watch": "jest --watch",              // Watch mode
  "test:coverage": "jest --coverage"         // With coverage
}
```

## Architecture Patterns

### Layered Architecture
1. **Routes** - Define endpoints and routing
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Business logic
4. **Repositories** - Data access via Prisma
5. **Middleware** - Cross-cutting concerns

### Error Handling
- Operational errors → ApiError → User-friendly messages
- Programming errors → Internal server error → Logged
- All errors pass through centralized error handler

### Authentication Flow
1. User sends JWT in Authorization header
2. `authenticate` middleware extracts and verifies token
3. User fetched from database and attached to request
4. `authorize` middleware checks user role
5. Route handler executes

### Validation Flow
1. Request arrives with body/query/params
2. Validation middleware applies Zod schema
3. Data is parsed and validated
4. Validated data replaces original request data
5. Validation errors return 422 with details

### Logging Strategy
- Request/response logging for all API calls
- Error logging with appropriate severity
- Structured logs for business events
- Daily rotating files
- Separate error logs
- Console output in development only

## Security Features

1. **Helmet** - Security headers
2. **CORS** - Configurable origin whitelist
3. **Rate Limiting** - Prevents abuse
4. **Input Validation** - Zod schemas
5. **Input Sanitization** - XSS prevention
6. **JWT Authentication** - Secure tokens
7. **Password Hashing** - bcrypt (via bcryptjs)
8. **SQL Injection Protection** - Prisma ORM
9. **Error Messages** - Sanitized in production

## Next Steps

To continue development, you should:

1. Implement authentication endpoints:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/logout
   - POST /api/v1/auth/refresh

2. Implement user management:
   - CRUD operations for users
   - User profile endpoints
   - Password change/reset

3. Implement core features:
   - Patient management
   - Appointment scheduling
   - Treatment tracking
   - Billing and payments

4. Add tests:
   - Unit tests for services
   - Integration tests for routes
   - E2E tests for critical flows

5. Add documentation:
   - API documentation (Swagger/OpenAPI)
   - Code documentation (JSDoc)

## Dependencies Summary

### Production
- express - Web framework
- @prisma/client - Database ORM
- zod - Schema validation
- jsonwebtoken - JWT tokens
- bcryptjs - Password hashing
- winston - Logging
- helmet - Security headers
- cors - CORS handling
- compression - Response compression
- express-rate-limit - Rate limiting
- dotenv - Environment variables

### Development
- typescript - TypeScript
- ts-node - TypeScript execution
- nodemon - Auto-restart
- prisma - Database toolkit
- jest - Testing
- eslint - Linting
- prettier - Code formatting
- tsconfig-paths - Path aliases
- @types/* - Type definitions

## Environment Variables Required

See `.env.example` for full list. Key variables:

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed origins

## Notes

- All empty directories contain `index.ts` barrel files for future exports
- TypeScript strict mode is enabled for maximum type safety
- Path aliases are configured for clean imports
- All async operations use catchAsync wrapper
- All errors go through centralized error handler
- Database connection is checked on startup
- Graceful shutdown is implemented for clean exits
