import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ReportType } from '../../../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({
    format: 'uuid',
    example: 'e8c3d514-1e4b-4a8f-b7c1-d5e590a9df8b',
  })
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

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
