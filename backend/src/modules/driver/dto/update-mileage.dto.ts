import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateMileageDto {
  @ApiProperty({ example: 45250, description: 'New mileage in kilometers' })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiPropertyOptional({ example: 'Relevé après trajet Paris-Lyon' })
  @IsString()
  @IsOptional()
  notes?: string;
}
