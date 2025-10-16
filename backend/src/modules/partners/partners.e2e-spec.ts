import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PartnersModule } from './partners.module';
import { Partner, PartnerType } from '../../entities/partner.entity';
import { PartnerUser } from '../../entities/partner-user.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import { AuthModule } from '../../core/auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

describe.skip('Partners E2E Tests (SKIP - requires full app setup)', () => {
  let app: INestApplication;
  let partnerAuthToken: string;
  let adminAuthToken: string;
  let partnerId: string;

  const testPartner = {
    companyName: 'Test Garage E2E',
    type: PartnerType.GARAGE,
    email: 'test-e2e@garage.com',
    phone: '+33612345678',
    address: '123 Rue Test',
    city: 'Paris',
    postalCode: '75001',
    siretNumber: '98765432109876',
    ownerFirstName: 'John',
    ownerLastName: 'Doe',
    ownerEmail: 'john-e2e@garage.com',
    ownerPassword: 'SecurePass123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'flotteq123',
          database: process.env.DB_NAME || 'flotteq_test',
          entities: [Partner, PartnerUser, PartnerService, User, Tenant],
          synchronize: true,
          dropSchema: true,
        }),
        PartnersModule,
        AuthModule,
        NotificationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Create admin user fixture
    await createAdminUser();
  });

  afterAll(async () => {
    await app.close();
  });

  const createAdminUser = async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admin-e2e@flotteq.com',
      password: 'AdminPass123!',
      firstName: 'Admin',
      lastName: 'User',
      companyName: 'FlotteQ',
      planId: 1,
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'admin-e2e@flotteq.com',
      password: 'AdminPass123!',
    });

    adminAuthToken = loginResponse.body.accessToken;
  };

  describe('POST /partners (registration)', () => {
    it('should register a new partner successfully', () => {
      return request(app.getHttpServer())
        .post('/partners')
        .send(testPartner)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('pending');
          expect(res.body.companyName).toBe(testPartner.companyName);
          partnerId = res.body.id;
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer()).post('/partners').send(testPartner).expect(409);
    });

    it('should reject invalid SIRET', () => {
      return request(app.getHttpServer())
        .post('/partners')
        .send({
          ...testPartner,
          email: 'another@test.com',
          siretNumber: '123', // Invalid SIRET
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/partners')
        .send({
          ...testPartner,
          email: 'weak@test.com',
          siretNumber: '12345678901234',
          ownerPassword: 'weak',
        })
        .expect(400);
    });
  });

  describe('POST /partners/auth/login', () => {
    it('should reject login if partner not approved', () => {
      return request(app.getHttpServer())
        .post('/partners/auth/login')
        .send({
          email: testPartner.ownerEmail,
          password: testPartner.ownerPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('pending approval');
        });
    });
  });

  describe('Admin approval flow', () => {
    it('should allow admin to approve partner', () => {
      return request(app.getHttpServer())
        .patch(`/partners/${partnerId}/approve`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .set('X-Tenant-ID', '1')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('approved');
        });
    });

    it('should reject duplicate approval', () => {
      return request(app.getHttpServer())
        .patch(`/partners/${partnerId}/approve`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .set('X-Tenant-ID', '1')
        .expect(400);
    });
  });

  describe('POST /partners/auth/login (after approval)', () => {
    it('should login successfully after approval', () => {
      return request(app.getHttpServer())
        .post('/partners/auth/login')
        .send({
          email: testPartner.ownerEmail,
          password: testPartner.ownerPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.partnerUser.email).toBe(testPartner.ownerEmail);
          partnerAuthToken = res.body.accessToken;
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/partners/auth/login')
        .send({
          email: testPartner.ownerEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });

  describe('GET /partners/auth/profile', () => {
    it('should get partner profile', () => {
      return request(app.getHttpServer())
        .get('/partners/auth/profile')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testPartner.ownerEmail);
          expect(res.body.partner.companyName).toBe(testPartner.companyName);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer()).get('/partners/auth/profile').expect(401);
    });
  });

  describe('Service CRUD', () => {
    let serviceId: string;

    it('should add service to partner', () => {
      return request(app.getHttpServer())
        .post('/partners/me/services')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .send({
          name: 'Vidange E2E',
          description: 'Test service',
          price: 99.99,
          durationMinutes: 60,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Vidange E2E');
          serviceId = res.body.id;
        });
    });

    it('should get partner services', () => {
      return request(app.getHttpServer())
        .get('/partners/me/services')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should update service', () => {
      return request(app.getHttpServer())
        .patch(`/partners/services/${serviceId}`)
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .send({ price: 109.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe('109.99');
        });
    });

    it('should delete service', () => {
      return request(app.getHttpServer())
        .delete(`/partners/services/${serviceId}`)
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .expect(200);
    });
  });

  describe('Admin operations', () => {
    it('should allow admin to update commission rate', () => {
      return request(app.getHttpServer())
        .patch(`/partners/${partnerId}/commission-rate`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .set('X-Tenant-ID', '1')
        .send({ commissionRate: 15 })
        .expect(200)
        .expect((res) => {
          expect(res.body.commissionRate).toBe('15.00');
        });
    });
  });
});
