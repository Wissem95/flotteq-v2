import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ReportStatus } from '../../../entities/report.entity';

export class UpdateReportDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiPropertyOptional({ example: 'Issue fixed, vehicle is operational' })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
