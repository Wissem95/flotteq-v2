import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { TenantId } from '../../core/tenant/tenant.decorator';

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new maintenance' })
  @ApiResponse({ status: 201, description: 'Maintenance created successfully' })
  create(
    @Body() createMaintenanceDto: CreateMaintenanceDto,
    @TenantId() tenantId: number,
  ) {
    return this.maintenanceService.create(createMaintenanceDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenances' })
  @ApiResponse({ status: 200, description: 'List of all maintenances' })
  findAll(@TenantId() tenantId: number) {
    return this.maintenanceService.findAll(tenantId);
  }

  @Get('alerts/upcoming')
  @ApiOperation({ summary: 'Get upcoming maintenance alerts' })
  @ApiResponse({ status: 200, description: 'List of upcoming maintenances' })
  getUpcomingAlerts(
    @TenantId() tenantId: number,
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.maintenanceService.getUpcomingMaintenances(tenantId, daysAhead || 7);
  }

  @Get('alerts/km')
  @ApiOperation({ summary: 'Get maintenance alerts by kilometer' })
  @ApiResponse({ status: 200, description: 'List of maintenances approaching km threshold' })
  getKmAlerts(@TenantId() tenantId: number) {
    return this.maintenanceService.getMaintenancesByKmAlert(tenantId);
  }

  @Get('costs/total')
  @ApiOperation({ summary: 'Get total maintenance costs for tenant' })
  @ApiResponse({ status: 200, description: 'Total maintenance costs' })
  getTotalCosts(@TenantId() tenantId: number) {
    return this.maintenanceService.getTotalCostsByTenant(tenantId);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get all maintenances for a specific vehicle' })
  @ApiResponse({ status: 200, description: 'List of maintenances for the vehicle' })
  findByVehicle(
    @Param('vehicleId') vehicleId: string,
    @TenantId() tenantId: number,
  ) {
    return this.maintenanceService.findByVehicle(vehicleId, tenantId);
  }

  @Get('vehicle/:vehicleId/costs')
  @ApiOperation({ summary: 'Get cost summary for a specific vehicle' })
  @ApiResponse({ status: 200, description: 'Cost summary for the vehicle' })
  getVehicleCostSummary(
    @Param('vehicleId') vehicleId: string,
    @TenantId() tenantId: number,
  ) {
    return this.maintenanceService.getCostSummaryByVehicle(vehicleId, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance details' })
  @ApiResponse({ status: 404, description: 'Maintenance not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: number) {
    return this.maintenanceService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance updated successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance not found' })
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
    @TenantId() tenantId: number,
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance deleted successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance not found' })
  remove(@Param('id') id: string, @TenantId() tenantId: number) {
    return this.maintenanceService.remove(id, tenantId);
  }
}