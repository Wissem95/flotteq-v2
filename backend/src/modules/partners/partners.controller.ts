import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { Auditable } from '../../common/decorators/auditable.decorator';
import { AuditAction } from '../../entities/audit-log.entity';
import { PartnerAuthGuard } from './auth/guards/partner-auth.guard';
import { CurrentPartner } from './decorators/current-partner.decorator';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // Admin endpoints (tenant users with admin roles)
  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all partners (admin only)' })
  @ApiResponse({ status: 200, description: 'Partners list retrieved.' })
  async findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner by ID' })
  @ApiResponse({ status: 200, description: 'Partner retrieved.' })
  @ApiResponse({ status: 404, description: 'Partner not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve partner (admin only)' })
  @ApiResponse({ status: 200, description: 'Partner approved successfully.' })
  @ApiResponse({ status: 400, description: 'Partner already approved.' })
  @ApiResponse({ status: 404, description: 'Partner not found.' })
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.approvePartner(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject partner (admin only)' })
  @ApiResponse({ status: 200, description: 'Partner rejected successfully.' })
  @ApiResponse({ status: 400, description: 'Partner already rejected.' })
  @ApiResponse({ status: 404, description: 'Partner not found.' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    return this.partnersService.rejectPartner(id, reason);
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend partner (admin only)' })
  @ApiResponse({ status: 200, description: 'Partner suspended successfully.' })
  @ApiResponse({ status: 404, description: 'Partner not found.' })
  async suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.suspendPartner(id);
  }

  @Patch(':id/commission-rate')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update partner commission rate (admin only)' })
  @ApiResponse({ status: 200, description: 'Commission rate updated.' })
  @ApiResponse({ status: 400, description: 'Invalid commission rate.' })
  @ApiResponse({ status: 404, description: 'Partner not found.' })
  async updateCommissionRate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('commissionRate') commissionRate: number,
  ) {
    return this.partnersService.updateCommissionRate(id, commissionRate);
  }

  // Partner-authenticated endpoints (for partner users managing their own data)
  @Patch('me')
  @UseGuards(PartnerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own partner profile (partner user)' })
  @ApiResponse({ status: 200, description: 'Partner profile updated.' })
  async updateOwnProfile(
    @CurrentPartner('partnerId') partnerId: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(partnerId, updatePartnerDto);
  }

  @Get('me/services')
  @UseGuards(PartnerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own partner services (partner user)' })
  @ApiResponse({ status: 200, description: 'Services retrieved.' })
  async getOwnServices(@CurrentPartner('partnerId') partnerId: string) {
    return this.partnersService.getPartnerServices(partnerId);
  }

  @Post('me/services')
  @UseGuards(PartnerAuthGuard)
  @Auditable({ entityType: 'partner_service', action: AuditAction.CREATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service to own partner (partner user)' })
  @ApiResponse({ status: 201, description: 'Service created.' })
  @ApiResponse({ status: 400, description: 'Partner not approved.' })
  async addOwnService(
    @CurrentPartner('partnerId') partnerId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.partnersService.addService(partnerId, createServiceDto);
  }

  @Patch('services/:serviceId')
  @UseGuards(PartnerAuthGuard)
  @Auditable({ entityType: 'partner_service', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update partner service (partner user)' })
  @ApiResponse({ status: 200, description: 'Service updated.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  async updateService(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.partnersService.updateService(serviceId, updateServiceDto);
  }

  @Delete('services/:serviceId')
  @UseGuards(PartnerAuthGuard)
  @Auditable({ entityType: 'partner_service', action: AuditAction.DELETE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner service (partner user)' })
  @ApiResponse({ status: 200, description: 'Service deleted.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  async removeService(@Param('serviceId', ParseUUIDPipe) serviceId: string) {
    await this.partnersService.removeService(serviceId);
    return { message: 'Service deleted successfully' };
  }

  @Get(':id/services')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner services by partner ID' })
  @ApiResponse({ status: 200, description: 'Services retrieved.' })
  async getPartnerServices(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.getPartnerServices(id);
  }
}
