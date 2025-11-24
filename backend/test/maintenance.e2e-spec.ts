import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { JwtService } from '@nestjs/jwt';
import { createTestTenant, cleanupTestTenant, TestTenant } from './test-helpers';
import {
  MaintenanceType,
  MaintenanceStatus,
} from '../src/modules/maintenance/entities/maintenance.entity';

describe('Maintenance (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let subscriptionsRepository: Repository<Subscription>;
  let plansRepository: Repository<SubscriptionPlan>;
  let vehiclesRepository: Repository<Vehicle>;
  let jwtService: JwtService;
  let authToken: string;
  let tenantId: number;
  let vehicleId: string;
  let maintenanceId: string;
  let templateId: string;
  let testTenantData: TestTenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    usersRepository = moduleFixture.get(getRepositoryToken(User));
    tenantsRepository = moduleFixture.get(getRepositoryToken(Tenant));
    subscriptionsRepository = moduleFixture.get(getRepositoryToken(Subscription));
    plansRepository = moduleFixture.get(getRepositoryToken(SubscriptionPlan));
    vehiclesRepository = moduleFixture.get(getRepositoryToken(Vehicle));
    jwtService = moduleFixture.get(JwtService);

    // Create test tenant with user using helper
    testTenantData = await createTestTenant(
      tenantsRepository,
      usersRepository,
      subscriptionsRepository,
      plansRepository,
      {
        userData: {
          email: `maintenance-test-${Date.now()}@test.com`,
          role: 'tenant_admin',
        },
      },
    );

    tenantId = testTenantData.tenant.id;

    // Generate JWT token for authentication
    authToken = jwtService.sign(
      {
        sub: testTenantData.user.id,
        email: testTenantData.user.email,
        role: testTenantData.user.role,
        tenantId: testTenantData.tenant.id,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
    );

    // Create a test vehicle
    const vehicleResponse = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        registration: 'TEST-MAINT-001',
        brand: 'Test',
        model: 'Maintenance',
        year: 2023,
        vin: 'TEST123456789MAINT',
        purchasePrice: 25000,
        currentKm: 10000,
      });

    vehicleId = vehicleResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup using helper and direct queries for maintenance data
    if (dataSource && tenantId) {
      await dataSource.query('DELETE FROM maintenances WHERE tenant_id = $1', [
        tenantId,
      ]);
      await dataSource.query(
        'DELETE FROM maintenance_templates WHERE tenant_id = $1',
        [tenantId],
      );
    }
    if (testTenantData) {
      await cleanupTestTenant(
        testTenantData.tenant,
        tenantsRepository,
        usersRepository,
        subscriptionsRepository,
        vehiclesRepository,
      );
    }
    await app.close();
  });

  describe('/maintenance (POST)', () => {
    it('should create a new maintenance', async () => {
      const response = await request(app.getHttpServer())
        .post('/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId,
          type: MaintenanceType.PREVENTIVE,
          description: 'Routine maintenance check',
          scheduledDate: '2025-11-15',
          estimatedCost: 150.0,
          performedBy: 'Test Garage',
          nextMaintenanceKm: 20000,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(MaintenanceType.PREVENTIVE);
      expect(response.body.estimatedCost).toBe('150.00');
      expect(response.body.status).toBe(MaintenanceStatus.SCHEDULED);

      maintenanceId = response.body.id;
    });

    it('should fail with invalid vehicle', async () => {
      await request(app.getHttpServer())
        .post('/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId: '00000000-0000-0000-0000-000000000000',
          type: MaintenanceType.PREVENTIVE,
          description: 'Test',
          scheduledDate: '2025-11-15',
          estimatedCost: 100,
        })
        .expect(500); // Will fail with FK constraint
    });
  });

  describe('/maintenance (GET)', () => {
    it('should get all maintenances', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('vehicle');
    });
  });

  describe('/maintenance/:id (GET)', () => {
    it('should get a specific maintenance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(maintenanceId);
      expect(response.body).toHaveProperty('vehicle');
    });

    it('should return 404 for non-existent maintenance', async () => {
      await request(app.getHttpServer())
        .get('/maintenance/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/maintenance/:id (PATCH)', () => {
    it('should update a maintenance', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: MaintenanceStatus.IN_PROGRESS,
          actualCost: 175.5,
        })
        .expect(200);

      expect(response.body.status).toBe(MaintenanceStatus.IN_PROGRESS);
      expect(response.body.actualCost).toBe('175.50');
    });
  });

  describe('/maintenance/alerts/upcoming (GET)', () => {
    it('should get upcoming maintenance alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenance/alerts/upcoming?daysAhead=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/maintenance/costs/total (GET)', () => {
    it('should get total costs', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenance/costs/total')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(typeof response.body).toBe('number');
    });
  });

  describe('/maintenance/templates (POST)', () => {
    it('should create a maintenance template', async () => {
      const response = await request(app.getHttpServer())
        .post('/maintenance/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vidange standard',
          type: MaintenanceType.OIL_CHANGE,
          description: 'Vidange moteur avec filtre',
          estimatedCost: 80,
          estimatedDurationDays: 1,
          kmInterval: 10000,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Vidange standard');
      expect(response.body.isActive).toBe(true);

      templateId = response.body.id;
    });
  });

  describe('/maintenance/templates (GET)', () => {
    it('should get all templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/maintenance/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/maintenance/from-template/:templateId (POST)', () => {
    it('should create maintenance from template', async () => {
      const response = await request(app.getHttpServer())
        .post(`/maintenance/from-template/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId,
          scheduledDate: '2025-12-01',
          performedBy: 'Garage Template',
        })
        .expect(201);

      expect(response.body.type).toBe(MaintenanceType.OIL_CHANGE);
      expect(response.body.description).toBe('Vidange moteur avec filtre');
      expect(response.body.estimatedCost).toBe('80.00');
    });

    it('should fail with non-existent template', async () => {
      await request(app.getHttpServer())
        .post('/maintenance/from-template/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vehicleId,
          scheduledDate: '2025-12-01',
        })
        .expect(404);
    });
  });

  describe('/maintenance/:id (DELETE)', () => {
    it('should delete a maintenance', async () => {
      await request(app.getHttpServer())
        .delete(`/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/maintenance/templates/:id (DELETE)', () => {
    it('should delete a template', async () => {
      await request(app.getHttpServer())
        .delete(`/maintenance/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
