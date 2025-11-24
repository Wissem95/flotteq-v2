import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { AuditLog } from '../src/entities/audit-log.entity';

describe('Complete Flow: Registration → Vehicle → Audit (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let auditLogsRepository: Repository<AuditLog>;

  let accessToken: string;
  let tenantId: number;
  let vehicleId: string;
  let userId: string;

  const uniqueEmail = `test-flow-${Date.now()}@example.com`;
  const uniqueCompany = `FlowTest-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('EmailQueueService')
      .useValue({
        queueWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        queuePasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
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
  });

  afterAll(async () => {
    // Cleanup : supprimer les données de test créées
    if (vehicleId) {
      await vehiclesRepository.delete({ id: vehicleId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (tenantId) {
      await auditLogsRepository.delete({ tenantId });
      await tenantsRepository.delete({ id: tenantId });
    }

    await app.close();
  });

  // 1. Inscription d'un nouveau tenant
  it('should register a new tenant', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/onboarding/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'Flow',
        companyName: uniqueCompany,
        planId: 16, // Freemium
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('tenant');
    expect(response.body.tenant).toHaveProperty('id');

    accessToken = response.body.accessToken;
    tenantId = response.body.tenant.id;
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
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);

    const deleteLogs = response.body.data.filter(
      (log: any) => log.action === 'DELETE' && log.entityId === vehicleId,
    );
    expect(deleteLogs.length).toBeGreaterThanOrEqual(1);
  });
});
