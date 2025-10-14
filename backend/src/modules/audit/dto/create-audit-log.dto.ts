import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { AuditAction } from '../../../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsNotEmpty()
  tenantId: number;

  @IsOptional()
  userId?: string | null;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsOptional()
  entityId?: string | null;

  @IsOptional()
  oldValue?: any;

  @IsOptional()
  newValue?: any;

  @IsOptional()
  metadata?: {
    ip?: string;
    userAgent?: string;
    route?: string;
    method?: string;
  };
}

export { AuditAction };
