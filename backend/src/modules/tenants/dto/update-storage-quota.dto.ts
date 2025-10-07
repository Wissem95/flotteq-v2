import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStorageQuotaDto {
  @ApiProperty({
    description: 'Quota de stockage personnalisé en MB (remplace le quota du plan)',
    example: 2048,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Le quota doit être un nombre entier' })
  @Min(0, { message: 'Le quota ne peut pas être négatif' })
  customStorageQuotaMb?: number;
}

export class StorageUsageResponseDto {
  @ApiProperty({ description: 'Nom du tenant' })
  tenantName: string;

  @ApiProperty({ description: 'Plan actuel du tenant' })
  planName: string;

  @ApiProperty({ description: 'Quota par défaut du plan (MB)' })
  planQuotaMb: number;

  @ApiProperty({ description: 'Quota personnalisé si défini (MB)', required: false })
  customQuotaMb?: number;

  @ApiProperty({ description: 'Quota effectif utilisé (MB)' })
  effectiveQuotaMb: number;

  @ApiProperty({ description: 'Espace utilisé (MB)' })
  usedMb: number;

  @ApiProperty({ description: 'Espace disponible (MB)' })
  availableMb: number;

  @ApiProperty({ description: 'Pourcentage d\'utilisation' })
  usagePercent: number;

  @ApiProperty({ description: 'Nombre de fichiers' })
  fileCount: number;
}
