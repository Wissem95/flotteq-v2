import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { AuditLog } from '../src/entities/audit-log.entity';
import { Booking, BookingStatus } from '../src/entities/booking.entity';
import { Commission } from '../src/entities/commission.entity';
import { Partner, PartnerStatus, PartnerType } from '../src/entities/partner.entity';
import { PartnerService } from '../src/entities/partner-service.entity';
import { PartnerUser, PartnerUserRole } from '../src/entities/partner-user.entity';
import { Subscription } from '../src/entities/subscription.entity';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { User } from '../src/entities/user.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { EmailQueueService } from '../src/modules/notifications/email-queue.service';
import { createTestTenant, TestTenant } from './test-helpers';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let subscriptionsRepository: Repository<Subscription>;
  let plansRepository: Repository<SubscriptionPlan>;
  let vehiclesRepository: Repository<Vehicle>;
  let partnersRepository: Repository<Partner>;
  let partnerUsersRepository: Repository<PartnerUser>;
  let partnerServicesRepository: Repository<PartnerService>;
  let bookingsRepository: Repository<Booking>;
  let commissionsRepository: Repository<Commission>;
  let auditLogsRepository: Repository<AuditLog>;

  let tenantData: TestTenant;
  let tenantToken: string;
  let partnerToken: string;
  let tenantId: number;
  let vehicleId: string;
  let partnerId: string;
  let partnerUserId: string;
  let serviceId: string;
  let bookingId: string;
  let rejectedBookingId: string;
  let cancelledBookingId: string;

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tenantPassword = 'TestPassword123';
  const partnerPassword = 'PartnerPassword123!';
  const inDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailQueueService)
      .useValue({
        queuePartnerBookingNew: jest.fn().mockResolvedValue(undefined),
        queueBookingConfirmed: jest.fn().mockResolvedValue(undefined),
        queueBookingRejected: jest.fn().mockResolvedValue(undefined),
        queueBookingCompleted: jest.fn().mockResolvedValue(undefined),
        queuePartnerBookingCancelled: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    tenantsRepository = moduleFixture.get(getRepositoryToken(Tenant));
    subscriptionsRepository = moduleFixture.get(
      getRepositoryToken(Subscription),
    );
    plansRepository = moduleFixture.get(getRepositoryToken(SubscriptionPlan));
    vehiclesRepository = moduleFixture.get(getRepositoryToken(Vehicle));
    partnersRepository = moduleFixture.get(getRepositoryToken(Partner));
    partnerUsersRepository = moduleFixture.get(getRepositoryToken(PartnerUser));
    partnerServicesRepository = moduleFixture.get(
      getRepositoryToken(PartnerService),
    );
    bookingsRepository = moduleFixture.get(getRepositoryToken(Booking));
    commissionsRepository = moduleFixture.get(getRepositoryToken(Commission));
    auditLogsRepository = moduleFixture.get(getRepositoryToken(AuditLog));

    tenantData = await createTestTenant(
      tenantsRepository,
      usersRepository,
      subscriptionsRepository,
      plansRepository,
      {
        tenantData: {
          name: `Bookings E2E ${suffix}`,
          email: `tenant-${suffix}@example.com`,
        },
        userData: { email: `user-${suffix}@example.com` },
      },
    );
    tenantId = tenantData.tenant.id;

    const tenantLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: tenantData.user.email, password: tenantPassword })
      .expect(200);
    tenantToken = tenantLogin.body.access_token;

    const vehicle = await vehiclesRepository.save({
      registration: `BK-${suffix}`,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      vin: `VIN-${suffix}`,
      color: 'Bleu',
      initialMileage: 12000,
      currentKm: 12000,
      tenantId,
    });
    vehicleId = vehicle.id;

    const partner = await partnersRepository.save({
      companyName: `Garage Bookings ${suffix}`,
      type: PartnerType.GARAGE,
      email: `garage-${suffix}@example.com`,
      phone: '+33612345678',
      address: '1 rue du Test',
      city: 'Paris',
      postalCode: '75001',
      siretNumber: String(Date.now()).padStart(14, '0'),
      status: PartnerStatus.APPROVED,
    });
    partnerId = partner.id;
    expect(partner.status).toBe(PartnerStatus.APPROVED);

    const partnerUser = await partnerUsersRepository.save({
      partnerId,
      email: `partner-user-${suffix}@example.com`,
      password: await bcrypt.hash(partnerPassword, 10),
      firstName: 'Partner',
      lastName: 'E2E',
      role: PartnerUserRole.OWNER,
      isActive: true,
    });
    partnerUserId = partnerUser.id;

    const persistedPartnerUser = await partnerUsersRepository.findOne({
      where: { id: partnerUserId },
      select: ['id', 'password', 'isActive'],
    });
    expect(persistedPartnerUser?.isActive).toBe(true);
    expect(await persistedPartnerUser?.validatePassword(partnerPassword)).toBe(
      true,
    );

    const partnerService = await partnerServicesRepository.save({
      partnerId,
      name: 'Entretien E2E',
      description: 'Prestation synthétique pour test',
      price: 120,
      durationMinutes: 90,
      isActive: true,
    });
    serviceId = partnerService.id;

    const partnerLogin = await request(app.getHttpServer())
      .post('/api/partners/auth/login')
      .send({ email: partnerUser.email, password: partnerPassword })
      .expect(200);
    partnerToken = partnerLogin.body.accessToken;
  });

  afterAll(async () => {
    if (tenantId) {
      await commissionsRepository?.delete({ partnerId });
      await bookingsRepository?.delete({ tenantId });
      await auditLogsRepository?.delete({ tenantId });
      await vehiclesRepository?.delete({ tenantId });
      await usersRepository?.delete({ tenantId });
      await subscriptionsRepository?.delete({ tenantId });
      await tenantsRepository?.delete(tenantId);
    }
    if (partnerId) {
      await partnerServicesRepository?.delete({ partnerId });
      await partnerUsersRepository?.delete({ partnerId });
      await partnersRepository?.delete(partnerId);
    }
    await app?.close();
  });

  function bookingPayload(scheduledDate: string, scheduledTime = '14:00') {
    return {
      partnerId,
      vehicleId,
      serviceId,
      scheduledDate,
      scheduledTime,
      endTime: '16:00',
      customerNotes: 'Vérifier les freins',
    };
  }

  function tenantRequest(method: 'get' | 'post' | 'patch' | 'delete', path: string) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${tenantToken}`)
      .set('X-Tenant-ID', String(tenantId));
  }

  function partnerRequest(method: 'get' | 'post' | 'patch' | 'delete', path: string) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${partnerToken}`);
  }

  it('creates a booking for an approved partner with a valid service and owned vehicle', async () => {
    const response = await tenantRequest('post', '/api/bookings')
      .send(bookingPayload(inDays(3)))
      .expect(201);

    expect(response.body.booking).toMatchObject({
      partnerId,
      tenantId,
      vehicleId,
      serviceId,
      status: BookingStatus.PENDING,
    });
    bookingId = response.body.booking.id;
  });

  it('rejects missing booking fields and dates in the past', async () => {
    await tenantRequest('post', '/api/bookings')
      .send({ partnerId })
      .expect(400);

    await tenantRequest('post', '/api/bookings')
      .send(bookingPayload('2020-01-01'))
      .expect(400);
  });

  it('requires authentication even when the tenant context is supplied', async () => {
    await request(app.getHttpServer())
      .post('/api/bookings')
      .set('X-Tenant-ID', String(tenantId))
      .send(bookingPayload(inDays(4)))
      .expect(401);
  });

  it('lists, filters, retrieves and reschedules the tenant booking', async () => {
    const list = await tenantRequest('get', '/api/bookings')
      .query({ page: 1, limit: 20 })
      .expect(200);
    expect(list.body.bookings.map((booking: Booking) => booking.id)).toContain(
      bookingId,
    );
    expect(list.body.total).toBeGreaterThanOrEqual(1);
    expect(list.body.page).toBe(1);
    expect(list.body.limit).toBe(20);

    const filtered = await tenantRequest('get', '/api/bookings')
      .query({ status: BookingStatus.PENDING })
      .expect(200);
    expect(
      filtered.body.bookings.every(
        (booking: Booking) => booking.status === BookingStatus.PENDING,
      ),
    ).toBe(true);

    const one = await tenantRequest('get', `/api/bookings/${bookingId}`).expect(200);
    expect(one.body.booking.id).toBe(bookingId);
    await tenantRequest(
      'get',
      '/api/bookings/00000000-0000-0000-0000-000000000000',
    ).expect(404);

    const rescheduled = await tenantRequest(
      'patch',
      `/api/bookings/${bookingId}/reschedule`,
    )
      .send({
        scheduledDate: inDays(5),
        scheduledTime: '10:00',
        endTime: '12:00',
      })
      .expect(200);
    expect(rescheduled.body.booking.scheduledTime).toBe('10:00');
  });

  it('lets the partner confirm and start work, then completes with commission', async () => {
    const confirmed = await partnerRequest(
      'patch',
      `/api/bookings/${bookingId}/confirm`,
    )
      .expect(200);
    expect(confirmed.body.booking.status).toBe(BookingStatus.CONFIRMED);
    expect(confirmed.body.booking.confirmedAt).toBeDefined();

    await partnerRequest('patch', `/api/bookings/${bookingId}/confirm`).expect(400);

    const upcoming = await tenantRequest('get', '/api/bookings/upcoming').expect(200);
    expect(upcoming.body.bookings.map((booking: Booking) => booking.id)).toContain(
      bookingId,
    );

    const started = await partnerRequest(
      'patch',
      `/api/bookings/${bookingId}/start`,
    ).expect(200);
    expect(started.body.booking.status).toBe(BookingStatus.IN_PROGRESS);

    const completed = await partnerRequest(
      'patch',
      `/api/bookings/${bookingId}/complete`,
    )
      .send({ partnerNotes: 'Prestation terminée' })
      .expect(200);
    expect(completed.body.booking.status).toBe(BookingStatus.COMPLETED);
    expect(Number(completed.body.booking.commissionAmount)).toBeGreaterThan(0);
    expect(completed.body.commission).toBeGreaterThan(0);
  });

  it('lets the partner reject a separate pending booking with a reason', async () => {
    const created = await tenantRequest('post', '/api/bookings')
      .send(bookingPayload(inDays(6), '09:00'))
      .expect(201);
    rejectedBookingId = created.body.booking.id;

    const rejected = await partnerRequest(
      'patch',
      `/api/bookings/${rejectedBookingId}/reject`,
    )
      .send({ reason: 'Indisponibilité exceptionnelle' })
      .expect(200);
    expect(rejected.body.booking.status).toBe(BookingStatus.REJECTED);
    expect(rejected.body.booking.rejectionReason).toBe(
      'Indisponibilité exceptionnelle',
    );
  });

  it('lets the tenant cancel a pending booking and soft-delete it', async () => {
    const created = await tenantRequest('post', '/api/bookings')
      .send(bookingPayload(inDays(7), '08:00'))
      .expect(201);
    cancelledBookingId = created.body.booking.id;

    const cancelled = await tenantRequest(
      'patch',
      `/api/bookings/${cancelledBookingId}/cancel`,
    )
      .send({ reason: 'Demande client annulée' })
      .expect(200);
    expect(cancelled.body.booking.status).toBe(BookingStatus.CANCELLED);

    await tenantRequest('delete', `/api/bookings/${cancelledBookingId}`).expect(204);
    await tenantRequest('get', `/api/bookings/${cancelledBookingId}`).expect(404);
  });
});
