import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { TenantId } from '../../core/tenant/tenant.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer les logs d\'audit avec filtres' })
  @ApiResponse({ status: 200, description: 'Logs d\'audit récupérés avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin seulement.' })
  async findAll(@TenantId() tenantId: number, @Query() filters: AuditLogFilterDto) {
    return this.auditService.findAll(tenantId, filters);
  }

  @Get('entity/:entityType/:entityId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer l\'historique d\'audit d\'une entité spécifique' })
  @ApiResponse({ status: 200, description: 'Historique récupéré avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async findByEntity(
    @TenantId() tenantId: number,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(tenantId, entityType, entityId);
  }
}
