import { IsEnum, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentEntityType } from '../../entities/document.entity';

export class QueryDocumentsDto {
  @ApiPropertyOptional({
    enum: DocumentEntityType,
    description: "Type d'entité (vehicle, driver, maintenance)",
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  entityId?: string;
}
