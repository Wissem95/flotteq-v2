import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { getAppConfig } from './core/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = getAppConfig();

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: config.corsOrigin.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FlotteQ API')
    .setDescription('Multi-tenant fleet management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.port);
  console.log(`🚀 FlotteQ API is running on: http://localhost:${config.port}`);
  console.log(`📚 Swagger docs: http://localhost:${config.port}/api/docs`);
}
bootstrap();
