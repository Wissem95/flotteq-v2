import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Vidange complète' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Vidange moteur + filtre à huile + filtre à air' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 89.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durationMinutes: number;
}
