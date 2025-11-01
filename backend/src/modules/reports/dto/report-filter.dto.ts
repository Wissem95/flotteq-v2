import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ReportStatus } from '../../../entities/report.entity';

export class ReportFilterDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  driverId?: string;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
