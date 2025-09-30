import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { FleetStatusDto } from './dto/fleet-status.dto';
import { CostAnalysisDto } from './dto/cost-analysis.dto';
import { AlertDto } from './dto/alert.dto';
import { MaintenanceStatsDto } from './dto/maintenance-stats.dto';
import { DriverStatsDto } from './dto/driver-stats.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview with global stats' })
  @ApiResponse({ status: 200, description: 'Overview retrieved successfully', type: DashboardOverviewDto })
  async getOverview(@Req() req: any): Promise<DashboardOverviewDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getOverview(tenantId);
  }

  @Get('fleet-status')
  @ApiOperation({ summary: 'Get fleet status breakdown by vehicle status' })
  @ApiResponse({ status: 200, description: 'Fleet status retrieved successfully', type: FleetStatusDto })
  async getFleetStatus(@Req() req: any): Promise<FleetStatusDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getFleetStatus(tenantId);
  }

  @Get('costs')
  @ApiOperation({ summary: 'Get cost analysis including maintenance and purchase costs' })
  @ApiResponse({ status: 200, description: 'Cost analysis retrieved successfully', type: CostAnalysisDto })
  async getCosts(@Req() req: any): Promise<CostAnalysisDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getCostAnalysis(tenantId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get all upcoming alerts (licenses, certificates, maintenances)' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully', type: [AlertDto] })
  async getAlerts(@Req() req: any): Promise<AlertDto[]> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getUpcomingAlerts(tenantId);
  }

  @Get('maintenance-stats')
  @ApiOperation({ summary: 'Get maintenance statistics' })
  @ApiResponse({ status: 200, description: 'Maintenance stats retrieved successfully', type: MaintenanceStatsDto })
  async getMaintenanceStats(@Req() req: any): Promise<MaintenanceStatsDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getMaintenanceStats(tenantId);
  }

  @Get('driver-stats')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiResponse({ status: 200, description: 'Driver stats retrieved successfully', type: DriverStatsDto })
  async getDriverStats(@Req() req: any): Promise<DriverStatsDto> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getDriverStats(tenantId);
  }
}