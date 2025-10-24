import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerType, PartnerStatus } from '../../../entities/partner.entity';

export class GetPartnersQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Garage Martin' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PartnerType, example: 'garage' })
  @IsOptional()
  @IsEnum(PartnerType)
  type?: PartnerType;

  @ApiPropertyOptional({ enum: PartnerStatus, example: 'approved' })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;
}
