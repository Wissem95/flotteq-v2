import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseUUIDPipe,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { TenantId } from '../core/tenant/tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { DocumentOwnershipGuard } from './guards/document-ownership.guard';
import { StorageQuotaInterceptor } from './interceptors/storage-quota.interceptor';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { Document } from '../entities/document.entity';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, DocumentOwnershipGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload un document lié à une entité',
    description: 'Upload un fichier PDF/image et l\'associe à un véhicule, conducteur ou maintenance',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'entityType', 'entityId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier à uploader (PDF, PNG, JPG, JPEG)',
        },
        entityType: {
          type: 'string',
          enum: ['vehicle', 'driver', 'maintenance'],
          description: 'Type d\'entité à associer',
        },
        entityId: {
          type: 'string',
          format: 'uuid',
          description: 'UUID de l\'entité',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploadé avec succès', type: Document })
  @ApiResponse({ status: 400, description: 'Validation échouée (entityId invalide, format fichier incorrect)' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes' })
  @ApiResponse({ status: 413, description: 'Quota de stockage dépassé' })
  @UseInterceptors(FileInterceptor('file'), StorageQuotaInterceptor)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser('id') userId: string,
    @TenantId() tenantId: number,
  ) {
    return this.documentsService.create(
      file,
      dto.entityType,
      dto.entityId,
      userId,
      tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Liste les documents du tenant avec filtres optionnels' })
  @ApiResponse({ status: 200, description: 'Liste des documents', type: [Document] })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findAll(
    @Query() query: QueryDocumentsDto,
    @TenantId() tenantId: number,
  ) {
    return this.documentsService.findAll(tenantId, query.entityType, query.entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère les métadonnées d\'un document' })
  @ApiResponse({ status: 200, description: 'Métadonnées du document', type: Document })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    return this.documentsService.findOne(id, tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Télécharge le fichier physique' })
  @ApiResponse({ status: 200, description: 'Fichier binaire' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Fichier introuvable sur disque' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const document = await this.documentsService.findOne(id, tenantId);

    // Vérifier l'existence physique du fichier
    if (!existsSync(document.fileUrl)) {
      throw new NotFoundException(
        `Fichier physique introuvable sur le disque: ${document.fileName}`,
      );
    }

    const file = createReadStream(document.fileUrl);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime un document (soft delete)' })
  @ApiResponse({ status: 200, description: 'Document supprimé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Seul l\'uploader ou admin peut supprimer' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: number,
  ) {
    await this.documentsService.remove(id, tenantId);
    return { message: 'Document supprimé' };
  }
}
