# Authentication Module

Complete authentication module for Soldent API with JWT tokens, role-based access control, and comprehensive security features.

## Features

- User registration with role assignment
- Secure login with JWT tokens
- Access and refresh tokens
- Password change functionality
- User profile retrieval
- Token validation
- Password reset (forgot password flow)
- Comprehensive error handling
- Rate limiting for security
- Input validation with Zod
- Structured logging for security events

## Architecture

The module follows a layered architecture:

```
auth/
├── types/          # TypeScript types and Zod schemas
├── repositories/   # Database access layer
├── services/       # Business logic layer
├── controllers/    # HTTP request handlers
└── routes/         # Route definitions
```

## API Endpoints

### Public Endpoints (No authentication required)

#### Register
```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+593987654321"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Welcome!",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+593987654321",
      "role": {
        "id": "uuid",
        "name": "receptionist",
        "description": "Receptionist role"
      },
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

**Rate Limit:** 3 requests per hour per IP

---

#### Login
```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful. Welcome back!",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### Refresh Token
```
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

---

#### Forgot Password
```
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Rate Limit:** 3 requests per hour per IP

---

#### Reset Password
```
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password"
}
```

**Rate Limit:** 3 requests per hour per IP

---

### Protected Endpoints (Authentication required)

Add the following header to all protected endpoints:
```
Authorization: Bearer <access-token>
```

#### Get Profile
```
GET /api/v1/auth/me
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+593987654321",
    "avatar": null,
    "role": {
      "id": "uuid",
      "name": "receptionist",
      "description": "Receptionist role",
      "permissions": [
        {
          "id": "uuid",
          "resource": "patients",
          "action": "read",
          "description": "View patients"
        }
      ]
    },
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Validate Token
```
GET /api/v1/auth/validate
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "userId": "uuid",
    "email": "user@example.com",
    "role": "receptionist"
  }
}
```

---

#### Logout
```
POST /api/v1/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. See you soon!"
}
```

---

#### Change Password
```
POST /api/v1/auth/change-password
```

**Request Body:**
```json
{
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login with your new password"
}
```

---

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Tokens
- **Access Token**: Short-lived (24 hours by default)
- **Refresh Token**: Long-lived (7 days by default)
- Tokens contain: userId, email, role

### Rate Limiting
- **Register**: 3 requests/hour per IP
- **Login**: 5 requests/15 minutes per IP
- **Password Reset**: 3 requests/hour per IP
- **General API**: 100 requests/15 minutes per IP

### Security Logging
All authentication events are logged:
- Successful/failed logins
- Registration attempts
- Password changes
- Token refresh attempts
- Suspicious activities

### Input Validation
All inputs are validated using Zod schemas:
- Email format validation
- Password strength validation
- Required field validation
- Type validation

### Protection Against
- SQL Injection (via Prisma ORM)
- XSS attacks (via input sanitization)
- CSRF attacks (via token-based auth)
- Brute force attacks (via rate limiting)
- Email enumeration (via consistent responses)

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request (Invalid input) |
| 401 | Unauthorized (Invalid credentials/token) |
| 403 | Forbidden (Account inactive/insufficient permissions) |
| 404 | Not Found (User not found) |
| 409 | Conflict (Email already exists) |
| 422 | Unprocessable Entity (Validation error) |
| 429 | Too Many Requests (Rate limit exceeded) |
| 500 | Internal Server Error |

---

## Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test auth.service.test.ts
```

### Test Coverage
- Unit tests for service layer
- Integration tests for all endpoints
- Test cases include:
  - Successful operations
  - Error scenarios
  - Validation errors
  - Authentication/authorization failures
  - Rate limiting

---

## Usage Examples

### Frontend Integration

#### Login Flow
```typescript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data.tokens;

// Store tokens (localStorage, sessionStorage, or secure cookie)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

#### Authenticated Request
```typescript
const response = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

#### Token Refresh
```typescript
// When access token expires (401 error)
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { data } = await refreshResponse.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// Retry original request
```

---

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  avatar    String?
  isActive  Boolean  @default(true)
  roleId    String

  role      Role     @relation(fields: [roleId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
```

### Role Model
```prisma
model Role {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  permissions Permission[]
  users       User[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Future Enhancements

- [ ] Email verification on registration
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Session management
- [ ] Device tracking
- [ ] IP whitelisting/blacklisting
- [ ] Account lockout after failed attempts
- [ ] Password history (prevent reuse)
- [ ] Security questions
- [ ] Audit logs

---

## Support

For issues or questions, contact the development team or create an issue in the project repository.
