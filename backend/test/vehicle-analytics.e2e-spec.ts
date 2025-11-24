import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { Maintenance } from '../src/modules/maintenance/entities/maintenance.entity';

describe('Vehicle Analytics: TCO & Mileage History (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let maintenancesRepository: Repository<Maintenance>;

  let accessToken: string;
  let tenantId: number;
  let vehicleId: string;
  let userId: string;
  let maintenanceId: string;

  const uniqueEmail = `test-analytics-${Date.now()}@example.com`;
  const uniqueCompany = `AnalyticsTest-${Date.now()}`;

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
    maintenancesRepository = moduleFixture.get(getRepositoryToken(Maintenance));

    // Setup : créer tenant + véhicule
    const registerResponse = await request(app.getHttpServer())
      .post('/api/onboarding/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'Analytics',
        companyName: uniqueCompany,
        planId: 16,
      });

    accessToken = registerResponse.body.accessToken;
    tenantId = registerResponse.body.tenant.id;
    userId = registerResponse.body.user.id;

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        registration: `ANALYTICS-${Date.now()}`,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        vin: `ANALYTICS${Date.now()}`,
        color: 'Bleu',
        initialMileage: 5000,
        currentKm: 5000,
        purchasePrice: 20000,
        purchaseDate: '2023-01-15',
      });

    vehicleId = vehicleResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup
    if (maintenanceId) {
      await maintenancesRepository.delete({ id: maintenanceId });
    }
    if (vehicleId) {
      await vehiclesRepository.delete({ id: vehicleId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (tenantId) {
      await tenantsRepository.delete({ id: tenantId });
    }

    await app.close();
  });

  // 1. Créer une maintenance pour le véhicule
  it('should create a maintenance for the vehicle', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        vehicleId,
        type: 'oil_change',
        description: 'Vidange régulière',
        scheduledDate: '2025-10-15',
        estimatedCost: 150,
        status: 'completed',
        actualCost: 140,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    maintenanceId = response.body.id;
  });

  // 2. Calculer le TCO (Total Cost of Ownership)
  it('should calculate TCO correctly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/costs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      vehicleId,
      purchasePrice: 20000,
      totalMaintenanceCost: 140,
      totalOwnershipCost: 20140,
      totalMaintenanceCount: 1,
      averageMaintenanceCost: 140,
    });

    expect(response.body).toHaveProperty('costPerKm');
    expect(typeof response.body.costPerKm).toBe('number');
  });

  // 3. Récupérer l'historique du kilométrage
  it('should return mileage history', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/mileage-history`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Vérifier la structure des données
    const firstEntry = response.body[0];
    expect(firstEntry).toHaveProperty('date');
    expect(firstEntry).toHaveProperty('mileage');
    expect(firstEntry).toHaveProperty('source');
    expect(firstEntry).toHaveProperty('change');
    expect(firstEntry).toHaveProperty('description');

    // Vérifier que le premier point est la création
    expect(firstEntry.source).toBe('creation');
    expect(firstEntry.mileage).toBe(5000);
  });

  // 4. Marquer le véhicule comme vendu
  it('should update vehicle to SOLD status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'sold',
        soldDate: '2025-10-10',
        currentValue: 18000,
      })
      .expect(200);

    expect(response.body.status).toBe('sold');
    expect(response.body.currentValue).toBe(18000);
  });

  // 5. Récupérer le véhicule vendu avec ses nouvelles données
  it('should retrieve sold vehicle with soldDate and currentValue', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.status).toBe('sold');
    expect(response.body.soldDate).toBe('2025-10-10');
    expect(response.body.currentValue).toBe(18000);

    // Vérifier dans la base de données
    const vehicle = await vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    expect(vehicle.status).toBe('sold');
    expect(vehicle.currentValue).toBe(18000);
    expect(vehicle.soldDate).toBeDefined();
  });

  // 6. Vérifier qu'un audit log a été créé pour le changement de statut
  it('should have created an audit log for status change to SOLD', async () => {
    // Attendre pour que l'interceptor crée le log
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await request(app.getHttpServer())
      .get(`/api/audit-logs/entity/Vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    // Trouver le log de l'UPDATE qui a changé le statut
    const statusUpdateLog = response.body.find(
      (log) =>
        log.action === 'UPDATE' &&
        log.newValue &&
        log.newValue.status === 'sold',
    );

    expect(statusUpdateLog).toBeDefined();
    expect(statusUpdateLog.newValue.currentValue).toBe(18000);
  });
});
