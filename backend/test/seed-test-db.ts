import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SubscriptionPlan } from '../src/entities/subscription-plan.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'flotteq123',
  database: 'flotteq_test',
  entities: [
    'src/entities/**/*.entity.ts',
    'src/modules/maintenance/entities/*.entity.ts',
  ],
  synchronize: false,
  logging: false,
});

async function seedTestDb() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to flotteq_test database');

    const planRepo = AppDataSource.getRepository(SubscriptionPlan);

    // Delete existing plans (check if any exist first)
    const existingPlans = await planRepo.find();
    if (existingPlans.length > 0) {
      console.log(`Found ${existingPlans.length} existing plans, skipping seed...`);
      await AppDataSource.destroy();
      process.exit(0);
    }

    // Create the 4 standard plans with EXACT same IDs as dev
    const plans = [
      {
        id: 10,
        name: 'Starter',
        price: 29,
        maxVehicles: 10,
        maxUsers: 5,
        maxDrivers: 10,
        maxStorageMb: 1024,
        trialDays: 14,
        features: ['support_email', 'basic_reports', 'api_access', 'export_pdf'],
        isActive: true,
      },
      {
        id: 11,
        name: 'Business',
        price: 99,
        maxVehicles: 50,
        maxUsers: 20,
        maxDrivers: 50,
        maxStorageMb: 5120,
        trialDays: 14,
        features: [
          'support_priority',
          'advanced_reports',
          'api_access',
          'export_excel',
          'custom_fields',
        ],
        isActive: true,
      },
      {
        id: 12,
        name: 'Enterprise',
        price: 299,
        maxVehicles: -1,
        maxUsers: -1,
        maxDrivers: -1,
        maxStorageMb: 51200,
        trialDays: 30,
        features: [
          'support_24_7',
          'custom_reports',
          'api_access',
          'dedicated_manager',
          'sla',
          'white_label',
        ],
        isActive: true,
      },
      {
        id: 16,
        name: 'Freemium',
        price: 0,
        maxVehicles: 2,
        maxUsers: 1,
        maxDrivers: 2,
        maxStorageMb: 100,
        trialDays: 0,
        features: ['basic_dashboard', 'email_notifications'],
        isActive: true,
      },
    ];

    // Use raw query to force specific IDs
    await AppDataSource.query(`
      INSERT INTO subscription_plans (id, name, price, "maxVehicles", "maxUsers", "maxDrivers", max_storage_mb, "trialDays", features, "isActive")
      VALUES
        (10, 'Starter', 29, 10, 5, 10, 1024, 14, '["support_email","basic_reports","api_access","export_pdf"]', true),
        (11, 'Business', 99, 50, 20, 50, 5120, 14, '["support_priority","advanced_reports","api_access","export_excel","custom_fields"]', true),
        (12, 'Enterprise', 299, -1, -1, -1, 51200, 30, '["support_24_7","custom_reports","api_access","dedicated_manager","sla","white_label"]', true),
        (16, 'Freemium', 0, 2, 1, 2, 100, 0, '["basic_dashboard","email_notifications"]', true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`✅ Seeded 4 subscription plans (IDs: 10, 11, 12, 16)`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedTestDb();
