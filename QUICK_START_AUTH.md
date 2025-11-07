# Quick Start - Authentication Module

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/soldent_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
BCRYPT_ROUNDS=10
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with initial data (roles, users, etc.)
npm run prisma:seed
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

---

## Test Credentials

After seeding, you can use these test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@soldent.com | admin123 | Admin |
| doctor@soldent.com | admin123 | Doctor |
| recepcion@soldent.com | admin123 | Receptionist |

---

## Test the API

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+593987654321"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@soldent.com",
    "password": "admin123"
  }'
```

Response will include:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### 3. Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Change Password
```bash
curl -X POST http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

---

## Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific test file
npm test auth.service.test.ts
npm test auth.integration.test.ts
```

---

## API Endpoints

### Public Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### Protected Endpoints (Require Authorization header)
```
GET    /api/v1/auth/me
GET    /api/v1/auth/validate
POST   /api/v1/auth/logout
POST   /api/v1/auth/change-password
```

---

## Common Issues

### Database Connection Failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### JWT Token Invalid
- Verify JWT_SECRET is set in .env
- Check token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

### Rate Limit Exceeded
- Wait for the rate limit window to expire
- Adjust rate limits in .env if needed

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## Directory Structure

```
backend/
├── src/
│   ├── types/
│   │   └── auth.types.ts          # Auth types and schemas
│   ├── repositories/
│   │   └── auth.repository.ts     # Database access layer
│   ├── services/
│   │   └── auth.service.ts        # Business logic
│   ├── controllers/
│   │   └── auth.controller.ts     # HTTP handlers
│   └── routes/
│       ├── auth.routes.ts         # Auth routes
│       └── index.ts               # Main router
├── tests/
│   ├── unit/
│   │   └── auth.service.test.ts   # Unit tests
│   └── integration/
│       └── auth.integration.test.ts # Integration tests
└── prisma/
    ├── schema.prisma              # Database schema
    └── seed.ts                    # Database seeding
```

---

## Next Steps

1. **Frontend Integration**
   - Use the auth endpoints to build login/register UI
   - Store tokens securely (httpOnly cookies or secure storage)
   - Implement token refresh logic

2. **Additional Modules**
   - Patients management
   - Appointments scheduling
   - Treatments tracking
   - Billing system

3. **Security Enhancements**
   - Enable email verification
   - Implement 2FA
   - Add OAuth providers
   - Set up proper HTTPS

4. **Production Deployment**
   - Configure production database
   - Set strong JWT_SECRET
   - Enable rate limiting
   - Set up monitoring and logging
   - Use environment-specific configs

---

## Support

For detailed documentation, see:
- [Auth Module README](backend/src/modules/auth/README.md)
- [Complete Summary](AUTH_MODULE_SUMMARY.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)

---

## Development Tips

### Hot Reload
```bash
npm run dev
```
Uses nodemon for automatic restart on file changes.

### Debug Mode
Set LOG_LEVEL=debug in .env for detailed logs.

### Database Changes
After modifying schema.prisma:
```bash
npm run prisma:migrate
npm run prisma:generate
```

### View Database
```bash
npm run prisma:studio
```
Opens Prisma Studio for database inspection.

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong passwords for test accounts
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Review rate limit settings
- [ ] Set up monitoring/alerts
- [ ] Regular security updates
- [ ] Backup database regularly

---

**You're all set!**

The authentication module is fully functional and ready for development. Start the server and begin testing the endpoints!
