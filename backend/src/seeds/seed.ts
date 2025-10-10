import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { Driver, DriverStatus } from '../entities/driver.entity';
import { Maintenance, MaintenanceType, MaintenanceStatus } from '../modules/maintenance/entities/maintenance.entity';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting seed...');

  // Clear existing data (attention en production!)
  await dataSource.query('TRUNCATE TABLE maintenances CASCADE');
  await dataSource.query('TRUNCATE TABLE vehicles CASCADE');
  await dataSource.query('TRUNCATE TABLE drivers CASCADE');
  await dataSource.query('TRUNCATE TABLE subscriptions CASCADE');
  await dataSource.query('TRUNCATE TABLE subscription_plans CASCADE');
  await dataSource.query('TRUNCATE TABLE users CASCADE');
  await dataSource.query('TRUNCATE TABLE tenants CASCADE');

  // Create tenants first (required for foreign keys)
  const tenants = await createTenants(dataSource);
  console.log(`✅ Created ${tenants.length} tenants`);

  // Create subscription plans and subscriptions
  await createSubscriptionPlans(dataSource, tenants);

  // Create users for different tenants
  const users = await createUsers(dataSource, tenants);
  console.log(`✅ Created ${users.length} users`);

  // Update users with roles
  await updateUsersWithRoles(dataSource, tenants);

  // Create drivers
  const drivers = await createDrivers(dataSource);
  console.log(`✅ Created ${drivers.length} drivers`);

  // Create vehicles
  const vehicles = await createVehicles(dataSource, drivers);
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create maintenances
  const maintenances = await createMaintenances(dataSource, vehicles);
  console.log(`✅ Created ${maintenances.length} maintenances`);

  console.log('🎉 Seed completed successfully!');
  await app.close();
}

async function createUsers(dataSource: DataSource, tenants: Tenant[]) {
  const userRepo = dataSource.getRepository(User);
  const password = await bcrypt.hash('Test12345', 12);

  const usersData = [
    // Tenant 1 - FlotteQ Demo
    { email: 'admin@flotteq.com', firstName: 'Admin', lastName: 'FlotteQ', tenantId: tenants[0].id, password },
    { email: 'manager@flotteq.com', firstName: 'Manager', lastName: 'FlotteQ', tenantId: tenants[0].id, password },
    { email: 'user@flotteq.com', firstName: 'User', lastName: 'FlotteQ', tenantId: tenants[0].id, password },

    // Tenant 2 - Transport Express SARL
    { email: 'admin@transport-express.fr', firstName: 'Admin', lastName: 'Transport', tenantId: tenants[1].id, password },
    { email: 'fleet@transport-express.fr', firstName: 'Fleet', lastName: 'Manager', tenantId: tenants[1].id, password },

    // Tenant 3 - LogisTransaction
    { email: 'admin@logistrans.com', firstName: 'Paul', lastName: 'Dubois', tenantId: tenants[2].id, password },
    { email: 'viewer@logistrans.com', firstName: 'Claire', lastName: 'Moreau', tenantId: tenants[2].id, password },
    { email: 'driver@logistrans.com', firstName: 'Pierre', lastName: 'Durand', tenantId: tenants[2].id, password },
  ];

  return userRepo.save(usersData);
}

