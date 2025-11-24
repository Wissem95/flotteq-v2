import { DataSource } from 'typeorm';
import { config } from 'dotenv';

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
  migrations: [],
  synchronize: true, // Auto-create schema for tests
  logging: false,
});

async function setupTestDb() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to flotteq_test database');
    console.log('✅ Schema synchronized successfully');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

setupTestDb();
