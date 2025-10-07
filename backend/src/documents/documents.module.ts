import { Module, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';
import * as fs from 'fs';
import { Document } from '../entities/document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentOwnershipGuard } from './guards/document-ownership.guard';
import { StorageQuotaInterceptor } from './interceptors/storage-quota.interceptor';
import { DocumentEntityExistsConstraint } from './validators/document-entity-exists.validator';
import { TenantsModule } from '../modules/tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    TenantsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tenantId = req['tenantId'] || 1;
          const uploadPath = `./uploads/${tenantId}`;

          // Créer le dossier s'il n'existe pas
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Sanitize filename: remove path traversal attempts
          const sanitized = basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${sanitized}`);
        },
      }),
      limits: {
        fileSize: configService.get<number>('MAX_FILE_SIZE', 10485760), // Default 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = /^(image\/.*|application\/pdf)$/;
        if (allowedMimes.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Type de fichier non autorisé. Types acceptés: images et PDF. Reçu: ${file.mimetype}`,
            ),
            false,
          );
        }
      },
    }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentOwnershipGuard,
    StorageQuotaInterceptor,
    DocumentEntityExistsConstraint,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
