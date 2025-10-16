import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Vidange complète' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Vidange moteur + filtre à huile + filtre à air' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 89.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
