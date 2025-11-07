import request from 'supertest';
import { app } from '@app';
import { prisma } from '@config/database';
import bcrypt from 'bcryptjs';

/**
 * Auth Integration Tests
 * Tests all authentication endpoints with real database interactions
 */
describe('Auth Integration Tests', () => {
  let testUserId: string;
  let testRoleId: string;
  let authToken: string;
  let refreshToken: string;

  const testUser = {
    email: 'integration.test@example.com',
    password: 'TestPassword123!',
    firstName: 'Integration',
    lastName: 'Test',
    phone: '+593987654321',
  };

  /**
   * Setup: Create test role before all tests
   */
  beforeAll(async () => {
    // Create test role if it doesn't exist
    const role = await prisma.role.upsert({
      where: { name: 'receptionist' },
      update: {},
      create: {
        name: 'receptionist',
        description: 'Test receptionist role',
      },
    });
    testRoleId = role.id;
  });

  /**
   * Cleanup: Delete test user after each test
   */
  afterEach(async () => {
    if (testUserId) {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { id: testUserId },
            { email: testUser.email },
          ],
        },
      });
      testUserId = '';
    }
  });

  /**
   * Final cleanup: Close database connection
   */
  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * ==========================================
   * REGISTER ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Save for cleanup
      testUserId = response.body.data.user.id;
    });

    it('should return 409 for duplicate email', async () => {
      // Create user first
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('already registered');
    });

    it('should return 422 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 422 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 422 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          // Missing password, firstName, lastName
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  /**
   * ==========================================
   * LOGIN ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;
    });

    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Save tokens for other tests
      authToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 422 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  /**
   * ==========================================
   * REFRESH TOKEN ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      // Create user and login to get refresh token
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it('should successfully refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  /**
   * ==========================================
   * GET PROFILE ENDPOINT TESTS
   * ==========================================
   */
  describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
      // Create user and login
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  /**
   * ==========================================
   * LOGOUT ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
      // Create user and login
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should successfully logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  /**
   * ==========================================
   * CHANGE PASSWORD ENDPOINT TESTS
   * ==========================================
   */
  describe('POST /api/v1/auth/change-password', () => {
    beforeEach(async () => {
      // Create user and login
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          roleId: testRoleId,
        },
      });
      testUserId = user.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should successfully change password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
    });

    it('should return 401 for incorrect old password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 422 for password mismatch', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!',
        })
        .expect(422);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .send({
          oldPassword: testUser.password,
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
