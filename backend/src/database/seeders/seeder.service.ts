import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Driver } from '../../entities/driver.entity';
import { TenantFactory } from './factories/tenant.factory';
import { UserFactory } from './factories/user.factory';
import { VehicleFactory } from './factories/vehicle.factory';
import { DriverFactory } from './factories/driver.factory';
import {
  TENANT_FLOTTEQ,
  TENANT_TRANSPORT_EXPRESS,
  TENANT_LOGISTRANS,
} from './data/tenants.data';
import {
  USER_WISSEM,
  USER_SUPPORT,
  USER_TE_ADMIN,
  USER_TE_MANAGER,
  USER_TE_DRIVER1,
  USER_TE_DRIVER2,
  USER_LT_ADMIN,
  USER_LT_VIEWER,
  USER_LT_DRIVER,
} from './data/users.data';
import {
  VEHICLES_TRANSPORT_EXPRESS,
  VEHICLES_LOGISTRANS,
} from './data/vehicles.data';
import {
  DRIVERS_TRANSPORT_EXPRESS,
  DRIVERS_LOGISTRANS,
} from './data/drivers.data';
import { getSeedCredentials, SeedCredentials } from './seed-security';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async seedAll(): Promise<void> {
    console.log('🌱 Starting database seeding...\n');

    const credentials = getSeedCredentials();

    await this.cleanDatabase();
    await this.seedFlotteqTenant(credentials);
    await this.seedTransportExpress(credentials.demoPassword);
    await this.seedLogistrans(credentials.demoPassword);

    console.log('\n✅ Database seeding completed successfully!');
  }

  private async cleanDatabase(): Promise<void> {
    console.log('🧹 Cleaning database...');

    // Delete in correct order to respect foreign key constraints
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query('DELETE FROM drivers');
      await queryRunner.query('DELETE FROM vehicles');
      await queryRunner.query('DELETE FROM users');
      await queryRunner.query('DELETE FROM subscriptions');
      await queryRunner.query('DELETE FROM tenants');

      // Reset sequence for tenants to ensure FlotteQ gets ID 1
      await queryRunner.query("SELECT setval('tenants_id_seq', 1, false)");

      console.log('✓ Database cleaned\n');
    } finally {
      await queryRunner.release();
    }
  }

  private async seedFlotteqTenant(credentials: SeedCredentials): Promise<void> {
    console.log('📦 Seeding FlotteQ tenant...');

    // Create FlotteQ tenant
    const flotteq = this.tenantRepo.create(TENANT_FLOTTEQ);
    await this.tenantRepo.save(flotteq);

    // Create FlotteQ users
    const wissem = UserFactory.create({
      ...USER_WISSEM,
      tenantId: flotteq.id,
      password: credentials.superAdminPassword,
    });
    const support = UserFactory.create({
      ...USER_SUPPORT,
      tenantId: flotteq.id,
      password: credentials.demoPassword,
    });

    await this.userRepo.save([wissem, support]);

    console.log('✓ FlotteQ tenant created');
    console.log(`  - Tenant ID: ${flotteq.id}`);
    console.log(`  - Super Admin: ${wissem.email}`);
    console.log(`  - Support: ${support.email}`);
  }

  private async seedTransportExpress(password: string): Promise<void> {
    console.log('\n📦 Seeding Transport Express...');

    // Create tenant
    const tenant = this.tenantRepo.create(TENANT_TRANSPORT_EXPRESS);
    await this.tenantRepo.save(tenant);

    // Create users
    const admin = UserFactory.create({
      ...USER_TE_ADMIN,
      tenantId: tenant.id,
      password,
    });
    const manager = UserFactory.create({
      ...USER_TE_MANAGER,
      tenantId: tenant.id,
      password,
    });
    const driver1 = UserFactory.create({
      ...USER_TE_DRIVER1,
      tenantId: tenant.id,
      password,
    });
    const driver2 = UserFactory.create({
      ...USER_TE_DRIVER2,
      tenantId: tenant.id,
      password,
    });

    await this.userRepo.save([admin, manager, driver1, driver2]);

    // Create vehicles
    const vehicles = VEHICLES_TRANSPORT_EXPRESS.map((v) =>
      VehicleFactory.create({ ...v, tenantId: tenant.id }),
    );
    await this.vehicleRepo.save(vehicles);

    // Create drivers
    const drivers = DRIVERS_TRANSPORT_EXPRESS.map((d) =>
      DriverFactory.create({ ...d, tenantId: tenant.id }),
    );
    await this.driverRepo.save(drivers);

    console.log('✓ Transport Express created');
    console.log(`  - Tenant ID: ${tenant.id}`);
    console.log(`  - Users: ${[admin, manager, driver1, driver2].length}`);
    console.log(`  - Vehicles: ${vehicles.length}`);
    console.log(`  - Drivers: ${drivers.length}`);
  }

  private async seedLogistrans(password: string): Promise<void> {
    console.log('\n📦 Seeding LogisTrans...');

    // Create tenant
    const tenant = this.tenantRepo.create(TENANT_LOGISTRANS);
    await this.tenantRepo.save(tenant);

    // Create users
    const admin = UserFactory.create({
      ...USER_LT_ADMIN,
      tenantId: tenant.id,
      password,
    });
    const viewer = UserFactory.create({
      ...USER_LT_VIEWER,
      tenantId: tenant.id,
      password,
    });
    const driver = UserFactory.create({
      ...USER_LT_DRIVER,
      tenantId: tenant.id,
      password,
    });

    await this.userRepo.save([admin, viewer, driver]);

    // Create vehicles
    const vehicles = VEHICLES_LOGISTRANS.map((v) =>
      VehicleFactory.create({ ...v, tenantId: tenant.id }),
    );
    await this.vehicleRepo.save(vehicles);

    // Create drivers
    const drivers = DRIVERS_LOGISTRANS.map((d) =>
      DriverFactory.create({ ...d, tenantId: tenant.id }),
    );
    await this.driverRepo.save(drivers);

    console.log('✓ LogisTrans created');
    console.log(`  - Tenant ID: ${tenant.id}`);
    console.log(`  - Users: ${[admin, viewer, driver].length}`);
    console.log(`  - Vehicles: ${vehicles.length}`);
    console.log(`  - Drivers: ${drivers.length}`);
  }
}
