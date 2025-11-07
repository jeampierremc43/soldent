# Soldent Backend API

Backend API for Soldent dental clinic management system built with Node.js, Express, TypeScript, and Prisma ORM.

## Tech Stack

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, env)
│   ├── middleware/      # Express middleware (auth, error handling, validation)
│   ├── utils/           # Utility functions and helpers
│   ├── types/           # TypeScript type definitions
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/              # Prisma schema and migrations
├── logs/                # Application logs
├── tests/               # Test files
└── uploads/             # File uploads (development only)
```

## Architecture

The application follows a layered architecture:

1. **Routes Layer**: Defines API endpoints and routing
2. **Controller Layer**: Handles HTTP requests/responses
3. **Service Layer**: Contains business logic
4. **Repository Layer**: Handles data access via Prisma
5. **Middleware Layer**: Request processing, validation, authentication

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### Development

Start development server with hot-reload:
```bash
npm run dev
```

The server will start at `http://localhost:5000` (or your configured PORT).

### Building

Build for production:
```bash
npm run build
```

### Running in Production

```bash
npm start
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origins

## API Endpoints

### Health & Info
- `GET /health` - Server health check
- `GET /api/v1/health` - Detailed health check with database status
- `GET /api/v1/` - API information
- `GET /api/v1/version` - API version

### Authentication (TODO)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token

### Users (TODO)
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Zod schemas for request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## Error Handling

The API uses a centralized error handling system:
- Custom `ApiError` class for operational errors
- Global error handler middleware
- Proper HTTP status codes
- Detailed error messages in development
- Sanitized error messages in production

## Logging

Winston logger with:
- Daily rotating log files
- Separate error logs
- Request/response logging
- Structured logging format
- Console output in development

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Push schema changes (development only)
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Scripts Reference

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## License

ISC
