import { ApiProperty } from '@nestjs/swagger';
import {
  DocumentType,
  DocumentEntityType,
} from '../../entities/document.entity';

export class ExpiringDocumentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty({ enum: DocumentEntityType })
  entityType: DocumentEntityType;

  @ApiProperty({ format: 'uuid' })
  entityId: string;

  @ApiProperty({ description: "Date d'expiration du document" })
  expiryDate: Date;

  @ApiProperty({ description: 'Nombre de jours avant expiration', example: 15 })
  daysUntilExpiry: number;

  @ApiProperty({
    description: "Niveau d'urgence",
    enum: ['critical', 'warning', 'info'],
  })
  urgencyLevel: 'critical' | 'warning' | 'info';
}
