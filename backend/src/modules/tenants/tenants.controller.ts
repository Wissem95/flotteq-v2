import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { QueryTenantsDto } from './dto/query-tenants.dto';
import { UpdateStorageQuotaDto } from './dto/update-storage-quota.dto';
import { TenantMeResponseDto } from './dto/tenant-me-response.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('tenants')
@ApiTags('tenants')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  findAll(@Query() query: QueryTenantsDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getStats(id);
  }

  @Patch(':id/change-plan/:planId')
  @HttpCode(HttpStatus.OK)
  changePlan(
    @Param('id', ParseIntPipe) id: number,
    @Param('planId', ParseIntPipe) planId: number,
  ) {
    return this.tenantsService.changePlan(id, planId);
  }

  @Get('me')
  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user tenant information' })
  @ApiResponse({
    status: 200,
    description: 'Current user tenant information',
    type: TenantMeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found for this user' })
  async findMyTenant(@CurrentUser() user: User): Promise<TenantMeResponseDto> {
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    return this.tenantsService.findByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft delete d'un tenant" })
  @ApiResponse({ status: 200, description: 'Tenant désactivé avec succès' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.remove(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réactiver un tenant soft-deleted' })
  @ApiResponse({ status: 200, description: 'Tenant réactivé avec succès' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.restore(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer/Désactiver un tenant' })
  @ApiResponse({ status: 200, description: 'Statut du tenant mis à jour' })
  updateTenantStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { isActive: boolean },
  ) {
    return this.tenantsService.updateTenantStatus(id, dto.isActive);
  }

  @Get(':id/storage-usage')
  @ApiOperation({ summary: "Obtenir l'usage de stockage d'un tenant" })
  @ApiResponse({
    status: 200,
    description: 'Usage de stockage retourné avec succès',
  })
  getStorageUsage(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getStorageUsage(id);
  }

  @Patch(':id/storage-quota')
  @ApiOperation({
    summary: "Mettre à jour le quota de stockage personnalisé d'un tenant",
  })
  @ApiResponse({ status: 200, description: 'Quota mis à jour avec succès' })
  updateStorageQuota(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStorageQuotaDto,
  ) {
    return this.tenantsService.updateStorageQuota(id, dto);
  }
}
