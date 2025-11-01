import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ReportType {
  MECHANICAL = 'mechanical',
  ACCIDENT = 'accident',
  DAMAGE = 'damage',
  CLEANING = 'cleaning',
  OTHER = 'other',
}

export class VehicleReportDto {
  @ApiProperty({ enum: ReportType, example: ReportType.MECHANICAL })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiProperty({ example: 'Strange noise from engine' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Noticed while driving on highway' })
  @IsString()
  @IsOptional()
  notes?: string;
}
