import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import { MileageHistory } from '../src/entities/mileage-history.entity';
import { StripeService } from '../src/stripe/stripe.service';
import { EmailQueueService } from '../src/modules/notifications/email-queue.service';

describe('Subscription Limits Enforcement (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let subscriptionsRepository: Repository<Subscription>;
  let plansRepository: Repository<SubscriptionPlan>;
  let mileageHistoryRepository: Repository<MileageHistory>;
  let starterPlanId: number;
  let businessPlanId: number;

  let accessToken: string;
  let tenantId: number;
  let userId: string;
  const vehicleIds: string[] = [];

  const uniqueEmail = `test-limits-${Date.now()}@example.com`;
  const uniqueCompany = `LimitsTest-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailQueueService)
      .useValue({
        queueWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        queuePasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(StripeService)
      .useValue({
        createCustomer: jest.fn().mockResolvedValue('cus_e2e'),
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
    const businessPlan = await plansRepository.findOne({
      where: { name: 'Business' },
    });
    if (!starterPlan || !businessPlan) {
      throw new Error('Les plans Starter et Business doivent exister en base E2E');
    }
    starterPlanId = starterPlan.id;
    businessPlanId = businessPlan.id;

    // Setup : créer tenant avec plan Freemium (max 3 véhicules)
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'Limits',
        companyName: uniqueCompany,
        planId: String(starterPlanId),
      });

    accessToken = registerResponse.body.access_token;
    tenantId = registerResponse.body.user.tenantId;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    for (const vehicleId of vehicleIds) {
      await mileageHistoryRepository.delete({ vehicleId });
      await vehiclesRepository.delete({ id: vehicleId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (tenantId) {
      await subscriptionsRepository.delete({ tenantId });
      await tenantsRepository.delete({ id: tenantId });
    }

    await app.close();
  });

  // 1. Bloquer la création du 4ème véhicule (limite Freemium atteinte)
  it('should block vehicle creation when limit reached', async () => {
    // Créer 3 véhicules (limite Freemium)
    for (let i = 1; i <= 3; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Tenant-ID', String(tenantId))
        .send({
          registration: `LIMIT-TEST-${Date.now()}-${i}`,
          brand: 'Toyota',
          model: `Corolla ${i}`,
          year: 2023,
          vin: `LIMIT${Date.now()}${i}`,
          color: 'Bleu',
          initialMileage: 5000,
          currentKm: 5000,
          purchasePrice: 20000,
        })
        .expect(201);

      vehicleIds.push(response.body.id);
    }

    // Vérifier que nous avons bien 3 véhicules
    expect(vehicleIds.length).toBe(3);

    // Tenter de créer un 4ème véhicule → doit échouer avec 403
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        registration: `LIMIT-TEST-${Date.now()}-4`,
        brand: 'Toyota',
        model: 'Corolla 4',
        year: 2023,
        vin: `LIMIT${Date.now()}4`,
        color: 'Bleu',
        initialMileage: 5000,
        currentKm: 5000,
        purchasePrice: 20000,
      })
      .expect(403);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Limite atteinte');
    expect(response.body.code).toBe('LIMIT_REACHED');
  });

  // 2. Permettre la création après upgrade du plan
  it('should allow more vehicles after plan upgrade', async () => {
    // Récupérer la subscription actuelle
    const subscription = await subscriptionsRepository.findOne({
      where: { tenantId },
      relations: ['plan'],
    });

    expect(subscription).toBeDefined();
    expect(subscription).not.toBeNull();
    expect(subscription!.planId).toBe(starterPlanId);

    // Simuler un upgrade vers le plan Business (plan ID 2, max 50 véhicules)
    // Note : Dans un vrai scénario, cela passerait par Stripe
    await subscriptionsRepository.update(subscription!.id, {
      planId: businessPlanId,
    });
    const upgradedSubscription = await subscriptionsRepository.findOne({
      where: { id: subscription!.id },
      relations: ['plan'],
    });
    expect(upgradedSubscription?.plan.name).toBe('Business');

    // Maintenant, créer un 4ème véhicule → doit réussir
    const response = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .send({
        registration: `LIMIT-TEST-${Date.now()}-4-UPGRADED`,
        brand: 'Toyota',
        model: 'Corolla 4 Upgraded',
        year: 2023,
        vin: `LIMITUP${Date.now()}`,
        color: 'Bleu',
        initialMileage: 5000,
        currentKm: 5000,
        purchasePrice: 20000,
      });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('id');
    vehicleIds.push(response.body.id);

    // Vérifier qu'on a maintenant 4 véhicules
    const vehicleCount = await vehiclesRepository.count({
      where: { tenantId },
    });
    expect(vehicleCount).toBeGreaterThanOrEqual(4);
  });
});
