import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  console.log('🌱 FlotteQ Database Seeder\n');

  const app = await NestFactory.createApplicationContext(SeederModule, {
    logger: ['error', 'warn'],
  });

  const seeder = app.get(SeederService);

  try {
    await seeder.seedAll();
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await app.close();
    process.exit(1);
  }
}

bootstrap();
