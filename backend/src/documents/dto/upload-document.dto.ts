import { IsEnum, IsUUID, IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentEntityType, DocumentType } from '../../entities/document.entity';
import { ValidateDocumentEntity } from '../validators/document-entity-exists.validator';

export class UploadDocumentDto {
  @ApiProperty({
    enum: DocumentEntityType,
    description: 'Type d\'entité (vehicle, driver, maintenance)',
    example: 'vehicle',
  })
  @IsEnum(DocumentEntityType)
  entityType: DocumentEntityType;

  @ApiProperty({
    format: 'uuid',
    description: 'UUID de l\'entité',
    example: 'e8c3d514-1e4b-4a8f-b7c1-d5e590a9df8b',
  })
  @IsUUID()
  @ValidateDocumentEntity({
    message: 'L\'entité référencée n\'existe pas en base de données',
  })
  entityId: string;

  @ApiPropertyOptional({
    enum: DocumentType,
    description: 'Type de document',
    example: 'permis',
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'Date d\'expiration du document',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Notes optionnelles',
    example: 'Document renouvelé',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
