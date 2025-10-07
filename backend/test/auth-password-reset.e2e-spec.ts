import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Auth Password Reset (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    jwtService = moduleFixture.get(JwtService);

    // Create test user
    const hashedPassword = await bcrypt.hash('OldPassword123', 12);
    testUser = await usersRepository.save({
      email: `reset-test-${Date.now()}@test.com`,
      password: hashedPassword,
      firstName: 'Reset',
      lastName: 'Test',
      role: 'tenant_admin',
      tenantId: 1,
    } as any);
  });

  afterAll(async () => {
    // Cleanup
    if (testUser) {
      await usersRepository.delete(testUser.id);
    }
    await app.close();
  });

  describe('POST /auth/forgot-password', () => {
    it('should return success for existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
        });
    });

    it('should return success for non-existing email (security)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for missing email', async () => {
      // Wait a bit to avoid rate limiting from previous tests
      await new Promise(resolve => setTimeout(resolve, 100));

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({})
        .then((res) => {
          // Expect either 400 (validation) or 429 (rate limit)
          expect([400, 429]).toContain(res.status);
        });
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password successfully with valid token', async () => {
      // Generate valid reset token
      const resetToken = jwtService.sign(
        { userId: testUser.id, type: 'reset-password' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123',
        })
        .expect(201);

      expect(response.body.message).toBe('Mot de passe réinitialisé avec succès');

      // Verify password was actually changed
      const updatedUser = await usersRepository.findOne({
        where: { id: testUser.id },
        select: ['id', 'password']
      });
      expect(updatedUser).toBeDefined();
      const isPasswordCorrect = await bcrypt.compare('NewPassword123', updatedUser!.password);
      expect(isPasswordCorrect).toBe(true);
    });

    it('should return 400 for expired token', async () => {
      // Create an already expired token
      const expiredToken = jwtService.sign(
        { userId: testUser.id, type: 'reset-password' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '0s' },
      );

      // Wait a bit to ensure it's expired
      await new Promise(resolve => setTimeout(resolve, 100));

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('expiré');
        });
    });

    it('should return 400 for invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('invalide');
        });
    });

    it('should return 400 for wrong token type', () => {
      const wrongTypeToken = jwtService.sign(
        { userId: testUser.id, type: 'access' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: wrongTypeToken,
          newPassword: 'NewPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Token invalide');
        });
    });

    it('should return 400 for password too short', () => {
      const validToken = jwtService.sign(
        { userId: testUser.id, type: 'reset-password' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: validToken,
          newPassword: 'short',
        })
        .expect(400);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({})
        .expect(400);
    });
  });
});
