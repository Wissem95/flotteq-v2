import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './modules/audit/audit.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Register global audit interceptor
  const reflector = app.get(Reflector);
  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(reflector, auditService));

  // Enable DI for class-validator (custom validators)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const port = configService.get('PORT', 3000);
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3001');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // JSON body parser - skip for Stripe webhook route
  app.use(
    json({
      limit: '50mb', // Augmenter la limite pour les uploads de photos
      verify: (req: any, res, buf) => {
        if (req.originalUrl === '/api/stripe/webhook') {
          req.rawBody = buf;
        }
      },
    }),
  );

  // URL encoded body parser avec limite augmentée
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir les fichiers statiques du dossier uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

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

  await app.listen(port);
  console.log(`🚀 FlotteQ API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
