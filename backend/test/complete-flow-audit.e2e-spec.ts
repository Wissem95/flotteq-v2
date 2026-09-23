import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { AuditLog } from '../src/entities/audit-log.entity';
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import { StripeService } from '../src/stripe/stripe.service';
import { MileageHistory } from '../src/entities/mileage-history.entity';
import { AuditService } from '../src/modules/audit/audit.service';
import { AuditInterceptor } from '../src/common/interceptors/audit.interceptor';

describe('Complete Flow: Registration → Vehicle → Audit (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let auditLogsRepository: Repository<AuditLog>;
  let subscriptionsRepository: Repository<Subscription>;
  let plansRepository: Repository<SubscriptionPlan>;
  let mileageHistoryRepository: Repository<MileageHistory>;

  let accessToken: string;
  let tenantId: number;
  let vehicleId: string;
  let userId: string;
  let starterPlanId: number;

  const uniqueEmail = `test-flow-${Date.now()}@example.com`;
  const uniqueCompany = `FlowTest-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeService)
      .useValue({
        createCustomer: jest.fn().mockResolvedValue('cus_e2e'),
        createCheckoutSession: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(
      new AuditInterceptor(
        moduleFixture.get(Reflector),
        moduleFixture.get(AuditService),
      ),
    );
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    tenantsRepository = moduleFixture.get(getRepositoryToken(Tenant));
    vehiclesRepository = moduleFixture.get(getRepositoryToken(Vehicle));
    auditLogsRepository = moduleFixture.get(getRepositoryToken(AuditLog));
    subscriptionsRepository = moduleFixture.get(
      getRepositoryToken(Subscription),
    );
    plansRepository = moduleFixture.get(getRepositoryToken(SubscriptionPlan));
    mileageHistoryRepository = moduleFixture.get(
      getRepositoryToken(MileageHistory),
    );
    const starterPlan = await plansRepository.findOne({
      where: { name: 'Starter' },
    });
    if (!starterPlan) throw new Error('Le plan Starter doit exister en base E2E');
    starterPlanId = starterPlan.id;
  });

  afterAll(async () => {
    // Cleanup : supprimer les données de test créées
    if (vehicleId) {
      await mileageHistoryRepository.delete({ vehicleId });
      await vehiclesRepository.delete({ id: vehicleId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (tenantId) {
      await auditLogsRepository.delete({ tenantId });
      await subscriptionsRepository.delete({ tenantId });
      await tenantsRepository.delete({ id: tenantId });
    }

    await app.close();
  });

  // 1. Inscription d'un nouveau tenant
  it('should register a new tenant', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'Flow',
        companyName: uniqueCompany,
        planId: String(starterPlanId),
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).toHaveProperty('tenantId');

    accessToken = response.body.access_token;
    tenantId = response.body.user.tenantId;
    userId = response.body.user.id;

    // Vérifier que le tenant existe bien dans la base
    const tenant = await tenantsRepository.findOne({ where: { id: tenantId } });
    expect(tenant).toBeDefined();
    expect(tenant).not.toBeNull();
    expect(tenant!.name).toBe(uniqueCompany);
  });

  // 2. Créer un véhicule
  it('should create a vehicle', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        registration: `TEST-${Date.now()}`,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        vin: `TEST${Date.now()}VIN`,
        color: 'Bleu',
        initialMileage: 5000,
        currentKm: 5000,
        purchasePrice: 20000,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.brand).toBe('Toyota');
    expect(response.body.model).toBe('Corolla');

    vehicleId = response.body.id;

    // Vérifier que le véhicule existe dans la base
    const vehicle = await vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    expect(vehicle).toBeDefined();
    expect(vehicle!.brand).toBe('Toyota');
  });

  // 3. Vérifier qu'un audit log a été créé pour la création
  it('should have created an audit log for vehicle creation', async () => {
    // Attendre un peu pour que l'interceptor ait le temps de créer le log
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await request(app.getHttpServer())
      .get(`/api/audit-logs/entity/Vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const createLog = response.body.find((log: any) => log.action === 'CREATE');
    expect(createLog).toBeDefined();
    expect(createLog.entityType).toBe('Vehicle');
    expect(createLog.entityId).toBe(vehicleId);
    expect(createLog.newValue).toMatchObject({
      brand: 'Toyota',
      model: 'Corolla',
    });
  });

  // 4. Modifier le véhicule
  it('should update the vehicle', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        currentKm: 10000,
      })
      .expect(200);

    expect(response.body.currentKm).toBe(10000);

    // Vérifier dans la base
    const vehicle = await vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    expect(vehicle).not.toBeNull();
    expect(vehicle!.currentKm).toBe(10000);
  });

  // 5. Vérifier le deuxième audit log (UPDATE)
  it('should have created an audit log for vehicle update', async () => {
    // Attendre un peu pour que l'interceptor ait le temps de créer le log
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await request(app.getHttpServer())
      .get(`/api/audit-logs/entity/Vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const updateLog = response.body.find((log: any) => log.action === 'UPDATE');
    expect(updateLog).toBeDefined();
    expect(updateLog.entityType).toBe('Vehicle');
    expect(updateLog.entityId).toBe(vehicleId);
  });

  // 6. Supprimer le véhicule
  it('should delete the vehicle', async () => {
    await request(app.getHttpServer())
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    // Vérifier que le véhicule est soft deleted
    const vehicle = await vehiclesRepository.findOne({
      where: { id: vehicleId },
      withDeleted: true,
    });
    expect(vehicle).toBeDefined();
    expect(vehicle).not.toBeNull();
    expect(vehicle!.deletedAt).toBeDefined();
  });

  // 7. Vérifier le troisième audit log (DELETE)
  it('should have created an audit log for vehicle deletion', async () => {
    // Attendre un peu pour que l'interceptor ait le temps de créer le log
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await request(app.getHttpServer())
      .get(`/api/audit-logs?entityType=Vehicle`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);

    const deleteLogs = response.body.data.filter(
      (log: any) => log.action === 'DELETE' && log.entityId === vehicleId,
    );
    expect(deleteLogs.length).toBeGreaterThanOrEqual(1);
  });
});
