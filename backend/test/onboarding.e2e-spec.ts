import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { Vehicle } from '../src/entities/vehicle.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Onboarding (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let tenantsRepository: Repository<Tenant>;
  let vehiclesRepository: Repository<Vehicle>;
  let jwtService: JwtService;

  // Arrays to track created entities for cleanup
  const createdTenants: Tenant[] = [];
  const createdUsers: User[] = [];

  // Counters for unique names
  let tenantCounter = 0;
  let companyCounter = 0;

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
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    tenantsRepository = moduleFixture.get(getRepositoryToken(Tenant));
    vehiclesRepository = moduleFixture.get(getRepositoryToken(Vehicle));
    jwtService = moduleFixture.get(JwtService);

    // Clean up ALL test data from previous runs
    // First delete bookings (FK constraint to vehicles)
    const dataSource = moduleFixture.get(DataSource);
    await dataSource.query('DELETE FROM bookings WHERE 1=1');

    // Then delete vehicles
    const allVehicles = await vehiclesRepository.find();
    for (const vehicle of allVehicles) {
      await vehiclesRepository.delete(vehicle.id);
    }

    const allUsers = await usersRepository.find();
    const testUserIds: string[] = [];
    const testTenantIds: Set<number> = new Set();

    for (const user of allUsers) {
      if (user.email.includes('test.com') || user.email.includes('@test')) {
        testUserIds.push(user.id);
        if (user.tenantId) {
          testTenantIds.add(user.tenantId);
        }
      }
    }

    // Delete ALL users from test tenants first
    for (const tenantId of testTenantIds) {
      const tenantUsers = await usersRepository.find({ where: { tenantId } });
      for (const user of tenantUsers) {
        await usersRepository.delete(user.id);
      }
    }

    // Then delete tenants
    for (const tenantId of testTenantIds) {
      await tenantsRepository.delete(tenantId);
    }
  });

  afterEach(async () => {
    // Cleanup after each test to prevent conflicts
    for (const user of createdUsers) {
      await vehiclesRepository.delete({ tenantId: user.tenantId });
      await usersRepository.delete({ id: user.id });
    }
    for (const tenant of createdTenants) {
      await tenantsRepository.delete(tenant.id);
    }
    // Clear arrays for next test
    createdUsers.length = 0;
    createdTenants.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function to create test user with tenant and token
  async function createTestUserWithTenant(
    tenantName: string,
    userEmail?: string,
  ) {
    tenantCounter++;
    const uniqueTenantName = `${tenantName}-${tenantCounter}`;

    // Generate truly unique ID with timestamp + counter + random
    const uniqueId = `${Date.now()}-${tenantCounter}-${Math.random().toString(36).substring(2, 15)}`;

    const tenant = await tenantsRepository.save({
      name: uniqueTenantName,
      email: `${tenantName.replace(/\s+/g, '-').toLowerCase()}-${uniqueId}@test.com`,
      status: 'active',
      subscriptionStatus: 'active',
      onboardingCompleted: false,
    } as any);
    createdTenants.push(tenant);

    const hashedPassword = await bcrypt.hash('TestPassword123', 12);
    const user = await usersRepository.save({
      email: userEmail || `user-${uniqueId}@test.com`,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.TENANT_ADMIN,
      tenantId: tenant.id,
    } as any);
    createdUsers.push(user);

    const token = jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    return { tenant, user, token };
  }

  // Helper to generate unique company name
  function uniqueCompanyName(baseName: string): string {
    companyCounter++;
    return `${baseName}-${companyCounter}`;
  }

  describe('POST /onboarding/complete', () => {
    it('[DEBUG] should show error message', async () => {
      const { tenant, token } =
        await createTestUserWithTenant('Debug Test Company');
      const companyName = uniqueCompanyName('Debug Updated');

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName,
            companyAddress: '123 St',
            companyCity: 'Paris',
            companyPostalCode: '75001',
            companyCountry: 'France',
            fleetSize: 10,
          },
        });

      if (response.status !== 201) {
        console.error('ERROR STATUS:', response.status);
        console.error('ERROR BODY:', JSON.stringify(response.body, null, 2));
        console.error('ERROR TEXT:', response.text);
        fail(`Request failed with status ${response.status}`);
      }
      expect(response.status).toBe(201);
    });

    it('should return 401 without JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .send({
          profile: {
            companyName: uniqueCompanyName('Test Company'),
            companyAddress: '123 Test St',
            companyCity: 'Paris',
            companyPostalCode: '75001',
            companyCountry: 'France',
            fleetSize: 5,
          },
        })
        .expect(401);
    });

    it('should complete onboarding with profile only', async () => {
      const { tenant, token } =
        await createTestUserWithTenant('Profile Only Test');
      const companyName = uniqueCompanyName('Updated Company');

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName,
            companyAddress: '456 New St',
            companyCity: 'Lyon',
            companyPostalCode: '69001',
            companyCountry: 'France',
            fleetSize: 10,
          },
        })
        .expect(201);

      expect(response.body.message).toBe('Onboarding complété avec succès');

      // Verify tenant was updated in DB
      const updatedTenant = await tenantsRepository.findOne({
        where: { id: tenant.id },
      });
      expect(updatedTenant!.name).toBe(companyName);
      expect(updatedTenant!.address).toBe('456 New St');
      expect(updatedTenant!.city).toBe('Lyon');
      expect(updatedTenant!.postalCode).toBe('69001');
      expect(updatedTenant!.country).toBe('France');
      expect(updatedTenant!.onboardingCompleted).toBe(true);
    });

    it('should complete onboarding with profile and vehicle', async () => {
      const { tenant, user, token } = await createTestUserWithTenant(
        'Vehicle Test Company',
      );
      const companyName = uniqueCompanyName('Company With Vehicle');

      await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName,
            companyAddress: '789 Vehicle St',
            companyCity: 'Marseille',
            companyPostalCode: '13001',
            companyCountry: 'France',
            fleetSize: 15,
          },
          vehicle: {
            licensePlate: `TEST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            brand: 'Renault',
            model: 'Kangoo',
            year: 2023,
            vin: `VIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
          },
        })
        .expect(201);

      // Verify vehicle was created in DB
      const vehicles = await vehiclesRepository.find({
        where: { tenantId: user.tenantId },
      });
      expect(vehicles.length).toBeGreaterThan(0);

      const createdVehicle = vehicles[0];
      expect(createdVehicle).toBeDefined();
      expect(createdVehicle!.brand).toBe('Renault');
      expect(createdVehicle!.model).toBe('Kangoo');
      expect(createdVehicle!.year).toBe(2023);
    });

    it('should complete onboarding with profile and driver', async () => {
      const { tenant, user, token } = await createTestUserWithTenant(
        'Driver Test Company',
      );
      const driverEmail = `driver-${Date.now()}@test.com`;
      const companyName = uniqueCompanyName('Company With Driver');

      await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName,
            companyAddress: '321 Driver St',
            companyCity: 'Nice',
            companyPostalCode: '06000',
            companyCountry: 'France',
            fleetSize: 20,
          },
          driver: {
            firstName: 'John',
            lastName: 'Driver',
            email: driverEmail,
            phone: '+33612345678',
            licenseNumber: 'LIC123456',
          },
        })
        .expect(201);

      // Verify driver was created in DB
      const createdDriver = await usersRepository.findOne({
        where: { email: driverEmail, tenantId: user.tenantId },
        select: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'password'],
      });

      expect(createdDriver).toBeDefined();
      expect(createdDriver!.firstName).toBe('John');
      expect(createdDriver!.lastName).toBe('Driver');
      expect(createdDriver!.phone).toBe('+33612345678');
      expect(createdDriver!.role).toBe(UserRole.DRIVER);
      expect(createdDriver!.password).toBeDefined(); // Has hashed password
    });

    it('should complete onboarding with all data (profile + vehicle + driver)', async () => {
      const { tenant, user, token } = await createTestUserWithTenant(
        'Full Onboarding Company',
      );
      const fullDriverEmail = `full-driver-${Date.now()}@test.com`;
      const companyName = uniqueCompanyName('Complete Company');

      await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName,
            companyAddress: '999 Full St',
            companyCity: 'Toulouse',
            companyPostalCode: '31000',
            companyCountry: 'France',
            fleetSize: 25,
          },
          vehicle: {
            licensePlate: `TEST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            brand: 'Peugeot',
            model: 'Partner',
            year: 2024,
          },
          driver: {
            firstName: 'Jane',
            lastName: 'FullDriver',
            email: fullDriverEmail,
            phone: '+33698765432',
            licenseNumber: 'FULL987654',
          },
        })
        .expect(201);

      // Verify all data
      const updatedTenant = await tenantsRepository.findOne({
        where: { id: tenant.id },
      });
      expect(updatedTenant!.name).toBe(companyName);
      expect(updatedTenant!.onboardingCompleted).toBe(true);

      const vehicles = await vehiclesRepository.find({
        where: { tenantId: user.tenantId },
      });
      expect(vehicles.length).toBeGreaterThan(0);
      expect(vehicles[0].brand).toBe('Peugeot');

      const driver = await usersRepository.findOne({
        where: { email: fullDriverEmail, tenantId: user.tenantId },
      });
      expect(driver).toBeDefined();
      expect(driver!.firstName).toBe('Jane');
    });

    it('should return 400 for invalid profile data', async () => {
      const { tenant, token } = await createTestUserWithTenant(
        'Invalid Profile Test',
      );

      return request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            // Missing required fields
            companyName: uniqueCompanyName('Test'),
          },
        })
        .expect(400);
    });

    it('should return 400 for invalid vehicle data', async () => {
      const { tenant, token } = await createTestUserWithTenant(
        'Invalid Vehicle Test',
      );

      return request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName: uniqueCompanyName('Test'),
            companyAddress: '123 St',
            companyCity: 'Paris',
            companyPostalCode: '75001',
            companyCountry: 'France',
            fleetSize: 5,
          },
          vehicle: {
            licensePlate: '', // Invalid: empty
            brand: 'Brand',
            model: 'Model',
            year: 2023,
          },
        })
        .expect(400);
    });

    it('should not create duplicate driver with same email', async () => {
      const { tenant, user, token } = await createTestUserWithTenant(
        'Duplicate Driver Test',
      );
      const duplicateEmail = `duplicate-${Date.now()}@test.com`;
      const firstCompanyName = uniqueCompanyName('First');
      const secondCompanyName = uniqueCompanyName('Second');

      // First creation
      await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName: firstCompanyName,
            companyAddress: '1 St',
            companyCity: 'Paris',
            companyPostalCode: '75001',
            companyCountry: 'France',
            fleetSize: 5,
          },
          driver: {
            firstName: 'First',
            lastName: 'Driver',
            email: duplicateEmail,
            phone: '+33611111111',
            licenseNumber: 'LIC111',
          },
        })
        .expect(201);

      // Second creation with same email - should not create duplicate
      await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', tenant.id.toString())
        .send({
          profile: {
            companyName: secondCompanyName,
            companyAddress: '2 St',
            companyCity: 'Lyon',
            companyPostalCode: '69001',
            companyCountry: 'France',
            fleetSize: 10,
          },
          driver: {
            firstName: 'Second',
            lastName: 'Driver',
            email: duplicateEmail,
            phone: '+33622222222',
            licenseNumber: 'LIC222',
          },
        })
        .expect(201);

      // Verify only one driver exists
      const drivers = await usersRepository.find({
        where: { email: duplicateEmail, tenantId: user.tenantId },
      });
      expect(drivers).toHaveLength(1);
      expect(drivers[0].firstName).toBe('First'); // Original driver kept
    });
  });
});