async function createDrivers(dataSource: DataSource) {
  const driverRepo = dataSource.getRepository(Driver);

  const driversData = [
    // Tenant 1 Drivers
    {
      firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@flotteq.com',
      phone: '+33612345678', licenseNumber: 'FR001234567',
      licenseExpiryDate: new Date('2025-12-31'), status: DriverStatus.ACTIVE,
      tenantId: 1, city: 'Paris', postalCode: '75001',
      birthDate: new Date('1985-03-15'),
      address: '12 rue de la Paix',
      emergencyContact: 'Sophie Martin',
      emergencyPhone: '+33698765432'
    },
    {
      firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@flotteq.com',
      phone: '+33623456789', licenseNumber: 'FR001234568',
      licenseExpiryDate: new Date('2026-06-30'), status: DriverStatus.ACTIVE,
      tenantId: 1, city: 'Lyon', postalCode: '69001',
      birthDate: new Date('1990-07-22'),
      address: '45 avenue de la République',
      emergencyContact: 'Paul Dubois',
      emergencyPhone: '+33687654321'
    },
    {
      firstName: 'Pierre', lastName: 'Lefevre', email: 'pierre.lefevre@flotteq.com',
      phone: '+33634567890', licenseNumber: 'FR001234569',
      licenseExpiryDate: new Date('2025-03-15'), status: DriverStatus.ON_LEAVE,
      tenantId: 1, city: 'Marseille', postalCode: '13001',
      birthDate: new Date('1988-11-05'),
      address: '78 boulevard des Dames',
      emergencyContact: 'Claire Lefevre',
      emergencyPhone: '+33676543210'
    },
    {
      firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@flotteq.com',
      phone: '+33645678901', licenseNumber: 'FR001234570',
      licenseExpiryDate: new Date('2027-01-20'), status: DriverStatus.ACTIVE,
      tenantId: 1, city: 'Toulouse', postalCode: '31000',
      birthDate: new Date('1992-05-18'),
      address: '23 rue Alsace Lorraine'
    },
    {
      firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@flotteq.com',
      phone: '+33656789012', licenseNumber: 'FR001234571',
      licenseExpiryDate: new Date('2026-09-12'), status: DriverStatus.ACTIVE,
      tenantId: 1, city: 'Nice', postalCode: '06000',
      birthDate: new Date('1987-02-28'),
      address: '67 promenade des Anglais'
    },

    // Tenant 2 Drivers (Transport Express SARL)
    {
      firstName: 'Luc', lastName: 'Moreau', email: 'luc.moreau@transport-express.fr',
      phone: '+33667890123', licenseNumber: 'FR002234567',
      licenseExpiryDate: new Date('2026-04-15'), status: DriverStatus.ACTIVE,
      tenantId: 2, city: 'Nantes', postalCode: '44000',
      birthDate: new Date('1986-08-10'),
      address: '89 rue de Strasbourg'
    },
    {
      firstName: 'Julie', lastName: 'Roux', email: 'julie.roux@transport-express.fr',
      phone: '+33678901234', licenseNumber: 'FR002234568',
      licenseExpiryDate: new Date('2027-02-28'), status: DriverStatus.ACTIVE,
      tenantId: 2, city: 'Bordeaux', postalCode: '33000',
      birthDate: new Date('1991-12-03'),
      address: '34 cours de l\'Intendance'
    },

    // Tenant 3 Drivers (LogisTransaction)
    {
      firstName: 'Marc', lastName: 'Girard', email: 'marc.girard@logistrans.com',
      phone: '+33689012345', licenseNumber: 'FR003234567',
      licenseExpiryDate: new Date('2025-11-30'), status: DriverStatus.ACTIVE,
      tenantId: 3, city: 'Lille', postalCode: '59000',
      birthDate: new Date('1989-04-17'),
      address: '56 rue Nationale'
    },
    {
      firstName: 'Emma', lastName: 'Simon', email: 'emma.simon@logistrans.com',
      phone: '+33690123456', licenseNumber: 'FR003234568',
      licenseExpiryDate: new Date('2026-07-22'), status: DriverStatus.ACTIVE,
      tenantId: 3, city: 'Strasbourg', postalCode: '67000',
      birthDate: new Date('1993-09-25'),
      address: '12 place Kléber'
    },
    {
      firstName: 'Alex', lastName: 'Laurent', email: 'alex.laurent@logistrans.com',
      phone: '+33601234567', licenseNumber: 'FR003234569',
      licenseExpiryDate: new Date('2025-05-10'), status: DriverStatus.INACTIVE,
      tenantId: 3, city: 'Rennes', postalCode: '35000',
      birthDate: new Date('1984-01-30'),
      address: '45 rue de la Monnaie'
    },
  ];

  return driverRepo.save(driversData);
}

