import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('DriversController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let driverId: string;
  let vehicleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create test tenant and user for E2E tests
    await dataSource.query(`
      INSERT INTO tenants (id, name, email, subscription_status, status, plan_id)
      VALUES (999, 'E2E Test Tenant', 'e2e-test@tenant.com', 'active', 'active', 13)
      ON CONFLICT ON CONSTRAINT "PK_53be67a04681c66b87ee27c9321"
      DO UPDATE SET plan_id = 13, subscription_status = 'active', status = 'active'
    `);

    // Create subscription for tenant (delete first if exists, then insert)
    await dataSource.query(`DELETE FROM subscriptions WHERE "tenantId" = 999`);
    await dataSource.query(`
      INSERT INTO subscriptions ("tenantId", "planId", status, usage)
      VALUES (999, 13, 'active', '{"vehicles": 0, "users": 0, "drivers": 0}')
    `);

    // Password hash for 'Test12345' (bcrypt)
    const passwordHash =
      '$2b$12$0XLtbTcy3k37sdRFXISD7OA3qapD/J8ipMmFIWgieRX7xoSjpT9te';

    await dataSource.query(
      `
      INSERT INTO users (email, password, first_name, last_name, role, tenant_id)
      VALUES ('test-e2e@drivers.com', $1, 'E2E', 'Test', 'tenant_admin', 999)
      ON CONFLICT (email, tenant_id) DO UPDATE SET password = $1
    `,
      [passwordHash],
    );

    // Login with test user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test-e2e@drivers.com',
        password: 'Test12345',
      });

    if (!loginResponse.body.access_token) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup test data to avoid DB pollution
    try {
      if (vehicleId) {
        await dataSource.query('DELETE FROM vehicles WHERE id = $1', [
          vehicleId,
        ]);
      }
      // Driver is already deleted in last test, but cleanup any remaining test drivers
      await dataSource.query(
        'DELETE FROM drivers WHERE email LIKE $1 OR "licenseNumber" LIKE $2',
        ['%@test.com', 'E2E%'],
      );
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }

    await app.close();
  });

  describe('POST /drivers', () => {
    it('should create a new driver', async () => {
      const response = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          firstName: 'E2E',
          lastName: 'TestDriver',
          email: 'e2e.driver@test.com',
          phone: '+33612345678',
          licenseNumber: 'E2E123456',
          licenseExpiryDate: '2026-12-31',
        })
        .expect(201);

      driverId = response.body.id;
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('E2E');
      expect(response.body.lastName).toBe('TestDriver');
      expect(response.body.email).toBe('e2e.driver@test.com');
      expect(response.body.status).toBe('active');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          firstName: 'Duplicate',
          lastName: 'Email',
          email: 'e2e.driver@test.com', // Same email
          phone: '+33698765432',
          licenseNumber: 'DUP123',
          licenseExpiryDate: '2026-12-31',
        })
        .expect(400);
    });

    it('should reject duplicate license number', async () => {
      await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          firstName: 'Duplicate',
          lastName: 'License',
          email: 'duplicate.license@test.com',
          phone: '+33698765432',
          licenseNumber: 'E2E123456', // Same license
          licenseExpiryDate: '2026-12-31',
        })
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          firstName: 'Invalid',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('GET /drivers', () => {
    it('should get paginated list of drivers', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter drivers by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers?page=1&limit=10&status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      response.body.data.forEach((driver: any) => {
        expect(driver.status).toBe('active');
      });
    });
  });

  describe('GET /drivers/:id', () => {
    it('should get driver by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      expect(response.body.id).toBe(driverId);
      expect(response.body.firstName).toBe('E2E');
    });

    it('should return 404 for non-existent driver', async () => {
      await request(app.getHttpServer())
        .get('/drivers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(404);
    });
  });

  describe('GET /drivers/available', () => {
    it('should get available drivers without vehicles', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/available')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // New driver should be available (no vehicles assigned)
      const newDriver = response.body.find((d: any) => d.id === driverId);
      expect(newDriver).toBeDefined();
    });
  });

  describe('GET /drivers/expiring-licenses', () => {
    it('should get drivers with expiring licenses', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/expiring-licenses?days=365')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /drivers/:id', () => {
    it('should update driver', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          firstName: 'Updated',
          phone: '+33699999999',
        })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
      expect(response.body.phone).toBe('+33699999999');
    });
  });

  describe('Vehicle Assignment', () => {
    beforeAll(async () => {
      // Create a test vehicle
      const vehicleResponse = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({
          registration: 'E2E-TEST',
          brand: 'Test',
          model: 'E2E',
          year: 2024,
          vin: 'E2ETEST123456789',
          color: 'Blue',
          purchaseDate: '2024-01-01',
          purchasePrice: 20000,
        });

      vehicleId = vehicleResponse.body.id;
    });

    describe('POST /drivers/:id/assign-vehicle', () => {
      it('should assign vehicle to driver', async () => {
        const response = await request(app.getHttpServer())
          .post(`/drivers/${driverId}/assign-vehicle`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .send({ vehicleId })
          .expect(201);

        expect(response.body.vehicles).toBeDefined();
        const vehicle = response.body.vehicles.find(
          (v: any) => v.id === vehicleId,
        );
        expect(vehicle).toBeDefined();
      });

      it('should reject assignment to already assigned vehicle', async () => {
        await request(app.getHttpServer())
          .post(`/drivers/${driverId}/assign-vehicle`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .send({ vehicleId })
          .expect(400);
      });

      it('should reject assignment with expired license', async () => {
        // Create driver with expired license
        const expiredDriverResponse = await request(app.getHttpServer())
          .post('/drivers')
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .send({
            firstName: 'Expired',
            lastName: 'License',
            email: 'expired@test.com',
            phone: '+33611111111',
            licenseNumber: 'EXP123',
            licenseExpiryDate: '2020-01-01', // Expired
          });

        await request(app.getHttpServer())
          .post(`/drivers/${expiredDriverResponse.body.id}/assign-vehicle`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .send({ vehicleId })
          .expect(400);
      });
    });

    describe('POST /drivers/:id/unassign-vehicle', () => {
      it('should unassign vehicle from driver', async () => {
        const response = await request(app.getHttpServer())
          .post(`/drivers/${driverId}/unassign-vehicle`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .send({ vehicleId })
          .expect(201);

        expect(response.body.vehicles).toBeDefined();
        const vehicle = response.body.vehicles.find(
          (v: any) => v.id === vehicleId,
        );
        expect(vehicle).toBeUndefined();
      });
    });

    describe('GET /drivers/:id/vehicles', () => {
      it('should get driver vehicles', async () => {
        const response = await request(app.getHttpServer())
          .get(`/drivers/${driverId}/vehicles`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Tenant-ID', '999')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('DELETE /drivers/:id', () => {
    it('should prevent deletion if vehicles are assigned', async () => {
      // Assign vehicle again
      await request(app.getHttpServer())
        .post(`/drivers/${driverId}/assign-vehicle`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({ vehicleId });

      await request(app.getHttpServer())
        .delete(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(400);

      // Unassign vehicle
      await request(app.getHttpServer())
        .post(`/drivers/${driverId}/unassign-vehicle`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .send({ vehicleId });
    });

    it('should delete driver when no vehicles assigned', async () => {
      await request(app.getHttpServer())
        .delete(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', '999')
        .expect(404);
    });
  });
});
