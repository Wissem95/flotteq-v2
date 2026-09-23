import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  ParseEnumPipe,
  Patch,
  Req,
  Res,
  StreamableFile,
  NotFoundException,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { basename, isAbsolute, resolve, sep } from 'path';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { PartnerDocumentsService } from './partner-documents.service';
import {
  PartnerDocumentSource,
  VerifyPartnerDocumentDto,
} from './dto/verify-partner-document.dto';

@ApiTags('partner-documents')
@ApiBearerAuth()
@Controller('partners/:partnerId/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerDocumentsController {
  constructor(
    private readonly partnerDocumentsService: PartnerDocumentsService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Liste les justificatifs d’un partenaire pour vérification',
  })
  async findByPartner(@Param('partnerId', ParseUUIDPipe) partnerId: string) {
    return this.partnerDocumentsService.findByPartner(partnerId);
  }

  @Patch(':documentId/verification')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Valide ou refuse un justificatif partenaire' })
  async verify(
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: VerifyPartnerDocumentDto,
    @Req() request: Request & { user?: { id?: string } },
  ) {
    return this.partnerDocumentsService.verify(
      partnerId,
      documentId,
      dto,
      request.user?.id || '',
    );
  }

  @Get(':documentId/download')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Télécharge un justificatif partenaire' })
  async download(
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('source', new ParseEnumPipe(PartnerDocumentSource))
    source: PartnerDocumentSource,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const document = await this.partnerDocumentsService.getDownload(
      partnerId,
      documentId,
      source,
    );
    const uploadRoot = resolve(process.cwd(), 'uploads') + sep;
    const filePath = isAbsolute(document.filePath)
      ? resolve(document.filePath)
      : resolve(process.cwd(), document.filePath);

    if (!filePath.startsWith(uploadRoot) || !existsSync(filePath)) {
      throw new NotFoundException('Fichier introuvable');
    }

    response.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${basename(document.fileName).replace(/["\\\r\n]/g, '_')}"`,
    });
    return new StreamableFile(createReadStream(filePath));
  }
}
