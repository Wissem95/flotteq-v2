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
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import { AuditLog } from '../src/entities/audit-log.entity';
import { EmailQueueService } from '../src/modules/notifications/email-queue.service';
import { createTestTenant, TestTenant } from './test-helpers';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../src/modules/audit/audit.service';
import { AuditInterceptor } from '../src/common/interceptors/audit.interceptor';
import { MileageHistory } from '../src/entities/mileage-history.entity';
import {
  MaintenanceStatus,
  MaintenanceType,
} from '../src/modules/maintenance/entities/maintenance.entity';

describe('Vehicle Analytics: TCO & Mileage History (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let maintenancesRepository: Repository<Maintenance>;
  let subscriptionsRepository: Repository<Subscription>;
  let plansRepository: Repository<SubscriptionPlan>;
  let auditLogsRepository: Repository<AuditLog>;
  let mileageHistoryRepository: Repository<MileageHistory>;

  let accessToken: string;
  let tenantId: number;
  let vehicleId: string;
  let userId: string;
  let maintenanceId: string;
  let testTenantData: TestTenant;

  const uniqueEmail = `test-analytics-${Date.now()}@example.com`;
  const uniqueCompany = `AnalyticsTest-${Date.now()}`;
  const runDate = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailQueueService)
      .useValue({
        queueWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        queuePasswordResetEmail: jest.fn().mockResolvedValue(undefined),
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
    maintenancesRepository = moduleFixture.get(getRepositoryToken(Maintenance));
    subscriptionsRepository = moduleFixture.get(getRepositoryToken(Subscription));
    plansRepository = moduleFixture.get(getRepositoryToken(SubscriptionPlan));
    auditLogsRepository = moduleFixture.get(getRepositoryToken(AuditLog));
    mileageHistoryRepository = moduleFixture.get(
      getRepositoryToken(MileageHistory),
    );

    testTenantData = await createTestTenant(
      tenantsRepository,
      usersRepository,
      subscriptionsRepository,
      plansRepository,
      {
        tenantData: { name: uniqueCompany, email: uniqueEmail },
        userData: { email: uniqueEmail },
      },
    );
    tenantId = testTenantData.tenant.id;
    userId = testTenantData.user.id;

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'TestPassword123' })
      .expect(200);
    accessToken = login.body.access_token;

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
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
      })
      .expect(201);

    vehicleId = vehicleResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup
    if (maintenanceId) {
      await maintenancesRepository.delete({ id: maintenanceId });
    }
    if (vehicleId) {
      await mileageHistoryRepository.delete({ vehicleId, tenantId });
      await auditLogsRepository.delete({ tenantId });
    }
    if (vehicleId) {
      await vehiclesRepository.delete({ id: vehicleId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (tenantId) {
      await subscriptionsRepository.delete({ tenantId });
      await auditLogsRepository.delete({ tenantId });
      await tenantsRepository.delete({ id: tenantId });
    }

    await app.close();
  });

  // 1. Créer une maintenance pour le véhicule
  it('should create a maintenance for the vehicle', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        vehicleId,
        type: MaintenanceType.OIL_CHANGE,
        description: 'Vidange régulière',
        scheduledDate: runDate,
        estimatedCost: 150,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    maintenanceId = response.body.id;

    await request(app.getHttpServer())
      .patch(`/api/maintenance/${maintenanceId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        status: MaintenanceStatus.COMPLETED,
        completedDate: runDate,
        actualCost: 140,
      })
      .expect(200);
  });

  // 2. Calculer le TCO (Total Cost of Ownership)
  it('should calculate TCO correctly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/tco`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(response.body).toMatchObject({
      vehicleId,
      purchasePrice: 20000,
      totalMaintenanceCosts: 140,
      totalTCO: 20140,
      estimatedFuelCosts: 0,
    });

    expect(response.body).toHaveProperty('tcoPerKm');
    expect(typeof response.body.tcoPerKm).toBe('number');
  });

  // 3. Récupérer l'historique du kilométrage
  it('should return mileage history', async () => {
    await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({ currentKm: 5100 })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}/mileage-history`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Vérifier la structure des données
    const firstEntry = response.body[0];
    expect(firstEntry).toHaveProperty('recordedAt');
    expect(firstEntry).toHaveProperty('mileage');
    expect(firstEntry).toHaveProperty('source');
    expect(firstEntry).toHaveProperty('difference');
    expect(firstEntry).toHaveProperty('notes');

    // La création initialise le compteur mais ne crée pas d'historique.
    // Un changement réel du compteur doit en créer un.
    expect(firstEntry.source).toBe('manual');
    expect(firstEntry.mileage).toBe(5100);
  });

  // 4. Marquer le véhicule comme vendu
  it('should update vehicle to SOLD status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        status: 'sold',
        soldDate: runDate,
        currentValue: 18000,
      })
      .expect(200);

    expect(response.body.status).toBe('sold');
    expect(Number(response.body.currentValue)).toBe(18000);
  });

  // 5. Récupérer le véhicule vendu avec ses nouvelles données
  it('should retrieve sold vehicle with soldDate and currentValue', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(response.body.status).toBe('sold');
    expect(response.body.soldDate).toBe(runDate);
    expect(Number(response.body.currentValue)).toBe(18000);

    // Vérifier dans la base de données
    const vehicle = await vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    expect(vehicle).not.toBeNull();
    expect(vehicle!.status).toBe('sold');
    expect(Number(vehicle!.currentValue)).toBe(18000);
    expect(vehicle!.soldDate).toBeDefined();
  });

  // 6. Vérifier qu'un audit log a été créé pour le changement de statut
  it('should have created an audit log for status change to SOLD', async () => {
    // Attendre pour que l'interceptor crée le log
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await request(app.getHttpServer())
      .get(`/api/audit-logs/entity/Vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    // Trouver le log de l'UPDATE qui a changé le statut
    const statusUpdateLog = response.body.find(
      (log: any) =>
        log.action === 'UPDATE' &&
        log.newValue &&
        log.newValue.status === 'sold',
    );

    expect(statusUpdateLog).toBeDefined();
    expect(statusUpdateLog.newValue.currentValue).toBe(18000);
  });
});
