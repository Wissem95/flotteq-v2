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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { HybridAuthGuard } from '../../core/auth/guards/hybrid-auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user.entity';
import { Auditable } from '../../common/decorators/auditable.decorator';
import { AuditAction } from '../../entities/audit-log.entity';
import { CurrentPartner } from './decorators/current-partner.decorator';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { SearchPartnersDto } from './dto/search-partners.dto';
import { GetPartnersQueryDto } from './dto/get-partners-query.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { MarketplacePartnerDto } from './dto/marketplace-partner.dto';
import { Request, BadRequestException } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    partnerId?: string;
    role: string;
    type?: string;
  };
}

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly searchService: SearchService,
  ) {}

  // Tenant search endpoint - Authenticated users only
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @Post('search')
  @ApiOperation({
    summary: 'Search partners by geolocation (Tenant)',
    description: 'Authenticated tenant users can search for approved partners within a specified radius, with optional filters for type, services, price, rating, and availability. Returns simplified marketplace DTOs with next available slots.'
  })
  @ApiResponse({
    status: 200,
    description: 'Partners search results with pagination. Returns MarketplacePartnerDto objects with simplified fields and next available booking slot.',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            companyName: 'Garage Martin',
            type: 'garage',
            city: 'Paris',
            rating: 4.5,
            totalReviews: 127,
            services: [
              { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Vidange complète', price: 89.99, durationMinutes: 60 }
            ],
            distance: 3.2,
            nextAvailableSlot: '2025-10-25T09:00:00.000Z',
            relevanceScore: 87.5,
            hasAvailability: true
          }
        ],
        meta: {
          total: 15,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid search parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required.' })
  async searchPartners(
    @CurrentUser() user: User,
    @Body() searchPartnersDto: SearchPartnersDto,
  ): Promise<{ data: MarketplacePartnerDto[], meta: any }> {
    return this.searchService.searchPartners(searchPartnersDto);
  }

  // Admin endpoints (tenant users with admin roles)
  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all partners with pagination and filters (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partners list retrieved with pagination.',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      },
    },
  })
  async findAll(@Query() query: GetPartnersQueryDto) {
    return this.partnersService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @Auditable({ entityType: 'partner', action: AuditAction.CREATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new partner (admin only)' })
  @ApiResponse({ status: 201, description: 'Partner created successfully.' })
  async createPartner(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.TENANT_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update partner (admin only)' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully.' })
  async updatePartner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Auditable({ entityType: 'partner', action: AuditAction.DELETE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner (super admin only)' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully.' })
  async deletePartner(@Param('id', ParseUUIDPipe) id: string) {
    await this.partnersService.remove(id);
    return { message: 'Partner deleted successfully' };
  }

  // Partner Stripe Connect Endpoints (must be before :id routes)
  @Post('me/stripe/onboard')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Connect account for partner' })
  @ApiResponse({ status: 200, description: 'Onboarding URL created' })
  async createStripeAccount(@Request() req: RequestWithUser) {
    const partnerId = req.user.partnerId;
    if (!partnerId) {
      throw new BadRequestException('Partner ID not found');
    }
    return this.partnersService.createStripeConnectAccount(partnerId);
  }

  @Get('me/stripe/status')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe onboarding status' })
  @ApiResponse({ status: 200, description: 'Stripe status retrieved' })
  async getStripeStatus(@Request() req: RequestWithUser) {
    const partnerId = req.user.partnerId;
    if (!partnerId) {
      throw new BadRequestException('Partner ID not found');
    }
    return this.partnersService.getStripeOnboardingStatus(partnerId);
  }

  @Get('me/commission-rate')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current commission rate for partner' })
  @ApiResponse({ status: 200, description: 'Commission rate retrieved', schema: { example: { commissionRate: 10 } } })
  async getOwnCommissionRate(@Request() req: RequestWithUser) {
    const partnerId = req.user.partnerId;
    if (!partnerId) {
      throw new BadRequestException('Partner ID not found');
    }
    const partner = await this.partnersService.findOne(partnerId);
    return { commissionRate: Number(partner.commissionRate) };
  }

  @Post('me/stripe/refresh')
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Stripe onboarding link' })
  @ApiResponse({ status: 200, description: 'New onboarding link created' })
  async refreshStripeLink(@Request() req: RequestWithUser) {
    const partnerId = req.user.partnerId;
    if (!partnerId) {
      throw new BadRequestException('Partner ID not found');
    }
    return this.partnersService.refreshStripeOnboardingLink(partnerId);
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
  @UseGuards(HybridAuthGuard)
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
  @UseGuards(HybridAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own partner services (partner user)' })
  @ApiResponse({ status: 200, description: 'Services retrieved.' })
  async getOwnServices(@CurrentPartner('partnerId') partnerId: string) {
    const services = await this.partnersService.getPartnerServices(partnerId);
    return {
      message: 'Services retrieved successfully',
      count: services.length,
      services,
    };
  }

  @Post('me/services')
  @UseGuards(HybridAuthGuard)
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
  @UseGuards(HybridAuthGuard)
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
  @UseGuards(HybridAuthGuard)
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