async function createVehicles(dataSource: DataSource, drivers: Driver[]) {
  const vehicleRepo = dataSource.getRepository(Vehicle);

  const vehiclesData = [
    // Tenant 1 Vehicles
    {
      registration: 'AA-111-AA', brand: 'Renault', model: 'Master',
      year: 2023, currentKm: 15000, status: VehicleStatus.IN_USE,
      vin: 'VF1MA000000000001', color: 'Blanc', tenantId: 1,
      assignedDriverId: drivers[0].id, // Jean Martin
      purchaseDate: new Date('2023-01-15'), purchasePrice: 45000
    },
    {
      registration: 'BB-222-BB', brand: 'Peugeot', model: 'Boxer',
      year: 2023, currentKm: 8000, status: VehicleStatus.IN_USE,
      vin: 'VF3YBBBBBBBBBB002', color: 'Gris', tenantId: 1,
      assignedDriverId: drivers[1].id, // Marie Dubois
      purchaseDate: new Date('2023-03-01'), purchasePrice: 42000
    },
    {
      registration: 'CC-333-CC', brand: 'Mercedes', model: 'Sprinter',
      year: 2022, currentKm: 35000, status: VehicleStatus.MAINTENANCE,
      vin: 'WDB9066331S000003', color: 'Bleu', tenantId: 1,
      assignedDriverId: null,
      purchaseDate: new Date('2022-06-15'), purchasePrice: 55000
    },
    {
      registration: 'DD-444-DD', brand: 'Fiat', model: 'Ducato',
      year: 2023, currentKm: 12000, status: VehicleStatus.IN_USE,
      vin: 'ZFA25000000000004', color: 'Rouge', tenantId: 1,
      assignedDriverId: drivers[3].id, // Sophie Bernard
      purchaseDate: new Date('2023-02-20'), purchasePrice: 38000
    },
    {
      registration: 'EE-555-EE', brand: 'Ford', model: 'Transit',
      year: 2022, currentKm: 28000, status: VehicleStatus.IN_USE,
      vin: 'WF0XXXTTFXXX00005', color: 'Blanc', tenantId: 1,
      assignedDriverId: drivers[4].id, // Thomas Petit
      purchaseDate: new Date('2022-09-10'), purchasePrice: 41000
    },
    {
      registration: 'FF-666-FF', brand: 'Renault', model: 'Kangoo',
      year: 2024, currentKm: 3000, status: VehicleStatus.AVAILABLE,
      vin: 'VF1XXXXXX00000006', color: 'Vert', tenantId: 1,
      purchaseDate: new Date('2024-01-05'), purchasePrice: 28000
    },

    // Tenant 2 Vehicles
    {
      registration: 'GG-777-GG', brand: 'Mercedes', model: 'Vito',
      year: 2023, currentKm: 18000, status: VehicleStatus.IN_USE,
      vin: 'WDF4470001X000007', color: 'Noir', tenantId: 2,
      assignedDriverId: drivers[5].id, // Luc Moreau
      purchaseDate: new Date('2023-04-12'), purchasePrice: 48000
    },
    {
      registration: 'HH-888-HH', brand: 'Volkswagen', model: 'Crafter',
      year: 2022, currentKm: 32000, status: VehicleStatus.IN_USE,
      vin: 'WV1ZZZ2EZ00000008', color: 'Blanc', tenantId: 2,
      assignedDriverId: drivers[6].id, // Julie Roux
      purchaseDate: new Date('2022-07-20'), purchasePrice: 52000
    },
    {
      registration: 'II-999-II', brand: 'Renault', model: 'Master',
      year: 2023, currentKm: 22000, status: VehicleStatus.MAINTENANCE,
      vin: 'VF1MA000000000009', color: 'Gris', tenantId: 2,
      purchaseDate: new Date('2023-05-08'), purchasePrice: 46000
    },
    {
      registration: 'JJ-111-JJ', brand: 'Peugeot', model: 'Partner',
      year: 2024, currentKm: 5000, status: VehicleStatus.AVAILABLE,
      vin: 'VF3XXXXXX00000010', color: 'Bleu', tenantId: 2,
      purchaseDate: new Date('2024-02-15'), purchasePrice: 25000
    },

    // Tenant 3 Vehicles
    {
      registration: 'KK-222-KK', brand: 'Citroën', model: 'Jumper',
      year: 2023, currentKm: 16000, status: VehicleStatus.IN_USE,
      vin: 'VF7YXXXXX00000011', color: 'Blanc', tenantId: 3,
      assignedDriverId: drivers[7].id, // Marc Girard
      purchaseDate: new Date('2023-06-01'), purchasePrice: 43000
    },
    {
      registration: 'LL-333-LL', brand: 'Iveco', model: 'Daily',
      year: 2022, currentKm: 41000, status: VehicleStatus.IN_USE,
      vin: 'ZCFC3500000000012', color: 'Rouge', tenantId: 3,
      assignedDriverId: drivers[8].id, // Emma Simon
      purchaseDate: new Date('2022-08-18'), purchasePrice: 49000
    },
    {
      registration: 'MM-444-MM', brand: 'Ford', model: 'Transit Custom',
      year: 2023, currentKm: 19000, status: VehicleStatus.OUT_OF_SERVICE,
      vin: 'WF0XXXTTFXXX00013', color: 'Gris', tenantId: 3,
      purchaseDate: new Date('2023-03-22'), purchasePrice: 39000
    },
    {
      registration: 'NN-555-NN', brand: 'Renault', model: 'Trafic',
      year: 2024, currentKm: 7000, status: VehicleStatus.AVAILABLE,
      vin: 'VF1JXXXXX00000014', color: 'Noir', tenantId: 3,
      purchaseDate: new Date('2024-01-20'), purchasePrice: 35000
    },
    {
      registration: 'OO-666-OO', brand: 'Mercedes', model: 'Sprinter',
      year: 2021, currentKm: 68000, status: VehicleStatus.MAINTENANCE,
      vin: 'WDB9066331S000015', color: 'Blanc', tenantId: 3,
      purchaseDate: new Date('2021-05-10'), purchasePrice: 53000
    },
  ];

  return vehicleRepo.save(vehiclesData);
}

