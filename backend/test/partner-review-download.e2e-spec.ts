import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { rm } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User, UserRole } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Partner } from '../src/entities/partner.entity';
import { PartnerUser } from '../src/entities/partner-user.entity';
import { PartnerService } from '../src/entities/partner-service.entity';
import {
  PartnerDocument,
  PartnerDocumentType,
} from '../src/entities/partner-document.entity';
import { EmailQueueService } from '../src/modules/notifications/email-queue.service';

describe('Partner application, admin review and protected document download (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let partnersRepository: Repository<Partner>;
  let partnerDocumentsRepository: Repository<PartnerDocument>;
  let partnerUsersRepository: Repository<PartnerUser>;
  let partnerServicesRepository: Repository<PartnerService>;
  let partnerId: string;
  let adminUserId: string;
  let adminToken: string;
  let tenantId: number;
  let adminTenantCreated = false;
  let documentId: string;

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const adminEmail = `admin-${suffix}@example.com`;
  const adminPassword = 'SyntheticAdminPass123!';
  const ownerEmail = `partner-${suffix}@example.com`;
  const pdf = Buffer.from('%PDF-1.4\n% FlotteQ synthetic partner proof\n%%EOF\n');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailQueueService)
      .useValue({
        queuePartnerWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        queuePartnerApprovedEmail: jest.fn().mockResolvedValue(undefined),
        queuePartnerRejectedEmail: jest.fn().mockResolvedValue(undefined),
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
    partnersRepository = moduleFixture.get(getRepositoryToken(Partner));
    partnerDocumentsRepository = moduleFixture.get(
      getRepositoryToken(PartnerDocument),
    );
    partnerUsersRepository = moduleFixture.get(getRepositoryToken(PartnerUser));
    partnerServicesRepository = moduleFixture.get(
      getRepositoryToken(PartnerService),
    );

    let adminTenant = await tenantsRepository.findOne({ where: { id: 1 } });
    if (!adminTenant) {
      adminTenant = await tenantsRepository.save({
        id: 1,
        name: `Synthetic FlotteQ Admin ${suffix}`,
        email: adminEmail,
      });
      adminTenantCreated = true;
      await tenantsRepository.query(`
        SELECT setval(
          pg_get_serial_sequence('tenants', 'id'),
          GREATEST((SELECT COALESCE(MAX(id), 1) FROM tenants), 1),
          true
        )
      `);
    }
    tenantId = adminTenant.id;

    const admin = await usersRepository.save({
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      firstName: 'Admin',
      lastName: 'FlotteQ',
      role: UserRole.SUPER_ADMIN,
      tenantId,
      isActive: true,
    });
    adminUserId = admin.id;
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    if (partnerId) {
      await rm(join(process.cwd(), 'uploads', 'partners', partnerId), {
        recursive: true,
        force: true,
      });
      await partnerDocumentsRepository.delete({ partnerId });
      await partnerServicesRepository.delete({ partnerId });
      await partnerUsersRepository.delete({ partnerId });
      await partnersRepository.delete(partnerId);
    }
    if (adminUserId) await usersRepository.delete(adminUserId);
    if (adminTenantCreated) await tenantsRepository.delete(tenantId);
    await app?.close();
  });

  it('registers pending, rejects early login, supports admin review and streams only an authorized file', async () => {
    const registration = await request(app.getHttpServer())
      .post('/api/partners/auth/register')
      .field('companyName', `Garage E2E ${suffix}`)
      .field('type', 'garage')
      .field('email', `garage-${suffix}@example.com`)
      .field('phone', '+33612345678')
      .field('address', '1 rue du Test')
      .field('city', 'Paris')
      .field('postalCode', '75001')
      .field('siretNumber', String(Date.now()).padStart(14, '0'))
      .field('ownerFirstName', 'Synthetic')
      .field('ownerLastName', 'Owner')
      .field('ownerEmail', ownerEmail)
      .field('ownerPassword', 'SyntheticPartner123!')
      .field('documentType', PartnerDocumentType.SIRET)
      .attach('documents', pdf, {
        filename: 'justificatif-e2e.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    partnerId = registration.body.id;
    expect(registration.body.status).toBe('pending');

    const pendingLogin = await request(app.getHttpServer())
      .post('/api/partners/auth/login')
      .send({ email: ownerEmail, password: 'SyntheticPartner123!' })
      .expect(401);
    expect(pendingLogin.body.message).toContain('pending approval');

    const pendingPartners = await request(app.getHttpServer())
      .get('/api/partners?status=pending')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200);
    expect(pendingPartners.body.data.map((partner: Partner) => partner.id)).toContain(
      partnerId,
    );

    const documents = await request(app.getHttpServer())
      .get(`/api/partners/${partnerId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(documents.body).toHaveLength(1);
    expect(documents.body[0]).toMatchObject({
      fileName: 'justificatif-e2e.pdf',
      verificationStatus: 'pending',
      source: 'registration',
    });
    documentId = documents.body[0].id;

    await request(app.getHttpServer())
      .patch(`/api/partners/${partnerId}/documents/${documentId}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ source: 'registration', status: 'approved', notes: 'Document synthétique valide' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.verificationStatus).toBe('approved');
      });

    await request(app.getHttpServer())
      .patch(`/api/partners/${partnerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Tenant-ID', String(tenantId))
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('approved');
      });

    const partnerLogin = await request(app.getHttpServer())
      .post('/api/partners/auth/login')
      .send({ email: ownerEmail, password: 'SyntheticPartner123!' })
      .expect(200);
    const partnerToken = partnerLogin.body.accessToken;

    const unauthorizedDownload = await request(app.getHttpServer())
      .get(`/api/partners/${partnerId}/documents/${documentId}/download?source=registration`)
      .expect(401);
    expect(unauthorizedDownload.status).toBe(401);

    const download = await request(app.getHttpServer())
      .get(`/api/partners/${partnerId}/documents/${documentId}/download?source=registration`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(download.headers['content-type']).toContain('application/pdf');
    expect(download.headers['content-disposition']).toContain('justificatif-e2e.pdf');
    expect(download.body).toEqual(pdf);

    const savedDocument = await partnerDocumentsRepository.findOneByOrFail({
      id: documentId,
      partnerId,
    });
    expect(savedDocument.verifiedById).toBe(adminUserId);
    expect(partnerToken).toEqual(expect.any(String));
  });
});
