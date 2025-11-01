import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, ReportStatus } from '../../../entities/report.entity';

export class ReportResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  vehicleId: string;

  @ApiPropertyOptional()
  vehicleRegistration?: string;

  @ApiProperty({ format: 'uuid' })
  driverId: string;

  @ApiPropertyOptional()
  driverName?: string;

  @ApiProperty({ enum: ReportType })
  type: ReportType;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  photos: string[] | null;

  @ApiPropertyOptional()
  acknowledgedAt: Date | null;

  @ApiPropertyOptional()
  acknowledgedBy: string | null;

  @ApiPropertyOptional()
  acknowledgedByName: string | null;

  @ApiPropertyOptional()
  resolvedAt: Date | null;

  @ApiPropertyOptional()
  resolvedBy: string | null;

  @ApiPropertyOptional()
  resolvedByName: string | null;

  @ApiPropertyOptional()
  resolutionNotes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ReportListResponseDto {
  @ApiProperty({ type: [ReportResponseDto] })
  data: ReportResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