async function createMaintenances(dataSource: DataSource, vehicles: Vehicle[]) {
  const maintenanceRepo = dataSource.getRepository(Maintenance);

  const maintenancesData = [
    // Tenant 1 Maintenances
    {
      vehicleId: vehicles[0].id, // AA-111-AA
      type: MaintenanceType.OIL_CHANGE,
      description: 'Vidange + filtre à huile + filtre à air',
      scheduledDate: new Date('2025-11-01'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 180,
      performedBy: 'Garage Central',
      nextMaintenanceKm: 25000,
      tenantId: 1
    },
    {
      vehicleId: vehicles[1].id, // BB-222-BB
      type: MaintenanceType.TIRE_CHANGE,
      description: 'Changement 4 pneus Michelin Agilis',
      scheduledDate: new Date('2025-10-15'),
      completedDate: new Date('2025-10-15'),
      status: MaintenanceStatus.COMPLETED,
      cost: 520,
      performedBy: 'Euromaster Lyon',
      tenantId: 1
    },
    {
      vehicleId: vehicles[2].id, // CC-333-CC
      type: MaintenanceType.CORRECTIVE,
      description: 'Réparation système de freinage ABS',
      scheduledDate: new Date('2025-09-28'),
      status: MaintenanceStatus.IN_PROGRESS,
      cost: 850,
      performedBy: 'Mercedes Service',
      tenantId: 1
    },
    {
      vehicleId: vehicles[0].id, // AA-111-AA
      type: MaintenanceType.INSPECTION,
      description: 'Contrôle technique périodique',
      scheduledDate: new Date('2025-08-15'),
      completedDate: new Date('2025-08-15'),
      status: MaintenanceStatus.COMPLETED,
      cost: 95,
      performedBy: 'Dekra Paris',
      tenantId: 1
    },
    {
      vehicleId: vehicles[3].id, // DD-444-DD
      type: MaintenanceType.PREVENTIVE,
      description: 'Révision 20 000 km',
      scheduledDate: new Date('2025-11-10'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 320,
      performedBy: 'Fiat Service',
      nextMaintenanceKm: 40000,
      tenantId: 1
    },
    {
      vehicleId: vehicles[4].id, // EE-555-EE
      type: MaintenanceType.OIL_CHANGE,
      description: 'Vidange complète Ford Transit',
      scheduledDate: new Date('2025-10-20'),
      completedDate: new Date('2025-10-20'),
      status: MaintenanceStatus.COMPLETED,
      cost: 165,
      performedBy: 'Ford Toulouse',
      nextMaintenanceKm: 38000,
      tenantId: 1
    },
    {
      vehicleId: vehicles[5].id, // FF-666-FF
      type: MaintenanceType.INSPECTION,
      description: 'Première révision véhicule neuf',
      scheduledDate: new Date('2025-12-01'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 150,
      performedBy: 'Renault Nice',
      nextMaintenanceKm: 15000,
      tenantId: 1
    },

    // Tenant 2 Maintenances
    {
      vehicleId: vehicles[6].id, // GG-777-GG
      type: MaintenanceType.PREVENTIVE,
      description: 'Révision 30 000 km Mercedes Vito',
      scheduledDate: new Date('2025-10-25'),
      completedDate: new Date('2025-10-25'),
      status: MaintenanceStatus.COMPLETED,
      cost: 450,
      performedBy: 'Mercedes Nantes',
      nextMaintenanceKm: 50000,
      tenantId: 2
    },
    {
      vehicleId: vehicles[7].id, // HH-888-HH
      type: MaintenanceType.TIRE_CHANGE,
      description: 'Remplacement pneus avant',
      scheduledDate: new Date('2025-11-05'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 380,
      performedBy: 'Point S Bordeaux',
      tenantId: 2
    },
    {
      vehicleId: vehicles[8].id, // II-999-II
      type: MaintenanceType.CORRECTIVE,
      description: 'Réparation turbo + vanne EGR',
      scheduledDate: new Date('2025-09-30'),
      status: MaintenanceStatus.IN_PROGRESS,
      cost: 1250,
      performedBy: 'Renault Pro Nantes',
      tenantId: 2
    },
    {
      vehicleId: vehicles[6].id, // GG-777-GG
      type: MaintenanceType.OIL_CHANGE,
      description: 'Vidange Mercedes + contrôles',
      scheduledDate: new Date('2025-07-10'),
      completedDate: new Date('2025-07-10'),
      status: MaintenanceStatus.COMPLETED,
      cost: 220,
      performedBy: 'Mercedes Nantes',
      tenantId: 2
    },
    {
      vehicleId: vehicles[9].id, // JJ-111-JJ
      type: MaintenanceType.INSPECTION,
      description: 'Inspection post-livraison',
      scheduledDate: new Date('2025-11-15'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 0,
      performedBy: 'Peugeot Bordeaux',
      tenantId: 2
    },

    // Tenant 3 Maintenances
    {
      vehicleId: vehicles[10].id, // KK-222-KK
      type: MaintenanceType.PREVENTIVE,
      description: 'Révision annuelle Citroën Jumper',
      scheduledDate: new Date('2025-11-08'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 380,
      performedBy: 'Citroën Lille',
      nextMaintenanceKm: 30000,
      tenantId: 3
    },
    {
      vehicleId: vehicles[11].id, // LL-333-LL
      type: MaintenanceType.CORRECTIVE,
      description: 'Remplacement embrayage complet',
      scheduledDate: new Date('2025-09-20'),
      completedDate: new Date('2025-09-20'),
      status: MaintenanceStatus.COMPLETED,
      cost: 1450,
      performedBy: 'Iveco Strasbourg',
      tenantId: 3
    },
    {
      vehicleId: vehicles[12].id, // MM-444-MM
      type: MaintenanceType.INSPECTION,
      description: 'Contrôle pré-vente',
      scheduledDate: new Date('2025-08-30'),
      completedDate: new Date('2025-08-30'),
      status: MaintenanceStatus.COMPLETED,
      cost: 120,
      performedBy: 'Ford Rennes',
      tenantId: 3
    },
    {
      vehicleId: vehicles[13].id, // NN-555-NN
      type: MaintenanceType.OIL_CHANGE,
      description: 'Première vidange Trafic',
      scheduledDate: new Date('2025-10-28'),
      completedDate: new Date('2025-10-28'),
      status: MaintenanceStatus.COMPLETED,
      cost: 145,
      performedBy: 'Renault Lille',
      nextMaintenanceKm: 20000,
      tenantId: 3
    },
    {
      vehicleId: vehicles[14].id, // OO-666-OO
      type: MaintenanceType.PREVENTIVE,
      description: 'Grande révision 70 000 km',
      scheduledDate: new Date('2025-10-05'),
      status: MaintenanceStatus.IN_PROGRESS,
      cost: 980,
      performedBy: 'Mercedes Strasbourg',
      nextMaintenanceKm: 90000,
      tenantId: 3
    },
    {
      vehicleId: vehicles[10].id, // KK-222-KK
      type: MaintenanceType.TIRE_CHANGE,
      description: 'Changement pneus hiver',
      scheduledDate: new Date('2025-11-20'),
      status: MaintenanceStatus.SCHEDULED,
      cost: 560,
      performedBy: 'Citroën Lille',
      tenantId: 3
    },
    {
      vehicleId: vehicles[11].id, // LL-333-LL
      type: MaintenanceType.OIL_CHANGE,
      description: 'Vidange Iveco Daily',
      scheduledDate: new Date('2025-06-15'),
      completedDate: new Date('2025-06-15'),
      status: MaintenanceStatus.COMPLETED,
      cost: 190,
      performedBy: 'Iveco Strasbourg',
      tenantId: 3
    },
    {
      vehicleId: vehicles[14].id, // OO-666-OO
      type: MaintenanceType.CORRECTIVE,
      description: 'Réparation injecteur cylindre 3',
      scheduledDate: new Date('2025-07-22'),
      completedDate: new Date('2025-07-22'),
      status: MaintenanceStatus.COMPLETED,
      cost: 720,
      performedBy: 'Mercedes Strasbourg',
      tenantId: 3
    },
  ];

  return maintenanceRepo.save(maintenancesData);
}

async function createTenants(dataSource: DataSource) {
  const tenantRepo = dataSource.getRepository(Tenant);

  const tenantsData = [
    // Tenant 1 - FlotteQ (entreprise principale)
    {
      name: 'FlotteQ',
      email: 'contact@flotteq.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue de la Flotte',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      status: TenantStatus.ACTIVE,
    },
    // Tenant 2 - Transport Express SARL
    {
      name: 'Transport Express SARL',
      email: 'admin@transport-express.fr',
      phone: '+33 1 98 76 54 32',
      address: '45 Rue de la Logistique',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France',
      status: TenantStatus.ACTIVE,
    },
    // Tenant 3 - LogisTransaction
    {
      name: 'LogisTransaction',
      email: 'contact@logistrans.com',
      phone: '+33 4 56 78 90 12',
      address: '78 Boulevard du Commerce',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France',
      status: TenantStatus.ACTIVE,
    },
  ];

  return tenantRepo.save(tenantsData);
}

async function createSubscriptionPlans(dataSource: DataSource, tenants: Tenant[]) {
  const planRepo = dataSource.getRepository(SubscriptionPlan);
  const subscriptionRepo = dataSource.getRepository(Subscription);

  console.log('🌱 Creating subscription plans...');

  const plans = [
    {
      name: 'Freemium',
      price: 0,
      maxVehicles: 2,
      maxUsers: 1,
      maxDrivers: 2,
      maxStorageMb: 100, // 100MB
      trialDays: 0, // Pas d'essai car c'est gratuit
      features: ['basic_dashboard', 'email_notifications'],
      isActive: true,
    },
    {
      name: 'Starter',
      price: 29,
      maxVehicles: 10,
      maxUsers: 5,
      maxDrivers: 10,
      maxStorageMb: 1024, // 1GB
      trialDays: 14, // 14 jours d'essai
      features: ['support_email', 'basic_reports', 'api_access', 'export_pdf'],
      isActive: true,
    },
    {
      name: 'Business',
      price: 99,
      maxVehicles: 50,
      maxUsers: 20,
      maxDrivers: 50,
      maxStorageMb: 5120, // 5GB
      trialDays: 14, // 14 jours d'essai
      features: ['support_priority', 'advanced_reports', 'api_access', 'export_excel', 'custom_fields'],
      isActive: true,
    },
    {
      name: 'Enterprise',
      price: 299,
      maxVehicles: -1, // Illimité
      maxUsers: -1,
      maxDrivers: -1,
      maxStorageMb: 51200, // 50GB
      trialDays: 30, // 30 jours d'essai pour Enterprise
      features: ['support_24_7', 'custom_reports', 'api_access', 'dedicated_manager', 'sla', 'white_label'],
      isActive: true,
    },
  ];

  const createdPlans = await planRepo.save(plans);
  console.log(`✅ Created ${createdPlans.length} subscription plans`);

  // Créer des abonnements pour les tenants existants
  for (const tenant of tenants) {
    // FlotteQ (tenant 1) = Enterprise
    // Transport Express (tenant 2) = Business
    // Logistique Rapide (tenant 3) = Starter (en trial)
    let plan: SubscriptionPlan;
    let status: SubscriptionStatus;

    if (tenant.id === 1) {
      plan = createdPlans.find(p => p.name === 'Enterprise')!;
      status = SubscriptionStatus.ACTIVE;
    } else if (tenant.id === 2) {
      plan = createdPlans.find(p => p.name === 'Business')!;
      status = SubscriptionStatus.ACTIVE;
    } else {
      plan = createdPlans.find(p => p.name === 'Starter')!;
      status = SubscriptionStatus.ACTIVE;
    }

    const subscriptionData: any = {
      tenantId: tenant.id,
      planId: plan.id,
      status,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usage: {
        vehicles: 0,
        users: 0,
        drivers: 0,
      },
    };

    // Plus de période d'essai

    const subscription = subscriptionRepo.create(subscriptionData);
    await subscriptionRepo.save(subscription);
  }

  console.log(`✅ Created subscriptions for ${tenants.length} tenants`);
}

async function updateUsersWithRoles(dataSource: DataSource, tenants: Tenant[]) {
  const userRepo = dataSource.getRepository(User);

  // Mettre à jour les rôles des users existants
  await userRepo.update(
    { email: 'admin@flotteq.com', tenantId: tenants[0].id },
    { role: UserRole.SUPER_ADMIN, isActive: true }
  );

  await userRepo.update(
    { email: 'manager@flotteq.com', tenantId: tenants[0].id },
    { role: UserRole.SUPPORT, isActive: true }
  );

  await userRepo.update(
    { email: 'user@flotteq.com', tenantId: tenants[0].id },
    { role: UserRole.VIEWER, isActive: true }
  );

  await userRepo.update(
    { email: 'admin@transport.com', tenantId: tenants[1].id },
    { role: UserRole.TENANT_ADMIN, isActive: true }
  );

  await userRepo.update(
    { email: 'fleet@transport.com', tenantId: tenants[1].id },
    { role: UserRole.MANAGER, isActive: true }
  );

  await userRepo.update(
    { email: 'admin@livraison.com', tenantId: tenants[2].id },
    { role: UserRole.TENANT_ADMIN, isActive: true }
  );

  console.log('✅ Updated user roles');
}

seed().catch(console.error);