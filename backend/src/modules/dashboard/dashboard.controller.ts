import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import {
  InternalStatsDto,
  InternalRevenueDto,
  InternalSubscriptionsDto,
  ActivityLogDto,
  RecentTenantDto,
} from './dto/internal-stats.dto';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { FleetStatusDto } from './dto/fleet-status.dto';
import { CostAnalysisDto } from './dto/cost-analysis.dto';
import { AlertDto } from './dto/alert.dto';
import { MaintenanceStatsDto } from './dto/maintenance-stats.dto';
import { DriverStatsDto } from './dto/driver-stats.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { SubscriptionUsageDto } from './dto/subscription-usage.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ============ INTERNAL (Admin FlotteQ) ============

  @Get('internal/stats')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({
    summary: 'Get global stats for all tenants (FlotteQ admin only)',
  })
  async getInternalStats(): Promise<InternalStatsDto> {
    return this.dashboardService.getInternalStats();
  }

  @Get('internal/revenue')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({
    summary: 'Get MRR, ARR and revenue evolution (FlotteQ admin only)',
  })
  async getInternalRevenue(): Promise<InternalRevenueDto> {
    return this.dashboardService.getInternalRevenue();
  }

  @Get('internal/subscriptions')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({
    summary: 'Get subscription plans distribution (FlotteQ admin only)',
  })
  async getInternalSubscriptions(): Promise<InternalSubscriptionsDto> {
    return this.dashboardService.getInternalSubscriptions();
  }

  @Get('internal/activity')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({
    summary: 'Get recent platform activity (FlotteQ admin only)',
  })
  async getInternalActivity(): Promise<ActivityLogDto[]> {
    return this.dashboardService.getInternalActivity();
  }

  @Get('internal/tenants/recent')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiOperation({
    summary: 'Get recently registered tenants (FlotteQ admin only)',
  })
  async getInternalRecentTenants(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<RecentTenantDto[]> {
    return this.dashboardService.getRecentTenants(limit);
  }

  // ============ SIMPLE ENDPOINTS (Frontend-Client Compatibility) ============

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get dashboard stats for current tenant' })
  async getStats(@Req() req: any): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats(req.user.tenantId);
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get alerts for current tenant' })
  async getAlerts(@Req() req: any): Promise<AlertDto[]> {
    return this.dashboardService.getUpcomingAlerts(req.user.tenantId);
  }

  @Get('subscription-usage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get subscription usage statistics for current tenant',
  })
  async getSubscriptionUsage(@Req() req: any): Promise<SubscriptionUsageDto> {
    return this.dashboardService.getSubscriptionUsage(req.user.tenantId);
  }

  // ============ TENANT (Clients) ============

  @Get('tenant/overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get tenant dashboard overview' })
  async getTenantOverview(@Req() req: any): Promise<DashboardOverviewDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getOverview(tenantId);
  }

  @Get('tenant/fleet-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get fleet status by vehicle status' })
  async getTenantFleetStatus(@Req() req: any): Promise<FleetStatusDto> {
    return this.dashboardService.getFleetStatus(req.user.tenantId);
  }

  @Get('tenant/costs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get cost analysis for tenant' })
  async getTenantCosts(@Req() req: any): Promise<CostAnalysisDto> {
    return this.dashboardService.getCostAnalysis(req.user.tenantId);
  }

  @Get('tenant/alerts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get upcoming alerts for tenant' })
  async getTenantAlerts(@Req() req: any): Promise<AlertDto[]> {
    return this.dashboardService.getUpcomingAlerts(req.user.tenantId);
  }

  @Get('tenant/maintenance-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get maintenance statistics for tenant' })
  async getTenantMaintenanceStats(
    @Req() req: any,
  ): Promise<MaintenanceStatsDto> {
    return this.dashboardService.getMaintenanceStats(req.user.tenantId);
  }

  @Get('tenant/driver-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get driver statistics for tenant' })
  async getTenantDriverStats(@Req() req: any): Promise<DriverStatsDto> {
    return this.dashboardService.getDriverStats(req.user.tenantId);
  }

  // ============ DRIVER (Conducteurs) - PLACEHOLDERS ============
  // À implémenter dans Sprint 4

  // ============ PARTNER (Partenaires) - PLACEHOLDERS ============
  // À implémenter dans Sprint 2
}
