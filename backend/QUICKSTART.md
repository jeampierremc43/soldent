# Quick Start Guide - Soldent Backend

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, update these variables:
# - DATABASE_URL
# - JWT_SECRET
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with initial data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000` (or your configured PORT).

## Available Endpoints

Once the server is running, you can test these endpoints:

### Health & Info
```bash
# Root endpoint
curl http://localhost:5000/

# Health check (simple)
curl http://localhost:5000/health

# Health check (detailed with database status)
curl http://localhost:5000/api/v1/health

# API information
curl http://localhost:5000/api/v1/

# API version
curl http://localhost:5000/api/v1/version
```

## Development Workflow

### Running Tests
```bash
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Code Quality
```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
```

### Database Management
```bash
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Create and run a new migration
npm run prisma:push      # Push schema changes (dev only)
```

### Building for Production
```bash
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server
```

## Project Structure Quick Reference

```
backend/
├── src/
│   ├── config/          # Database & environment configuration
│   ├── middleware/      # Express middleware (auth, validation, etc.)
│   ├── utils/           # Utility functions (logger, errors, responses)
│   ├── types/           # TypeScript type definitions
│   ├── controllers/     # HTTP request handlers (add your controllers here)
│   ├── services/        # Business logic (add your services here)
│   ├── repositories/    # Data access layer (add your repositories here)
│   ├── routes/          # API route definitions (add your routes here)
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── prisma/              # Prisma schema and migrations
└── logs/                # Application logs (created automatically)
```

## Next Steps

Now that the base structure is ready, you should implement:

1. **Authentication endpoints** (register, login, logout, refresh)
2. **User management** (CRUD operations)
3. **Core business features** (patients, appointments, treatments, billing)
4. **Tests** for your endpoints and services

## Common Commands

```bash
# Development
npm run dev                    # Start dev server with hot-reload
npm run prisma:studio          # Open database GUI

# Database
npm run prisma:generate        # Generate Prisma Client after schema changes
npm run prisma:migrate         # Create and run migrations
npm run prisma:push            # Push schema changes (dev only, no migration)

# Code Quality
npm run lint                   # Check code quality
npm run lint:fix               # Fix linting issues
npm test                       # Run tests

# Production
npm run build                  # Build TypeScript
npm start                      # Start production server
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/soldent_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Troubleshooting

### Port already in use
```bash
# Change PORT in .env file or kill the process using the port
```

### Database connection error
```bash
# Verify DATABASE_URL in .env
# Ensure PostgreSQL is running
# Check database credentials and permissions
```

### Prisma Client errors
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

### TypeScript errors
```bash
# Check for compilation errors
npx tsc --noEmit
```

## Documentation

- [Full README](./README.md) - Complete project documentation
- [Structure Documentation](./STRUCTURE.md) - Detailed structure explanation
- [Prisma Documentation](./prisma/README.md) - Database schema documentation

## Support

For more detailed information, see the full documentation files:
- `README.md` - Complete project guide
- `STRUCTURE.md` - Architecture and file structure
- `prisma/SCHEMA_OVERVIEW.md` - Database schema details
