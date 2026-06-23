import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentVerificationStatus } from '../../entities/document.entity';

export class VerifyDocumentDto {
  @ApiProperty({
    enum: DocumentVerificationStatus,
    example: DocumentVerificationStatus.APPROVED,
    description: 'Nouveau statut de vérification',
  })
  @IsEnum(DocumentVerificationStatus)
  status: DocumentVerificationStatus;

  @ApiPropertyOptional({
    example: 'Document illisible, merci de renvoyer un scan net',
    description: 'Motif (recommandé en cas de refus)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
